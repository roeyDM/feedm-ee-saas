import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Clock,
  Sparkles,
  Rocket,
  Palette,
  Link2,
  ShieldCheck,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { HelpHeader } from "@/components/help-center/help-header";
import {
  getCategoryBySlug,
  getArticlesByCategory,
} from "@/lib/help-center-data";

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "getting-started": <Rocket className="w-6 h-6 text-emerald-600" />,
  "design-customization": <Palette className="w-6 h-6 text-purple-600" />,
  "links-and-content": <Link2 className="w-6 h-6 text-blue-600" />,
  "verification": <ShieldCheck className="w-6 h-6 text-teal-600" />,
  "billing-subscriptions": <CreditCard className="w-6 h-6 text-amber-600" />,
  "analytics-pixels": <BarChart3 className="w-6 h-6 text-pink-600" />,
};

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(categorySlug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Dynamic Header */}
      <HelpHeader />

      {/* ── Category Header & Breadcrumbs ── */}
      <section className="bg-gradient-to-b from-slate-100/70 to-slate-50 border-b border-slate-200/80 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-500">
            <Link href="/help" className="hover:text-slate-900 transition-colors">
              Help Center
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-emerald-700 font-bold">{category.name}</span>
          </nav>

          <div className="flex items-center gap-3.5 sm:gap-4 pt-1 sm:pt-2">
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
              {CATEGORY_ICONS[category.slug] || <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5 sm:mt-1">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Articles List ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 space-y-6 w-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
            {articles.length} {articles.length === 1 ? "Article" : "Articles"} in this category
          </span>
          <Link
            href="/help"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
        </div>

        <div className="divide-y divide-slate-200/80">
          {articles.map((art) => (
            <Link
              key={art.slug}
              href={`/help/${category.slug}/${art.slug}`}
              className="py-4 sm:py-5 block group transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {art.title}
                    </h2>
                    {art.popular && (
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                    {art.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.readTimeMinutes} min read</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
