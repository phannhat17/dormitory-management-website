'use client';

import * as z from "zod";
import { useState, useTransition } from "react";
import { ResetFromSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { reset } from "@/actions/reset";

const ForgotPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetFromSchema>>({
    resolver: zodResolver(ResetFromSchema),
    defaultValues: {
      email: "",
    }
  });

  const onSubmit = (values: z.infer<typeof ResetFromSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(values) 
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.sucess);
        })
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
