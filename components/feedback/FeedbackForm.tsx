"use client";

import { feedback } from "@/actions/feedback";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import { FeedbackSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const FeedbackForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

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
    <FormProvider {...form}>
      <FeedbackCard
        isPending={isPending}
        error={error}
        success={success}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
};

export default FeedbackForm;
