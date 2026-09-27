"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
          Coming soon
        </div>
        <div>
          <CardTitle className="text-2xl">Password recovery</CardTitle>
          <CardDescription className="mt-1.5">
            Backend FEAT-005 is not available yet. Use change-password from Profile when signed in.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
