"use client";

import { deleteUser } from "@/actions/admin/user";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import EditUserCard from "@/components/modify/EditUser";
import ReusableAlertDialog from "@/components/modify/ReusableAlertDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gender, UserStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { toast } from "sonner";

export type Usertable = {
  id: string;
  name: string | null;
  email: string | null;
  gender: Gender;
  status: UserStatus;
};
export const statuses = [
  {
    label: "Stay",
    value: UserStatus.STAYING,
  },
  {
    label: "Not stay",
    value: UserStatus.NOT_STAYING,
  },
  {
    label: "Banned",
    value: UserStatus.BANNED,
  },
];
export const gender = [
  {
    label: "Male",
    value: Gender.MALE,
  },
  {
    label: "Female",
    value: Gender.FEMALE,
  },
];
export const excelColumn = [
  { header: "ID", key: "id", width: 10 },
  { header: "Name", key: "name", width: 32 },
  { header: "Email", key: "email", width: 32 },
  { header: "Gender", key: "gender", width: 32 },
  { header: "Status", key: "status", width: 32 },
]

interface ActionsCellProps {
  row: any;
}
const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter();

  const user = row.original

  const handleDelete = () => {
    deleteUser(user.id)
      .then((data) => {
        if (data.success) {
          toast.success(data.success);
          router.refresh();
        } else if (data.error) {
          toast.error(data.error);
        }
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>View/Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>


      <EditUserCard
        isOpen={isEditDialogOpen}
        setIsOpen={isEditDialogOpen ?
          setIsEditDialogOpen : setIsDeleteDialogOpen}
        userID={user.id}
        onConfirm={() => { }}
      />

      <ReusableAlertDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={isDeleteDialogOpen ?
          setIsDeleteDialogOpen : setIsEditDialogOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        confirmButtonText="Continue"
        cancelButtonText="Cancel"
        onConfirm={handleDelete}
      />
    </>
  );
};

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
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
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
              row.getValue("gender") === "MALE"
                ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                : row.getValue("gender") === "FEMALE"
                  ? "border-transparent bg-[#d7dbfa] text-[#543107]-foreground shadow hover:bg-[#d7dbfa]/80"
                  : ""
            }
          >
            {row.getValue("gender")}
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
    cell: ActionsCell,
  },
];
