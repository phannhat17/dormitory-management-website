'use client';

import { login } from "@/actions/auth/login";
import { FormError } from "@/components/form/form-error";
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
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";

const LoginPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    startTransition(() => {
      login({ ...values, recaptchaToken })
        .then((data) => {
          if (data) {
            if (data.error) {
              setError(data.error);
            } else if (data.twoFA) {
              setShowTwoFA(true);
              if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaToken(null);
              }
            }
          }
        })
        .catch((error) => {
          setError("Something went wrong. Please try again.");
        });
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="my-auto mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {showTwoFA && (
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Two FA code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isPending} placeholder="123456" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {!showTwoFA && (
                <>
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="email@example.com" type="email" />
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
                          <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                            <Link href="/auth/reset" className="ml-auto inline-block text-sm underline">
                              Forgot your password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="**********" type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "site-key"}
                onChange={setRecaptchaToken} />

              <FormError message={error} />
              <Button type="submit" disabled={isPending} className="w-full">
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
