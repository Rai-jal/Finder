/**
 * GrowFast API Client
 * Uses /api/growfast proxy to avoid CORS (browser) or direct URL (server)
 * Docs: https://finder.terangacode.com/api/documentation
 */

// Server-side: use env; fallback to default. Browser: use proxy to avoid CORS.
const EXTERNAL_API =
  typeof process !== "undefined" && process.env?.GROWFAST_API_URL
    ? process.env.GROWFAST_API_URL
    : "https://finder.terangacode.com/api";
const API_BASE =
  typeof window !== "undefined" ? "/api/growfast" : EXTERNAL_API;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("finder_token");
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("finder_token", token);
  else localStorage.removeItem("finder_token");
}

async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // For multipart (file upload), don't set Content-Type - browser sets it with boundary
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    throw new Error("Network error - check your connection and that the API is reachable");
  }

  if (!res.ok) {
    const errText = await res.text();
    let err: Record<string, unknown> = {};
    try {
      err = (errText ? JSON.parse(errText) : {}) as Record<string, unknown>;
    } catch {
      if (res.status === 500 && errText?.length < 500) {
        err = { message: errText };
      }
    }
    const errorsObj = err?.errors as Record<string, string[]> | undefined;
    let message: string;
    if (errorsObj && typeof errorsObj === "object") {
      message = Object.entries(errorsObj)
        .flatMap(([field, msgs]) => (Array.isArray(msgs) ? msgs : [String(msgs)]).map((m) => `${field}: ${m}`))
        .join(". ");
    } else if (typeof err?.message === "string") {
      message = err.message;
    } else if (typeof err?.detail === "string") {
      message = err.detail;
    } else if (typeof err?.error === "string") {
      message = err.error;
    } else if (Array.isArray(err?.detail)) {
      message = (err.detail as string[]).join(", ");
    } else if (res.status === 401) {
      message = "Invalid email or password";
    } else if (res.status === 422) {
      message = "Validation failed - check your details";
    } else if (res.status === 405) {
      message = `Method not allowed - ${path}`;
    } else if (res.status === 500) {
      const backendMsg = typeof err?.message === "string" ? err.message : null;
      message = backendMsg
        ? `Server error: ${backendMsg}`
        : "Server error - the API may be temporarily unavailable. Please try again later or contact support.";
    } else {
      message = `API error ${res.status}`;
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

// --- Auth ---

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const data = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

function sanitizePayload<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}) {
  const payload = sanitizePayload({
    name: data.name?.trim(),
    email: data.email?.trim().toLowerCase(),
    password: data.password,
    password_confirmation: data.password_confirmation ?? data.password,
  });
  await api("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // Register doesn't return token - login after
  return apiLogin(data.email, data.password);
}

export async function apiLogout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  startup?: { id: string; name: string };
  subscription_tier?: string;
}

export async function apiMe(): Promise<ApiUser | null> {
  if (!getToken()) return null;
  try {
    return await api<ApiUser>("/auth/me");
  } catch {
    setToken(null);
    return null;
  }
}

// --- Opportunities ---

export interface ApiOpportunity {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  organization?: string;
  funding_type?: string;
  type?: string;
  deadline?: string;
  funding_min?: number;
  funding_max?: number;
  match_score?: number;
  [key: string]: unknown;
}

function mapOpportunity(o: ApiOpportunity, index?: number) {
  return {
    id: o.id ?? String(index ?? 0),
    title: o.title ?? o.name ?? "Untitled",
    organization: o.organization ?? "",
    type: (o.type ?? o.funding_type ?? "Grant") as string,
    deadline: o.deadline ?? new Date().toISOString().slice(0, 10),
    shortDescription: (o.description ?? "").slice(0, 150),
    summary: o.description ?? "",
    matchPercent: o.match_score,
    sector: o.sector as string | undefined,
    stage: o.stage as string | undefined,
    eligibility: o.eligibility as string | undefined,
    requiredDocuments: (o.required_documents as string[]) ?? [],
    applicationQuestions: (o.application_questions as string[]) ?? [],
  };
}

