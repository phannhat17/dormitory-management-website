import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from "zod";
import { CreateUserSchema } from "@/schemas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { Label } from "@/components/ui/label";

interface StudentData {
  studentid: string;
  name: string;
  email: string;
}

interface AddStudentCardProps {
  isPending: boolean;
  error: string | undefined;
  success: string | undefined;
  onSubmit: (values: z.infer<typeof CreateUserSchema>) => void;
}

const AddStudentCard: React.FC<AddStudentCardProps> = ({ isPending, error, success, onSubmit }) => {
  const form = useFormContext<z.infer<typeof CreateUserSchema>>();
  const [studentData, setStudentData] = useState<StudentData[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      const jsonData: StudentData[] = [];


      if (worksheet) {
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const [studentidCell, nameCell, emailCell] = Array.prototype.slice.call(row.values, 1, 4);
            const studentid = studentidCell?.toString() || '';
            const name = nameCell?.toString() || '';
            const email = emailCell?.toString() || '';
            jsonData.push({ studentid, name, email });
          }
        });
      }

      setStudentData(jsonData);
    }
  };



  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle className="text-2xl">Add new student</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          
          <div className="flex w-full max-w-md items-center space-x-2 mb-4">
            <Label htmlFor="excel" className="w-1/3">Import excel file</Label>
            <Input type="file" accept=".xlsx" onChange={handleFileUpload}/>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {studentData.map((student, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name={`students.${index}.studentid`}
                  defaultValue={student.studentid}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`students.${index}.name`}
                  defaultValue={student.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`students.${index}.email`}
                  defaultValue={student.email}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" disabled={isPending} className="w-full">
              Add Student
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddStudentCard;