import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { convertToIST } from "@/utils/formatDate";
import { getStatusColor } from "@/utils/getStatusColor";
import { TruncatedUUID } from "../TruncateUUID";

export type Order = {
  id: string;
  transactionId: string;
  orderId: string;
  orderStatus: string;
  createdAt: string;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => {
      const id = row.getValue("orderId") as string;
      const paymentStatus = row.getValue("paymentStatus") as string;
      if (
        paymentStatus !== "INITIATED" &&
        paymentStatus !== "PENDING" &&
        paymentStatus !== "FAILURE"
      ) {
        return (
          <Link className="text-blue-900" to={`/admin/order/${id}`}>
            <TruncatedUUID uuid={id} isLink={true} />
          </Link>
        );
      } else {
        return <TruncatedUUID uuid={id} />;
      }
    },
  },
  {
    accessorKey: "paymentOrderId",
    header: "Payment Order Id",
  },
  {
    accessorKey: "providerName",
    header: "Restaurant Name",
  },
  {
    accessorKey: "userName",
    header: "User Name",
  },
  {
    accessorKey: "userPhone",
    header: "User Phone",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "createdAt",
    header: "created At",
    cell: ({ row }) => (
      <div className="whitespace-nowrap w-32 text-center">
        {convertToIST(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("paymentStatus"))}`}>
        {row.getValue("paymentStatus")}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatusAt",
    header: "Payment Status Updated At",
    cell: ({ row }) => (
      <div className="whitespace-nowrap w-32 text-center">
        {convertToIST(row.getValue("paymentStatusAt"))}
      </div>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("orderStatus"))}`}>
        {row.getValue("orderStatus")}
      </span>
    ),
  },
  {
    accessorKey: "orderStatusAt",
    header: "Order Status Updated At",
    cell: ({ row }) => (
      <div className="whitespace-nowrap w-32 text-center">
        {convertToIST(row.getValue("orderStatusAt"))}
      </div>
    ),
  },
  {
    accessorKey: "issueStatus",
    header: "Issue Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("issueStatus"))}`}>
        {row.getValue("issueStatus")}
      </span>
    ),
  },
  {
    accessorKey: "issueStatusAt",
    header: "Issue Status Updated At",
    cell: ({ row }) => {
      const date = row.getValue("issueStatusAt");
      return (
        <div className="whitespace-nowrap w-32 text-center">
          {date ? convertToIST(row.getValue("issueStatusAt")) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "transferStatus",
    header: "Transfer Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("transferStatus"))}`}>
        {row.getValue("transferStatus")}
      </span>
    ),
  },
  {
    accessorKey: "transferStatusAt",
    header: "Transfer Status Updated At",
    cell: ({ row }) => {
      const date = row.getValue("transferStatusAt");
      console.log(date);
      return (
        <div className="whitespace-nowrap w-32 text-center">
          {date ? convertToIST(row.getValue("transferStatusAt")) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "transferSettleStatus",
    header: "Transfer Settlement Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("transferSettleStatus"))}`}>
        {row.getValue("transferSettleStatus")}
      </span>
    ),
  },
];

export const statusOptions = {
  paymentStatus: ["INITIATED", "PENDING", "SUCCESS", "FAILURE"],
  orderStatus: [
    "Created",
    "Pending",
    "Accepted",
    "Cancelled",
    "Completed",
    "In_progress",
  ],
  issueStatus: ["NONE", "OPEN", "ESCALATED_TO_SELLER", "CLOSED"],
  settleStatus: [
    "INITIATED",
    "NOT_SETTLED",
    "SETTLED",
    "FAILURE",
    "PENDING",
    "CORRECTION_REQUIRED",
    "CORRECTION_APPROVED",
  ],
};
