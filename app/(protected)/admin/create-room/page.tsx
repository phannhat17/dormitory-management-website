"use client";

import { createRoomWithFacilities } from "@/actions/room";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import ExcelJS from "exceljs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Gender = "MALE" | "FEMALE";

interface Facility {
  name: string;
  number: number;
  status: string;
  price: number;
}

interface Room {
  roomId: string;
  gender: Gender;
  price: number;
  max: number;
  facilities: Facility[];
}

const CreateRoomPage = () => {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  const formMethods = useForm({
    resolver: zodResolver(z.object({})),
  });

  const onSubmit = async () => {

    if (!file) {
      toast.error("Please upload a file.");
      return;
    }

    startTransition(async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        const roomsMap: Record<string, Room> = {};

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          const roomId = row.getCell(1).value?.toString() || "";
          const genderValue = row.getCell(2).value?.toString()?.toUpperCase();
          const gender: Gender = genderValue === "MALE" ? "MALE" : "FEMALE";
          const price = parseFloat(row.getCell(3).value?.toString() || "0");
          const max = parseInt(row.getCell(4).value?.toString() || "0", 10);
          const facilityName = row.getCell(5).value?.toString() || "";
          const facilityNumber = parseInt(row.getCell(6).value?.toString() || "0", 10);
          const facilityStatus = row.getCell(7).value?.toString() || "";
          const facilityPrice = parseFloat(row.getCell(8).value?.toString() || "0");

          if (!facilityStatus || facilityPrice <= 0) {
            toast.error(`Invalid gender value in row ${rowNumber}. Skipping this row!`);
            return;
          }

          const facility: Facility = {
            name: facilityName,
            number: facilityNumber,
            status: facilityStatus,
            price: facilityPrice,
          };

          if (!roomsMap[roomId]) {
            roomsMap[roomId] = {
              roomId,
              gender,
              price,
              max,
              facilities: [facility],
            };
          } else {
            roomsMap[roomId].facilities.push(facility);
          }
        });

        const rooms: Room[] = Object.values(roomsMap);

        // Log parsed data to inspect its structure
        console.log(JSON.stringify(rooms, null, 2));

        const response = await createRoomWithFacilities({ rooms });

        if (response.error) {
          console.log(JSON.stringify(response.details, null, 2));
        }

        if (response.error) {
          toast.error(response.error);
        } else if (response.success) {
          toast.success(response.success);
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to parse the file.");
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Create new rooms with facilities</h1>
      </div>
      <div className="mx-auto w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Input type="file" accept=".xlsx" onChange={handleFileChange} />
            <Button type="submit" disabled={isPending} className="mt-3">
              Upload and Create
            </Button>
          </form>
        </FormProvider>
      </div>
    </main>
  );
};

export default CreateRoomPage;
