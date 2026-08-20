"use client";

import type React from "react";

import { DataRow } from "@/components/dashboard/DataRow";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { DataCard } from "@/components/dashboard/DataCard";
import { CardContent } from "@/components/ui/card";
import {
  approveCorrection,
  getOrderById,
  sendRecon,
  updateAmount,
} from "@/utils/api";
import { convertToIST } from "@/utils/formatDate";
import type {
  Issue,
  IssueAction,
  IssueActionCode,
  issueStatus,
  OrderResponse,
} from "@/utils/types";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getStatusColor } from "@/utils/getStatusColor";
import { Button } from "@/components/ui/button";
import { TruncatedUUID } from "@/components/TruncateUUID";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
// import IssueChat from "@/components/issue/issue-chat";
import { AlertCircle, Dot } from "lucide-react";
import {
  getIssueStatus,
  issueEscalateToSeller,
  raiseSettlementIssue,
  replyIssue,
} from "@/utils/igm.api";
import { EscalateIssueDialog } from "@/components/issue/EscalationModal";
import { RaiseSettlementIssueDialog } from "@/components/settlements/raiseSettleIssue";

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [openAmountModal, setOpenAmountModal] = useState(false);

  const [form, setForm] = useState({
    totalAmount: "",
    sellerAmount: "",
    buyerAmount: "",
    tcs: "",
    tds: "",
  });
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<issueStatus>("PROCESSING");
  const [descriptorCode, setDescriptorCode] =
    useState<IssueActionCode>("PROCESSING");
  const [raiseIssueOpen, setRaiseIssueOpen] = useState(false);
  const [selectedResolutionId, setSelectedResolutionId] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => getOrderById(orderId!),
    placeholderData: keepPreviousData,
  });

  const sendReconMutation = useMutation({
    mutationFn: sendRecon,
    onSuccess: () => {
      toast.success("Recon Sent Successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  const [confirmModal, setConfirmModal] = useState(false);

  const approveCorrectionMutation = useMutation({
    mutationFn: approveCorrection,
    onSuccess: () => {
      toast.success("Correction Approved Successfully");
      setConfirmModal(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  const updateAmountMutation = useMutation({
    mutationFn: updateAmount,
    onSuccess: () => {
      toast.success("Amount Updated Successfully");
      setOpenAmountModal(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  const escalateIssueMutation = useMutation({
    mutationFn: issueEscalateToSeller,
    onSuccess: () => {
      refetch();
      toast.success("Issue escalated successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.error?.response?.data?.message || "Failed to escalate issue",
      );
    },
  });

  const replyIssueMutation = useMutation({
    mutationFn: replyIssue,
    onSuccess: () => {
      toast.success("Reply sent");
      refetch();
    },
    onError: () => {
      toast.error("Failed to send reply");
    },
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

  const raiseSettleIssueMutation = useMutation({
    mutationFn: raiseSettlementIssue,
    onSuccess: () => {
      toast.success("Issue raised successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to raise issue");
    },
  });

  const STATUS_OPTIONS = ["PROCESSING", "RESOLVED", "CLOSED"] as const;

  const DESCRIPTOR_OPTIONS = [
    "PROCESSING",
    "INFO_REQUESTED",
    "INFO_PROCESSING",
    "INFO_PROVIDED",
    "INFO_NOT_AVAILABLE",
    "RESOLUTION_PROCESSING",
    "RESOLUTION_ACCEPTED",
    "RESOLUTION_REJECTED",
    "CLOSED",
  ] as const;

  const order: OrderResponse = data?.data;
  console.log("Order Details:", order);
  const issues = order?.issues;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something Went Wrong</div>;

  const handleSendRecon = () => {
    sendReconMutation.mutate({
      orderId: order.id,
      transactionId: order.settlementOrders[0].settlement.transactionId,
    });
  };

  const handleApproveCorrection = () => {
    approveCorrectionMutation.mutate(order.id);
  };

  const handleOpenModal = () => {
    setForm({
      totalAmount: order.payment.amount?.toString() ?? "",
      sellerAmount: order.payment.sellerAmount?.toString() ?? "",
      tcs: order.payment.tcs?.toString() ?? "",
      buyerAmount: order.payment.buyerAmount?.toString() ?? "",
      tds: order.payment.tds?.toString() ?? "",
    });
    setOpenAmountModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers and decimals up to 2 places
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === "" || regex.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    updateAmountMutation.mutate({
      orderId: order.id,
      totalAmount: parseFloat(form.totalAmount),
      sellerAmount: parseFloat(form.sellerAmount),
      tcs: parseFloat(form.tcs),
      buyerAmount: parseFloat(form.buyerAmount),
      tds: parseFloat(form.tds),
    });
  };
  return (
    <div className="space-y-6">
      {/* ORDER DETAILS */}
      <div className="w-full border bg-white rounded-lg pb-2">
        <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
          <h1 className="py-3 font-bold ">Order Details</h1>
        </div>
        <CardContent className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard>
              <DataRow
                label="Order ID"
                value={<TruncatedUUID uuid={order.id} />}
              />
              <DataRow label="Restaurant" value={order.providerName} />
              <DataRow label="Restaurant ID" value={order.providerId} />
            </DataCard>
            <DataCard>
              <DataRow
                className={`${getStatusColor(order.state)}`}
                label="Status"
                value={order.state}
              />
              <DataRow label="Amount" value={`₹${order.quote.value}`} />
            </DataCard>
          </div>

          {/* Timeline Info */}
          <SectionHeading>Order Timeline</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {order.confirmedAt && (
              <DataCard>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Confirmed At
                </p>
                <p className="text-sm font-medium">
                  {convertToIST(order.confirmedAt)}
                </p>
              </DataCard>
            )}
            {order.completedAt && (
              <DataCard>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Delivered At
                </p>
                <p className="text-sm font-medium">
                  {convertToIST(order.completedAt)}
                </p>
              </DataCard>
            )}
            {order.cancelledAt && (
              <DataCard>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Cancelled At
                </p>
                <p className="text-sm font-medium">
                  {convertToIST(order.cancelledAt)}
                </p>
              </DataCard>
            )}
          </div>
        </CardContent>
      </div>

      {/* ORDER BREAKUP */}

      <div className="w-full border bg-white rounded-lg pb-2">
        <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
          <h1 className="py-3 font-bold ">Order Breakup</h1>
        </div>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {order.quote.breakup.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start py-2 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.title} {item.quantity && `x ${item.quantity}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.itemId}</p>
                </div>
                <p className="font-semibold">₹{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      {/* BILLING DETAILS */}

      <div className="w-full border bg-white rounded-lg pb-2">
        <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
          <h1 className="py-3 font-bold ">Billing Details</h1>
        </div>
        <CardContent className="pt-6">
          {order.billing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataCard>
                <DataRow label="Customer Name" value={order.billing.name} />
                <DataRow label="Customer Phone" value={order.billing.phone} />
              </DataCard>
              {order.billing.email && (
                <DataCard>
                  <DataRow label="Customer Email" value={order.billing.email} />
                </DataCard>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* DELIVERY DETAILS */}

      <div className="w-full border bg-white rounded-lg pb-2">
        <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
          <h1 className="py-3 font-bold ">Delivery Details</h1>
        </div>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {order.fulfillments.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                {/* <h4 className="font-semibold mb-4">Fulfillment #{index + 1}</h4> */}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <DataCard>
                    <DataRow
                      label="Fulfillment ID"
                      value={<TruncatedUUID uuid={item.fulfillmentId} />}
                    />
                  </DataCard>
                  <DataCard>
                    <DataRow label="Type" value={item.type} />
                  </DataCard>
                  <DataCard>
                    <DataRow label="Status" value={item.state} />
                  </DataCard>
                </div>

                {/* Delivery Timeline */}
                <div className="mb-6">
                  <h5 className="font-semibold text-sm mb-3">
                    Delivery Timeline
                  </h5>
                  <div className="space-y-2 ml-4">
                    {item.orderFulfillmentStateHistories.map((history, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start py-2 text-sm"
                      >
                        <span className="font-medium">{history.state}</span>
                        <span className="text-muted-foreground">
                          {convertToIST(history.stateUpdatedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address Details */}
                <div className="mb-6">
                  <h5 className="font-semibold text-sm mb-3">
                    Delivery Address
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataCard>
                      <DataRow label="Building" value={item.endBuilding} />
                      <DataRow label="Locality" value={item.endLocality} />
                      <DataRow label="Area Code" value={item.endAreaCode} />
                    </DataCard>
                    <DataCard>
                      <DataRow label="City" value={item.endCity} />
                      <DataRow label="State" value={item.endState} />
                      <DataRow label="GPS" value={item.endGps} />
                    </DataCard>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h5 className="font-semibold text-sm mb-3">Contact Person</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataCard>
                      <DataRow label="Name" value={item.contactName} />
                    </DataCard>
                    <DataCard>
                      <DataRow label="Phone" value={item.contactPhone} />
                    </DataCard>
                    {item.contactEmail && (
                      <DataCard>
                        <DataRow label="Email" value={item.contactEmail} />
                      </DataCard>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      {/* CANCELLATION / RETURN DETAILS */}
      {order.orderCancelFulfillments.length > 0 && (
        <div className="w-full border bg-white rounded-lg pb-2">
          <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
            <h1 className="py-3 font-bold ">Cancellation / Return Details</h1>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {order.orderCancelFulfillments.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <DataCard>
                      <DataRow label="Type" value={item.type} />
                    </DataCard>
                    <DataCard>
                      <DataRow label="Status" value={item.state} />
                    </DataCard>
                    <DataCard>
                      <DataRow
                        label="Quote Value"
                        value={`₹${item.quoteValue}`}
                      />
                    </DataCard>
                  </div>

                  <DataRow
                    label="Cancellation ID"
                    value={<TruncatedUUID uuid={item.id} />}
                  />

                  {/* Refund Details */}
                  {item.orderCancelQuoteTrails.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-sm mb-3">
                        Refund Details
                      </h5>
                      <div className="space-y-2">
                        {item.orderCancelQuoteTrails.map((trail, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start py-2 text-sm border-b last:border-b-0"
                          >
                            <div>
                              <p className="font-medium">{trail.type}</p>
                              {trail.ref_id && (
                                <p className="text-xs text-muted-foreground">
                                  Ref ID: {trail.ref_id}
                                </p>
                              )}
                            </div>
                            <p className="font-medium">₹{trail.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancellation Tags */}
                  {item.orderCancelTagGroups.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-sm mb-3">
                        Cancellation Tags
                      </h5>
                      <div className="space-y-3">
                        {item.orderCancelTagGroups.map((tagGroup, idx) => (
                          <div key={idx} className="bg-muted/30 rounded p-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              {tagGroup.code}
                            </p>
                            <div className="space-y-1">
                              {tagGroup.items.map((tag, tagIdx) => (
                                <div
                                  key={tagIdx}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {tag.key}:
                                  </span>
                                  <span className="font-medium">
                                    {tag.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      )}

      {/* PAYMENT DETAILS */}
      <div className="w-full border bg-white rounded-lg pb-2">
        <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
          <h1 className="py-3 font-bold ">Payment Details</h1>
        </div>
        <div className="flex justify-end mt-4 mr-2">
          <Button onClick={() => setRaiseIssueOpen(true)} className="">
            Raise Settlement Issue
          </Button>
        </div>
        {order.payment.settleStatus === "CORRECTION_REQUIRED" && (
          <div className="flex justify-end mt-4 mr-2">
            <Button onClick={handleOpenModal} className="">
              Update Amount
            </Button>
          </div>
        )}

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Main Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataCard>
                <DataRow
                  label="Payment ID"
                  value={order.payment.transactionId}
                />
                <DataRow label="Payment Status" value={order.payment.status} />
              </DataCard>
              <DataCard>
                <DataRow
                  label="Total Amount"
                  value={`₹${order.payment.amount}`}
                />
                <DataRow
                  label="Settlement Status"
                  value={order.payment.settleStatus}
                />
              </DataCard>
            </div>

            {/* Amount Breakdown */}
            <div>
              <h5 className="font-semibold text-sm mb-3">Amount Breakdown</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard>
                  <DataRow
                    label="Buyer Amount"
                    value={`₹${order.payment.buyerAmount}`}
                  />
                  <DataRow
                    label="Finder Fee"
                    value={`₹${order.payment.finderFeeAmount}`}
                  />
                </DataCard>
                <DataCard>
                  <DataRow
                    label="Seller Amount"
                    value={`₹${order.payment.sellerAmount}`}
                  />
                </DataCard>
              </div>
            </div>

            {/* Taxes */}
            <div>
              <h5 className="font-semibold text-sm mb-3">Taxes</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataCard>
                  <DataRow label="TCS" value={order.payment.tcs} />
                </DataCard>
                <DataCard>
                  <DataRow label="TDS" value={order.payment.tds} />
                </DataCard>
              </div>
            </div>

            {/* Settlement account Details */}
            {order.payment.settlements.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm mb-3">
                  Settlement Account Details
                </h5>
                <div className="space-y-4">
                  {order.payment.settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="border rounded-lg grid grid-cols-1 md:grid-cols-2 p-4"
                    >
                      <DataCard>
                        <DataRow label="Type" value={settlement.type} />

                        <DataRow
                          label="Beneficiary Name"
                          value={settlement.beneficiaryName}
                        />
                        <DataRow
                          label="Bank Name"
                          value={settlement.bankName}
                        />
                      </DataCard>
                      <DataCard>
                        <DataRow label="Branch" value={settlement.branchName} />
                        <DataRow
                          label="Account No"
                          value={settlement.bankAccountNo}
                        />
                        <DataRow
                          label="IFSC Code"
                          value={settlement.ifscCode}
                        />
                      </DataCard>
                      {settlement.upiAddress && (
                        <div className="mt-3 pt-3 border-t">
                          <DataRow
                            label="UPI Address"
                            value={settlement.upiAddress}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      {/* ROUTE TRANSFER DETAILS */}
      {order.rpRouteTransfer && (
        <div className="w-full border bg-white rounded-lg pb-2">
          <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
            <h1 className="py-3 font-bold ">Route Transfer Details</h1>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard>
                <DataRow label="Amount" value={order.rpRouteTransfer.amount / 100} />
                  <DataRow label="Status" value={order.rpRouteTransfer.status} />
                  <DataRow label="Settlement Status" value={order.rpRouteTransfer.settlementStatus} />
                  <DataRow label="RP Transfer ID" value={order.rpRouteTransfer.rpTransferId} />
                  <DataRow label="RP Payment ID" value={order.rpRouteTransfer.rpPaymentId} />
                </DataCard>
                <DataCard>
                <DataRow label="Created At" value={convertToIST(order.rpRouteTransfer.createdAt)} />
                  <DataRow label="Status Updated At" value={convertToIST(order.rpRouteTransfer.statusUpdatedAt)} />
                  <DataRow label="Settlement Updated At" value={convertToIST(order.rpRouteTransfer.settlementUpdatedAt)} />
                  <DataRow label="RP Aczcount ID" value={order.rpRouteTransfer.rpAccountId} />
                  <DataRow label="Updated At" value={convertToIST(order.rpRouteTransfer.statusUpdatedAt)} />
                </DataCard>
              </div>
             
           
            </div>
          </CardContent>
        </div>
      )}

      {/* SETTLEMENT DETAILS */}
      {order.settlementOrders.length > 0 && (
        <div className="w-full border bg-white rounded-lg pb-2">
          <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
            <h1 className="py-3 font-bold ">Settlement Details</h1>
          </div>
          <div className="flex justify-end mt-4 mr-2">
            <Button onClick={handleSendRecon} className="">
              Send Recon
            </Button>
          </div>

          {order.settlementOrders.map((item, index) => (
            <div key={index} className="border rounded-lg m-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard>
                  <DataRow
                    label="Settlement ID"
                    onClick={() => {
                      navigate(`/admin/settlements/${item.settlement.id}`);
                    }}
                    value={<TruncatedUUID uuid={item.settlement.id} />}
                  />

                  <DataRow label="Seller Amount" value={item.sellerAmount} />
                  <DataRow label="Buyer Amount" value={item.buyerAmount} />
                </DataCard>
                <DataCard>
                  <DataRow label="Total Amount" value={item.totalAmount} />
                  <DataRow
                    className={`${getStatusColor(item.sellerStatus)}`}
                    label="Seller Settlement Status"
                    value={item.sellerStatus}
                  />
                  <DataRow
                    label="Buyer Settlement Status"
                    value={item.selfStatus}
                  />
                </DataCard>
              </div>
            </div>
          ))}

          {order.reconOrder && (
            <div className="p-5">
              <h5 className="font-semibold text-sm">Recon Details</h5>
            </div>
          )}
          {order.reconOrder?.dueDate &&
            order.payment.settleStatus === "CORRECTION_REQUIRED" && (
              <div className="flex justify-end mb-2 mr-4">
                <Button onClick={() => setConfirmModal(true)}>
                  Approve Correction
                </Button>
              </div>
            )}

          {order.reconOrder?.dueDate &&
            order.payment.settleStatus === "CORRECTION_APPROVED" && (
              <div className="flex justify-end mb-2 mr-4">
                <Button disabled>Correction Approved </Button>
              </div>
            )}
          {order.reconOrder && (
            <div className="border rounded-lg mx-4 mb-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataCard>
                  <DataRow
                    label="Recon Success"
                    value={order.reconOrder.reconAccord ? "Yes" : "No"}
                  />
                  <DataRow
                    label="Transaction Id"
                    value={
                      <TruncatedUUID uuid={order.reconOrder.transactionId} />
                    }
                  />
                  {order.reconOrder?.dueDate && (
                    <DataRow
                      label="Settlement Due Date"
                      value={format(order.reconOrder.dueDate, "MM/dd/yyyy")}
                    />
                  )}
                </DataCard>
                <DataCard>
                  <DataRow label="Amount" value={order.reconOrder.amount} />
                  <DataRow
                    label="Updated At"
                    value={convertToIST(order.reconOrder.updatedAt)}
                  />
                </DataCard>
              </div>
              {order.reconOrder.reconSettlements.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h5 className="font-semibold text-sm p-4">
                    Recon Settlement Details
                  </h5>
                  <div className="space-y-4">
                    {order.reconOrder.reconSettlements.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg grid grid-cols-1 md:grid-cols-2 p-4"
                      >
                        <DataCard>
                          <DataRow label="Status" value={item.status} />
                          <DataRow label="Amount" value={item.amount} />
                          <DataRow label="Commission" value={item.commission} />
                          <DataRow
                            label="With Holding Amount"
                            value={item.withHoldingAmount}
                          />
                          <DataRow label="TCS" value={item.tcs} />
                          <DataRow label="TDS" value={item.tds} />
                        </DataCard>
                        <DataCard>
                          <DataRow
                            label="Settlement Id"
                            value={<TruncatedUUID uuid={item.settlementId} />}
                          />
                          <DataRow
                            label="Diff Amount"
                            value={item.diffAmount}
                          />
                          <DataRow
                            label="Diff Commission"
                            value={item.diffCommission}
                          />
                          <DataRow
                            label="Diff WithHolding Amount"
                            value={item.withHoldingAmount}
                          />
                          <DataRow label="Diff TCS" value={item.diffTcs} />
                          <DataRow label="Diff TDS" value={item.diffTds} />
                        </DataCard>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Issues */}
      {issues && issues.length > 0 && (
        <div id="issues" className="w-full border bg-white rounded-lg pb-2">
          <div className="px-6 py-auto border-b flex align-center bg-gray-50 rounded-t-lg">
            <h1 className="py-3 font-bold ">Issue Details</h1>
          </div>
          {issues.map((issue: Issue, index: number) => {
            const myActor = issue?.issueActors.find(
              (a) => a.type === "INTERFACING_NP",
            );
            const myActorId = myActor?.id;

            return (
              <div
                key={index}
                className="border  border-gray-200 rounded-lg overflow-hidden p-4 m-4"
              >
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
                  </div>
                </div>
                <ResolutionList resolutions={issue.resolutions} />
                {order.issueStatus === "OPEN" ? (
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setEscalationOpen(true);
                      }}
                    >
                      Escalate To Seller
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setEscalationOpen(true);
                      }}
                      disabled
                    >
                      Escalated To Seller
                    </Button>
                  </div>
                )}

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
                {issue.issueActions.length > 0 && (
                  <div className="m-4 border rounded p-4 space-y-1">
                    <h5 className="font-semibold text-sm">Issue Actions</h5>
                    {issue.issueActions.map((action) => (
                      <ChatBubble
                        key={action.id}
                        action={action}
                        isMe={action.actionBy === myActorId}
                      />
                    ))}
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
                            onChange={(e) => {
                              setDescriptorCode(
                                e.target.value as IssueActionCode,
                              );
                              setSelectedResolutionId("");
                            }}
                          >
                            {DESCRIPTOR_OPTIONS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        {(descriptorCode === "RESOLUTION_ACCEPTED" ||
                          descriptorCode === "RESOLUTION_REJECTED") || descriptorCode === "INFO_PROVIDED" && (
                            <div className="flex gap-2 mb-2">
                              <div>Resolution: </div>
                              <select
                                className="border rounded px-2 py-1 text-sm"
                                value={selectedResolutionId}
                                onChange={(e) =>
                                  setSelectedResolutionId(e.target.value)
                                }
                              >
                                <option value="">-- Select Resolution --</option>
                                {issue.resolutions.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.shortDesc || r.id}
                                  </option>
                                ))}
                              </select>
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
                            ((descriptorCode === "RESOLUTION_ACCEPTED" ||
                              descriptorCode === "RESOLUTION_REJECTED") &&
                              !selectedResolutionId)
                          }
                          onClick={() => {
                            replyIssueMutation.mutate({
                              issueId: issue.id,
                              status,
                              shortDesc: message,
                              descriptorCode,
                              actionBy: myActorId!,
                              ...(selectedResolutionId && {
                                refId: selectedResolutionId,
                                refType: "RESOLUTIONS",
                              }),
                            });
                            setMessage("");
                            setSelectedResolutionId("");
                          }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {issues && issues.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No issues reported for this order
          </p>
        </div>
      )}

      <EscalateIssueDialog
        open={escalationOpen}
        onOpenChange={(open) => {
          setEscalationOpen(open);
          if (!open) setSelectedIssueId(null);
        }}
        orderId={order.id}
        issueId={selectedIssueId!}
        escalateIssueMutation={escalateIssueMutation}
      />

      <Dialog open={openAmountModal} onOpenChange={setOpenAmountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Amounts</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <Input
                  name={key}
                  value={value}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={updateAmountMutation.isPending}
            >
              {updateAmountMutation.isPending ? "Updating..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Correction</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm">
            Are you sure you want to approve this correction for order{" "}
            <span className="font-semibold">{order.id}</span>?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModal(false)}
              disabled={approveCorrectionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveCorrection}
              disabled={approveCorrectionMutation.isPending}
            >
              {approveCorrectionMutation.isPending ? "Approving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RaiseSettlementIssueDialog
        open={raiseIssueOpen}
        onOpenChange={setRaiseIssueOpen}
        order={order}
        isLoading={raiseSettleIssueMutation.isPending}
        onSubmit={(payload) => {
          raiseSettleIssueMutation.mutate(payload, {
            onSuccess: () => {
              setRaiseIssueOpen(false);
            },
          });
        }}
      />
    </div>
  );
};

export default OrderDetails;

function ChatBubble({ action, isMe }: { action: IssueAction; isMe: boolean }) {
  return (
    <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${isMe
            ? "bg-yellow-300 text-black rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
          }`}
      >
        <div className="font-medium text-xs opacity-80 mb-1">
          {action.actorName}
        </div>
        <div className="text-xs flex items-center">
          <Dot />
          {action.descriptorCode}
        </div>
        <div>{action.shortDesc}</div>
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
