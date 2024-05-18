"use client";

import { getRoomInfo, updateRoom, getUsers } from "@/actions/room";
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
import { Gender } from "@prisma/client";
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            const response = await getRoomInfo(roomID);
            if (response !== null && "error" in response) {
                setError(response.error);
            } else if (response !== null) {
                setOriginalRoomId(response.id);
                setNewRoomId(response.id);
                setRoomGender(response.gender);
                setRoomPrice(response.price.toString());
                setMaxCapacity(response.max);
                setFacilities(response.Facilities || []);
                setUsers(response.Users || []);
                setError(null);
            }
        };
        const fetchUsers = async () => {
            const response = await getUsers();
            if (response !== null && "error" in response) {
                setError(response.error || null);
            } else if (response !== null) {
                setAllUsers(response.users);
            }
        };
        fetchRoomInfo();
        fetchUsers();
    }, [roomID]);

    useEffect(() => {
        if (searchQuery) {
            setFilteredUsers(
                allUsers.filter(
                    (user) =>
                        user.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        user.gender === roomGender
                )
            );
        } else {
            setFilteredUsers([]);
        }
    }, [searchQuery, allUsers, roomGender]);

    const handleGenderChange = (value: Gender) => {
        setRoomGender(value);
    };

    const handleSave = async () => {
        if (users.length > maxCapacity) {
            setError("Cannot save changes. The number of users exceeds the maximum room capacity.");
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
            toast.success(response.success);
            onConfirm();
            router.refresh();
            setIsOpen(false);
        } else {
            toast(response.error);
        }
    };

    const handleAddUser = (userId: string) => {
        if (users.length >= maxCapacity) {
            setError("Cannot add more users. Room capacity reached.");
            return;
        }
        const user = allUsers.find((user) => user.id === userId);
        if (user && !users.some((u) => u.id === user.id)) {
            setUsers([...users, user]);
        }
        setSearchQuery("");
        setError(null);
    };

    const handleRemoveUser = (userId: string) => {
        setUsers(users.filter((user) => user.id !== userId));
        setError(null);
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
                {error && <div className="text-red-500">{error}</div>}
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