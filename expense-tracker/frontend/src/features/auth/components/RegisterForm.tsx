"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/forms/Field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/hooks";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";

export function RegisterForm() {
  const registerMutation = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
          Get started
        </div>
        <div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription className="mt-1.5">
            Seeded categories and a Cash account are ready on day one.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            registerMutation.mutate({
              email: values.email,
              password: values.password,
              name: values.name || undefined,
            }),
          )}
        >
          <Field id="name" label="Name">
            <Input id="name" autoComplete="name" placeholder="Ajay" {...form.register("name")} />
          </Field>
          <Field id="email" label="Email" error={form.formState.errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@email.com"
              {...form.register("email")}
            />
          </Field>
          <Field
            id="password"
            label="Password"
            error={form.formState.errors.password?.message}
            hint="At least 8 characters"
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.register("password")}
            />
          </Field>
          <Button className="w-full" size="lg" type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
