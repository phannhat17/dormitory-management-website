'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { BeatLoader } from "react-spinners"
import { useSearchParams } from "next/navigation";
import { newVerificationToken } from "@/actions/admin/auth/verification";
import { FormSuccess } from "@/components/form/form-success";
import { FormError } from "@/components/form/form-error";


const VerificationPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setError("Missing token!");
      return;
    };

    newVerificationToken(token).then((data) => {
      setError(data?.error);
      setSuccess(data?.success);
    }).catch((error) => {
      setError("Something went wrong!");
    })
  }, [token])

  useEffect(() => {
    onSubmit();
  }, [onSubmit])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="my-auto mx-auto max-w-sm w-96">
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Verification</CardTitle>
          <CardDescription className="mx-auto">
            Confirming your verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center w-full justify-center">
            {!success && !error && (
              <BeatLoader />
            )}
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>
          <div className="mt-4 text-center text-sm">
            Back to{" "}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPage;
