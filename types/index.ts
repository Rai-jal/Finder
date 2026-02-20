// Auth & User
export type SubscriptionTier = "free" | "premium";

export interface User {
  id: string;
  email: string;
  startupName: string;
  subscriptionTier: SubscriptionTier;
}

// Onboarding
export interface StartupIdentity {
  startupName: string;
  description: string;
  registeredBusiness: boolean;
  registrationNumber?: string;
}

export type StartupStage =
  | "idea"
  | "mvp"
  | "early_traction"
  | "growth"
  | "scale";

export interface QualificationDetails {
  sectors: string[];
  stage: string;
  location?: string;
  country?: string; // ISO 3166-1 alpha-2 (e.g. US, GB) - max 3 chars for API
  teamSize: string;
  revenueRange: string;
}

export type OpportunityCategory =
  | "grants"
  | "accelerators"
  | "competitions"
  | "fellowships"
  | "government_programs"
  | "investor_events"
  | "incubators"
  | "corporate_programs";

export interface OnboardingData {
  startupIdentity: StartupIdentity;
  qualification: QualificationDetails;
  categories: OpportunityCategory[];
}

// Opportunities (matches API funding_type: grant, equity, debt, prize, other)
export type OpportunityType =
  | "Grant"
  | "Equity"
  | "Debt"
  | "Prize"
  | "Other"
  | "Accelerator"
  | "Competition"
  | "Fellowship"
  | "Government Program"
  | "Investor Event"
  | "Incubator"
  | "Corporate Program";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  deadline: string;
  shortDescription: string;
  summary: string;
  matchPercent?: number;
  eligibility?: string;
  requiredDocuments?: string[];
  applicationQuestions?: string[];
  sector?: string;
  stage?: string;
}

// Applications
export type ApplicationStatus = "draft" | "completed";

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  applicationQuestions?: string[];
  status: ApplicationStatus;
  progressPercent: number;
  answers: Record<string, string>;
  lastUpdated: string;
}

// Documents
export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size?: number;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "opportunity_match" | "deadline" | "incomplete_application";
  read: boolean;
  createdAt: string;
}
