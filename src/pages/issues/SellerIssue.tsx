import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getIssueStatus,
  getSellerIssueById,
  sendOnIssue,
} from "@/utils/igm.api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import type {
  Issue,
  IssueAction,
  IssueActionCode,
  issueStatus,
  ResolutionDescCode,
} from "@/utils/types";
import { AlertCircle, Dot } from "lucide-react";
import { TruncatedUUID } from "@/components/TruncateUUID";
import { getStatusColor } from "@/utils/getStatusColor";
import { convertToIST } from "@/utils/formatDate";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SellerIssue = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div className="text-center mt-5">Issue not found</div>;
  }

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<issueStatus>("PROCESSING");
  const [descriptorCode, setDescriptorCode] =
    useState<IssueActionCode>("PROCESSING");
  const [resolutionShortDesc, setResolutionShortDesc] = useState("");
  const [resolutionDescCode, setResolutionDescCode] = useState<
    ResolutionDescCode | ""
  >("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["Seller_Issue", id],
    queryFn: () => getSellerIssueById({ id: id }),
    placeholderData: keepPreviousData,
  });

  const issueStatusMutation = useMutation({
    mutationFn: getIssueStatus,
    onSuccess: () => {
      toast.success("Successfully Requested for status update");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });
  const replyIssueMutation = useMutation({
    mutationFn: sendOnIssue,
    onSuccess: () => {
      toast.success("Reply sent");
      refetch();
    },
    onError: () => {
      toast.error("Failed to send reply");
    },
  });

  const STATUS_OPTIONS = ["PROCESSING", "RESOLVED"] as const;

  const DESCRIPTOR_OPTIONS = [
    "PROCESSING",
    "INFO_REQUESTED",
    "INFO_PROCESSING",
    "INFO_PROVIDED",
    "INFO_NOT_AVAILABLE",
    "RESOLUTION_PROPOSED",
    "RESOLVED",
  ] as const;

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  const issue: Issue = data.data.issue;

  console.log("seller-issue", issue);

  const resolutionMap = new Map(issue.resolutions.map((r) => [r.id, r]));

  const myActor = issue?.issueActors.find((a) => a.type === "COUNTERPARTY_NP");
  const myActorId = myActor?.id;
  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        {issue ? (
          <div id="issues" className="w-full border bg-white rounded-lg pb-2">
            <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
              <h1 className="py-3 font-bold ">Issue Details</h1>
            </div>

            <div className="border  border-gray-200 rounded-lg overflow-hidden p-4 m-4">
              <div className="flex">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-1" />{" "}
                <div className="w-full">
                  <div className="w-full flex justify-between">
                    <div className="font-bold">
                      Issue -
                      <TruncatedUUID uuid={issue.id} />
                    </div>
                    <div className={getStatusColor(issue.status)}>
                      {issue.status}
                    </div>
                  </div>
                  <div className="my-2 text-sm">{issue.shortDesc}</div>
                  <div className="text-xs">{issue.longDesc}</div>
                  <div className="text-xs">
                    Reported at: {convertToIST(issue.createdAt)}
                  </div>
                  {issue.images.length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-semibold text-sm mb-2 ">Images</h5>
                      <div className="flex gap-2">
                        {issue.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt="Image"
                            className="w-24 h-24 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  variant={"outline"}
                  onClick={() => {
                    issueStatusMutation.mutate({
                      issueId: issue.id,
                    });
                  }}
                >
                  Issue Status
                </Button>
              </div>
              <ResolutionList resolutions={issue.resolutions} />
              {issue.issueActions.length > 0 && (
                <div className="m-4 border rounded p-4 space-y-1">
                  <h5 className="font-semibold text-sm mb-4 text-center underline">
                    Issue Actions
                  </h5>
                  <div className="max-h-125 overflow-y-auto">
                    {issue.issueActions.map((action) => (
                      <ChatBubble
                        key={action.id}
                        action={action}
                        isMe={action.actionBy === myActorId}
                        resolutionMap={resolutionMap}
                      />
                    ))}
                  </div>
                  <div className="mt-4 border-t pt-3">
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex gap-2">
                        <div>Issue Status: </div>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as issueStatus)
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <div>Message Descriptor: </div>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={descriptorCode}
                          onChange={(e) =>
                            setDescriptorCode(e.target.value as IssueActionCode)
                          }
                        >
                          {DESCRIPTOR_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      {descriptorCode === "RESOLUTION_PROPOSED" && (
                        <div className="space-y-2 border rounded p-3 bg-gray-50">
                          <div className="flex gap-2 items-center">
                            <div className="text-sm">Resolution Type:</div>
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={resolutionDescCode}
                              onChange={(e) =>
                                setResolutionDescCode(
                                  e.target.value as ResolutionDescCode
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="NOW_VISIBLE">Now Visible</option>
                              <option value="NO_ACTION">No Action</option>
                              <option value="RECONCILED">Reconciled</option>
                              <option value="NOT_RECONCILED">
                                Not Reconciled
                              </option>
                            </select>
                          </div>

                          <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Resolution description"
                            value={resolutionShortDesc}
                            onChange={(e) =>
                              setResolutionShortDesc(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button
                        disabled={
                          !message.trim() ||
                          (descriptorCode === "RESOLUTION_PROPOSED" &&
                            (!resolutionDescCode || !resolutionShortDesc))
                        }
                        onClick={() => {
                          replyIssueMutation.mutate({
                            issueId: issue.id,
                            status,
                            shortDesc: message,
                            descriptorCode,

                            ...(descriptorCode === "RESOLUTION_PROPOSED" && {
                              refId:
                                "R" +
                                Math.floor(100000 + Math.random() * 900000),
                              refType: "RESOLUTIONS",
                              resolutionDescCode,
                              resolutionShortDesc,
                            }),
                          });

                          setMessage("");
                          setResolutionDescCode("");
                          setResolutionShortDesc("");
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No issues reported for this order
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerIssue;

function ChatBubble({
  action,
  isMe,
  resolutionMap,
}: {
  action: IssueAction;
  isMe: boolean;
  resolutionMap: Map<string, Issue["resolutions"][number]>;
}) {
  const linkedResolution =
    action.refType === "RESOLUTIONS" && action.refId
      ? resolutionMap.get(action.refId)
      : null;

  return (
    <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
          isMe
            ? "bg-yellow-300 text-black rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        <div className="font-medium text-xs opacity-80 mb-1">
          {action.actorName}
        </div>

        <div className="text-xs flex items-center gap-1">
          <Dot className="w-3 h-3" />
          {action.descriptorCode}
        </div>

        <div className="mt-1">{action.shortDesc}</div>

        {/* 🔗 Resolution reference */}
        {linkedResolution && (
          <div className="mt-2 text-xs border-l-2 pl-2 border-green-400 text-green-700">
            <div>
              Linked Resolution: <TruncatedUUID uuid={linkedResolution.id} />
            </div>
            <div className="italic">{linkedResolution.shortDesc}</div>
          </div>
        )}

        <div className="text-[10px] opacity-70 mt-1 text-right">
          {convertToIST(action.updatedAt)}
        </div>
      </div>
    </div>
  );
}

function ResolutionList({
  resolutions,
}: {
  resolutions: Issue["resolutions"];
}) {
  if (!resolutions || resolutions.length === 0) return null;

  return (
    <div className="my-4 border rounded-lg p-4 bg-green-50">
      <h5 className="font-semibold text-sm mb-3 text-green-800">
        Proposed Resolutions
      </h5>

      <div className="space-y-3">
        {resolutions.map((r, idx) => (
          <div key={r.id} className="border rounded p-3 bg-white text-sm">
            <div className="flex justify-between items-center">
              <div className="font-medium">Resolution ID: {r.id}</div>

              {idx === resolutions.length - 1 && (
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                  Latest
                </span>
              )}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Code: <span className="font-medium">{r.code}</span>
            </div>

            <div className="mt-1">{r.shortDesc}</div>

            <div className="mt-1 text-[10px] text-gray-400 text-right">
              {convertToIST(r.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
