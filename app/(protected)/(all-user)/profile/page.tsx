"use client";

import React, { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeedbackSchema } from "@/schemas";
import { feedback } from "@/actions/feedback";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import ProfileCard from "@/components/profile/ProfileCard";
import { z } from "zod";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Profile() {
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [optionType, setOptionType] = useState("profile");

  const form = useForm<z.infer<typeof FeedbackSchema>>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  const onSubmit = (values: z.infer<typeof FeedbackSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      feedback(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Account Setting</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <Link
            href="#"
            onClick={() => setOptionType("profile")}
            className={`font-semibold ${
              optionType === "profile" ? "text-primary" : ""
            }`}
          >
            My profile
          </Link>
          <Link
            href="#"
            onClick={() => setOptionType("feedback")}
            className={`font-semibold ${
              optionType === "feedback" ? "text-primary" : ""
            }`}
          >
            Feedback
          </Link>
        </nav>
        <div className="grid gap-6">
          {optionType === "profile" ? (
            <ProfileCard />
          ) : user?.role === "ADMIN" ? (
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Not available</CardTitle>
                <CardDescription>
                  As an administrator, please share your feedback directly with
                  the admin team.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <FormProvider {...form}>
              <FeedbackCard
                isPending={isPending}
                error={error}
                success={success}
                onSubmit={onSubmit}
              />
            </FormProvider>
          )}
        </div>
      </div>
    </main>
  );
}