export async function apiGetOpportunities(params?: {
  page?: number;
  per_page?: number;
}): Promise<{ data: unknown[]; total?: number }> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.per_page) search.set("per_page", String(params.per_page ?? 50));
  const q = search.toString();
  const res = await api<{ data?: unknown[]; items?: unknown[] }>(
    `/opportunities${q ? `?${q}` : ""}`
  );
  const list = res.data ?? res.items ?? [];
  return {
    data: Array.isArray(list) ? list : [],
    total: (res as { total?: number }).total,
  };
}

export async function apiGetOpportunity(id: string): Promise<ApiOpportunity | null> {
  try {
    const o = await api<ApiOpportunity>(`/opportunities/${id}`);
    return o;
  } catch {
    return null;
  }
}

// --- Startups (for saved opportunities, documents, matches) ---

export async function apiGetStartups(): Promise<{ id: string; name: string }[]> {
  const res = await api<unknown>("/startups");
  if (Array.isArray(res)) return res as { id: string; name: string }[];
  const obj = res as Record<string, unknown>;
  const arr = (obj?.data ?? obj?.startups ?? obj?.items) as { id: string; name: string }[] | undefined;
  return Array.isArray(arr) ? arr : [];
}

export interface CreateStartupPayload {
  name: string;
  industry?: number | string;
  stage?: number | string;
  country?: string;
  funding_min?: number;
  funding_max?: number;
  funding_types?: ("grant" | "equity" | "debt" | "prize" | "other")[];
  preferred_industries?: (number | string)[];
  preferred_stages?: (number | string)[];
  preferred_countries?: string[];
  deadline_min?: string;
  deadline_max?: string;
}

/** Backend expects strings for industry/stage. */
function toStr(v: number | string | undefined): string | undefined {
  if (v === undefined || v === "") return undefined;
  return String(v);
}

