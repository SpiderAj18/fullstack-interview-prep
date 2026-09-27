"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";
import { getErrorMessage } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    enabled: enabled && !!tokenStore.getAccessToken(),
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast.success("Signed in");
      router.replace("/dashboard");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Login failed")),
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast.success("Account created");
      router.replace("/dashboard");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Registration failed")),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Password changed. Please sign in again.");
      router.replace("/login");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
