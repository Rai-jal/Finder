/**
 * Unified API - connects to GrowFast backend only (no mock)
 * Uses /api/growfast proxy to avoid CORS
 */

import type { User, Opportunity, Application, Document, Notification, OnboardingData } from "@/types";
import * as api from "./client";
import { getIndustries, getStages, hasRealReferenceData } from "./reference";

// --- Auth ---

export async function login(email: string, password: string): Promise<User> {
  await api.apiLogin(email, password);
  const me = await api.apiMe();
  if (!me) throw new Error("Failed to fetch user");
  return {
    id: me.id,
    email: me.email,
    startupName: me.startup?.name ?? me.name ?? "",
    subscriptionTier: (me.subscription_tier as "free" | "premium") ?? "free",
  };
}

export async function signup(data: {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
  startupName: string;
}): Promise<User> {
  const loginRes = await api.apiRegister({
    name: data.name,
    email: data.email,
    password: data.password,
    password_confirmation: data.passwordConfirmation,
  });
  api.setToken(loginRes.access_token);
  const me = await api.apiMe();
  if (!me) throw new Error("Failed to fetch user");
  return {
    id: me.id,
    email: me.email,
    startupName: me.startup?.name ?? me.name ?? data.startupName,
    subscriptionTier: "free",
  };
}

export async function logout(): Promise<void> {
  await api.apiLogout();
}

// --- Opportunities ---

const FUNDING_TYPE_LABELS: Record<string, string> = {
  grant: "Grant",
  equity: "Equity",
  debt: "Debt",
  prize: "Prize",
  other: "Other",
};

function mapApiOpportunity(o: api.ApiOpportunity): Opportunity {
  const rawType = (o.type ?? o.funding_type ?? "grant") as string;
  const typeLabel =
    FUNDING_TYPE_LABELS[rawType.toLowerCase()] || (rawType.charAt(0).toUpperCase() + rawType.slice(1)) || "Grant";
  return {
    id: o.id,
    title: (o.title ?? o.name ?? "Untitled") as string,
    organization: (o.organization ?? "") as string,
    type: typeLabel as Opportunity["type"],
    deadline: (o.deadline ?? new Date().toISOString().slice(0, 10)) as string,
    shortDescription: ((o.description ?? "") as string).slice(0, 150),
    summary: (o.description ?? "") as string,
    matchPercent: o.match_score as number | undefined,
    sector: o.sector as string | undefined,
    stage: o.stage as string | undefined,
    eligibility: o.eligibility as string | undefined,
    requiredDocuments: (o.required_documents as string[]) ?? [],
    applicationQuestions: (o.application_questions as string[]) ?? [],
  };
}

export async function getOpportunities(filters?: {
  type?: string;
  sector?: string;
  stage?: string;
  closingSoon?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<Opportunity[]> {
  const res = await api.apiGetOpportunities({
    page: filters?.page,
    per_page: filters?.per_page ?? 50,
  });
  let list = (res.data ?? []) as api.ApiOpportunity[];
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (o) =>
        (o.title ?? o.name ?? "").toLowerCase().includes(s) ||
        (o.organization ?? "").toLowerCase().includes(s)
    );
  }
  if (filters?.type) {
    const t = filters.type.toLowerCase();
    list = list.filter(
      (o) => ((o.type ?? o.funding_type) as string)?.toLowerCase() === t
    );
  }
  if (filters?.sector) {
    const s = filters.sector.toLowerCase();
    list = list.filter(
      (o) =>
        ((o.sector ?? o.industry) as string)?.toLowerCase() === s ||
        (o.sector ?? o.industry) === filters.sector
    );
  }
  if (filters?.stage) {
    const st = filters.stage.toLowerCase();
    list = list.filter(
      (o) => ((o.stage as string)?.toLowerCase() === st) || o.stage === filters.stage
    );
  }
  return list.map(mapApiOpportunity);
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const o = await api.apiGetOpportunity(id);
  return o ? mapApiOpportunity(o) : null;
}

// --- Applications (GrowFast API has no applications yet - localStorage fallback) ---

const APPLICATIONS_KEY = "finder_applications";

function getStoredApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(APPLICATIONS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function setStoredApplications(apps: Application[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
}

export async function getApplications(): Promise<Application[]> {
  return getStoredApplications();
}

export async function getApplication(id: string): Promise<Application | null> {
  return getStoredApplications().find((a) => a.id === id) ?? null;
}

export async function createApplication(
  opportunityId: string,
  opportunityTitle: string
): Promise<Application> {
  const apps = getStoredApplications();
  const existing = apps.find((a) => a.opportunityId === opportunityId);
  if (existing) return existing;
  const app: Application = {
    id: `app-${Date.now()}`,
    opportunityId,
    opportunityTitle,
    status: "draft",
    progressPercent: 0,
    answers: {},
    lastUpdated: new Date().toISOString(),
  };
  setStoredApplications([...apps, app]);
  return app;
}

export async function saveApplication(
  id: string,
  answers: Record<string, string>
): Promise<Application> {
  const apps = getStoredApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("Application not found");
  const app = apps[idx]!;
  const questionCount = 3;
  const progress = Math.min(
    100,
    Math.round((Object.keys(answers).filter((k) => answers[k]?.trim()).length / questionCount) * 100)
  );
  const updated: Application = {
    ...app,
    answers,
    progressPercent: progress,
    lastUpdated: new Date().toISOString(),
  };
  apps[idx] = updated;
  setStoredApplications([...apps]);
  return updated;
}

// --- Documents ---

export async function getDocuments(startupId: string | null): Promise<Document[]> {
  if (!startupId) return [];
  const list = await api.apiGetDocuments(startupId);
  return list.map((d) => ({
    id: d.id,
    name: d.name,
    uploadDate: d.uploadDate ?? new Date().toISOString(),
    size: d.size,
  }));
}

export async function uploadDocument(startupId: string | null, file: File): Promise<Document> {
  if (!startupId) throw new Error("Create a startup first (complete onboarding)");
  const d = await api.apiUploadDocument(startupId, file);
  return {
    id: d.id,
    name: d.name,
    uploadDate: d.uploadDate ?? new Date().toISOString(),
    size: d.size,
  };
}

export async function deleteDocument(startupId: string | null, id: string): Promise<void> {
  if (!startupId) return;
  await api.apiDeleteDocument(startupId, id);
}

// --- Notifications ---

export async function getNotifications(): Promise<Notification[]> {
  const list = await api.apiGetNotifications(50);
  return list.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as Notification["type"],
    read: n.read,
    createdAt: n.createdAt ?? new Date().toISOString(),
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.apiMarkNotificationRead(id);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.apiMarkAllNotificationsRead();
}

export async function suggestOpportunity(data: {
  grant_name: string;
  url?: string;
  description?: string;
}): Promise<void> {
  await api.apiSuggestOpportunity(data);
}

// Map frontend opportunity categories to API funding_types
const CATEGORY_TO_FUNDING_TYPE: Record<string, "grant" | "equity" | "debt" | "prize" | "other"> = {
  grants: "grant",
  accelerators: "equity",
  competitions: "prize",
  fellowships: "grant",
  government_programs: "grant",
  investor_events: "equity",
  incubators: "equity",
  corporate_programs: "other",
};

// --- Onboarding ---

/**
 * Map qualification to API payload.
 * BACKEND EXPECTS SLUGS not IDs. Form stores IDs; we map to slugs before sending.
 */
async function mapToApiPayload(qualification: OnboardingData["qualification"]) {
  const countryCode = qualification.country?.slice(0, 3) || undefined;
  const preferredCountries = countryCode ? [countryCode] : undefined;

  const hasRealData = await hasRealReferenceData();
  if (!hasRealData) {
    return { country: countryCode, preferred_countries: preferredCountries };
  }

  const [industries, stages] = await Promise.all([getIndustries(), getStages()]);

  const idToIndustrySlug = new Map(industries.map((i) => [String(i.id), i.slug]));
  const idToStageSlug = new Map(stages.map((s) => [String(s.id), s.slug]));

  const industrySlug = qualification.sectors?.[0]
    ? idToIndustrySlug.get(qualification.sectors[0])
    : undefined;
  const stageSlug = qualification.stage
    ? idToStageSlug.get(qualification.stage)
    : undefined;
  const preferredIndustrySlugs = qualification.sectors
    ?.map((id) => idToIndustrySlug.get(id))
    .filter((s): s is string => !!s);
  const preferredStageSlugs = stageSlug ? [stageSlug] : undefined;

  return {
    industry: industrySlug,
    stage: stageSlug,
    country: countryCode,
    preferred_industries: preferredIndustrySlugs?.length ? preferredIndustrySlugs : undefined,
    preferred_stages: preferredStageSlugs,
    preferred_countries: preferredCountries,
  };
}

export async function submitOnboarding(
  data: OnboardingData
): Promise<{ success: boolean; startupId?: string; startupName?: string }> {
  const fundingTypes = [
    ...new Set(
      (data.categories ?? []).map((c) => CATEGORY_TO_FUNDING_TYPE[c]).filter(Boolean)
    ),
  ] as ("grant" | "equity" | "debt" | "prize" | "other")[];
  const mapped = await mapToApiPayload(data.qualification);

  const created = await api.apiCreateStartup({
    name: data.startupIdentity.startupName,
    ...mapped,
    funding_types: fundingTypes.length > 0 ? fundingTypes : undefined,
  });
  return {
    success: true,
    startupId: created.id,
    startupName: created.name ?? data.startupIdentity.startupName,
  };
}

export async function updateStartupProfile(
  startupId: string,
  data: OnboardingData
): Promise<void> {
  const fundingTypes = [
    ...new Set(
      (data.categories ?? []).map((c) => CATEGORY_TO_FUNDING_TYPE[c]).filter(Boolean)
    ),
  ] as ("grant" | "equity" | "debt" | "prize" | "other")[];
  const mapped = await mapToApiPayload(data.qualification);

  await api.apiUpdateStartup(startupId, {
    name: data.startupIdentity.startupName,
    ...mapped,
    funding_types: fundingTypes.length > 0 ? fundingTypes : undefined,
  });
}

// Re-export for SavedOpportunities
export {
  apiGetSavedOpportunities,
  apiSaveOpportunity,
  apiUnsaveOpportunity,
  apiGetMatches,
} from "./client";