export async function apiCreateStartup(data: CreateStartupPayload): Promise<{ id: string; name: string }> {
  const payload = sanitizePayload({
    name: data.name,
    industry: toStr(data.industry),
    stage: toStr(data.stage),
    country: data.country,
    funding_min: data.funding_min,
    funding_max: data.funding_max,
    funding_types: data.funding_types,
    preferred_industries: data.preferred_industries?.map(toStr).filter((s): s is string => s != null),
    preferred_stages: data.preferred_stages?.map(toStr).filter((s): s is string => s != null),
    preferred_countries: data.preferred_countries,
    deadline_min: data.deadline_min,
    deadline_max: data.deadline_max,
  });
  const res = await api<{ id?: string; name?: string; data?: { id?: string; name?: string } }>("/startups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const obj = (res as { data?: { id?: string; name?: string } })?.data ?? res;
  const id = obj?.id;
  const name = obj?.name ?? data.name;
  if (!id) throw new Error("Startup created but no id returned");
  return { id: String(id), name: String(name) };
}

export async function apiUpdateStartup(
  id: string,
  data: Partial<CreateStartupPayload>
) {
  const payload = sanitizePayload({
    ...(data as Record<string, unknown>),
    industry: data.industry !== undefined ? toStr(data.industry) : undefined,
    stage: data.stage !== undefined ? toStr(data.stage) : undefined,
    preferred_industries: data.preferred_industries?.map(toStr).filter((s): s is string => s != null),
    preferred_stages: data.preferred_stages?.map(toStr).filter((s): s is string => s != null),
  });
  return api<{ id: string; name: string }>(`/startups/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiGetStartup(id: string): Promise<{
  id: string;
  name: string;
  industry?: string;
  stage?: string;
  country?: string;
  [key: string]: unknown;
} | null> {
  try {
    return await api(`/startups/${id}`);
  } catch {
    return null;
  }
}

export async function apiGetSavedOpportunities(startupId: string): Promise<string[]> {
  const res = await api<{ data?: { opportunity_id?: string; id?: string }[] }>(
    `/startups/${startupId}/saved-opportunities`
  );
  const list = res.data ?? [];
  return (list as { opportunity_id?: string; id?: string }[]).map(
    (x) => x.opportunity_id ?? x.id ?? ""
  );
}

export async function apiSaveOpportunity(startupId: string, opportunityId: string): Promise<void> {
  await api(`/startups/${startupId}/opportunities/${opportunityId}/save`, {
    method: "POST",
  });
}

export async function apiUnsaveOpportunity(startupId: string, opportunityId: string): Promise<void> {
  await api(`/startups/${startupId}/opportunities/${opportunityId}/save`, {
    method: "DELETE",
  });
}

// --- Matches (opportunities matched to startup profile) ---

export async function apiGetMatches(startupId: string): Promise<ApiOpportunity[]> {
  const res = await api<{ data?: ApiOpportunity[] }>(`/startups/${startupId}/matches`);
  return res.data ?? [];
}

// --- Documents ---

export interface ApiDocument {
  id: string;
  name: string;
  upload_date?: string;
  uploadDate?: string;
  size?: number;
}

export async function apiGetDocuments(startupId: string): Promise<ApiDocument[]> {
  const res = await api<{ data?: ApiDocument[] }>(`/startups/${startupId}/documents`);
  const list = res.data ?? [];
  return (list as ApiDocument[]).map((d) => ({
    id: d.id,
    name: d.name,
    uploadDate: d.upload_date ?? d.uploadDate ?? new Date().toISOString(),
    size: d.size,
  }));
}

export async function apiUploadDocument(startupId: string, file: File): Promise<ApiDocument> {
  const form = new FormData();
  form.append("file", file);
  const d = await api<ApiDocument>(`/startups/${startupId}/documents`, {
    method: "POST",
    body: form,
  });
  return {
    id: d.id,
    name: d.name ?? file.name,
    uploadDate: new Date().toISOString(),
    size: file.size,
  };
}

export async function apiDeleteDocument(startupId: string, documentId: string): Promise<void> {
  await api(`/startups/${startupId}/documents/${documentId}`, { method: "DELETE" });
}

// --- Notifications ---

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  created_at?: string;
  createdAt?: string;
}

export async function apiGetNotifications(perPage?: number): Promise<ApiNotification[]> {
  if (!getToken()) return [];
  try {
    const q = perPage ? `?per_page=${perPage}` : "";
    const res = await api<{ data?: ApiNotification[] }>(`/notifications${q}`);
    const list = res.data ?? [];
    return (list as ApiNotification[]).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: (n.type ?? "opportunity_match") as "opportunity_match" | "deadline" | "incomplete_application",
      read: n.read,
      createdAt: n.created_at ?? n.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function apiGetUnreadCount(): Promise<number> {
  const res = await api<{ count?: number }>("/notifications/unread-count");
  return res.count ?? 0;
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await api("/notifications/mark-all-read", { method: "POST" });
}

// --- Reference data (public, no auth) ---

function extractArray<T>(res: unknown, ...keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[];
  const obj = res as Record<string, unknown>;
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

export async function apiGetIndustries(): Promise<{ id: string | number; name: string; slug?: string }[]> {
  const res = await api<unknown>("/industries");
  const arr = extractArray<{ id: string | number; name: string; slug?: string }>(
    res, "data", "industries", "items"
  );
  return arr.map((i) => ({
    id: i.id,
    name: i?.name ?? "Unknown",
    slug: i?.slug ?? String(i?.name ?? "").toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function apiGetStages(): Promise<{ id: string | number; name: string; slug?: string }[]> {
  const res = await api<unknown>("/stages");
  const arr = extractArray<{ id: string | number; name: string; slug?: string }>(
    res, "data", "stages", "items"
  );
  return arr.map((s) => ({
    id: s.id,
    name: s?.name ?? "Unknown",
    slug: s?.slug ?? String(s?.name ?? "").toLowerCase().replace(/\s+/g, "-"),
  }));
}

// --- Subscriptions ---

export interface ApiSubscription {
  id: string;
  name?: string;
  tier?: string;
  price?: number;
  [key: string]: unknown;
}

export async function apiGetSubscriptions(): Promise<ApiSubscription[]> {
  const res = await api<{ data?: ApiSubscription[] } | ApiSubscription[]>("/subscriptions");
  if (Array.isArray(res)) return res;
  return (res as { data?: ApiSubscription[] }).data ?? [];
}

export async function apiGetSubscription(): Promise<{ tier?: string } | null> {
  try {
    return await api<{ tier?: string }>("/subscriptions/my");
  } catch {
    return null;
  }
}

export async function apiSubscribe(subscriptionId: string): Promise<void> {
  await api("/user-subscriptions/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });
}

// --- Opportunity suggestions (public) ---

export async function apiSuggestOpportunity(data: {
  grant_name: string;
  url?: string;
  description?: string;
}): Promise<void> {
  await api("/opportunity-suggestions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { setToken, getToken };
