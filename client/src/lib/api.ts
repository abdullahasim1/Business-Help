import axios from "axios";

const http = axios.create({ withCredentials: true });

export async function api<T>(path: string, body?: unknown, options?: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" }): Promise<T> {
  try {
    const method = options?.method ?? (body ? "POST" : "GET");
    const response = await http.request<T>({ url: path, method, data: body });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string })?.error;
      throw new Error(message || "Request failed");
    }
    throw error;
  }
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "BUSINESS_ADMIN";
  businessId: number | null;
};