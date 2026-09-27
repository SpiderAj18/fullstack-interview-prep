import { apiClient } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import type { AuthResponse, AuthUser, TokenPair } from "@/types/api";

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  name: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const authApi = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/register", input);
    tokenStore.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/login", input);
    tokenStore.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  },

  async refresh(): Promise<TokenPair | null> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return null;
    const { data } = await apiClient.post<TokenPair>("/api/v1/auth/refresh", {
      refreshToken,
    });
    tokenStore.setTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post("/api/v1/auth/logout", { refreshToken });
      }
    } finally {
      tokenStore.clear();
    }
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ user: AuthUser }>("/api/v1/auth/me");
    return data.user;
  },

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const { data } = await apiClient.patch<{ user: AuthUser }>("/api/v1/auth/me", input);
    return data.user;
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiClient.post("/api/v1/auth/change-password", input);
    tokenStore.clear();
  },
};
