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
  /** `payment.settleStatus` — the order's payment settlement, "NA" when unpaid. */
  settleStatus?: string | null;
  settleStatusAt?: string | null;
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
  // The Razorpay Route transfer columns are gone: payouts are recorded manually in
  // the Settlements section now, so `rpRouteTransfer` is null on new orders.
  {
    accessorKey: "settleStatus",
    header: "Settlement Status",
    cell: ({ row }) => {
      const status = row.getValue("settleStatus") as string | null;
      return status ? (
        <span className={getStatusColor(status)}>{status}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "settleStatusAt",
    header: "Settlement Status Updated At",
    cell: ({ row }) => {
      // Null until the payment's settlement status actually moves.
      const date = row.getValue("settleStatusAt") as string | null;
      return (
        <div className="whitespace-nowrap w-32 text-center">
          {date ? convertToIST(date) : "-"}
        </div>
      );
    },
  },
];

/**
 * Kept as a named export for existing importers; the source of truth for the filter
 * enums is `@/utils/adminEnums`, which is validated against the backend contract.
 */
export const statusOptions = ORDER_FILTER_OPTIONS;
