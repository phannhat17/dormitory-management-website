'use client';

import { reset } from "@/actions/auth/reset";
import { verifyRecaptcha } from "@/actions/auth/verifyRecaptcha";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetFromSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";

const ForgotPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetFromSchema>>({
    resolver: zodResolver(ResetFromSchema),
    defaultValues: {
      email: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof ResetFromSchema>) => {
    setError("");
    setSuccess("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    const recaptchaValidation = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaValidation.success) {
      setError("reCAPTCHA validation failed. Please try again.");
      return;
    }

    startTransition(() => {
      reset(values) 
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        });
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="my-auto mx-auto max-w-sm w-96">
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Reset Password</CardTitle>
          <CardDescription className="mx-auto">
            Forgot your password? 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <div className="grid gap-2 mb-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="example@sis.hust.edu.vn"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "site-key"}
                    onChange={setRecaptchaToken}
              />
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button type="submit" disabled={isPending} className="w-full">
                Reset Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPage;
