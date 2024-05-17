"use client";

import React, { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@/schemas";
import { createUser } from "@/actions/user";
import AddStudentCard from "@/components/createuser/AddStudentCard";
import { z } from "zod";

const CreateUserPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const formMethodsStudent = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      students: [],
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

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Create new user</h1>
      </div>
      <div className="mx-auto w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <FormProvider {...formMethodsStudent}>
          <AddStudentCard
            isPending={isPending}
            error={error}
            success={success}
            onSubmit={onSubmitStudent}
          />
        </FormProvider>
      </div>
    </main>
  );
};

export default CreateUserPage;