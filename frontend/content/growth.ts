import type { Module } from "./types";

const LOOM = "https://www.loom.com/share/placeholder";

export const GROWTH_MODULES: Module[] = [
  {
    id: "ai-automation",
    slug: "ai-automation",
    title: "AI Conversations & Automation",
    description:
      "Put the Coach G qualifier bot to work. Automate first touch, qualify in your sleep, and wake up to booked appointments.",
    tier: "growth",
    lessons: [
      {
        id: "ai-qualifier-overview",
        slug: "ai-qualifier-overview",
        title: "How the Coach G Qualifier Bot Works",
        description:
          "See the AI qualification bot in action — how it engages new leads, asks the right questions, and routes them based on their responses.",
        loomUrl: LOOM,
        durationMin: 10,
      },
      {
        id: "ai-activation",
        slug: "ai-activation",
        title: "Activating AI on a Lead",
        description:
          "Step-by-step: how to turn on AI conversations for a specific lead, what triggers it, and how to take back control when you're ready to close.",
        loomUrl: LOOM,
        durationMin: 8,
      },
      {
        id: "ai-summaries",
        slug: "ai-summaries",
        title: "Reading AI Conversation Summaries",
        description:
          "After the AI qualifies a lead, it logs a full conversation summary to the contact record. Here's how to read it and pick up the call prepared.",
        loomUrl: LOOM,
        durationMin: 7,
      },
      {
        id: "first-workflow",
        slug: "first-workflow",
        title: "Setting Up Your First Automation Workflow",
        description:
          "Build your first workflow from scratch — trigger, conditions, actions, and timing. This is the engine behind every automated follow-up in your CRM.",
        loomUrl: LOOM,
        durationMin: 14,
      },
    ],
  },
  {
    id: "booking-showrate",
    slug: "booking-showrate",
    title: "Booking & Show Rate Optimization",
    description:
      "Convert booked appointments into shown appointments. The reminder + rebook stack that lifts show rate.",
    tier: "growth",
    lessons: [
      {
        id: "appointment-funnel",
        slug: "appointment-funnel",
        title: "Setting Up Your Appointment Funnel",
        description:
          "Build the end-to-end flow: lead opts in → AI qualifies → calendar link fires → confirmation SMS goes out. Fully automated.",
        loomUrl: LOOM,
        durationMin: 12,
      },
      {
        id: "appt-reminders",
        slug: "appt-reminders",
        title: "Automated Appointment Reminders",
        description:
          "Configure your 24hr and 2hr reminder sequences. These two automations alone will lift your show rate by double digits.",
        loomUrl: LOOM,
        durationMin: 9,
      },
      {
        id: "noshow-rebook",
        slug: "noshow-rebook",
        title: "No-Show & Rebook Sequence",
        description:
          "What happens automatically when someone misses their appointment — and how your CRM chases the rebook without you lifting a finger.",
        loomUrl: LOOM,
        durationMin: 8,
      },
    ],
  },
];
