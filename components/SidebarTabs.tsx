import React from "react";
import { ArrowRightLeft, Key, History } from "lucide-react";

const tabs = [
  { id: "sync", label: "Tab Sync", icon: ArrowRightLeft },
  { id: "passwords", label: "Password Manager", icon: Key },
  { id: "history", label: "Browser History", icon: History },
];

interface SidebarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  setActiveTab,
}) => (
  <div className="flex space-x-1 mb-8 bg-black/20 backdrop-blur-sm rounded-xl p-2">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
          activeTab === tab.id
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <tab.icon className="w-4 h-4" />
        <span className="font-medium">{tab.label}</span>
      </button>
    ))}
  </div>
);
