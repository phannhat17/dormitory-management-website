"use client";

import { getUserInfo, updateUser } from "@/actions/admin/user";
import { getListRooms } from "@/actions/admin/room";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
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
import { UserRole, Gender, UserStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface ReusableAlertDialogProps {
    isOpen: boolean;
    userID: string;
    setIsOpen: (isOpen: boolean) => void;
    onConfirm: () => void;
}

const EditUserCard: React.FC<ReusableAlertDialogProps> = ({ isOpen, userID, setIsOpen, onConfirm }) => {
    const router = useRouter();

    const [originalUserId, setOriginalUserId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userRole, setUserRole] = useState<UserRole | "">("");
    const [userGender, setUserGender] = useState<Gender | "">("");
    const [userRoomId, setUserRoomId] = useState<string | null>(null);
    const [userAmountPaid, setUserAmountPaid] = useState<string>("");
    const [userAmountDue, setUserAmountDue] = useState<string>("");
    const [rooms, setRooms] = useState<{ id: string; gender: Gender; current: number; max: number }[]>([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await getUserInfo(userID);
            if (response && !("error" in response)) {
                setOriginalUserId(response.id);
                setUserId(response.id);
                setUserName(response.name || '');
                setUserEmail(response.email || '');
                setUserRole(response.role);
                setUserGender(response.gender);
                const currentRoomId = response.currentRoomId ?? null;
                setUserRoomId(currentRoomId);
                const amountPaid = response.amountPaid ?? 0;
                setUserAmountPaid(amountPaid.toString());
                const amountDue = response.amountDue ?? 0;
                setUserAmountDue(amountDue.toString());
            } else {
                toast.error("Failed to fetch user information");
            }
        };

        const fetchRooms = async () => {
            const response = await getListRooms();
            if (response && !("error" in response)) {
                setRooms(response.rooms);
            } else {
                toast.error("Failed to fetch rooms");
            }
        };

        if (isOpen) {
            fetchUserInfo();
            fetchRooms();
        }
    }, [userID, isOpen]);

    const handleSaveChanges = async () => {
        const updatedUser = {
            id: originalUserId,
            newId: userId,
            name: userName,
            email: userEmail,
            role: userRole as UserRole,
            status: userRoomId ? UserStatus.STAYING : UserStatus.NOT_STAYING,
            currentRoomId: userRoomId,
            amountPaid: parseFloat(userAmountPaid),
            amountDue: parseFloat(userAmountDue),
        };

        const response = await updateUser(updatedUser);

        if (response && response.success) {
            toast.success("User updated successfully");
            onConfirm();
            router.refresh();
            setIsOpen(false);
        } else {
            toast.error(response.error || "Failed to update user");
        }
    };

    const filteredRooms = rooms.filter(room => 
        (room.gender === userGender && room.current < room.max) || room.id === userRoomId
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{userName}&apos;s Profile</DialogTitle>
                    <DialogDescription>
                        View or make changes to user profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="id" className="text-right">
                            ID
                        </Label>
                        <Input id="id" value={userId} onChange={(e) => setUserId(e.target.value)} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={userRole} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select user&apos;s role</SelectLabel>
                                    {Object.values(UserRole).map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="roomid" className="text-right">
                            Room ID
                        </Label>
                        <Select value={userRoomId || "Remove"} onValueChange={(value) => setUserRoomId(value === "Remove" ? null : value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={userRoomId || "Select a room"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Select Room</SelectLabel>
                                    <SelectItem value="Remove">None</SelectItem>
                                    {filteredRooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.id}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountPaid" className="text-right">
                            Amount Paid
                        </Label>
                        <Input id="AmountPaid" value={userAmountPaid} onChange={(e) => setUserAmountPaid(e.target.value)} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountDue" className="text-right">
                            Amount Due
                        </Label>
                        <Input id="AmountDue" value={userAmountDue} onChange={(e) => setUserAmountDue(e.target.value)} className="col-span-2" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditUserCard;
