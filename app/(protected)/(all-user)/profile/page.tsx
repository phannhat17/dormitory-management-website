"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const user = useCurrentUser();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
      </div>
      <div className="mx-auto w-full max-w-4xl items-start gap-6">
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center justify-between my-4">
              <p className="font-medium mx-5">Student ID</p>
              <p className="font-medium mx-5">{user?.id}</p>
            </div>
            <div className="flex flex-row items-center justify-between my-4">
              <p className="font-medium mx-5">Student Name</p>
              <p className="font-medium mx-5">{user?.name}</p>
            </div>
            <div className="flex flex-row items-center justify-between my-4">
              <p className="font-medium mx-5">Email</p>
              <p className="font-medium mx-5">{user?.email}</p>
            </div>
            <div className="flex flex-row items-center justify-between my-4">
              <p className="font-medium mx-5">Status</p>
              <p className="font-medium mx-5">
                <Badge
                  variant={user?.status === "BANNED" ? "destructive" : null}
                  className={
                    user?.status === "NOT_STAYING"
                      ? "border-transparent bg-[#fbcb14] text-[#543107]-foreground shadow hover:bg-[#fbcb14]/80"
                      : user?.status === "STAYING"
                        ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                        : ""
                  }
                >
                  {user?.status}
                </Badge>
              </p>
            </div>
            {user?.role === "ADMIN" && (
              <div className="flex flex-row items-center justify-between my-4">
                <p className="font-medium mx-5">Role</p>
                <p className="font-medium mx-5">
                  <Badge
                    className="border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                  >
                    {user?.role}
                  </Badge>
                </p>
              </div>
            )}

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Dialog>
              <DialogTrigger>
                <Button>Update profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Need permission</DialogTitle>
                  <DialogDescription>
                    This action cannot be done. You need administrator permission to perform this action.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}