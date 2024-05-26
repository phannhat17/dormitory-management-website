"use client";

import React, { useEffect, useState } from "react";
import { Users, DollarSign, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserInfo } from "@/actions/user";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Gender, UserRole, UserStatus } from "@prisma/client";

const Dashboard = () => {
  const user = useCurrentUser();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Info</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{user?.name}</div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2">{user?.role}</Badge>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Info</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {user?.currentRoomId ? user?.currentRoomId : "No Room Assigned"}
              </div>
              {user?.currentRoomId && (
                <p className="text-xs text-muted-foreground">
                  {/* Room Status: {user?.roomStatus} */}
                </p>
              )}
              <Badge className="mt-2">
                {user?.gender === "MALE" ? "Male Dormitory" : "Female Dormitory"}
              </Badge>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${user?.amountPaid || 0}</div>
              <p className="text-xs text-muted-foreground">
                Amount Due: ${user?.amountDue || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
