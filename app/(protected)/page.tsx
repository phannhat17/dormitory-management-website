"use client";

import React, { useEffect, useState } from "react";
import { Users, DollarSign, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserInfo, getAvailableRooms, requestRoomChange } from "@/actions/student/user";
import { getRoomChangeRequests, deleteRoomChangeRequest } from "@/actions/student/request";
import { User, Room, Gender, RequestStatus } from "@prisma/client";
import { BeatLoader } from "react-spinners"

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

interface RoomChangeRequest {
  id: string;
  userId: string;
  fromRoomId: string | null;
  toRoomId: string;
  status: RequestStatus;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RoomChangeRequest[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userInfo, rooms, requests] = await Promise.all([
          getUserInfo(),
          getAvailableRooms(),
          getRoomChangeRequests()
        ]);

        if (userInfo.error) {
          toast.error(userInfo.error);
        } else {
          setUser(userInfo.user ?? null);
        }

        if (rooms.error) {
          toast.error(rooms.error);
        } else {
          setAvailableRooms(rooms.availableRooms ?? []);
        }

        if (requests.error) {
          toast.error(requests.error);
        } else {
          setPendingRequests(requests.requests ?? []);
        }
      } catch (error) {
        toast.error("Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRoomChange = async (toRoomId: string) => {
    if (isRequesting || !user) return;

    setIsRequesting(true);
    try {
      const response = await requestRoomChange(toRoomId);

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(response.success);
        const updatedRequests = await getRoomChangeRequests();
        setPendingRequests(updatedRequests.requests ?? []);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const response = await deleteRoomChangeRequest(requestId);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(response.success);
        const updatedRequests = await getRoomChangeRequests();
        setPendingRequests(updatedRequests.requests ?? []);
      }
    } catch (error) {
      toast.error("Failed to delete the request.");
    }
  };

  const hasPendingRequestForRoom = (roomId: string) => {
    return pendingRequests.some(request => request.toRoomId === roomId && request.status === "PENDING");
  };

  const hasPendingRequest = pendingRequests.some(request => request.status === "PENDING");


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
    <BeatLoader />
  </div>;
  }

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
              <p className="text-xs text-muted-foreground">{user?.id ?? "N/A"}</p>
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
                    {roommate.name} - {roommate.id}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Facilities:</p>
                {user?.Room?.Facilities.map((facility) => (
                  <div key={facility.id} className="text-xs">
                    {facility.name} x {facility.number}: {facility.status}
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
                    Price: {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(room.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Occupants: {room.current}/{room.max}
                  </p>
                  <Button
                    className="mt-2"
                    onClick={() => handleRoomChange(room.id)}
                    disabled={isRequesting || hasPendingRequest}
                  >
                    {hasPendingRequestForRoom(room.id) ? "Request Pending" : "Request Room Change"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Your Room Change Requests</h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Request to Room {request.toRoomId}</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Status: {request.status}</div>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => handleDeleteRequest(request.id)}
                    disabled={request.status !== "PENDING"}
                  >
                    {request.status === "PENDING" ? "Cancel Request" : "Cannot Cancel"}
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
