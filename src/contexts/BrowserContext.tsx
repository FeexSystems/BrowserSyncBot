import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

// MOCK DATA
const MOCK_DEVICES = [
  {
    id: "phone-1",
    name: "iPhone 15 Pro",
    type: "mobile",
    browser: "Safari",
    lastSync: "2 min ago",
    status: "online",
  },
  {
    id: "laptop-1",
    name: "MacBook Pro",
    type: "desktop",
    browser: "Chrome",
    lastSync: "1 min ago",
    status: "online",
  },
];

const MOCK_TABS = [
  {
    id: "tab-1",
    title: "GitHub",
    url: "https://github.com",
    device: "laptop-1",
    browser: "Chrome",
    favicon: "🐙",
  },
  {
    id: "tab-2",
    title: "Netflix",
    url: "https://netflix.com",
    device: "phone-1",
    browser: "Safari",
    favicon: "🎬",
  },
];

const MOCK_HISTORY = [
  {
    id: "hist-1",
    title: "React Docs",
    url: "https://react.dev",
    device: "laptop-1",
    time: "1 hour ago",
    visits: 3,
  },
];

export interface Device {
  id: string;
  name: string;
  type: string;
  browser: string;
  lastSync: string;
  status: string;
}

export interface Tab {
  id: string;
  title: string;
  url: string;
  device: string;
  browser: string;
  favicon: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  device: string;
  time: string;
  visits: number;
}

export interface BrowserContextType {
  devices: Device[];
  tabs: Tab[];
  history: HistoryItem[];
  selectedDevice: Device | null;
  selectDevice: (deviceId: string) => void;
  getDevicePerformance: (deviceId: string) => any;
  getDeviceBrowser: (deviceId: string) => any;
}

export const BrowserContext = createContext<BrowserContextType | undefined>(
  undefined
);

export const BrowserProvider = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [tabs, setTabs] = useState<Tab[]>(MOCK_TABS);
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      toast.success("Connected to sync server!");
    });

    newSocket.on("disconnect", () => {
      toast.error("Disconnected from sync server.");
    });

    // Replace mock data with real data from server
    // newSocket.on('update-devices', setDevices);
    // newSocket.on('update-tabs', setTabs);
    // newSocket.on('update-history', setHistory);

    return () => {
      newSocket.close();
    };
  }, []);

  const selectDevice = useCallback(
    (deviceId: string) => {
      const device = devices.find((d) => d.id === deviceId) || null;
      setSelectedDevice(device);
      if (device) {
        toast.success(`${device.name} selected.`);
      }
    },
    [devices]
  );

  const getDevicePerformance = (deviceId: string) => {
    // Mock performance data
    const hash = deviceId
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    return {
      cpu: Math.abs(hash % 40) + 20,
      memory: Math.abs((hash * 2) % 60) + 30,
      storage: Math.abs((hash * 3) % 50) + 40,
    };
  };

  const getDeviceBrowser = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    return device ? { name: device.browser, version: "latest" } : null;
  };

  const value = {
    devices,
    tabs,
    history,
    selectedDevice,
    selectDevice,
    getDevicePerformance,
    getDeviceBrowser,
  };

  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
};
