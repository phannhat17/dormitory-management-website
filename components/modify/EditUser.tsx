"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserInfo } from "@/actions/user"
import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { UserRole, UserStatus } from "@prisma/client";

interface ReusableAlertDialogProps {
    isOpen: boolean;
    userID: string;
    setIsOpen: (isOpen: boolean) => void;
    onConfirm: () => void;
}

const EditUserCard: React.FC<ReusableAlertDialogProps> = ({ isOpen, userID, setIsOpen, onConfirm }) => {
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [userStatus, setUserStatus] = useState<string>("");
    const [userRoomId, setUserRoomId] = useState<string>("");
    const [userAmountPaid, setUserAmountPaid] = useState<string>("");
    const [userAmountDue, setUserAmountDue] = useState<string>("");
    const [userFeedbackCount, setUserFeedbackCount] = useState<number>(0);
  
    useEffect(() => {
      const fetchUserInfo = async () => {
        const response = await getUserInfo(userID);
        console.log(response)
        setUserId(response.id);
        setUserName(response.name);
        setUserEmail(response.email);
        setUserRole(response.role);
        setUserStatus(response.status);
        setUserFeedbackCount(response.feedbackCount);
        setUserRoomId(response.currentRoomId);
        setUserAmountPaid(response.amountPaid);
        setUserAmountDue(response.amountDue);
      };
  
      fetchUserInfo();
    });
  
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                <DialogTitle>{userName}'s Profile</DialogTitle>
                <DialogDescription>
                    View or make changes to user profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="id" className="text-right">
                        ID
                        </Label>
                        <Input id="userId" value={userId} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Name
                        </Label>
                        <Input id="name" value={userName} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                        Email
                        </Label>
                        <Input id="email" value={userEmail} className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                        Role
                        </Label>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={userRole}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Select user's role</SelectLabel>
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
                        <Label htmlFor="username" className="text-right">
                            Status
                        </Label>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={userStatus}/>
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Modify user's status</SelectLabel>
                                {Object.values(UserStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
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
                        <Input id="roomid" value={userRoomId} className="col-span-2" />
                    </div>    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountPaid" className="text-right">
                        Amount Paid
                        </Label>
                        <Input id="AmountPaid" value={userAmountPaid} className="col-span-2" />
                    </div> 
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountPaid" className="text-right">
                        Amount Due
                        </Label>
                        <Input id="AmountPaid" value={userAmountDue} className="col-span-2" />
                    </div> 
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                        Number of feedbacks
                        </Label>
                        <div className="font-medium text-sm col-span-2"><p className="text-primary">{userFeedbackCount}</p></div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={onConfirm}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditUserCard;