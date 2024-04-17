"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const user = useCurrentUser();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-2xl font-semibold">Invoice</h1>
      </div>
      <div className="mx-auto w-full max-w-4xl items-start gap-6">
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Invoice</CardTitle>
            <CardDescription>Your Invoice information.</CardDescription>
          </CardHeader>
          <CardContent>
          <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Dialog>
              <DialogTrigger>
                <Button>Update profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Need permission</DialogTitle>
                  <DialogDescription>
                    This action cannot be done. You need administrator permission to perform this action.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
