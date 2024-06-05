"use client";
import React, { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUserInfo, getAvailableRooms, requestRoomChange } from "@/actions/student/user";
import { getRoomChangeRequests, deleteRoomChangeRequest } from "@/actions/student/request";
import { User, Room, RequestStatus } from "@prisma/client";
import { DollarSign, Home, Users } from "lucide-react";
import DOMPurify from "dompurify";

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
  Contracts: {
    id: number;
    startDate: Date;
    endDate: Date;
    Invoices: {
      id: number;
      amountPaid: number;
      amountDue: number;
    }[];
  }[];
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
        const userInfo = await getUserInfo();
        if (userInfo.error) {
          toast.error(userInfo.error);
        } else {
          setUser(userInfo.user ?? null);
          const requests = await getRoomChangeRequests();
          setPendingRequests(requests.requests?.filter(request => request.status === "PENDING") ?? []);
        }

        const rooms = await getAvailableRooms();
        setAvailableRooms(rooms.availableRooms ?? []);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRoomChange = async (toRoomId: string) => {
    if (isRequesting || !user || user.currentRoomId === toRoomId) return;

    setIsRequesting(true);
    const response = await requestRoomChange(toRoomId);
    setIsRequesting(false);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.success);
      const updatedRequests = await getRoomChangeRequests();
      setPendingRequests(updatedRequests.requests?.filter(request => request.status === "PENDING") ?? []);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    const response = await deleteRoomChangeRequest(requestId);
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.success);
      const updatedRequests = await getRoomChangeRequests();
      setPendingRequests(updatedRequests.requests?.filter(request => request.status === "PENDING") ?? []);
    }
  };

  const hasPendingRequestForRoom = (roomId: string) => {
    return pendingRequests.some(request => request.toRoomId === roomId && request.status === "PENDING");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader />
      </div>
    );
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
              <div className="text-xl font-bold">{user?.name ? DOMPurify.sanitize(user?.name) : "N/A"}</div>
              <p className="text-xs text-muted-foreground">{user?.id ? DOMPurify.sanitize(user?.id) : "N/A"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ? DOMPurify.sanitize(user?.email) : "N/A"}</p>
              <Badge className="mt-2">{user?.role ? DOMPurify.sanitize(user?.role) : "N/A"}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Info</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{user?.Room?.id ? DOMPurify.sanitize(user?.Room?.id) : "No Room Assigned"}</div>
              {user?.Room?.id && (
                <p className="text-xs text-muted-foreground">
                  Room Status: {user?.Room?.status ? DOMPurify.sanitize(user?.Room?.status) : ''}
                </p>
              )}
              <Badge className="mt-2">
                {user?.gender ? (user?.gender === "MALE" ? "Male Dormitory" : "Female Dormitory") : ''}
              </Badge>
              <div className="mt-2">
                <p className="text-sm font-medium">Roommates:</p>
                {user?.Room?.Users.map((roommate) => (
                  <div key={roommate.id} className="text-xs">
                    {roommate.name ? DOMPurify.sanitize(roommate.name) : ''} - {roommate.id ? DOMPurify.sanitize(roommate.id) : ''}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Facilities:</p>
                {user?.Room?.Facilities.map((facility) => (
                  <div key={facility.id} className="text-xs">
                    {facility.name ? DOMPurify.sanitize(facility.name) : ''} x {facility.number}: {facility.status ? DOMPurify.sanitize(facility.status) : ''}
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
              {user?.Contracts.map((contract) => (
                <div key={contract.id} className="mb-4">
                  <div className="text-lg font-bold">
                    Contract Start Date: {new Date(contract.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-bold">
                    Contract End Date: {new Date(contract.endDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    {contract.Invoices.map((invoice) => (
                      <div key={invoice.id} className="text-sm text-muted-foreground">
                        Amount Due: {invoice.amountDue}, Amount Paid: {invoice.amountPaid}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Available Rooms</h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-4">
            {availableRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Room {room.id ? DOMPurify.sanitize(room.id) : ''}</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{room.gender ? DOMPurify.sanitize(room.gender) : ''}</div>
                  <p className="text-xs text-muted-foreground">Price: {DOMPurify.sanitize(String(room.price))} million dong</p>
                  <p className="text-xs text-muted-foreground">Current Occupants: {DOMPurify.sanitize(String(room.current))}/{DOMPurify.sanitize(String(room.max))}</p>                  <Button
                    className="mt-2"
                    onClick={() => handleRoomChange(room.id)}
                    disabled={isRequesting || hasPendingRequestForRoom(room.id) || user?.currentRoomId === room.id || pendingRequests.length > 0}
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
                  <CardTitle className="text-sm font-medium">Request to Room {request.toRoomId ? DOMPurify.sanitize(request.toRoomId) : ''}</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Status: {request.status ? DOMPurify.sanitize(request.status) : ''}</div>
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
