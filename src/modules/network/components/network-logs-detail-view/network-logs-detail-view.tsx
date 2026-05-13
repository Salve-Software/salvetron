import { useState } from "react";
import type { NetworkLog } from "@mako/types";
import { OverviewTab } from "./tabs/overview-tab";
import { RequestTab } from "./tabs/request-tab";
import { ResponseTab } from "./tabs/response-tab";
import { HeadersTab } from "./tabs/headers-tab";

interface NetworkLogsDetailViewProps {
  log: NetworkLog;
}

type TabId = "overview" | "request" | "response" | "headers";

interface TabConfig {
  id: TabId;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "request", label: "Request" },
  { id: "response", label: "Response" },
  { id: "headers", label: "Headers" },
];

export function NetworkLogsDetailView({ log }: NetworkLogsDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-olive-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-olive-100 border-blue-400"
                : "text-olive-400 border-transparent hover:text-olive-200 hover:border-olive-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-0 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab log={log} />}
        {activeTab === "request" && <RequestTab log={log} />}
        {activeTab === "response" && <ResponseTab log={log} />}
        {activeTab === "headers" && <HeadersTab log={log} />}
      </div>
    </div>
  );
}
