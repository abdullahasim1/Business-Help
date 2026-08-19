import { api, type SessionUser } from "@/lib/api";

export type SignInValues = {
  email: string;
  password: string;
};

export const signInAction = async (values: SignInValues) => {
  const loginResult = await api<{ ok: boolean; mustChangePassword: boolean }>("/api/auth/login", values);
  const { user } = await api<{ user: SessionUser }>("/api/auth/me");
  const redirect = loginResult.mustChangePassword
    ? "/auth/set-new-password?first=true"
    : user.role === "SUPER_ADMIN"
      ? "/super-admin"
      : "/dashboard";
  return { user, redirect, mustChangePassword: loginResult.mustChangePassword };
};
