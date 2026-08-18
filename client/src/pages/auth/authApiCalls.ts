import { api, type SessionUser } from "@/lib/api";

export type SignInValues = {
  email: string;
  password: string;
};

export const signInAction = async (values: SignInValues) => {
  await api("/api/auth/login", values);
  const { user } = await api<{ user: SessionUser }>("/api/auth/me");
  return { user, redirect: user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard" };
};
