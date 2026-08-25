import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { convertToIST, formatAmount } from "@/utils/formatDate";
import { getStatusColor } from "@/utils/getStatusColor";
import { TruncatedUUID } from "../TruncateUUID";
import { ORDER_FILTER_OPTIONS } from "@/utils/adminEnums";

export type Order = {
  id: string;
  transactionId: string;
  orderId: string;
  orderStatus: string;
  createdAt: string;
  hasTransfer?: boolean;
  transferStatus?: string | null;
  transferStatusAt?: string | null;
  transferSettleStatus?: string | null;
};

const noTransferLabel = (
  <span className="text-xs text-muted-foreground">No transfer</span>
);

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
    // `quote.value` is a string ("101.50" / "100.5") — parse before formatting.
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatAmount(row.getValue("amount") as string | null)}
      </span>
    ),
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
    cell: ({ row }) => {
      if (!row.original.hasTransfer) return noTransferLabel;
      const status = row.getValue("transferStatus") as string | null;
      return status ? (
        <span className={getStatusColor(status)}>{status}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "transferStatusAt",
    header: "Transfer Status Updated At",
    cell: ({ row }) => (
      <div className="whitespace-nowrap w-32 text-center">
        {row.original.hasTransfer
          ? convertToIST(row.getValue("transferStatusAt"))
          : "—"}
      </div>
    ),
  },
  {
    accessorKey: "transferSettleStatus",
    header: "Transfer Settlement Status",
    cell: ({ row }) => {
      // No transfer at all vs. a transfer that has not been settled yet.
      if (!row.original.hasTransfer) return noTransferLabel;
      const status = row.getValue("transferSettleStatus") as string | null;
      return status ? (
        <span className={getStatusColor(status)}>{status}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
];

/**
 * Kept as a named export for existing importers; the source of truth for the filter
 * enums is `@/utils/adminEnums`, which is validated against the backend contract.
 */
export const statusOptions = ORDER_FILTER_OPTIONS;
