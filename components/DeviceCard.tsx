import React from "react";
import { Smartphone, Monitor, Tablet, Wifi, WifiOff } from "lucide-react";

const getDeviceIcon = (type: string) => {
  switch (type) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
      return Monitor;
    default:
      return Monitor;
  }
};

const getStatusIcon = (status: string) => {
  return status === "online" ? Wifi : WifiOff;
};

export const DeviceCard = ({ device }) => {
  const DeviceIcon = getDeviceIcon(device.type);
  const StatusIcon = getStatusIcon(device.status);

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <DeviceIcon className="w-5 h-5 text-white" />
        </div>
        <div
          className={`flex items-center space-x-1 ${device.status === "online" ? "text-green-400" : "text-gray-400"}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs capitalize">{device.status}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-white">{device.name}</h3>
        <p className="text-sm text-gray-400">{device.browser}</p>
        <p className="text-xs text-gray-500">Last sync: {device.lastSync}</p>
      </div>
    </div>
  );
};
