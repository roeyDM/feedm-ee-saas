export interface DemoProfileData {
  id: string;
  name: string;
  handle: string;
  category: "Creators" | "E-commerce" | "Service Providers";
  avatar: string;
  bio: string;
  themeColor: string;
  description: string;
  badgeLabel: string;
  tags: string[];
  links: {
    id: string;
    title: string;
    url: string;
    badgeText?: string;
    isActive: boolean;
  }[];
  reels: {
    id: string;
    videoUrl: string;
    caption: string;
    likes: number;
    productTag?: string;
    promoEnabled?: boolean;
    promoTitle?: string;
    promoCta?: string;
    promoUrl?: string;
  }[];
  leadForm: {
    title: string;
    subtitle: string;
    routeType: "email" | "whatsapp";
    target: string;
    is_phone_required: boolean;
    is_email_required: boolean;
    is_enabled: boolean;
  };
}

export const DEMO_PROFILES: Record<string, DemoProfileData> = {
  "alex-rivers": {
    id: "alex-rivers",
    name: "Alex Rivers Media",
    handle: "alexrivers",
    category: "Creators",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    bio: "Digital Creator & Media Specialist. Helping creators build high-converting video bio feeds.",
    themeColor: "#bad1cb",
    description: "Digital content creator using 3 vertical video reels to promote masterclass courses and book 1-on-1 strategy sessions.",
    badgeLabel: "5-Page Snap Reel",
    tags: ["Video Reels", "Masterclass CTA", "Leadform"],
    links: [
      {
        id: "alex-1",
        title: "Join Creator Masterclass 2026",
        url: "/pricing",
        badgeText: "POPULAR",
        isActive: true,
      },
      {
        id: "alex-2",
        title: "Download Free 2026 Video Bio Playbook",
        url: "/pricing",
        badgeText: "FREE PDF",
        isActive: true,
      },
      {
        id: "alex-3",
        title: "Book 1-on-1 Content Strategy Consultation",
        url: "/pricing",
        isActive: true,
      },
    ],
    reels: [
      {
        id: "alex-reel-1",
        videoUrl: "/demo-video-1.mp4",
        caption: "Stop losing traffic on static bio links! Here is how video snap reels boost audience engagement.",
        likes: 342,
        productTag: "Masterclass 2026",
        promoEnabled: true,
        promoTitle: "Get 40% Off Creator Course",
        promoCta: "Claim Offer",
        promoUrl: "/pricing",
      },
      {
        id: "alex-reel-2",
        videoUrl: "/demo-video-2.mp4",
        caption: "Turn casual Instagram & TikTok visitors into qualified WhatsApp leads in under 60 seconds.",
        likes: 512,
        productTag: "WhatsApp Lead Tool",
        promoEnabled: true,
        promoTitle: "Book 1-on-1 Strategy Call",
        promoCta: "Book Call",
        promoUrl: "/pricing",
      },
      {
        id: "alex-reel-3",
        videoUrl: "/demo-video-3.mp4",
        caption: "Build your video bio link in under 60 seconds! Connect, upload your top Reels, and add direct conversion links.",
        likes: 429,
        productTag: "Quick Setup",
        promoEnabled: true,
        promoTitle: "Launch Your Feed",
        promoCta: "Get Started",
        promoUrl: "/pricing",
      },
    ],
    leadForm: {
      title: "Get in Touch with Alex",
      subtitle: "Leave your details below to request custom creator strategy consultation.",
      routeType: "email",
      target: "alex@riversmedia.com",
      is_phone_required: true,
      is_email_required: true,
      is_enabled: true,
    },
  },

  "fitgym-studio": {
    id: "fitgym-studio",
    name: "FitGym Studio",
    handle: "fitgym",
    category: "Service Providers",
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
    bio: "Premier Fitness & Personal Training Studio. Transform your health with expert trainers.",
    themeColor: "#10b981",
    description: "Personal training studio capturing trial workout session leads directly into WhatsApp with instant 1-click messaging.",
    badgeLabel: "Direct WhatsApp Routing",
    tags: ["WhatsApp Routing", "1-Tap Call", "CRM Sync"],
    links: [
      {
        id: "fit-1",
        title: "Claim Your Free 7-Day Trial Workout Pass",
        url: "/pricing",
        badgeText: "FREE PASS",
        isActive: true,
      },
      {
        id: "fit-2",
        title: "View Class Schedule & Studio Locations",
        url: "/pricing",
        isActive: true,
      },
      {
        id: "fit-3",
        title: "Meet Our Certified Personal Trainers",
        url: "/pricing",
        isActive: true,
      },
    ],
    reels: [
      {
        id: "fit-reel-1",
        videoUrl: "/demo-video-3.mp4",
        caption: "Ready for your fitness transformation? Claim a free 1-on-1 trial workout with our head trainers today.",
        likes: 689,
        productTag: "Free Trial Workout",
        promoEnabled: true,
        promoTitle: "Free 1-on-1 Trial Pass",
        promoCta: "Claim Pass",
        promoUrl: "/pricing",
      },
      {
        id: "fit-reel-2",
        videoUrl: "/demo-video-1.mp4",
        caption: "See how Sarah dropped 15 lbs in 8 weeks with our custom strength & conditioning program.",
        likes: 820,
        productTag: "Success Story",
        promoEnabled: true,
        promoTitle: "Start Transformation",
        promoCta: "Join Now",
        promoUrl: "/pricing",
      },
    ],
    leadForm: {
      title: "Claim Your Free Trial Workout",
      subtitle: "Leave your details below to book a free 1-on-1 personal training trial session.",
      routeType: "whatsapp",
      target: "15550192834",
      is_phone_required: true,
      is_email_required: true,
      is_enabled: true,
    },
  },

  "aura-apparel": {
    id: "aura-apparel",
    name: "Aura Apparel",
    handle: "aurastyle",
    category: "E-commerce",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop",
    bio: "Sustainable Streetwear & Fashion Essentials. Designed for modern minimalist lifestyles.",
    themeColor: "#f43f5e",
    description: "Sustainable fashion label showcasing new collection video drops with interactive promo deal popups.",
    badgeLabel: "Interactive Promo Drop",
    tags: ["Product Tags", "Promo Popups", "Bio Links"],
    links: [
      {
        id: "aura-1",
        title: "Shop Summer Collection Drop",
        url: "/pricing",
        badgeText: "NEW DROP",
        isActive: true,
      },
      {
        id: "aura-2",
        title: "Get 15% Off Your First Order",
        url: "/pricing",
        badgeText: "CODE: AURA15",
        isActive: true,
      },
      {
        id: "aura-3",
        title: "Read Our Sustainable Sourcing Guide",
        url: "/pricing",
        isActive: true,
      },
    ],
    reels: [
      {
        id: "aura-reel-1",
        videoUrl: "/demo-video-2.mp4",
        caption: "New Summer Streetwear Drop is live. Organic cottons, relaxed fits & zero-waste packaging.",
        likes: 940,
        productTag: "Summer Drop",
        promoEnabled: true,
        promoTitle: "15% Off Code: AURA15",
        promoCta: "Shop Collection",
        promoUrl: "/pricing",
      },
      {
        id: "aura-reel-2",
        videoUrl: "/demo-video-1.mp4",
        caption: "Lookbook styling guide: 3 minimalist outfits for warm weather days. Tap link to shop.",
        likes: 1120,
        productTag: "Lookbook '26",
        promoEnabled: true,
        promoTitle: "Explore Lookbook",
        promoCta: "View Styles",
        promoUrl: "/pricing",
      },
    ],
    leadForm: {
      title: "Get 15% Off Your First Order",
      subtitle: "Subscribe to receive exclusive collection drops & VIP discount codes.",
      routeType: "email",
      target: "vip@aurastyle.com",
      is_phone_required: false,
      is_email_required: true,
      is_enabled: true,
    },
  },

  "urban-bakery": {
    id: "urban-bakery",
    name: "Urban Cafe & Bakery",
    handle: "urbancafe",
    category: "E-commerce",
    avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
    bio: "Artisanal Specialty Coffee & Fresh Organic Bakery. Handcrafted daily in the heart of the city.",
    themeColor: "#f59e0b",
    description: "Artisanal coffee shop & bakery collecting catering and event booking leads directly from TikTok & Instagram bio links.",
    badgeLabel: "Instant Event Booking",
    tags: ["Custom Domain", "Event Booking", "WhatsApp"],
    links: [
      {
        id: "cafe-1",
        title: "View Daily Coffee & Bakery Menu",
        url: "/pricing",
        badgeText: "FRESH TODAY",
        isActive: true,
      },
      {
        id: "cafe-2",
        title: "Inquire for Event & Office Catering",
        url: "/pricing",
        badgeText: "CATERING",
        isActive: true,
      },
      {
        id: "cafe-3",
        title: "Order Online for Express Pickup",
        url: "/pricing",
        isActive: true,
      },
    ],
    reels: [
      {
        id: "cafe-reel-1",
        videoUrl: "/demo-video-1.mp4",
        caption: "Fresh sourdough pastries coming hot out of the oven! Stop by or order online for express pickup.",
        likes: 640,
        productTag: "Fresh Bakery",
        promoEnabled: true,
        promoTitle: "10% Off Online Pickup",
        promoCta: "Order Now",
        promoUrl: "/pricing",
      },
      {
        id: "cafe-reel-2",
        videoUrl: "/demo-video-3.mp4",
        caption: "Host your next corporate event with Urban Cafe catering! Fresh coffee, pastries & organic lunches.",
        likes: 490,
        productTag: "Catering Service",
        promoEnabled: true,
        promoTitle: "Request Catering Quote",
        promoCta: "Inquire Now",
        promoUrl: "/pricing",
      },
    ],
    leadForm: {
      title: "Inquire for Event Catering",
      subtitle: "Leave your event details below to receive a custom corporate catering quote.",
      routeType: "email",
      target: "catering@urbancafe.com",
      is_phone_required: true,
      is_email_required: true,
      is_enabled: true,
    },
  },
};
