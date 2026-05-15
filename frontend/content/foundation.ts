import type { Module } from "./types";

const LOOM = "https://www.loom.com/share/placeholder";

export const FOUNDATION_MODULES: Module[] = [
  {
    id: "crm-setup",
    slug: "crm-setup",
    title: "CRM Setup & First Steps",
    description:
      "Get your GoHighLevel dashboard configured from day one. Profile, calendar, phone, email — everything you need to start working leads.",
    tier: "foundation",
    lessons: [
      {
        id: "crm-overview",
        slug: "crm-overview",
        title: "Your CRM Overview — What You're Working With",
        description:
          "A walkthrough of your GoHighLevel dashboard — where everything lives and how the platform is organized for your agency.",
        loomUrl: LOOM,
        durationMin: 8,
      },
      {
        id: "profile-setup",
        slug: "profile-setup",
        title: "Setting Up Your Profile & Agency Info",
        description:
          "Update your agency name, logo, contact info, and timezone. This is the foundation everything else builds on.",
        loomUrl: LOOM,
        durationMin: 6,
      },
      {
        id: "calendar-setup",
        slug: "calendar-setup",
        title: "Connecting Your Calendar",
        description:
          "Link your Google or Outlook calendar, configure your availability, and set up your first booking page so leads can schedule with you.",
        loomUrl: LOOM,
        durationMin: 10,
      },
      {
        id: "phone-email-setup",
        slug: "phone-email-setup",
        title: "Setting Up Your Phone Number & Email",
        description:
          "Activate your LC Phone number for SMS and calling, verify your sending email, and send your first test message.",
        loomUrl: LOOM,
        durationMin: 12,
      },
    ],
  },
  {
    id: "leads-contacts",
    slug: "leads-contacts",
    title: "Managing Your Leads & Contacts",
    description:
      "Master the contact record. Tag, segment, and surface the right leads with Smart Lists.",
    tier: "foundation",
    lessons: [
      {
        id: "lead-entry",
        slug: "lead-entry",
        title: "How Leads Enter Your CRM",
        description:
          "See exactly how leads flow from your forms and ads into your contact list — and what happens automatically when they arrive.",
        loomUrl: LOOM,
        durationMin: 8,
      },
      {
        id: "contact-record",
        slug: "contact-record",
        title: "Navigating the Contact Record",
        description:
          "The contact record is your command center for every lead. Learn every section: timeline, tasks, notes, conversations, and custom fields.",
        loomUrl: LOOM,
        durationMin: 10,
      },
      {
        id: "manual-contacts",
        slug: "manual-contacts",
        title: "Adding & Tagging Contacts Manually",
        description:
          "How to manually add a contact, apply the right tags, and set their lead status so your automations know how to treat them.",
        loomUrl: LOOM,
        durationMin: 7,
      },
      {
        id: "smart-lists",
        slug: "smart-lists",
        title: "Using Smart Lists to Filter Your Pipeline",
        description:
          "Build saved Smart Lists to instantly surface hot leads, stale contacts, or any segment of your database you need to work.",
        loomUrl: LOOM,
        durationMin: 9,
      },
    ],
  },
  {
    id: "pipeline-followup",
    slug: "pipeline-followup",
    title: "Your Pipeline & Follow-Up System",
    description:
      "Move leads through your pipeline like a closer. SMS, email, calls, and notes — all from the contact record.",
    tier: "foundation",
    lessons: [
      {
        id: "pipeline-overview",
        slug: "pipeline-overview",
        title: "Understanding Your Sales Pipeline",
        description:
          "Walk through every stage of your pipeline — from New Lead to Closed — and understand what each stage means for your follow-up strategy.",
        loomUrl: LOOM,
        durationMin: 8,
      },
      {
        id: "moving-stages",
        slug: "moving-stages",
        title: "Moving Leads Through Stages",
        description:
          "How to manually move a contact through your pipeline stages, and what automations fire when you do.",
        loomUrl: LOOM,
        durationMin: 6,
      },
      {
        id: "manual-outreach",
        slug: "manual-outreach",
        title: "Sending SMS & Emails From the CRM",
        description:
          "Send a one-off text or email directly from a contact record. Use templates to save time and keep your messaging consistent.",
        loomUrl: LOOM,
        durationMin: 10,
      },
      {
        id: "calls-notes",
        slug: "calls-notes",
        title: "Logging Calls & Adding Notes",
        description:
          "Keep a clean contact history by logging your calls, adding notes after conversations, and setting follow-up tasks so nothing falls through the cracks.",
        loomUrl: LOOM,
        durationMin: 7,
      },
    ],
  },
];
