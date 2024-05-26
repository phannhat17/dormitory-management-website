"use client";

import { RequestStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { approveRoomChangeRequest, rejectRoomChangeRequest } from "@/actions/admin/request";
import { useRouter } from 'next/navigation';
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const request = row.original;

  const handleApprove = async () => {
    setIsLoading(true);
    const response = await approveRoomChangeRequest(request.id);
    setIsLoading(false);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.success);
      router.refresh();
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    const response = await rejectRoomChangeRequest(request.id);
    setIsLoading(false);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.success);
      router.refresh();
    }
  };

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
        <DropdownMenuItem onClick={handleApprove} disabled={isLoading || request.status !== RequestStatus.PENDING}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReject} disabled={isLoading || request.status !== RequestStatus.PENDING}>
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      }}>{row.getValue("id")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "fromRoomId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From Room ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-medium">{row.getValue("fromRoomId") || "N/A"}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "toRoomId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="To Room ID" />
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
        (status) => status.value === row.getValue("status")
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {(row.getValue("createdAt") as Date).toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
