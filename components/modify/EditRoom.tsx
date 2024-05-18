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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
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
                        <Label htmlFor="facilities" className="text-right">
                            Facilities
                        </Label>
                        <ul className="col-span-2">
                            {facilities.map((facility) => (
                                <li key={facility.id}>
                                    {facility.id}: {facility.status}, {facility.price}
                                </li>
                            ))}
                        </ul>
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
                    <Label htmlFor="curentusers" className="text-right">
                    </Label>
                    <div className="col">{users.map((user) => (
                        <li key={user.id} className="flex items-center justify-between">
                            <Button variant="outline" className="hover:bg-transparent hover:text-inherit hover cursor-text">{user.id} {user.name}</Button>
                            <Button variant="ghost" onClick={() => handleRemoveUser(user.id)} size="sm">
                                Remove
                            </Button>
                        </li>
                    ))}</div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoomCard;