"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { convertToIST } from "../../utils/formatDate";
import { getStatusColor } from "@/utils/getStatusColor";
import { TruncatedUUID } from "@/components/TruncateUUID";
import type { Issue } from "@/utils/types";

export const columns: ColumnDef<Issue>[] = [
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
    header: "Order Id",
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
    accessorKey: "id",
    header: "Issue Id",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <TruncatedUUID uuid={id} />;
    },
  },
  {
    accessorKey: "transactionId",
    header: "Transaction Id",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      return <TruncatedUUID uuid={id} />;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At ",
    cell: ({ row }) => {
      const id = row.getValue("updatedAt") as string;
      return (
        <div className="">
          {" "}
          <div>{convertToIST(id)}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Issue Status",
    cell: ({ row }) => (
      <span className={`${getStatusColor(row.getValue("status"))}`}>
        {row.getValue("status")}
      </span>
    ),
  },
];

export const statusOptions = {
  issueStatus: ["OPEN", "CLOSED", "PROCESSING", "RESOLVED"],
};
