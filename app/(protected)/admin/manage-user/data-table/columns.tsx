"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserRole, UserStatus } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export type Usertable = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
};
export const statuses = [
  {
    label: "STAYING",
    value: "STAYING",
  },
  {
    label: "NOT_STAYING",
    value: "NOT_STAYING",
  },
  {
    label: "BANNED",
    value: "BANNED",
  },
];
export const roles = [
  {
    label: "STUDENT",
    value: "STUDENT",
  },
  {
    label: "ADMIN",
    value: "ADMIN",
  },
];

export const columns: ColumnDef<Usertable>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="w-[80px] font-medium">{row.getValue("id")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-medium">{row.getValue("name")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div>
          <Badge
            className={
              row.getValue("role") === "ADMIN"
                ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                : row.getValue("role") === "STUDENT"
                ? "border-transparent bg-[#fbcb14] text-[#543107]-foreground shadow hover:bg-[#fbcb14]/80"
                : ""
            }
          >
            {row.getValue("role")}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div>
          <Badge
            variant={row.getValue("status") === "BANNED" ? "destructive" : null}
            className={
              row.getValue("status") === "NOT_STAYING"
                ? "border-transparent bg-[#fbcb14] text-[#543107]-foreground shadow hover:bg-[#fbcb14]/80"
                : row.getValue("status") === "STAYING"
                ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                : ""
            }
          >
            {row.getValue("status")}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
