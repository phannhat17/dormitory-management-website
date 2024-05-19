"use client";

import { createFacility } from "@/actions/room"; // Adjust the import path accordingly
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
import React, { useState } from "react";
import { toast } from "sonner";

interface AddFacilityDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onAddFacility: (facility: any) => void;
    currentRoomId: string;
}

const AddFacilityDialog: React.FC<AddFacilityDialogProps> = ({
    isOpen,
    setIsOpen,
    onAddFacility,
    currentRoomId,
}) => {
    const [facilityName, setFacilityName] = useState<string>("");
    const [facilityNumber, setFacilityNumber] = useState<number | null>(null);
    const [facilityStatus, setFacilityStatus] = useState<string>("");
    const [facilityPrice, setFacilityPrice] = useState<number | null>(null);

    const handleCreateFacility = async () => {
        if (facilityName === "" || facilityNumber === null || facilityStatus === "" || facilityPrice === null) {
            toast.error("Please fill in all fields to create a facility.");
            return;
        }

        const response = await createFacility({
            name: facilityName,
            number: facilityNumber,
            status: facilityStatus,
            price: facilityPrice,
            currentRoomId: currentRoomId,
        });

        if ("success" in response) {
            onAddFacility(response.facility);
            toast.success(response.success);
            setIsOpen(false);
            setFacilityName("");
            setFacilityNumber(null);
            setFacilityStatus("");
            setFacilityPrice(null);
        } else {
            toast.error(response.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add Facility</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new facility.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facilityName" className="text-right">
                            Facility Name
                        </Label>
                        <Input
                            id="facilityName"
                            value={facilityName}
                            onChange={(e) => setFacilityName(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facilityNumber" className="text-right">
                            Facility Number
                        </Label>
                        <Input
                            id="facilityNumber"
                            type="number"
                            value={facilityNumber !== null ? facilityNumber : ""}
                            onChange={(e) => setFacilityNumber(parseInt(e.target.value, 10))}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facilityStatus" className="text-right">
                            Facility Status
                        </Label>
                        <Input
                            id="facilityStatus"
                            value={facilityStatus}
                            onChange={(e) => setFacilityStatus(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="facilityPrice" className="text-right">
                            Facility Price
                        </Label>
                        <Input
                            id="facilityPrice"
                            type="number"
                            value={facilityPrice !== null ? facilityPrice : ""}
                            onChange={(e) => setFacilityPrice(parseInt(e.target.value, 10))}
                            className="col-span-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleCreateFacility}>
                        Create Facility
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddFacilityDialog;