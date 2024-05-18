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
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackSchema } from "@/schemas";
import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

interface FeedbackCardProps {
  isPending: boolean;
  error: string | undefined;
  success: string | undefined;
  onSubmit: (values: z.infer<typeof FeedbackSchema>) => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  isPending,
  error,
  success,
  onSubmit,
}) => {
  const form = useFormContext<z.infer<typeof FeedbackSchema>>();

  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader>
        <CardTitle className="text-2xl">Feedback</CardTitle>
        <CardDescription>
          We appreciate your interest in sharing your thoughts, questions, or
          feedback with us. To ensure we can address your concerns effectively,
          please take a moment to provide the following information in the
          feedback form below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Your feedback..."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="my-4">            
              <FormError message={error} />
              <FormSuccess message={success} />
            </div>
            <Button type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
