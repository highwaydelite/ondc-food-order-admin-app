"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { convertToIST } from "../../utils/formatDate";
import { getStatusColor } from "@/utils/getStatusColor";
import { TruncatedUUID } from "@/components/TruncateUUID";
export interface Settlement {
  context: {
    bpp_id: string;
    bpp_uri: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
  };
  id: string;
  createdAt: string;
  settlementItems: SettlementItem[];
}

export interface SettlementItem {
  details: {
    collector_app_id: string;
    receiver_app_id: string;
    payee_name: string;
    payee_address: string;
    payee_account_no: string;
    payee_bank_code: string;
    payee_virtual_payment_address: string;
    payment_type: string;
    purpose_code: string;
  };
  error: string | null;
  id: string;
  amount: number;
  status: string;
  date: string;
  refNo: string;
  createdAt: string;
  settlementContextId: string;
  ticketOrderIds: string[];
}

export const columns: ColumnDef<Settlement>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const id = row.getValue("createdAt") as string;
      return <div>{convertToIST(id)}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Settlement Id",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <Link className="text-blue-900" to={`/admin/settlements/${id}`}>
          <TruncatedUUID uuid={id} isLink={true} />
        </Link>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Settlement Type",
  },
  {
    accessorKey: "receiverAppId",
    header: "Seller ID",
    cell: ({ row }) => {
      const receiverAppId = row.getValue("receiverAppId") as string;
      const settlementStatus = row.getValue("status") as string;
      if (settlementStatus === "NIL")
        return <div className="text-red-500 font-semibold">Nil Settlement</div>;
      if (!receiverAppId) {
        return <div className="text-red-500 font-semibold"> self Transfer</div>;
      }
      return <div className=""> {receiverAppId}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Settlement Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("status"))}`}>
        {row.getValue("status")}
      </span>
    ),
  },
  {
    accessorKey: "statusUpdatedAt",
    header: "Settlement Status Updated At",
    cell: ({ row }) => (
      <span>{convertToIST(row.getValue("statusUpdatedAt"))}</span>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "Transaction Id",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      return <TruncatedUUID uuid={id} />;
    },
  },
];

export const statusOptions = {
  ticketStatus: ["INITIATED", "ACTIVE", "CANCELLED", "EXPIRED", "FAILURE"],
  orderStatus: ["INITIATED", "PENDING", "SUCCESS", "FAILURE"],
  issueStatus: ["NONE", "OPENED", "ESCALATED_TO_SELLER", "CLOSED"],
  reconStatus: ["NONE", "INITIATED", "SETTLED", "CORRECTION"],
};
