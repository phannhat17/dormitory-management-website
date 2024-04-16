"use client";

import {
  SquareX,
  SquareCheck,
  ShieldCheck,
  GraduationCap,
  Users,
  Ban,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { getTotalUser } from "@/actions/db-action";

export default function AdminDashboard() {
  const [totalUser, setTotalUser] = useState<number | undefined>(undefined);
  const [numStudent, setNumStudent] = useState<number | undefined>(undefined);
  const [numAdmin, setNumAdmin] = useState<number | undefined>(undefined);
  const [numStaying, setNumStaying] = useState<number | undefined>(undefined);
  const [numNotStaying, setNumNotStaying] = useState<number | undefined>(
    undefined
  );
  const [numBanned, setNumBanned] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchNumUsers = async () => {
      const response = await getTotalUser();
      setTotalUser(response.totalUsers);
      setNumStudent(response.studentCount);
      setNumAdmin(response.adminCount);
      setNumStaying(response.stayingCount);
      setNumNotStaying(response.notStayingCount);
      setNumBanned(response.bannedCount);
    };

    fetchNumUsers();
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 ">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total user</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUser}</div>
              <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total student
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numStudent}</div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total staff</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numAdmin}</div>
              <p className="text-xs text-muted-foreground">Staff</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staying</CardTitle>
              <SquareCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numStaying}</div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Staying</CardTitle>
              <SquareX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numNotStaying}</div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numBanned}</div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
