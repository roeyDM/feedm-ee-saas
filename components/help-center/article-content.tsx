"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  ArrowLeft,
  ThumbsUp,
  Mail,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { SupportModal } from "@/components/help-center/support-modal";
import { HelpArticle, HelpCategory } from "@/lib/help-center-data";

interface ArticleContentProps {
  article: HelpArticle;
  category: HelpCategory;
  categoryArticles: HelpArticle[];
}

export function ArticleContent({ article, category, categoryArticles }: ArticleContentProps) {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

  return (
    <>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultSubject={`Help with: ${article.title}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
        
        {/* Main Article Body (8 Cols) */}
        <article className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-10 space-y-6 sm:space-y-8 shadow-xs">
          
          {/* Title & Metadata */}
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {category.name}
              </span>
              {article.popular && (
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Popular Guide
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                {article.readTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Intro Lead */}
          <p className="text-sm sm:text-lg font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {article.content.intro}
          </p>

          {/* Content Sections */}
          <div className="space-y-6 sm:space-y-8 text-sm sm:text-base font-normal text-slate-700 leading-relaxed">
            {article.content.sections.map((section, idx) => (
              <div key={idx} className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span>{section.heading}</span>
                </h2>

                <p className="font-medium text-slate-700">{section.body}</p>

                {/* Step-by-Step Instructions Box */}
                {section.steps && section.steps.length > 0 && (
                  <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Step-by-Step Instructions:</h4>
                    <ul className="space-y-2">
                      {section.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tip Box */}
                {section.tip && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm font-semibold text-amber-900">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-800 block font-black uppercase text-[10px] tracking-wider mb-0.5">Pro Tip</strong>
                      <span>{section.tip}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Helpful Feedback Widget */}
          <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-black text-slate-900">Was this article helpful?</h4>
              <p className="text-xs font-medium text-slate-500">Let us know if this guide resolved your question.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHelpful(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isHelpful
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHelpful ? "Thank you!" : "Yes, thanks!"}</span>
              </button>
            </div>
          </div>

        </article>

        {/* Sidebar Navigation (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* More Articles in Category */}
          {categoryArticles.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>More in {category.name}</span>
              </h3>

              <div className="space-y-2.5">
                {categoryArticles.map((art) => (
                  <Link
                    key={art.slug}
                    href={`/help/${category.slug}/${art.slug}`}
                    className="block p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-colors group"
                  >
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {art.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                      {art.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Need Direct Assistance Card with SupportModal Launcher */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3 text-center shadow-xs">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Need Personal Support?</h4>
            <p className="text-xs font-medium text-slate-500">
              Can&apos;t find what you are looking for? Reach out directly to our support engineers.
            </p>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-xs text-center cursor-pointer"
            >
              Contact Support &rarr;
            </button>
          </div>

          {/* Back to Help Center */}
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Help Center Main</span>
          </Link>

        </aside>

      </div>
    </>
  );
}
