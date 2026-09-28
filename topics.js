/*
  QuickFile Videos - topic configuration
  ---------------------------------------
  Each video is put into ONE topic, based on the words in its title and description.
  A keyword found in the title scores 3 points and one found in the description scores 1.
  The video goes into the topic with the highest score. If two topics tie, the one
  higher up this list wins.

  - Add, remove or reorder topics as you like. "id" is used in links (#topic=vat-mtd).
  - Keywords are not case sensitive and match part of a word ("reconcil" matches "reconciling").
  - Videos that match nothing go into the "fallback" topic.
  - To force a video into a topic, add it to "overrides" as  "VIDEO_ID": "topic-id".
  - To hide a video from the site, add its ID to "hidden".
  - To choose which videos come first in a topic, list their IDs under "order".

  You can edit this file and refresh the page. You do not need to run the updater again.
*/
window.QF_TOPICS = {
  topics: [
    {
      id: "getting-started",
      name: "Getting started",
      icon: "rocket",
      description: "Set up your QuickFile account, find your way around the dashboard and get your settings right from day one.",
      keywords: ["getting started", "get started", "introduction", "intro to", "overview", "welcome", "dashboard", "tour", "account settings", "beginner", "first steps", "navigat", "opening balance"]
    },
    {
      id: "invoicing-sales",
      name: "Invoicing and sales",
      icon: "invoice",
      description: "Raise invoices, estimates and credit notes, set up recurring invoices and manage your clients.",
      keywords: ["invoice", "invoicing", "estimate", "quote", "credit note", "recurring", "client", "customer", "sales", "payment link", "late payment", "reminder", "statement"]
    },
    {
      id: "purchases-suppliers",
      name: "Purchases and suppliers",
      icon: "cart",
      description: "Record bills and expenses, use the Receipt Hub and keep track of what you owe your suppliers.",
      keywords: ["purchase", "supplier", "bill", "expense", "receipt", "receipt hub", "mileage", "petty cash"]
    },
    {
      id: "bank-feeds",
      name: "Banking and bank feeds",
      icon: "bank",
      description: "Connect bank feeds, tag and reconcile transactions, and handle transfers, PayPal and card payments.",
      keywords: ["bank", "feed", "reconcil", "tagging", "tag ", "transfer", "open banking", "paypal", "stripe", "card", "statement import", "bank rules", "merchant"]
    },
    {
      id: "vat-mtd",
      name: "VAT and Making Tax Digital",
      icon: "tax",
      description: "Set up VAT, file VAT returns to HMRC through Making Tax Digital and deal with flat rate and cash accounting.",
      keywords: ["vat", "mtd", "making tax digital", "hmrc", "flat rate", "cash accounting", "domestic reverse charge", "cis"]
    },
    {
      id: "landlords-sole-traders",
      name: "Sole traders and landlords",
      icon: "home",
      description: "Guides for sole traders and landlords, including property income and Self Assessment.",
      keywords: ["landlord", "property", "rental", "tenant", "sole trader", "self assessment", "self-assessment", "itsa", "income tax", "partnership"]
    },
    {
      id: "reports-year-end",
      name: "Reports and year end",
      icon: "chart",
      description: "Run your profit and loss, balance sheet and trial balance, post journals and close your financial year.",
      keywords: ["report", "profit", "loss", "balance sheet", "trial balance", "year end", "year-end", "financial year", "closing", "journal", "nominal", "ledger", "chart of accounts", "depreciation", "fixed asset", "accrual", "prepayment", "backup", "dividend", "director"]
    },
    {
      id: "integrations",
      name: "Imports, apps and integrations",
      icon: "plug",
      description: "Bring data in and out of QuickFile with CSV imports, the API and connected apps.",
      keywords: ["import", "export", "csv", "api", "integration", "zapier", "app", "automation", "migrat", "switching from", "switching to", "moving from", "connect"]
    },
    {
      id: "accountants",
      name: "For accountants and bookkeepers",
      icon: "users",
      description: "Practice features, multi-user access and working with clients' accounts.",
      keywords: ["accountant", "bookkeeper", "practice", "multi-user", "multi user", "user access", "permissions", "client access"]
    }
  ],

  fallback: {
    id: "more",
    name: "More guides",
    icon: "play",
    description: "Everything else from the QuickFile Help Guides channel."
  },

  overrides: {
    "vEUCvQpUVOU": "getting-started",   // Manage Team Members in QuickFile
    "ochOpf5AHCw": "getting-started",   // QuickFile Signup Process
    "K4VindLn9ws": "bank-feeds",        // Importing Bank Statements in QuickFile
    "Hik4X_2QJSg": "accountants"        // QuickFile Affinity Overview
  },

  // Videos listed here appear first in their topic, in this order.
  // Any other videos in the topic follow, newest first.
  order: {
    "getting-started": [
      "ochOpf5AHCw",   // QuickFile Signup Process
      "TPA37PBbCtM",   // QuickFile Interface Tour: Navigate Sales, Purchases, Banking & More
      "vEUCvQpUVOU"    // Manage Team Members in QuickFile
    ]
  },

  hidden: [
    // "VIDEO_ID"
  ]
};
