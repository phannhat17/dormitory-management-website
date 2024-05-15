"use client"

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";


const ProfileCard = () => {
  const user = useCurrentUser();
  
  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle className="text-2xl">Profile</CardTitle>
        <CardDescription>Your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between my-4">
          <p className="font-medium mx-5">User ID</p>
          <p className="font-medium mx-5">{user?.id}</p>
        </div>
        <div className="flex flex-row items-center justify-between my-4">
          <p className="font-medium mx-5">User Name</p>
          <p className="font-medium mx-5">{user?.name}</p>
        </div>
        <div className="flex flex-row items-center justify-between my-4">
          <p className="font-medium mx-5">Email</p>
          <p className="font-medium mx-5">{user?.email}</p>
        </div>
        <div className="flex flex-row items-center justify-between my-4">
          <p className="font-medium mx-5">Gender</p>
          <p className="font-medium mx-5">
            <Badge
              className={
                user?.gender === "FEMALE"
                  ? "border-transparent bg-[#d7dbfa] text-[#543107]-foreground shadow hover:bg-[#d7dbfa]/80"
                  : user?.gender === "MALE"
                  ? "border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80"
                  : ""
              }
            >
              {user?.gender}
            </Badge>
          </p>
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
              <Badge className="border-transparent bg-emerald-500 text-primary-foreground shadow hover:bg-emerald-500/80">
                {user?.role}
              </Badge>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
