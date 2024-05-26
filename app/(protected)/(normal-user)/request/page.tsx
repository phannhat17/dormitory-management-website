import { getRoomChangeRequests } from "@/actions/student/request";
import { ExportButton } from "@/components/data-table/export-button";
import { RefreshButton } from "@/components/data-table/refresh-button";
import { RoomChangeRequestTable, columns } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";

async function getData(): Promise<RoomChangeRequestTable[]> {
  const response = await getRoomChangeRequests();

  if (response.requests) {
    return response.requests;
  } else {
    throw new Error("Invalid response from when get list of room change requests!");
  }
}

export default async function ManageRequests() {
  const requests = await getData();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-semibold">Manage Room Change Requests</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <RefreshButton />
          </div>
        </div>
        <DataTable columns={columns} data={requests} />
      </div>
    </main>
  );
}
