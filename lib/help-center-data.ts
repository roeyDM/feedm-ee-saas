export interface HelpArticle {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  readTimeMinutes: number;
  popular?: boolean;
  content: {
    intro: string;
    sections: {
      heading: string;
      body: string;
      steps?: string[];
      tip?: string;
    }[];
  };
}

export interface HelpCategory {
  slug: string;
  name: string;
  iconName: string;
  description: string;
  articleCount: number;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: "getting-started",
    name: "Getting Started",
    iconName: "Rocket",
    description: "Learn how to set up your Feedm.ee profile, choose a username, and launch your feed.",
    articleCount: 3,
  },
  {
    slug: "design-customization",
    name: "Design & Customization",
    iconName: "Palette",
    description: "Customize themes, background colors, custom fonts, avatar borders, and remove watermarks.",
    articleCount: 4,
  },
  {
    slug: "links-and-content",
    name: "Links & Content",
    iconName: "Link2",
    description: "Add custom links, drag and drop reorder, embed vertical video reels, and capture leads.",
    articleCount: 3,
  },
  {
    slug: "verification",
    name: "Identity & Verification",
    iconName: "ShieldCheck",
    description: "Complete Didit KYC verification, unlock the Verified Badge, and understand verification requirements.",
    articleCount: 3,
  },
  {
    slug: "billing-subscriptions",
    name: "Billing & Subscriptions",
    iconName: "CreditCard",
    description: "Compare Free vs. Pro plans, manage Lemon Squeezy subscriptions, and track trial days.",
    articleCount: 3,
  },
  {
    slug: "analytics-pixels",
    name: "Analytics & Pixels",
    iconName: "BarChart3",
    description: "Track page views and clicks, configure Meta/TikTok tracking pixels, and export CRM leads.",
    articleCount: 3,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  // ── Getting Started ──
  {
    slug: "account-setup",
    categorySlug: "getting-started",
    title: "Setting Up Your Feedm.ee Account",
    description: "A complete step-by-step guide to creating your creator account and completing the initial setup wizard.",
    readTimeMinutes: 3,
    popular: true,
    content: {
      intro: "Welcome to Feedm.ee! Creating an account allows you to build an interactive link-in-bio page with rich video feeds and audience lead capture.",
      sections: [
        {
          heading: "1. Account Registration",
          body: "Sign up using your email and password at the authentication page. Once registered, your profile is immediately initialized on our secure database server.",
          steps: [
            "Navigate to the Feedm.ee authentication portal.",
            "Enter your primary email address and select a strong password.",
            "Click Sign Up to initialize your account and enter the creator dashboard."
          ]
        },
        {
          heading: "2. Completing the Setup Wizard",
          body: "Upon first login, the Setup Wizard guides you through 3 essential steps: Profile Bio & Links, Video Reels, and Theme Customization.",
          tip: "You can skip steps anytime or return to edit your profile details directly from the builder tabs."
        }
      ]
    }
  },
  {
    slug: "username-selection",
    categorySlug: "getting-started",
    title: "Choosing & Updating Your Profile URL",
    description: "How to select your unique Feedm.ee username handle and share your public profile link.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "Your Feedm.ee profile handle defines your public web URL (e.g., feedm.ee/yourhandle).",
      sections: [
        {
          heading: "How to Change Your Handle",
          body: "You can update your username handle anytime from the Account Settings tab inside your creator workspace.",
          steps: [
            "Open your Dashboard and click on the Account Settings tab.",
            "Locate the Username / Profile URL input field.",
            "Type your new handle and click Save Changes."
          ],
          tip: "Usernames must contain only alphanumeric characters, hyphens, or underscores without spaces."
        }
      ]
    }
  },
  {
    slug: "bio-avatar-setup",
    categorySlug: "getting-started",
    title: "Configuring Display Name, Avatar & Bio",
    description: "Learn how to upload your profile photo and write an engaging bio for your audience.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "Your avatar picture, display name, and bio form the header of your creator page.",
      sections: [
        {
          heading: "Uploading a Profile Avatar",
          body: "Click on the avatar placeholder image in the Profile tab to select a JPEG, PNG, or WebP photo from your device.",
          steps: [
            "Select the Profile tab in your dashboard.",
            "Click the circular profile image placeholder.",
            "Select your photo. The recommended image resolution is 300x300 pixels."
          ]
        }
      ]
    }
  },

  // ── Design & Customization ──
  {
    slug: "themes-and-backgrounds",
    categorySlug: "design-customization",
    title: "Customizing Themes, Colors & Gradients",
    description: "Explore solid background colors, dual-tone gradients, and custom image overlays.",
    readTimeMinutes: 4,
    popular: true,
    content: {
      intro: "Feedm.ee provides advanced visual styling controls to align your creator feed with your visual brand identity.",
      sections: [
        {
          heading: "Choosing a Theme Preset",
          body: "Select from curated design presets like Dark Modern, Emerald Luxe, Cyber Neon, or Sunset Boulevard in the Design editor."
        },
        {
          heading: "Setting Custom Dual-Tone Gradients",
          body: "Configure custom linear gradients with Start and End color pickers, along with adjustable gradient angles (0 to 360 degrees).",
          steps: [
            "Open the Design & Themes tab.",
            "Set Background Type to Gradient.",
            "Choose your Start Color and End Color using the hex pickers.",
            "Adjust the Gradient Angle slider."
          ]
        }
      ]
    }
  },
  {
    slug: "fonts-and-typography",
    categorySlug: "design-customization",
    title: "Selecting Fonts & Headline Styling",
    description: "Choose from Google Fonts including Inter, Poppins, Montserrat, and Playfair Display.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "Match your page typography with your brand aesthetic.",
      sections: [
        {
          heading: "Font Selection & Colors",
          body: "Choose from Google Fonts included in the font picker. Custom headline and bio text colors can be configured independently."
        }
      ]
    }
  },
  {
    slug: "avatar-border-ring",
    categorySlug: "design-customization",
    title: "Customizing the Avatar Border Ring",
    description: "Enable, colorize, and adjust the thickness of your profile photo accent ring.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "Add a stylish accent border ring around your avatar image.",
      sections: [
        {
          heading: "Configuring the Ring",
          body: "In the Design tab, locate the Avatar Border Ring section. Toggle the border ring on, pick your border color, and adjust thickness from 1px to 12px."
        }
      ]
    }
  },
  {
    slug: "watermark-removal",
    categorySlug: "design-customization",
    title: "Removing Feedm.ee Branding",
    description: "How to hide the default Feedm.ee footer badge on paid plans.",
    readTimeMinutes: 2,
    popular: true,
    content: {
      intro: "Subscribers on Personal, Pro, and Business plans can remove the default Feedm.ee footer watermark.",
      sections: [
        {
          heading: "Hiding the Branding Footer",
          body: "In the Design tab under General Settings, enable the 'Hide Feedm.ee Branding' toggle and save your changes."
        }
      ]
    }
  },

  // ── Links & Content ──
  {
    slug: "managing-links",
    categorySlug: "links-and-content",
    title: "Adding, Editing & Reordering Links",
    description: "Manage your links, icons, thumbnail images, and real-time drag-and-drop ordering.",
    readTimeMinutes: 3,
    popular: true,
    content: {
      intro: "Add unlimited destination links to your store, social accounts, music, or external content.",
      sections: [
        {
          heading: "Adding New Links",
          body: "Click 'Add New Link' in the Bio & Links tab. Enter a Title, Destination URL, and optional Subtitle.",
          steps: [
            "Open the Bio & Links tab.",
            "Click the Add Link button.",
            "Fill in link title, URL, and optional icon or thumbnail image."
          ]
        },
        {
          heading: "Reordering Links",
          body: "Drag the grip handle next to any link card to adjust its order on your live page."
        }
      ]
    }
  },
  {
    slug: "video-reels-embed",
    categorySlug: "links-and-content",
    title: "Embedding Vertical Video Reels",
    description: "How to upload and showcase vertical MP4 video shorts and reels on your profile.",
    readTimeMinutes: 3,
    popular: true,
    content: {
      intro: "Personal, Pro, and Business plan creators can showcase up to 3 vertical video reels on their page.",
      sections: [
        {
          heading: "Adding Video Reels",
          body: "Open the Videos & Reels tab. Upload an MP4 video file or enter a direct video URL, write a caption, and set up optional promo callouts."
        }
      ]
    }
  },
  {
    slug: "lead-capture-forms",
    categorySlug: "links-and-content",
    title: "Setting Up Lead Generation Forms",
    description: "Collect audience email addresses and phone numbers directly from your page.",
    readTimeMinutes: 3,
    popular: false,
    content: {
      intro: "Turn visitors into subscribers with embedded lead capture forms.",
      sections: [
        {
          heading: "Configuring Lead Capture",
          body: "Enable the Lead Form in the Leads tab. Customize the header title, input field labels, and submission button text."
        }
      ]
    }
  },

  // ── Identity & Verification ──
  {
    slug: "didit-kyc-process",
    categorySlug: "verification",
    title: "Didit Identity Verification Process",
    description: "Understand the automated Didit KYC identity verification workflow.",
    readTimeMinutes: 4,
    popular: true,
    content: {
      intro: "Feedm.ee integrates official Didit v3 REST API verification to offer official Verified Badges for creators.",
      sections: [
        {
          heading: "How Verification Works",
          body: "After purchasing the Verified Badge, click 'Start Identity Verification' to launch the secure Didit session. Complete the ID document check and selfie scan on your device.",
          steps: [
            "Complete the one-time $14.99 Verified Badge checkout.",
            "Click 'Start Identity Verification' in the Verification tab.",
            "Follow the Didit instructions to scan your government ID and complete the selfie check."
          ]
        }
      ]
    }
  },
  {
    slug: "verified-badge-fee",
    categorySlug: "verification",
    title: "Verified Badge $14.99 One-Time Fee",
    description: "Details regarding the one-time verification fee and PRO subscriber eligibility.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "The Verified Badge is an exclusive trust badge reserved for active PRO and Business plan creators.",
      sections: [
        {
          heading: "Pricing & Requirements",
          body: "The Verified Badge requires an active PRO or Business plan and a one-time $14.99 processing fee processed via Lemon Squeezy."
        }
      ]
    }
  },
  {
    slug: "verification-troubleshooting",
    categorySlug: "verification",
    title: "Troubleshooting KYC Approvals",
    description: "What to do if your verification session fails or remains pending.",
    readTimeMinutes: 3,
    popular: false,
    content: {
      intro: "Resolving common identity document scan errors or verification delays.",
      sections: [
        {
          heading: "Resolution Steps",
          body: "Ensure your government ID is valid and clearly illuminated. If automated checks fail, contact support@feedm.ee for manual review."
        }
      ]
    }
  },

  // ── Billing & Subscriptions ──
  {
    slug: "pricing-plans",
    categorySlug: "billing-subscriptions",
    title: "Comparing Free, Personal, Pro & Business Plans",
    description: "Detailed breakdown of features, limits, and pricing across all plan tiers.",
    readTimeMinutes: 4,
    popular: true,
    content: {
      intro: "Select the plan tier that fits your growth requirements.",
      sections: [
        {
          heading: "Plan Comparison",
          body: "Starter Free ($0/mo) includes 1 feed and basic links. Personal ($8/mo) adds watermark removal and 3 video reels. Pro Growth ($15/mo) unlocks unlimited leads, tracking pixels, and full analytics. Business ($35/mo) includes 5 feeds and team seat management."
        }
      ]
    }
  },
  {
    slug: "lemon-squeezy-portal",
    categorySlug: "billing-subscriptions",
    title: "Managing Subscriptions & Invoices",
    description: "Access your Lemon Squeezy billing portal to manage payment methods and invoices.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "All payments and subscriptions are processed through Lemon Squeezy.",
      sections: [
        {
          heading: "Opening Billing Portal",
          body: "Navigate to Account Settings or Billing in your dashboard and click 'Manage Subscription' to view invoices or update payment methods."
        }
      ]
    }
  },
  {
    slug: "trial-management",
    categorySlug: "billing-subscriptions",
    title: "Understanding the 7-Day Pro Trial",
    description: "How trial periods work and upgrading before your trial expires.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "New creator signups enjoy a 7-day trial of Pro Growth features.",
      sections: [
        {
          heading: "Trial Expiration",
          body: "A counter in your top dashboard header displays remaining trial days. You can upgrade anytime to ensure uninterrupted access."
        }
      ]
    }
  },

  // ── Analytics & Pixels ──
  {
    slug: "traffic-analytics",
    categorySlug: "analytics-pixels",
    title: "Understanding Page Views & Click Rates",
    description: "Analyze visitor engagement, top links, and click-through rates.",
    readTimeMinutes: 3,
    popular: true,
    content: {
      intro: "Track how your audience interacts with your feed in real-time.",
      sections: [
        {
          heading: "Analytics Metrics",
          body: "View total page impressions, unique visitors, individual link clicks, and overall click-through rates (CTR) in the Analytics tab."
        }
      ]
    }
  },
  {
    slug: "meta-tiktok-pixels",
    categorySlug: "analytics-pixels",
    title: "Setting Up Meta & TikTok Pixels",
    description: "Connect Facebook, TikTok, and Google Ads tracking IDs.",
    readTimeMinutes: 3,
    popular: false,
    content: {
      intro: "Track conversions and build custom retargeting audiences.",
      sections: [
        {
          heading: "Configuring Pixel IDs",
          body: "Pro subscribers can enter their Meta Pixel ID, TikTok Pixel ID, or Google Ads Measurement ID in the Marketing Pixels tab. PageView and Lead events fire automatically."
        }
      ]
    }
  },
  {
    slug: "crm-csv-export",
    categorySlug: "analytics-pixels",
    title: "Exporting Captured Leads to CSV",
    description: "Download audience leads for your email marketing campaigns.",
    readTimeMinutes: 2,
    popular: false,
    content: {
      intro: "Export captured leads seamlessly to your CRM or email provider.",
      sections: [
        {
          heading: "Downloading Leads",
          body: "In the Leads tab, click the 'Export CSV' button to download a spreadsheet containing name, email address, phone number, and timestamp."
        }
      ]
    }
  }
];

export function getArticleBySlug(categorySlug: string, articleSlug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(
    (a) => a.categorySlug === categorySlug && a.slug === articleSlug
  );
}

export function getCategoryBySlug(categorySlug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === categorySlug);
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.categorySlug === categorySlug);
}

export function searchArticles(query: string): HelpArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return HELP_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.content.intro.toLowerCase().includes(q)
  );
}
