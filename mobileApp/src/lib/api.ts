import { API_URL } from "./config";
import { getToken } from "./storage";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type Member = { email: string; name: string | null };

export type GroupSummary = {
  id: string;
  name: string;
  createdAt: string;
  members: Member[];
  myBalance: number;
};

export type Expense = {
  id: string;
  groupId: string | null;
  description: string;
  amount: number;
  paidByEmail: string;
  paidByName: string | null;
  createdAt: string;
  shares: { email: string; amount: number }[];
  myBalance: number;
};

export type GroupDetail = GroupSummary & { expenses: Expense[] };

export type Friend = { email: string; name: string | null; balance: number };

export type InviteResult = { email: string; sent: boolean; error?: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, `Can't reach VacayPay at ${API_URL}`);
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || "Request failed");
  }
  return payload as T;
}

export const api = {
  requestOtp(email: string) {
    return request<{ sent: boolean; previewCode?: string; message?: string }>("/api/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  verifyOtp(email: string, code: string) {
    return request<{ token: string; user: User }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },
  google(body: { idToken?: string; accessToken?: string }) {
    return request<{ token: string; user: User }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  me() {
    return request<{ user: User }>("/api/me");
  },
  groups() {
    return request<{ groups: GroupSummary[] }>("/api/groups");
  },
  group(id: string) {
    return request<{ group: GroupDetail }>(`/api/groups/${id}`);
  },
  createGroup(name: string, emails: string[]) {
    return request<{ group: GroupDetail; invites: InviteResult[] }>("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, emails }),
    });
  },
  friends() {
    return request<{ friends: Friend[] }>("/api/friends");
  },
  addFriend(email: string) {
    return request<{ friend: Friend; invite: InviteResult }>("/api/friends", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  expense(id: string) {
    return request<{ expense: Expense }>(`/api/expenses/${id}`);
  },
  addExpense(body: { description: string; amount: number; groupId?: string | null; emails: string[]; paidBy?: string }) {
    return request<{ expense: Expense }>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateExpense(id: string, body: { description: string; amount: number; emails: string[]; paidBy?: string }) {
    return request<{ expense: Expense }>(`/api/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};
