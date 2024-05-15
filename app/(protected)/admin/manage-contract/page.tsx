import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table/data-table";
import { Usertable, columns, excelColumn } from "./data-table/columns";
import { getListUsers } from "@/actions/db-action";
import { ExportButton } from "@/components/data-table/export-button";
import { RefreshButton } from "@/components/data-table/refresh-button";
import Link from "next/link";

async function getData(): Promise<Usertable[]> {
  const response = await getListUsers();

  if (response.users && response.total) {
    return response.users;
  } else {
    throw new Error("Invalid response from when get list users!");
  }
}

export default async function ManageUsers() {
  const users = await getData();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-semibold">Manage User</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ExportButton data={users} columns={excelColumn} filename="all_users" />
            <Link
              href="/admin/create-user"
            >
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-sm"
              >
                <FileUp className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Add student</span>
              </Button>
            </Link>
            <RefreshButton />
          </div>
        </div>
        <DataTable columns={columns} data={users} />
      </div>
    </main>
  );
}
