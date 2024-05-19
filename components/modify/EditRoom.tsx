"use client";

import { getRoomInfo, updateRoom } from "@/actions/room";
import { getUsers, updateUserStatus } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Gender, UserStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import AddFacilityDialog from "./AddFacilityDialog";
import EditFacilityDialog from "./EditFacilityDialog";

interface EditRoomCardProps {
    isOpen: boolean;
    roomID: string;
    setIsOpen: (isOpen: boolean) => void;
    onConfirm: () => void;
}

const EditRoomCard: React.FC<EditRoomCardProps> = ({
    isOpen,
    roomID,
    setIsOpen,
    onConfirm,
}) => {
    const router = useRouter();

    const [originalRoomId, setOriginalRoomId] = useState<string>("");
    const [newRoomId, setNewRoomId] = useState<string>("");
    const [roomGender, setRoomGender] = useState<Gender>(Gender.FEMALE);
    const [roomPrice, setRoomPrice] = useState<string>("");
    const [maxCapacity, setMaxCapacity] = useState<number>(0);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

    const [showAddFacilityDialog, setShowAddFacilityDialog] = useState<boolean>(false);
    const [showEditFacilityDialog, setShowEditFacilityDialog] = useState<boolean>(false);
    const [facilityToEdit, setFacilityToEdit] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchRoomInfo = async () => {
                const response = await getRoomInfo(roomID);
                if (response !== null && "error" in response) {
                    toast.error(response.error);
                } else if (response !== null) {
                    setOriginalRoomId(response.id);
                    setNewRoomId(response.id);
                    setRoomGender(response.gender);
                    setRoomPrice(response.price.toString());
                    setMaxCapacity(response.max);
                    setFacilities(response.Facilities || []);
                    setUsers(response.Users || []);
                }
            };
            const fetchUsers = async () => {
                const response = await getUsers();
                if (response !== null && "error" in response) {
                    toast.error(response.error || null);
                } else if (response !== null) {
                    setAllUsers(response.users);
                }
            };
            fetchRoomInfo();
            fetchUsers();
        } else {
            setSearchQuery("");
            setFilteredUsers([]);
        }
    }, [isOpen, roomID]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredUsers(
                allUsers.filter(
                    (user) =>
                        user.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        user.gender === roomGender &&
                        !users.some((u) => u.id === user.id)
                )
            );
        } else {
            setFilteredUsers([]);
        }
    }, [searchQuery, allUsers, roomGender, users]);

    const handleGenderChange = (value: Gender) => {
        setRoomGender(value);
    };

    const handleSave = async () => {
        if (users.length > maxCapacity) {
            toast.error("Cannot save changes. The number of users exceeds the maximum room capacity.");
            return;
        }

        const response = await updateRoom({
            originalId: originalRoomId,
            newId: newRoomId,
            gender: roomGender,
            price: parseFloat(roomPrice),
            facilities: facilities.map((facility) => facility.id),
            users: users.map((user) => user.id),
            max: maxCapacity,
        });

        if ("success" in response) {
            const updateUserStatusPromises = users.map(user => updateUserStatus(user.id, UserStatus.STAYING));
            const updateUserStatusResponses = await Promise.all(updateUserStatusPromises);

            const failedUpdates = updateUserStatusResponses.filter(res => res.error);
            if (failedUpdates.length > 0) {
                toast.error("Room saved, but some user statuses were not updated.");
            } else {
                toast.success(response.success);
            }

            onConfirm();
            router.refresh();
            setIsOpen(false);
        } else {
            toast.error(response.error);
        }
    };

    const handleAddUser = (userId: string) => {
        if (users.length >= maxCapacity) {
            toast.error("Cannot add more users. Room capacity reached.");
            return;
        }
        const user = allUsers.find((user) => user.id === userId);
        if (user && !users.some((u) => u.id === user.id)) {
            setUsers([...users, user]);
        }
    };

    const handleRemoveUser = (userId: string) => {
        setUsers(users.filter((user) => user.id !== userId));
    };

    const handleAddFacility = (facility: any) => {
        setFacilities([...facilities, facility]);
    };

    const handleEditFacility = (facility: any) => {
        setFacilityToEdit(facility);
        setShowEditFacilityDialog(true);
    };

    const handleUpdateFacility = (updatedFacility: any) => {
        setFacilities(facilities.map(facility => facility.id === updatedFacility.id ? updatedFacility : facility));
        setShowEditFacilityDialog(false);
    };

    const handleRemoveFacility = (facilityId: number) => {
        setFacilities(facilities.filter(facility => facility.id !== facilityId));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl overflow-auto max-h-screen">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        View or make changes to the room profile here. Click save when
                        you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="id" className="text-right">
                            Room ID
                        </Label>
                        <Input
                            id="id"
                            value={newRoomId}
                            onChange={(e) => setNewRoomId(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">
                            Gender
                        </Label>
                        <Select onValueChange={handleGenderChange} value={roomGender}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={roomGender} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select gender</SelectLabel>
                                    {Object.values(Gender).map((gender) => (
                                        <SelectItem key={gender} value={gender}>
                                            {gender}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price
                        </Label>
                        <Input
                            id="price"
                            value={roomPrice}
                            onChange={(e) => setRoomPrice(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maxCapacity" className="text-right">
                            Max Capacity
                        </Label>
                        <Input
                            id="maxCapacity"
                            type="number"
                            value={maxCapacity}
                            onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                            className="col-span-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="users" className="text-right">
                        Users
                    </Label>
                    <div className="col-span-2 flex items-center gap-4">
                        <Input
                            placeholder="Search by User ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Select onValueChange={handleAddUser}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select user to add" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select User</SelectLabel>
                                    {filteredUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-4 flex flex-col gap-2">
                    <Label htmlFor="currentUsers" className="text-right">
                    </Label>
                    <div className="col">
                        {users.map((user) => (
                            <li key={user.id} className="flex items-center justify-between my-1">
                                <Button variant="outline" className="hover:bg-transparent hover:text-inherit hover cursor-text mr-1">
                                    {user.id} - {user.name}
                                </Button>
                                <Button variant="ghost" onClick={() => handleRemoveUser(user.id)} size="sm">
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="facilities" className="text-right">
                        Facilities
                    </Label>
                    <div className="col-span-2 flex items-center gap-4">
                        <Button type="button" size="sm" onClick={() => setShowAddFacilityDialog(true)}>
                            Add Facility
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-4 flex flex-col gap-2">
                    <Label htmlFor="currentFacilities" className="text-right">
                    </Label>
                    <div className="col">
                        {facilities.map((facility) => (
                            <li key={facility.id} className="flex items-center justify-between my-1">
                                
                                <Button
                                    variant="outline"
                                    className="hover:bg-transparent hover:text-inherit mr-1"
                                    onClick={() => handleEditFacility(facility)}
                                >
                                    {facility.name} x {facility.number}: {facility.status} - Price: {facility.price} VND
                                </Button>
                                <Button variant="ghost" onClick={() => handleRemoveFacility(facility.id)} size="sm">
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </div>
                </div>
                <AddFacilityDialog
                    isOpen={showAddFacilityDialog}
                    setIsOpen={setShowAddFacilityDialog}
                    onAddFacility={handleAddFacility}
                    currentRoomId={newRoomId}
                />
                {facilityToEdit && (
                    <EditFacilityDialog
                        isOpen={showEditFacilityDialog}
                        setIsOpen={setShowEditFacilityDialog}
                        facility={facilityToEdit}
                        onUpdateFacility={handleUpdateFacility}
                    />
                )}
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

export default EditRoomCard;