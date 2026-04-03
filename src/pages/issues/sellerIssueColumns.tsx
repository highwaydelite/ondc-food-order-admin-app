"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { convertToIST } from "../../utils/formatDate";
import { getStatusColor } from "@/utils/getStatusColor";
import { Link } from "react-router-dom";
import type { Issue } from "@/utils/types";
import { TruncatedUUID } from "@/components/TruncateUUID";

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
    accessorKey: "id",
    header: "Issue Id",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <Link className="text-blue-900" to={`/admin/seller-issue/${id}`}>
          {id}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
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
  {
    accessorKey: "updatedAt",
    header: "Updated At ",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string;
      return <div className=""> {convertToIST(date)}</div>;
    },
  },
  {
    accessorKey: "transactionId",
    header: "Transaction Id",
    cell: ({ row }) => (
      <div>
        <TruncatedUUID uuid={row.getValue("transactionId")} />
      </div>
    ),
  },
  {
    accessorKey: "bppId",
    header: "Bpp Id",
  },
];
