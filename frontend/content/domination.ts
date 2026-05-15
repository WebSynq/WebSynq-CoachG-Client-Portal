import type { Module } from "./types";

const LOOM = "https://www.loom.com/share/placeholder";

export const DOMINATION_MODULES: Module[] = [
  {
    id: "reporting",
    slug: "reporting",
    title: "Advanced Reporting & Performance Tracking",
    description:
      "Know your numbers cold. Dashboard metrics and custom reports that tell you where to push.",
    tier: "domination",
    lessons: [
      {
        id: "dashboard-metrics",
        slug: "dashboard-metrics",
        title: "Reading Your Dashboard Metrics",
        description:
          "Understand every number on your reporting dashboard — leads by source, contact rate, conversion rate, and pipeline velocity.",
        loomUrl: LOOM,
        durationMin: 10,
      },
      {
        id: "custom-reports",
        slug: "custom-reports",
        title: "Building Custom Reports",
        description:
          "Create saved reports filtered by date range, lead source, stage, or agent. Know exactly where your business stands at any moment.",
        loomUrl: LOOM,
        durationMin: 12,
      },
    ],
  },
  {
    id: "recruiting",
    slug: "recruiting",
    title: "Recruiting & Agency Scaling",
    description:
      "Recruit agents the way you recruit clients — with a pipeline, automations, and a scoreboard.",
    tier: "domination",
    lessons: [
      {
        id: "recruiting-pipeline",
        slug: "recruiting-pipeline",
        title: "Setting Up a Recruiting Pipeline",
        description:
          "Build a separate pipeline for recruiting prospects — track candidates from first contact through contracting, fully automated.",
        loomUrl: LOOM,
        durationMin: 11,
      },
      {
        id: "recruiting-sequences",
        slug: "recruiting-sequences",
        title: "Automated Recruiting Outreach Sequences",
        description:
          "Deploy multi-step SMS and email sequences to recruit agents at scale. The same system Chase used to build a 7-figure agency.",
        loomUrl: LOOM,
        durationMin: 13,
      },
    ],
  },
];
