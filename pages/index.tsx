import React, { useState } from "react";
import { Header } from "../components/Header";
import { SidebarTabs } from "../components/SidebarTabs";
import { DeviceCard } from "../components/DeviceCard";
import { TabList } from "../components/TabList";
import { PasswordList } from "../components/PasswordList";
import { HistoryList } from "../components/HistoryList";
import { useBrowser } from "../src/hooks/useBrowser";
import { useTabTransfer } from "../components/useTabTransfer";

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
  const { devices, tabs, history, selectedDevice, selectDevice } = useBrowser();
  const { transferTab, isTransferring } = useTabTransfer();

  const handleTabTransfer = (tab) => {
    if (selectedDevice) {
      const fromDevice = devices.find((d) => d.id === tab.device);
      transferTab(tab, fromDevice, selectedDevice);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
      suppressHydrationWarning={true}
    >
      <Header syncStatus={"online"} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SidebarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onSelect={() => selectDevice(device.id)}
            />
          ))}
        </div>

        {activeTab === "sync" && (
          <TabList tabs={tabs} onTransferTab={handleTabTransfer} />
        )}
        {activeTab === "passwords" && (
          <PasswordList
            passwords={mockPasswords} // Passwords are not implemented yet
            showPasswords={showPasswords}
            toggleVisibility={() => setShowPasswords(!showPasswords)}
          />
        )}
        {activeTab === "history" && <HistoryList history={history} />}
      </div>
    </div>
  );
};

export default IndexPage;
