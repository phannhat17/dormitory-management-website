import { FileDown, FileUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table/data-table";
import { Usertable, columns } from "@/components/data-table/columns"
import { getListUsers } from "@/actions/db-action";

async function getData(): Promise<Usertable[]> {
  const response: { users: Usertable[], total: number } = await getListUsers();
  return response.users;
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
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <FileDown className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-sm"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Import</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Import data</DialogTitle>
                  <DialogDescription>
                    Import data from an XLSX file, noting that all the current
                    data will be replaced by the new data.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    File
                  </Label>
                  <Input id="importfile" type="file" className="col-span-3" />
                </div>
                <DialogFooter>
                  <Button type="submit">Import</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <DataTable columns={columns} data={users} />
      </div>        
    </main>
  );
}
