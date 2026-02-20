/**
 * GrowFast API reference data - industries & stages
 * Used for dropdowns across onboarding, profile, opportunities filters
 */

import { apiGetIndustries, apiGetStages } from "./client";

export interface Industry {
  id: string;
  name: string;
  slug: string;
}

export interface Stage {
  id: string;
  name: string;
  slug: string;
}

// Fallback when API fails
export const FALLBACK_INDUSTRIES: Industry[] = [
  { id: "1", name: "Technology", slug: "technology" },
  { id: "2", name: "Healthcare", slug: "healthcare" },
  { id: "3", name: "Finance", slug: "finance" },
  { id: "4", name: "Sustainability", slug: "sustainability" },
  { id: "5", name: "Education", slug: "education" },
  { id: "6", name: "Agriculture", slug: "agriculture" },
  { id: "7", name: "Manufacturing", slug: "manufacturing" },
  { id: "8", name: "E-commerce", slug: "e-commerce" },
  { id: "9", name: "Other", slug: "other" },
];

export const FALLBACK_STAGES: Stage[] = [
  { id: "1", name: "Idea Stage", slug: "idea" },
  { id: "2", name: "MVP", slug: "mvp" },
  { id: "3", name: "Early Traction", slug: "early_traction" },
  { id: "4", name: "Growth", slug: "growth" },
  { id: "5", name: "Scale", slug: "scale" },
];

export async function getIndustries(): Promise<Industry[]> {
  try {
    const list = await apiGetIndustries();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((i) => ({
        id: String(i?.id ?? ""),
        name: i?.name ?? "Unknown",
        slug: i?.slug ?? String(i?.name ?? "").toLowerCase().replace(/\s+/g, "-") ?? "",
      }));
    }
  } catch {
    // ignore
  }
  return FALLBACK_INDUSTRIES;
}

export async function getStages(): Promise<Stage[]> {
  try {
    const list = await apiGetStages();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((s) => ({
        id: String(s?.id ?? ""),
        name: s?.name ?? "Unknown",
        slug: s?.slug ?? String(s?.name ?? "").toLowerCase().replace(/\s+/g, "-") ?? "",
      }));
    }
  } catch {
    // ignore
  }
  return FALLBACK_STAGES;
}

/** True if data came from API (not fallback). Fallback IDs may not exist in backend. */
export async function hasRealReferenceData(): Promise<boolean> {
  try {
    const [industries, stages] = await Promise.all([apiGetIndustries(), apiGetStages()]);
    const indOk = Array.isArray(industries) && industries.length > 0;
    const stOk = Array.isArray(stages) && stages.length > 0;
    return indOk && stOk;
  } catch {
    return false;
  }
}
