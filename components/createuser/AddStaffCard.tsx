import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from "zod";
import { CreateStaffSchema } from "@/schemas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";

interface AddStaffCardProps {
  isPending: boolean;
  error: string | undefined;
  success: string | undefined;
  onSubmit: (values: z.infer<typeof CreateStaffSchema>) => void;
}

const AddStaffCard: React.FC<AddStaffCardProps> = ({ isPending, error, success, onSubmit }) => {
  const form = useFormContext<z.infer<typeof CreateStaffSchema>>();

  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle className="text-2xl">Add new staff</CardTitle>
        <CardDescription>
          Add new staff to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="staffid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="STAFFXXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="Nguyen Van A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isPending} placeholder="example@sis.hust.edu.vn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isPending} placeholder="**********" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" disabled={isPending} className="w-full">
              Add Staff
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddStaffCard;
