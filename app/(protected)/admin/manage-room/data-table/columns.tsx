"use client";

import { deleteRoom } from "@/actions/admin/room";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import EditRoomCard from "@/components/modify/EditRoom";
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
import { Gender, RoomStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { toast } from "sonner";

export type Roomstable = {
  id: string;
  gender: Gender;
  status: RoomStatus;
  max: number;
  price: number;
  current: number;
};
export const statuses = [
  {
    label: "Full",
    value: RoomStatus.FULL,
  },
  {
    label: "Available",
    value: RoomStatus.AVAILABLE,
  },
];

export const genders = [
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
  { header: "Gender", key: "gender", width: 10 },
  { header: "Current", key: "current", width: 10 },
  { header: "Max", key: "max", width: 10 },
  { header: "Status", key: "status", width: 10 },
  { header: "Price (VND)", key: "price", width: 20 },
]
interface ActionsCellProps {
  row: any;
}
const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const router = useRouter();

  const room = row.original

  const handleDelete = () => {
    deleteRoom(room.id)
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


      <EditRoomCard
        isOpen={isEditDialogOpen}
        setIsOpen={isEditDialogOpen ?
          setIsEditDialogOpen : setIsDeleteDialogOpen}
        roomID={room.id}
        onConfirm={() => { }}
      />

      <ReusableAlertDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={isDeleteDialogOpen ?
          setIsDeleteDialogOpen : setIsEditDialogOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone"
        confirmButtonText="Continue"
        cancelButtonText="Cancel"
        onConfirm={handleDelete}
      />
    </>
  );
};

export const columns: ColumnDef<Roomstable>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="w-[80px] font-medium">{row.getValue("id")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Room for" />
    ),
    cell: ({ row }) => {
      const gender = genders.find(
        (gender) => gender.value === row.getValue("gender")
      );

      if (!gender) {
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
    accessorKey: "current",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Current" />
    ),

    cell: ({ row }) => {
      return <div>{row.getValue("current")}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "max",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue("max")}</div>;
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
            variant={row.getValue("status") === "FULL" ? "destructive" : null}
            className={
              row.getValue("status") === "AVAILABLE"
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
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(row.getValue("price"));
      return <div className="w-[80px] font-medium">{formattedPrice}</div>;
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];