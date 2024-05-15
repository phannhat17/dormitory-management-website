"use client";

import React, { useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function Profile() {
  const user = useCurrentUser();
  const [optionType, setOptionType] = useState("profile");

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
            onClick={() => setOptionType("changepassword")}
            className={`font-semibold ${
              optionType === "changepassword" ? "text-primary" : ""
            }`}
          >
            Change password
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
          ) : optionType === "changepassword"? (
            <ChangePasswordForm />
          ) : user?.role === "ADMIN" ? (
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle className="text-2xl">Not available</CardTitle>
                <CardDescription>
                  As an administrator, please share your feedback directly with
                  the admin team.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <FeedbackForm />
          )}
        </div>
      </div>
    </main>
  );
}
