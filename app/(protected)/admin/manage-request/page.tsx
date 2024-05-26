// app/admin/requests/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { RoomChangeRequestTable, columns } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";
import { getRoomChangeRequests } from "@/actions/admin/request";
import BeatLoader from "react-spinners/BeatLoader";
import { toast } from "sonner";

async function getData(): Promise<RoomChangeRequestTable[]> {
  const response = await getRoomChangeRequests();

  if (response.requests) {
    return response.requests;
  } else {
    throw new Error("Invalid response when getting room change requests!");
  }
}

export default function ManageRequests() {
  const [requests, setRequests] = useState<RoomChangeRequestTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await getData();
        setRequests(data);
      } catch (error) {
        toast.error("Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader />
      </div>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-2xl font-semibold">Manage Room Change Requests</h1>
        <DataTable columns={columns} data={requests} />
      </div>
    </main>
  );
}
