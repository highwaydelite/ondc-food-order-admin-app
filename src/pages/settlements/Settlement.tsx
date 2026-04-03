import { useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
// import { DataTable } from '../DataTable'
// import { FilterModal } from '../FilterModal'
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { getSettlementById, report } from "@/utils/api";
import type { TRV14SettlementType } from "./columns";
import { columns } from "./columns";
import { useParams } from "react-router-dom";
import { convertToIST } from "../../utils/formatDate";
import toast from "react-hot-toast";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";

const Settlement = () => {
  const { id } = useParams<{ id: string }>();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settlement", pagination.pageIndex, pagination.pageSize],
    queryFn: () => getSettlementById(id!),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  const reportMutation = useMutation({
    mutationFn: report,
    onSuccess: () => {
      console.log("Report sent successfully");

      toast.success(
        "Sent Request successfully. Please wait and check details again."
      );
    },
  });

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError) return <div>Error: {(error as Error).message}</div>;
  const settlement: TRV14SettlementType = data.data;
  console.log("settlement data:", settlement);
  const transformedOrders = settlement.settlementOrders;

  const total = transformedOrders.length;
  let totalSellerAmt = transformedOrders.reduce(
    (total, order) => total + Number(order.sellerAmount),
    0
  );

  let totalBuyerAmt = transformedOrders.reduce(
    (total, order) => total + Number(order.buyerAmount),
    0
  );

  return (
    <>
      {settlement.type === "NP_NP" ? (
        <div>
          <div className="flex justify-between bg-white p-4 rounded">
            <div className="flex gap-2 flex-col tracking-wide">
              <div className="">
                <span className="font-semibold">Settlement Id: </span>
                {id}
              </div>
              <div>
                <span className="font-semibold"> Date : </span>
                {convertToIST(settlement.updatedAt)}
              </div>
              <div className="font-semibold">
                Total Seller Amount Transferred : {totalSellerAmt}
              </div>
              <div className="font-semibold">
                Total Buyer Amount Transferred : {totalBuyerAmt}
              </div>

              <div className="text-red-500 font-semibold">
                {settlement.status === "NOT_SETTLED" &&
                  "This Settlement has Unsettled Items"}{" "}
              </div>
            </div>
            <div className="flex gap-3 font-semibold">
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
                onClick={() => {
                  reportMutation.mutate({
                    city: settlement.cityCode,
                    transaction_id: settlement.transactionId,
                    message_id: settlement.messageId,
                  });
                }}
              >
                Get Status
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl">
            <div className="p-4">
              <div className="flex justify-end mb-2"></div>
              <DataTable
                columns={columns}
                data={transformedOrders}
                pageCount={total}
                pagination={pagination}
                setPagination={setPagination}
                // selectedIds={selectedIds}
                // setSelectedIds={setSelectedIds}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between bg-white p-4 rounded">
            <div className="flex gap-2 flex-col tracking-wide">
              <div className="">
                <span className="font-semibold">Settlement Id: </span>
                {id}
              </div>
              <div>
                <span className="font-semibold"> Date : </span>
                {convertToIST(settlement.updatedAt)}
              </div>
              <div>
                {" "}
                <span className="font-semibold"> Amount: </span>
                Rs.{settlement.miscSelfAmount}
              </div>
              <div>
                <span className="font-semibold">Reference No: </span>
                {settlement.miscReferenceNo || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Error Message: </span>
                {settlement.errorMessage || "N/A"}
              </div>
            </div>
            <div>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
                onClick={() => {
                  reportMutation.mutate({
                    city: settlement.cityCode,
                    transaction_id: settlement.transactionId,
                    message_id: settlement.messageId,
                  });
                }}
              >
                Get Status
              </Button>
            </div>
          </div>{" "}
        </div>
      )}
    </>
  );
};

export default Settlement;
