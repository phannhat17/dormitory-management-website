import { DataTable } from "./data-table/data-table";
import { Feedbacktable, columns } from "./data-table/columns";
import { getListFB } from "@/actions/db-action";

async function getData(): Promise<Feedbacktable[]> {
  const response: { feedbacks: Feedbacktable[] } = await getListFB();
  return response.feedbacks;
}

export default async function ManageUsers() {
  const users = await getData();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-semibold">View Feedback</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
          </div>
        </div>
        <DataTable columns={columns} data={users} />
      </div>
    </main>
  );
}
