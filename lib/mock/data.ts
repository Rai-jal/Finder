import type {
  Opportunity,
  Application,
  Document,
  Notification,
  OpportunityType,
} from "@/types";

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    title: "Tech Growth Grant 2025",
    organization: "National Innovation Fund",
    type: "Grant",
    deadline: "2025-03-15",
    shortDescription: "Up to $50,000 for early-stage tech startups",
    summary:
      "The Tech Growth Grant supports innovative technology startups with funding up to $50,000. Focus areas include AI, fintech, and sustainability tech.",
    matchPercent: 92,
    sector: "Technology",
    stage: "early_traction",
    eligibility:
      "Registered businesses under 3 years old. Minimum 2 team members. Revenue under $500k.",
    requiredDocuments: ["Business Plan", "Financial Projections", "Team CVs"],
    applicationQuestions: [
      "Describe your startup and its unique value proposition.",
      "How will you use the grant funding?",
      "What are your key milestones for the next 12 months?",
    ],
  },
  {
    id: "2",
    title: "Accelerate Startup Program",
    organization: "Venture Hub",
    type: "Accelerator",
    deadline: "2025-03-20",
    shortDescription: "12-week intensive accelerator with $25k investment",
    summary:
      "Join our cohort of 10 startups for a 12-week program. Receive mentorship, workspace, and $25,000 in exchange for 5% equity.",
    matchPercent: 88,
    sector: "Technology",
    stage: "mvp",
    eligibility:
      "Pre-seed or seed stage. Must be able to relocate for program duration.",
    requiredDocuments: ["Pitch Deck", "Product Demo", "Cap Table"],
    applicationQuestions: [
      "What problem does your startup solve?",
      "Why do you need an accelerator at this stage?",
      "What would success look like for you after the program?",
    ],
  },
  {
    id: "3",
    title: "Green Innovation Competition",
    organization: "Climate Ventures",
    type: "Competition",
    deadline: "2025-04-01",
    shortDescription: "Win $100k prize for climate tech solutions",
    summary:
      "Annual competition for startups building solutions to climate change. Finalists present at our summit. Top 3 receive funding.",
    matchPercent: 75,
    sector: "Sustainability",
    stage: "early_traction",
    eligibility:
      "Climate or sustainability focus. Must have working prototype.",
    requiredDocuments: ["Impact Report", "Technical Documentation"],
    applicationQuestions: [
      "Describe your climate impact metrics.",
      "What is your path to scale?",
      "How do you measure success beyond revenue?",
    ],
  },
  {
    id: "4",
    title: "Founder Fellowship 2025",
    organization: "Startup Institute",
    type: "Fellowship",
    deadline: "2025-03-25",
    shortDescription: "6-month fellowship with stipend and mentorship",
    summary:
      "Selected founders receive $15,000 stipend, office space, and 1:1 mentorship from serial entrepreneurs.",
    matchPercent: 82,
    sector: "General",
    stage: "idea",
    eligibility: "Solo founders or co-founders. Idea stage acceptable.",
    requiredDocuments: ["Application Form", "Personal Statement"],
    applicationQuestions: [
      "What drives you as a founder?",
      "Describe a challenge you've overcome.",
      "What mentorship do you need most?",
    ],
  },
  {
    id: "5",
    title: "SME Support Program",
    organization: "Department of Trade",
    type: "Government Program",
    deadline: "2025-04-10",
    shortDescription: "Government grants for registered SMEs",
    summary:
      "National program supporting small and medium enterprises with grants up to $30,000 for growth initiatives.",
    matchPercent: 70,
    sector: "General",
    stage: "early_traction",
    eligibility: "Must be registered business. Annual revenue $50k-$2M.",
    requiredDocuments: ["Registration Certificate", "Tax Returns", "Business Plan"],
    applicationQuestions: [
      "Describe your growth strategy.",
      "How will the grant impact your business?",
      "Timeline for proposed initiatives?",
    ],
  },
  {
    id: "6",
    title: "Investor Demo Day",
    organization: "Angel Network",
    type: "Investor Event",
    deadline: "2025-03-18",
    shortDescription: "Pitch to 50+ angel investors",
    summary:
      "Quarterly demo day. 10 startups selected to pitch. Network with accredited investors seeking early-stage deals.",
    matchPercent: 85,
    sector: "Technology",
    stage: "mvp",
    eligibility: "Raising $100k-$500k. Must have traction metrics.",
    requiredDocuments: ["Pitch Deck", "Financial Model"],
    applicationQuestions: [
      "What are you raising?",
      "Key traction metrics?",
      "Use of funds?",
    ],
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    opportunityId: "1",
    opportunityTitle: "Tech Growth Grant 2025",
    status: "draft",
    progressPercent: 45,
    answers: {
      q1: "We're building an AI-powered analytics platform...",
    },
    lastUpdated: "2025-02-15T10:30:00Z",
  },
  {
    id: "app-2",
    opportunityId: "2",
    opportunityTitle: "Accelerate Startup Program",
    status: "completed",
    progressPercent: 100,
    answers: {},
    lastUpdated: "2025-02-10T14:20:00Z",
  },
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    name: "Business_Plan_2025.pdf",
    uploadDate: "2025-02-01T09:00:00Z",
    size: 2450000,
  },
  {
    id: "doc-2",
    name: "Pitch_Deck_v3.pptx",
    uploadDate: "2025-02-05T11:30:00Z",
    size: 3200000,
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "New opportunity match",
    message: "Green Innovation Competition is 92% match for your profile",
    type: "opportunity_match",
    read: false,
    createdAt: "2025-02-18T09:00:00Z",
  },
  {
    id: "notif-2",
    title: "Deadline approaching",
    message: "Tech Growth Grant 2025 closes in 7 days",
    type: "deadline",
    read: false,
    createdAt: "2025-02-18T08:30:00Z",
  },
  {
    id: "notif-3",
    title: "Incomplete application",
    message: "Tech Growth Grant 2025 - 45% complete",
    type: "incomplete_application",
    read: true,
    createdAt: "2025-02-17T16:00:00Z",
  },
];

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  "Grant",
  "Accelerator",
  "Competition",
  "Fellowship",
  "Government Program",
  "Investor Event",
  "Incubator",
  "Corporate Program",
];

export const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Sustainability",
  "Education",
  "Agriculture",
  "Manufacturing",
  "E-commerce",
  "Other",
];

export const STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP" },
  { value: "early_traction", label: "Early Traction" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
];
