"use client";

import React, { useEffect, useState } from "react";
import { Users, DollarSign, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserInfo, getAvailableRooms, requestRoomChange } from "@/actions/student/user";
import { User, Room, Gender, RoomStatus, UserStatus } from "@prisma/client";

interface Facility {
  id: number;
  name: string;
  number: number;
  currentRoomId: string;
  status: string;
  price: number;
}

interface UserWithRelations extends User {
  Room: (Room & {
    Facilities: Facility[];
    Users: User[];
  }) | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const userInfo = await getUserInfo();
      if (userInfo.error) {
        toast.error(userInfo.error);
      } else {
        setUser(userInfo.user ?? null);
      }

      const rooms = await getAvailableRooms();
      setAvailableRooms(rooms.availableRooms);
    }

    fetchData();
  }, []);

  const handleRoomChange = async (toRoomId: string) => {
    if (isRequesting || !user) return;

    setIsRequesting(true);
    const response = await requestRoomChange(user.id, toRoomId);
    setIsRequesting(false);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.success);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Info</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{user?.name ?? "N/A"}</div>
              <p className="text-xs text-muted-foreground">{user?.email ?? "N/A"}</p>
              <Badge className="mt-2">{user?.role ?? "N/A"}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Info</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {user?.Room?.id ?? "No Room Assigned"}
              </div>
              {user?.Room?.id && (
                <p className="text-xs text-muted-foreground">
                  Room Status: {user?.Room?.status}
                </p>
              )}
              <Badge className="mt-2">
                {user?.gender === "MALE" ? "Male Dormitory" : "Female Dormitory"}
              </Badge>
              <div className="mt-2">
                <p className="text-sm font-medium">Roommates:</p>
                {user?.Room?.Users.map((roommate) => (
                  <div key={roommate.id} className="text-xs">
                    {roommate.name}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Facilities:</p>
                {user?.Room?.Facilities.map((facility) => (
                  <div key={facility.id} className="text-xs">
                    {facility.name}: {facility.status}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">${user?.amountPaid ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Amount Due: ${user?.amountDue ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Available Rooms</h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-4">
            {availableRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Room {room.id}</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{room.gender}</div>
                  <p className="text-xs text-muted-foreground">
                    Price: {room.price} million dong
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Occupants: {room.current}/{room.max}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleRoomChange(room.id)}
                    disabled={isRequesting}
                  >
                    Request Room Change
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
