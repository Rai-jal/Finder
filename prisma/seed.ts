import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OPPORTUNITIES = [
  {
    title: "Tech Growth Grant 2025",
    organization: "National Innovation Fund",
    type: "Grant",
    deadline: new Date("2025-03-15"),
    shortDescription: "Up to $50,000 for early-stage tech startups",
    summary: "The Tech Growth Grant supports innovative technology startups with funding up to $50,000. Focus areas include AI, fintech, and sustainability tech.",
    matchPercent: 92,
    sector: "Technology",
    stage: "early_traction",
    eligibility: "Registered businesses under 3 years old. Minimum 2 team members. Revenue under $500k.",
    requiredDocuments: ["Business Plan", "Financial Projections", "Team CVs"],
    applicationQuestions: [
      "Describe your startup and its unique value proposition.",
      "How will you use the grant funding?",
      "What are your key milestones for the next 12 months?",
    ],
  },
  {
    title: "Accelerate Startup Program",
    organization: "Venture Hub",
    type: "Accelerator",
    deadline: new Date("2025-03-20"),
    shortDescription: "12-week intensive accelerator with $25k investment",
    summary: "Join our cohort of 10 startups for a 12-week program. Receive mentorship, workspace, and $25,000 in exchange for 5% equity.",
    matchPercent: 88,
    sector: "Technology",
    stage: "mvp",
    eligibility: "Pre-seed or seed stage. Must be able to relocate for program duration.",
    requiredDocuments: ["Pitch Deck", "Product Demo", "Cap Table"],
    applicationQuestions: [
      "What problem does your startup solve?",
      "Why do you need an accelerator at this stage?",
      "What would success look like for you after the program?",
    ],
  },
  {
    title: "Green Innovation Competition",
    organization: "Climate Ventures",
    type: "Competition",
    deadline: new Date("2025-04-01"),
    shortDescription: "Win $100k prize for climate tech solutions",
    summary: "Annual competition for startups building solutions to climate change.",
    matchPercent: 75,
    sector: "Sustainability",
    stage: "early_traction",
    eligibility: "Climate or sustainability focus. Must have working prototype.",
    requiredDocuments: ["Impact Report", "Technical Documentation"],
    applicationQuestions: [
      "Describe your climate impact metrics.",
      "What is your path to scale?",
      "How do you measure success beyond revenue?",
    ],
  },
  {
    title: "Founder Fellowship 2025",
    organization: "Startup Institute",
    type: "Fellowship",
    deadline: new Date("2025-03-25"),
    shortDescription: "6-month fellowship with stipend and mentorship",
    summary: "Selected founders receive $15,000 stipend, office space, and 1:1 mentorship.",
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
    title: "SME Support Program",
    organization: "Department of Trade",
    type: "Government Program",
    deadline: new Date("2025-04-10"),
    shortDescription: "Government grants for registered SMEs",
    summary: "National program supporting small and medium enterprises with grants up to $30,000.",
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
    title: "Investor Demo Day",
    organization: "Angel Network",
    type: "Investor Event",
    deadline: new Date("2025-03-18"),
    shortDescription: "Pitch to 50+ angel investors",
    summary: "Quarterly demo day. 10 startups selected to pitch.",
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

async function main() {
  console.log("Seeding database...");

  const count = await prisma.opportunity.count();
  if (count === 0) {
    await prisma.opportunity.createMany({
      data: OPPORTUNITIES as never[],
    });
    console.log(`Created ${OPPORTUNITIES.length} opportunities`);
  } else {
    console.log(`Opportunities already exist (${count}), skipping seed`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
