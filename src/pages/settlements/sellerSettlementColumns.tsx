"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TruncatedUUID } from "@/components/TruncateUUID";
import { convertToIST, formatAmount } from "@/utils/formatDate";

/**
 * Amounts arrive as JSON numbers on the pending/settle responses and as strings
 * ("249.5") on the stored ones, so every amount field is typed as both and always
 * goes through `formatAmount` / `toAmount`.
 */
export type PendingSellerSettlement = {
  sellerId: string;
  sellerName: string;
  pendingAmount: number | string;
  orderCount: number;
};

export type SellerSettlementRecord = {
  id: string;
  totalAmount: number | string;
  utrNumber: string;
  /** A raw admin user id, not a name. */
  settledBy: string;
  settledAt: string;
  seller: { id: string; name: string } | null;
};

export type SettlementOrderLine = {
  orderId: string;
  transactionId: string;
  providerName: string;
  completedAt: string;
  sellerAmount: number | string;
};

export const pendingSellerColumns = ({
  onSettle,
}: {
  onSettle: (seller: PendingSellerSettlement) => void;
}): ColumnDef<PendingSellerSettlement>[] => [
  {
    accessorKey: "sellerName",
    header: "Seller",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.sellerName || "-"}</div>
    ),
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ row }) => <div>{row.original.orderCount ?? 0}</div>,
  },
  {
    accessorKey: "pendingAmount",
    header: "Pending Amount",
    cell: ({ row }) => (
      <div className="font-semibold whitespace-nowrap">
        {formatAmount(row.original.pendingAmount)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/settlements/pending/${row.original.sellerId}`}>
            View orders
          </Link>
        </Button>
        <Button
          size="sm"
          className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
          onClick={() => onSettle(row.original)}
        >
          Settle
        </Button>
      </div>
    ),
  },
];

export const settledSellerColumns: ColumnDef<SellerSettlementRecord>[] = [
  {
    accessorKey: "settledAt",
    header: "Settled On",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {convertToIST(row.original.settledAt)}
      </div>
    ),
  },
  {
    id: "sellerName",
    accessorFn: (row) => row.seller?.name ?? "",
    header: "Seller",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.seller?.name || "-"}</div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-semibold whitespace-nowrap">
        {formatAmount(row.original.totalAmount)}
      </div>
    ),
  },
  {
    accessorKey: "utrNumber",
    header: "UTR",
    cell: ({ row }) => (
      <div className="font-mono text-[11px]">{row.original.utrNumber || "-"}</div>
    ),
  },
  // `settledBy` is deliberately not shown: the API returns a raw admin user id with
  // no name anywhere in the payload, and a bare uuid tells the finance user nothing.
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/settlements/settled/${row.original.id}`}>
            View orders
          </Link>
        </Button>
      </div>
    ),
  },
];

/** Shared by both drawers — the pending and settled order lists are the same shape. */
export const settlementOrderColumns: ColumnDef<SettlementOrderLine>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => {
      const id = row.original.orderId;
      return (
        <Link className="text-blue-900" to={`/admin/order/${id}`}>
          <TruncatedUUID uuid={id} isLink={true} />
        </Link>
      );
    },
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) =>
      row.original.transactionId ? (
        <TruncatedUUID uuid={row.original.transactionId} />
      ) : (
        <div>-</div>
      ),
  },
  {
    accessorKey: "providerName",
    header: "Provider",
    cell: ({ row }) => <div>{row.original.providerName || "-"}</div>,
  },
  {
    accessorKey: "completedAt",
    header: "Delivered On",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {convertToIST(row.original.completedAt)}
      </div>
    ),
  },
  {
    accessorKey: "sellerAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="whitespace-nowrap font-medium">
        {formatAmount(row.original.sellerAmount)}
      </div>
    ),
  },
];
