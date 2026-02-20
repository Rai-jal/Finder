import type {
  User,
  OnboardingData,
  Opportunity,
  Application,
  Document,
  Notification,
} from "@/types";
import {
  MOCK_OPPORTUNITIES,
  MOCK_APPLICATIONS,
  MOCK_DOCUMENTS,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock/data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Auth
export const mockLogin = async (
  email: string,
  password: string
): Promise<User> => {
  await delay(500);
  return {
    id: "user-1",
    email,
    startupName: "Acme Startup",
    subscriptionTier: "free",
  };
};

export const mockSignup = async (data: {
  email: string;
  password: string;
  startupName: string;
}): Promise<User> => {
  await delay(500);
  return {
    id: "user-1",
    email: data.email,
    startupName: data.startupName,
    subscriptionTier: "free",
  };
};

export const mockLogout = async (): Promise<void> => {
  await delay(200);
};

// Onboarding
export const mockSubmitOnboarding = async (
  data: OnboardingData
): Promise<{ success: boolean }> => {
  await delay(500);
  return { success: true };
};

// Opportunities
export const mockGetOpportunities = async (filters?: {
  type?: string;
  sector?: string;
  stage?: string;
  closingSoon?: boolean;
  search?: string;
}): Promise<Opportunity[]> => {
  await delay(400);
  let results = [...MOCK_OPPORTUNITIES];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    results = results.filter(
      (o) =>
        o.title.toLowerCase().includes(search) ||
        o.organization.toLowerCase().includes(search)
    );
  }
  if (filters?.type) {
    results = results.filter((o) => o.type === filters.type);
  }
  if (filters?.sector) {
    results = results.filter((o) => o.sector === filters.sector);
  }
  if (filters?.stage) {
    results = results.filter((o) => o.stage === filters.stage);
  }
  if (filters?.closingSoon) {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    results = results.filter((o) => new Date(o.deadline) <= in30Days);
  }

  return results;
};

export const mockGetOpportunity = async (
  id: string
): Promise<Opportunity | null> => {
  await delay(300);
  return MOCK_OPPORTUNITIES.find((o) => o.id === id) ?? null;
};

// Applications - in-memory store for mock
let applicationsStore = [...MOCK_APPLICATIONS];

export const mockGetApplications = async (): Promise<Application[]> => {
  await delay(400);
  return applicationsStore;
};

export const mockGetApplication = async (
  id: string
): Promise<Application | null> => {
  await delay(300);
  return applicationsStore.find((a) => a.id === id) ?? null;
};

export const mockCreateApplication = async (
  opportunityId: string,
  opportunityTitle: string
): Promise<Application> => {
  await delay(300);
  const existing = applicationsStore.find((a) => a.opportunityId === opportunityId);
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
  applicationsStore = [...applicationsStore, app];
  return app;
};

export const mockSaveApplication = async (
  id: string,
  answers: Record<string, string>
): Promise<Application> => {
  await delay(300);
  const app = applicationsStore.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  const questionCount = 3; // approximate for progress
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
  applicationsStore = applicationsStore.map((a) => (a.id === id ? updated : a));
  return updated;
};

// Documents - in-memory store for mock
let documentsStore = [...MOCK_DOCUMENTS];

export const mockGetDocuments = async (): Promise<Document[]> => {
  await delay(300);
  return documentsStore;
};

export const mockUploadDocument = async (file: File): Promise<Document> => {
  await delay(500);
  const doc: Document = {
    id: `doc-${Date.now()}`,
    name: file.name,
    uploadDate: new Date().toISOString(),
    size: file.size,
  };
  documentsStore = [...documentsStore, doc];
  return doc;
};

export const mockDeleteDocument = async (id: string): Promise<void> => {
  await delay(300);
  documentsStore = documentsStore.filter((d) => d.id !== id);
};

// Notifications
export const mockGetNotifications = async (): Promise<Notification[]> => {
  await delay(200);
  return MOCK_NOTIFICATIONS;
};

export const mockMarkNotificationRead = async (
  id: string
): Promise<void> => {
  await delay(200);
};
