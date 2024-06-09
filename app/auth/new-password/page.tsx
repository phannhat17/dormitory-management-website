'use client';

import { forgotPassword } from "@/actions/auth/reset";
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
import { ResetPassword } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import * as z from "zod";

const ResetPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ResetPassword>>({
    resolver: zodResolver(ResetPassword),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    }
  });

  const onSubmit = (values: z.infer<typeof ResetPassword>) => {
    setError("");
    setSuccess("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    startTransition(() => {
      forgotPassword({ ...values, recaptchaToken }, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
    });
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);


  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="my-auto mx-auto max-w-sm w-96">
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">New Password</CardTitle>
          <CardDescription className="mx-auto">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="********"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="********"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "site-key"}
                onChange={setRecaptchaToken}
              />
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

export default ResetPage;
