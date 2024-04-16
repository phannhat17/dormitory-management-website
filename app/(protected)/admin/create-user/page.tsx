"use client";

import React, { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@/schemas";
import { CreateStaffSchema } from "@/schemas"; // Ensure this is correct
import { createUser } from "@/actions/create-user";
import { createStaff } from "@/actions/create-staff"; // Ensure this is imported correctly
import AddStudentCard from "@/components/createuser/AddStudentCard";
import AddStaffCard from "@/components/createuser/AddStaffCard"; // Ensure this is imported correctly
import { z } from "zod";
import Link from "next/link";

const CreateUserPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [userType, setUserType] = useState('student'); // 'student' or 'staff'

  const formMethodsStudent = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      studentid: "",
    },
  });

  const formMethodsStaff = useForm<z.infer<typeof CreateStaffSchema>>({
    resolver: zodResolver(CreateStaffSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      staffid: "",
    },
  });

  const onSubmitStudent = (values: z.infer<typeof CreateUserSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      createUser(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  const onSubmitStaff = (values: z.infer<typeof CreateStaffSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      createStaff(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Create user</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0">
          <Link href="#" onClick={() => setUserType('student')} className={`font-semibold ${userType === 'student' ? 'text-primary' : ''}`}>
            Add student
          </Link>
          <Link href="#" onClick={() => setUserType('staff')} className={`font-semibold ${userType === 'staff' ? 'text-primary' : ''}`}>
            Add staff
          </Link>
        </nav>
        <div className="grid gap-6">
          {userType === 'student' ? (
            <FormProvider {...formMethodsStudent}>
              <AddStudentCard
                isPending={isPending}
                error={error}
                success={success}
                onSubmit={onSubmitStudent}
              />
            </FormProvider>
          ) : (
            <FormProvider {...formMethodsStaff}>
              <AddStaffCard
                isPending={isPending}
                error={error}
                success={success}
                onSubmit={onSubmitStaff}
              />
            </FormProvider>
          )}
        </div>
      </div>
    </main>
  );
};

export default CreateUserPage;