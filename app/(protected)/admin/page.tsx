"use client";

import {
  Activity,
  Ban,
  GraduationCap,
  ShieldCheck,
  SquareCheck,
  SquareX,
  Users,
} from "lucide-react";

import { getTotalUser } from "@/actions/db-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getRoomStatistics } from "@/actions/room";

export default function AdminDashboard() {
  const [totalUser, setTotalUser] = useState<number | undefined>(undefined);
  const [numStudent, setNumStudent] = useState<number | undefined>(undefined);
  const [numAdmin, setNumAdmin] = useState<number | undefined>(undefined);
  const [numStaying, setNumStaying] = useState<number | undefined>(undefined);
  const [numNotStaying, setNumNotStaying] = useState<number | undefined>(
    undefined
  );
  const [numBanned, setNumBanned] = useState<number | undefined>(undefined);

  const [totalRooms, setTotalRooms] = useState(0);
  const [maleRooms, setMaleRooms] = useState(0);
  const [femaleRooms, setFemaleRooms] = useState(0);
  const [fullRooms, setFullRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);


  useEffect(() => {
    const fetchNumUsers = async () => {
      const responseUser = await getTotalUser();
      const roomStats = await getRoomStatistics();
      setTotalUser(responseUser.totalUsers);
      setNumStudent(responseUser.studentCount);
      setNumAdmin(responseUser.adminCount);
      setNumStaying(responseUser.stayingCount);
      setNumNotStaying(responseUser.notStayingCount);
      setNumBanned(responseUser.bannedCount);

      setTotalRooms(roomStats.totalRooms);
      setMaleRooms(roomStats.maleRooms);
      setFemaleRooms(roomStats.femaleRooms);
      setFullRooms(roomStats.fullRooms);
      setAvailableRooms(roomStats.availableRooms);

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
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRooms}</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Male Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maleRooms}</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Female Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{femaleRooms}</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Rooms</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fullRooms}</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableRooms}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
