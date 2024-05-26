"use client";

import { createUser } from "@/actions/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import ExcelJS from "exceljs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateUserSchema } from "@/schemas";
import { toast } from "sonner";

const CreateUserPage = () => {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  const formMethodsStudent = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      students: [],
    },
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

        const students: { studentid: string; name: string; email: string; gender: "MALE" | "FEMALE" }[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          const studentid = row.getCell(1).value?.toString() || "";
          const name = row.getCell(2).value?.toString() || "";
          const email = row.getCell(3).value?.toString() || "";
          const genderValue = row.getCell(4).value?.toString()?.toUpperCase() as "MALE" | "FEMALE";

          // Ensure gender is either "MALE" or "FEMALE"
          if (genderValue !== "MALE" && genderValue !== "FEMALE") {
            toast.error(`Invalid gender value in row ${rowNumber}. Skipping this row!`);
            return;
          }

          students.push({
            studentid,
            name,
            email,
            gender: genderValue,
          });
        });

        const response = await createUser({ students });

        if (response.error) {
          toast.error(response.error);
        } else if (response.success) {
          toast.success(response.success);
        }

      } catch (err) {
        toast.error("Failed to parse the file.")
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
        <h1 className="text-3xl font-semibold">Create new users</h1>
      </div>
      <div className="mx-auto w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <FormProvider {...formMethodsStudent}>
          <form onSubmit={formMethodsStudent.handleSubmit(onSubmit)}>
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

export default CreateUserPage;
