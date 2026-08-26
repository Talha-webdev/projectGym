import api from "@/services/api";
import type { User, AuthTokens, LoginResponse, LoginRequest, RegisterRequest, VerifyEmailResponse } from "@/types/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<LoginResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>("/auth/refresh", { refresh_token: refreshToken }),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refresh_token: refreshToken }),

  getProfile: () => api.get<User>("/users/me"),

  updateProfile: (data: Partial<Pick<User, "full_name" | "avatar_url">>) =>
    api.patch<User>("/users/me", data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.patch("/users/me/password", data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }),

  verifyEmail: (token: string) =>
    api.post<VerifyEmailResponse>("/auth/verify-email", { token }),
};
