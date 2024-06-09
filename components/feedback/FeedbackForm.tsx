"use client";

import { feedback } from "@/actions/admin/feedback";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import { FeedbackSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { verifyRecaptcha } from "@/actions/auth/verifyRecaptcha";
import ReCAPTCHA from "react-google-recaptcha";

const FeedbackForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FeedbackSchema>>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FeedbackSchema>) => {
    setError("");
    setSuccess("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    startTransition(() => {
      feedback({ ...values, recaptchaToken }).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <FormProvider {...form}>
      <FeedbackCard
        isPending={isPending}
        error={error}
        success={success}
        onSubmit={onSubmit}
        setRecaptchaToken={setRecaptchaToken}
      />
    </FormProvider>
  );
};

export default FeedbackForm;
