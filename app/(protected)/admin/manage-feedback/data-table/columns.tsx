"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { deleteFeedback } from "@/actions/feedback";
import { toast } from "sonner"
import { useRouter } from 'next/navigation';

export type Feedbacktable = {
  id: number;
  userId: string;
  userName: string | null;
  content: string | null;
  createdAt: Date;
};

interface ActionsCellProps {
  row: any;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const router = useRouter();

      const fb = row.original

      const handleDelete = () => {
        deleteFeedback(fb.id)
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
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
};


export const columns: ColumnDef<Feedbacktable>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "userId",
    header: "User Id",
    cell: ({ row }) => (
      <div className="w-[80px] font-medium">{row.getValue("userId")}</div>
    ),
  },
  {
    accessorKey: "userName",
    header: "User Name",
    cell: ({ row }) => (
      <div className="w-[100px] font-medium">{row.getValue("userName")}</div>
    ),
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div style={{
        width: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {row.getValue("content")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {(row.getValue("createdAt") as Date).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];

export const excelColumn = [
  { header: "ID", key: "id" },
  { header: "User ID", key: "userId" },
  { header: "User Name", key: "userName" },
  { header: "Feedback Content", key: "content" },
  { header: "Created At", key: "createdAt" },
];