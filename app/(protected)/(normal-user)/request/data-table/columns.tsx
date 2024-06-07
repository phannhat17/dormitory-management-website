"use client";

import { deleteRoomChangeRequest } from "@/actions/student/request";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
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
import { RequestStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { toast } from "sonner";
import DOMPurify from 'dompurify';

export type RoomChangeRequestTable = {
  id: string;
  userId: string;
  fromRoomId: string | null;
  toRoomId: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const statuses = [
  {
    label: "Pending",
    value: RequestStatus.PENDING,
  },
  {
    label: "Approved",
    value: RequestStatus.APPROVED,
  },
  {
    label: "Rejected",
    value: RequestStatus.REJECTED,
  },
];

interface ActionsCellProps {
  row: any;
}
const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();

  const request = row.original;

  const handleDelete = () => {
    deleteRoomChangeRequest(request.id)
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
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} disabled={DOMPurify.sanitize(request.status) !== RequestStatus.PENDING}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReusableAlertDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone."
        confirmButtonText="Continue"
        cancelButtonText="Cancel"
        onConfirm={handleDelete}
      />
    </>
  );
};

export const columns: ColumnDef<RoomChangeRequestTable>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div style={{
        width: '100px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>{DOMPurify.sanitize(row.getValue("id"))}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => (
      <div>{DOMPurify.sanitize(row.getValue("userId"))}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "fromRoomId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From Room ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-medium">{DOMPurify.sanitize(row.getValue("fromRoomId") || "N/A")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "toRoomId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="To Room ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-medium">{DOMPurify.sanitize(row.getValue("toRoomId") || "N/A")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => DOMPurify.sanitize(status.value) === DOMPurify.sanitize(row.getValue("status"))
      );

      if (!status) {
        return null;
      }

      return (
        <div>
          <Badge
            variant={row.getValue("status") === "REJECTED" ? "destructive" : null}
            className={
              row.getValue("status") === "APPROVED"
                ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                : row.getValue("status") === "PENDING"
                  ? "border-transparent bg-yellow-500 text-primary-foreground shadow hover:bg-yellow-500/80"
                  : ""
            }
          >
            {DOMPurify.sanitize(row.getValue("status"))}
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {DOMPurify.sanitize((row.getValue("createdAt") as Date).toLocaleString())}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
