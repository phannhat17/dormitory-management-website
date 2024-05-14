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
  
    useEffect(() => {
        const fetchUserInfo = async () => {
          const response = await getUserInfo(userID);
          if (response) {
            setUserId(response.id);
            setUserName(response.name || '');
            setUserEmail(response.email || '');
            setUserRole(response.role);
            setUserStatus(response.status);

            const currentRoomId = response.currentRoomId ?? 0; 
            setUserRoomId(currentRoomId.toString());

            const amountPaid = response.amountPaid ?? 0; 
            setUserAmountPaid(amountPaid.toString());

            const amountDue = response.amountDue ?? 0; 
            setUserAmountDue(amountDue.toString());
          } 
        };
      
        fetchUserInfo();
      }, [userID]); 
  
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
                        <Label htmlFor="username" className="text-right">
                        Role
                        </Label>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={userRole}/>
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
                        <Label htmlFor="username" className="text-right">
                            Status
                        </Label>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={userStatus}/>
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Modify user&apos;s status</SelectLabel>
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
                        <Input id="roomid" value={userRoomId} onChange={(e) => setUserRoomId(e.target.value)} className="col-span-2" />
                    </div>    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountPaid" className="text-right">
                        Amount Paid
                        </Label>
                        <Input id="AmountPaid" value={userAmountPaid} onChange={(e) => setUserAmountPaid(e.target.value)} className="col-span-2" />
                    </div> 
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="AmountPaid" className="text-right">
                        Amount Due
                        </Label>
                        <Input id="AmountPaid" value={userAmountDue} onChange={(e) => setUserAmountDue(e.target.value)} className="col-span-2" />
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