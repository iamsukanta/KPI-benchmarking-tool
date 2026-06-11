import {
  ProfileErrorResponse,
  ProfileResponse,
  ProfileSuccessResponse,
  SignupResponse
} from "@/lib/types/auth";
import { ChangePasswordFormData, LoginFormData, ProfileFormData, SignupFormData } from "@/lib/validators/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function signupRequest(data: SignupFormData): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  try {
    return await res.json();
  } catch {
    throw new Error("Der Server hat eine unerwartete Antwort zurückgegeben.");
  }
}

export async function loginRequest(data: LoginFormData) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}

export async function loadProfile(): Promise<ProfileResponse> {
  const res = await fetch("/api/proxy/auth/me/");
  return res.json();
}

export async function updateProfile(data: ProfileFormData): Promise<ProfileSuccessResponse | ProfileErrorResponse> {
  const res = await fetch("/api/proxy/auth/me/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.json();
}

export async function changePassword(data: ChangePasswordFormData): Promise<ProfileSuccessResponse | ProfileErrorResponse> {
  const res = await fetch("/api/proxy/auth/me/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.json();
}
