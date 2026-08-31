import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { HelpHeader } from "@/components/help-center/help-header";
import { ArticleContent } from "@/components/help-center/article-content";
import {
  getArticleBySlug,
  getCategoryBySlug,
  getArticlesByCategory,
} from "@/lib/help-center-data";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { category: categorySlug, slug: articleSlug } = await params;
  const article = getArticleBySlug(categorySlug, articleSlug);
  const category = getCategoryBySlug(categorySlug);

  if (!article || !category) {
    notFound();
  }

  const categoryArticles = getArticlesByCategory(categorySlug).filter(
    (a) => a.slug !== article.slug
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Dynamic Header */}
      <HelpHeader />

      {/* ── Article Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 mb-6 sm:mb-8">
          <Link href="/help" className="hover:text-slate-900 transition-colors">
            Help Center
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/help/${category.slug}`} className="hover:text-slate-900 transition-colors">
            {category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-700 font-bold truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Article Body & Interactive Sidebar */}
        <ArticleContent
          article={article}
          category={category}
          categoryArticles={categoryArticles}
        />

      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
