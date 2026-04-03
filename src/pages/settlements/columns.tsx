"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { convertToIST } from "../../utils/formatDate";
import { getStatusLabel } from "../../utils/status-colors";
import { TruncatedUUID } from "@/components/TruncateUUID";

export type SettlementOrder = {
  id: string;
  orderId: string;
  settlementId: string;
  totalAmount: number;
  sellerAmount: number;
  buyerAmount: number;
  status: string;
  referenceNo: string | null;
  selfReferenceNo: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  diffTotalAmount: string | null;
  diffBuyerAmount: string | null;
};

export type TRV14SettlementType = {
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  type: string;
  miscSelfAmount: string | null;
  miscReferenceNo: string | null;
  updatedAt: string;
  settlementOrders: SettlementOrder[];
  cityCode: string;
  transactionId: string;
  messageId: string;
};

export function getCounterPartyPaidStatus(code: string) {
  switch (code) {
    case "01":
      return "Paid";
    case "02":
      return "Overpaid";
    case "03":
      return "Underpaid";
    case "04":
      return "Not paid";
    default:
      return "UNKNOWN";
  }
}

export const columns: ColumnDef<SettlementOrder>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const id = row.getValue("createdAt") as string;
      return <div>{convertToIST(id)}</div>;
    },
  },
  {
    accessorKey: "orderId",
    header: "Order",
    cell: ({ row }) => {
      const id = row.getValue("orderId") as string;
      return (
        <Link className="text-blue-900" to={`/admin/order/${id}`}>
          <TruncatedUUID uuid={id} isLink={true} />
        </Link>
      );
    },
  },
  {
    accessorKey: "sellerAmount",
    header: "Seller Amount",
    cell: ({ row }) => {
      const id = row.getValue("sellerAmount") as string;
      return <div>INR {id}</div>;
    },
  },
  {
    accessorKey: "sellerStatus",
    header: "Seller Transfer Status",
    cell: ({ row }) => {
      const id = row.getValue("sellerStatus") as string;

      return getStatusLabel("settleStatus", id);
    },
  },
  {
    accessorKey: "referenceNo",
    header: "Seller Transfer Reference No",
    cell: ({ row }) => {
      const id = row.getValue("referenceNo") as string;
      if (!id) {
        return <div>NA</div>;
      }
      return <div>{id}</div>;
    },
  },
  {
    accessorKey: "errorMessage",
    header: "Seller Transfer Error Message",
    cell: ({ row }) => {
      const id = row.getValue("errorMessage") as string;
      if (!id) {
        return <div>NA</div>;
      }
      return <div>{id} </div>;
    },
  },

  {
    accessorKey: "buyerAmount",
    header: "Buyer Amount",
    cell: ({ row }) => {
      const id = row.getValue("buyerAmount") as string;
      return <div>INR {id}</div>;
    },
  },
  {
    accessorKey: "selfStatus",
    header: "Self Transfer Status",
    cell: ({ row }) => {
      const id = row.getValue("selfStatus") as string;

      return getStatusLabel("settleStatus", id);
    },
  },
  {
    accessorKey: "selfReferenceNo",
    header: "Self Transfer Reference No",
    cell: ({ row }) => {
      const id = row.getValue("selfReferenceNo") as string;
      if (!id) {
        return <div>NA</div>;
      }
      return <div>{id}</div>;
    },
  },
  {
    accessorKey: "selfErrorMessage",
    header: "Self Transfer Error Message",
    cell: ({ row }) => {
      const id = row.getValue("selfErrorMessage") as string;
      if (!id) {
        return <div>NA</div>;
      }
      return <div>{id} </div>;
    },
  },
];
