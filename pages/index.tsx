import React, { useState } from "react";
import { Header } from "../components/Header";
import { SidebarTabs } from "../components/SibebarTabs";
import { DeviceCard } from "../components/DeviceCard";
import { TabList } from "../components/TabList";
import { PasswordList } from "../components/PasswordList";
import { HistoryList } from "../components/HistoryList";

const mockDevices = [
  {
    id: "phone",
    name: "iPhone 15 Pro",
    type: "mobile",
    browser: "Safari",
    lastSync: "2 min ago",
    status: "online",
  },
  {
    id: "laptop",
    name: "MacBook Pro",
    type: "desktop",
    browser: "Chrome",
    lastSync: "1 min ago",
    status: "online",
  },
  {
    id: "work-pc",
    name: "Dell Workstation",
    type: "desktop",
    browser: "Edge",
    lastSync: "5 min ago",
    status: "online",
  },
  {
    id: "tablet",
    name: "iPad Air",
    type: "tablet",
    browser: "Safari",
    lastSync: "10 min ago",
    status: "offline",
  },
];

const mockTabs = [
  {
    id: 1,
    title: "GitHub - Repository Dashboard",
    url: "github.com/dashboard",
    device: "laptop",
    browser: "Chrome",
    favicon: "🐙",
  },
  {
    id: 2,
    title: "Netflix - Watch Movies",
    url: "netflix.com/browse",
    device: "phone",
    browser: "Safari",
    favicon: "🎬",
  },
];

const mockPasswords = [
  {
    site: "github.com",
    username: "john@email.com",
    strength: "strong",
    lastUpdated: "2 days ago",
  },
];

const mockHistory = [
  {
    title: "React Hooks Guide",
    url: "reactjs.org/hooks",
    device: "laptop",
    time: "1 hr ago",
    visits: 10,
  },
];

const IndexPage = () => {
  const [activeTab, setActiveTab] = useState("sync");
  const [showPasswords, setShowPasswords] = useState(false);
  const [syncStatus, setSyncStatus] = useState("online");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header syncStatus={syncStatus} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SidebarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>

        {activeTab === "sync" && <TabList tabs={mockTabs} />}
        {activeTab === "passwords" && (
          <PasswordList
            passwords={mockPasswords}
            showPasswords={showPasswords}
            toggleVisibility={() => setShowPasswords(!showPasswords)}
          />
        )}
        {activeTab === "history" && <HistoryList history={mockHistory} />}
      </div>
    </div>
  );
};

export default IndexPage;
