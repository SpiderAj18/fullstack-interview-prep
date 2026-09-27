"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChangePassword, useMe, useUpdateProfile } from "@/features/auth/hooks";
import { changePasswordSchema } from "@/features/auth/schemas";
import { Skeleton } from "@/components/feedback/Skeleton";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user?.name != null) {
      profileForm.reset({ name: user.name || "" });
    }
  }, [user, profileForm]);

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Profile"
        description="Update your display name or change your password."
      />

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              {isLoading ? <Skeleton className="mt-1 h-4 w-40" /> : user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(async (values) => {
                await updateProfile.mutateAsync(values);
              })}
            >
              <Field
                id="name"
                label="Display name"
                error={profileForm.formState.errors.name?.message}
              >
                <Input id="name" autoComplete="name" {...profileForm.register("name")} />
              </Field>
              <Button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto">
                {updateProfile.isPending ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn stagger={2}>
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>You will be signed out after a successful change.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(async (values) => {
                await changePassword.mutateAsync({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
              })}
            >
              <Field id="currentPassword" label="Current password">
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                />
              </Field>
              <Field id="newPassword" label="New password">
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                />
              </Field>
              <Field
                id="confirmPassword"
                label="Confirm new password"
                error={passwordForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
              </Field>
              <Button
                type="submit"
                variant="secondary"
                disabled={changePassword.isPending}
                className="w-full sm:w-auto"
              >
                {changePassword.isPending ? "Updating…" : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}
