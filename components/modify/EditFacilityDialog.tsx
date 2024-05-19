"use client";

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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateFacility } from "@/actions/room";

interface EditFacilityDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    facility: any;
    onUpdateFacility: (facility: any) => void;
}

const EditFacilityDialog: React.FC<EditFacilityDialogProps> = ({
    isOpen,
    setIsOpen,
    facility,
    onUpdateFacility,
}) => {
    const [facilityName, setFacilityName] = useState<string>(facility?.name || "");
    const [facilityNumber, setFacilityNumber] = useState<number>(facility?.number || 0);
    const [facilityStatus, setFacilityStatus] = useState<string>(facility?.status || "");
    const [facilityPrice, setFacilityPrice] = useState<number>(facility?.price || 0);

    useEffect(() => {
        if (facility) {
            setFacilityName(facility.name);
            setFacilityNumber(facility.number);
            setFacilityStatus(facility.status);
            setFacilityPrice(facility.price);
        }
    }, [facility]);

    const handleSave = async () => {
        if (!facilityName || facilityNumber <= 0 || !facilityStatus || facilityPrice <= 0) {
            toast.error("Please fill in all fields to update the facility.");
            return;
        }

        const updatedFacility = {
            id: facility.id,
            name: facilityName,
            number: facilityNumber,
            status: facilityStatus,
            price: facilityPrice,
        };

        const response = await updateFacility(updatedFacility);

        if ("success" in response) {
            toast.success(response.success);
            onUpdateFacility(updatedFacility);
        } else {
            toast.error(response.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Facility</DialogTitle>
                    <DialogDescription>
                        Update the details of the facility.
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
                            value={facilityNumber}
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
                            value={facilityPrice}
                            onChange={(e) => setFacilityPrice(parseInt(e.target.value, 10))}
                            className="col-span-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSave}>
                        Save Facility
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditFacilityDialog;