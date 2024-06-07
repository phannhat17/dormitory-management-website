"use client";

import { deleteFeedback } from "@/actions/admin/feedback";
import FeedBackDetails from "@/components/feedback/DeailsCard";
import ReusableAlertDialog from "@/components/modify/ReusableAlertDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { toast } from "sonner";
import DOMPurify from 'dompurify';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

      <FeedBackDetails
        isOpen={isEditDialogOpen}
        setIsOpen={isEditDialogOpen ?
          setIsEditDialogOpen : setIsDeleteDialogOpen}
        fbId={fb.id}
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


export const columns: ColumnDef<Feedbacktable>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "userId",
    header: "User Id",
    cell: ({ row }) => (
      <div>{DOMPurify.sanitize(row.getValue("userId"))}</div>
    ),
  },
  {
    accessorKey: "userName",
    header: "User Name",
    cell: ({ row }) => (
      <div>{DOMPurify.sanitize(row.getValue("userName"))}</div>
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
        {DOMPurify.sanitize(row.getValue("content"))}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div>
        {DOMPurify.sanitize((row.getValue("createdAt") as Date).toLocaleString())}
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