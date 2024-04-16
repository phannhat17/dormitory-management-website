"use client";

import React, { useEffect, useState } from "react";

import { FileDown, FileUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getListUsers } from "@/actions/db-action";
import { UserRole, UserStatus } from "@prisma/client";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
};

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userCount, setUserCount] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getListUsers(currentPage - 1);
      setUsers(response.users);
      setUserCount(response.total);
    };

    fetchUsers();
  }, [currentPage]);

  const totalPages = Math.ceil(userCount / usersPerPage);

  const nextPage = () => {
    console.log("nextPage call");

    setCurrentPage((current) => Math.min(current + 1, totalPages));
  };

  const previousPage = () => {
    console.log("previousPage call");
    setCurrentPage((current) => Math.max(current - 1, 1));
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid auto-rows-max items-start gap-2 md:gap-8 lg:col-span-2">
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
        </div>
        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "BANNED" ? "destructive" : null
                        }
                        className={
                          user.status === "NOT_STAYING"
                            ? "border-transparent bg-[#fbcb14] text-[#543107]-foreground shadow hover:bg-[#fbcb14]/80"
                            : user.status === "STAYING"
                            ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                            : ""
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "ADMIN"
                            ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                            : user.role === "STUDENT"
                            ? "border-transparent bg-[#fbcb14] text-[#543107]-foreground shadow hover:bg-[#fbcb14]/80"
                            : ""
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="flex flex-row justify-between items-center w-full text-xs text-muted-foreground">
              <div>
                Showing <strong>{(currentPage - 1) * usersPerPage + 1}</strong>{" "}
                to{" "}
                <strong>
                  {Math.min(currentPage * usersPerPage, userCount)}
                </strong>{" "}
                of <strong>{userCount}</strong> users
              </div>
              <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={previousPage}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
