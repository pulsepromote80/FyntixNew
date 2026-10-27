import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  card?: boolean;
}

export function Tabs({ tabs, defaultTab, className, card = false }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  if (card) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        <nav className="mb-4 flex gap-2 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm",
                activeTab === tab.id
                  ? "border-amber-500 bg-amber-400 text-gray-900"
                  : "border-gray-200 bg-white text-gray-500 hover:border-amber-400 hover:text-amber-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-amber-300"
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4 sm:p-6">{activeTabData?.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-border">
        <nav className="-mb-px flex overflow-x-auto space-x-4 sm:space-x-8 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {activeTabData?.content}
      </div>
    </div>
  );
}
