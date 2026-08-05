import { AnalyticsManager } from "@/components/analytics-manager";

export const metadata = {
  title: "Analytics & Insights Preview | FeedM.ee",
  description: "Draft preview of the 3-tier Analytics & Insights engine for FeedM.ee.",
};

export default function AnalyticsPreviewPage() {
  return (
    <div className="min-h-screen bg-zinc-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <AnalyticsManager planType="free" />
      </div>
    </div>
  );
}
