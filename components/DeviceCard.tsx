import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  Cpu,
  HardDrive,
  Activity,
  MoreVertical,
  Eye,
  RefreshCw,
  PowerOff,
} from "lucide-react";
import { useBrowser } from "../src/hooks/useBrowser";

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

const getBatteryLevel = (deviceType: string) => {
  // Mock battery levels
  const levels = { mobile: 85, tablet: 92, desktop: 100 };
  return levels[deviceType as keyof typeof levels] || 100;
};

const getPerformanceData = (deviceId: string) => {
  // Use device ID to generate consistent values
  const hash = deviceId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const cpu = Math.abs(hash % 40) + 20;
  const memory = Math.abs((hash * 2) % 60) + 30;
  const storage = Math.abs((hash * 3) % 50) + 40;

  return { cpu, memory, storage };
};

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    type: string;
    browser: string;
    lastSync: string;
    status: string;
  };
  onRemoteView?: (deviceId: string) => void;
  onSync?: (deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onRemoteView,
  onSync,
}) => {
  const {
    devices,
    selectedDevice,
    selectDevice,
    getDevicePerformance,
    getDeviceBrowser,
  } = useBrowser();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const DeviceIcon = getDeviceIcon(device.type);
  const StatusIcon = getStatusIcon(device.status);
  const batteryLevel = getBatteryLevel(device.type);
  const performance = getDevicePerformance(device.id) || {
    cpu: 0,
    memory: 0,
    storage: 0,
  };
  const browser = getDeviceBrowser(device.id) || { name: "Unknown", version: "" };

  const isSelected = selectedDevice?.id === device.id;

  const cardVariants = {
    idle: {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      scale: 1,
    },
    hover: {
      rotateX: 5,
      rotateY: 5,
      z: 50,
      scale: 1.02,
    },
  };

  const glowVariants = {
    idle: { opacity: 0 },
    hover: { opacity: 1 },
  };

  return (
    <motion.div
      className="relative perspective-1000"
      initial="idle"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"
        variants={glowVariants}
      />

      <motion.div
        className={`glass-card rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 ${
          isSelected
            ? "border-purple-500 shadow-2xl shadow-purple-500/20"
            : "border-white/10"
        }`}
        variants={cardVariants}
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => selectDevice(device.id)}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <DeviceIcon className="w-6 h-6 text-white" />
              {device.status === "online" && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white pulse-ring"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.div>

            <div className="flex items-center space-x-2">
              <motion.div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg glass-button ${
                  device.status === "online"
                    ? "text-emerald-400"
                    : "text-gray-400"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="text-xs font-medium capitalize">
                  {device.status}
                </span>
              </motion.div>

              {device.type !== "desktop" && (
                <motion.div
                  className="flex items-center space-x-1 px-2 py-1 rounded-lg glass-button"
                  whileHover={{ scale: 1.05 }}
                >
                  <Battery className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">
                    {batteryLevel}%
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div className="relative">
            <motion.button
              className="glass-button p-2 rounded-lg"
              onClick={() => setShowMenu(!showMenu)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </motion.button>

            {/* Dropdown menu */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-40 glass-card rounded-xl p-2 z-20"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={
                showMenu
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.9, y: -10 }
              }
              transition={{ duration: 0.2 }}
              style={{ display: showMenu ? "block" : "none" }}
            >
              <motion.button
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg"
                onClick={() => onRemoteView?.(device.id)}
                whileHover={{ x: 5 }}
              >
                <Eye className="w-4 h-4" />
                <span>Remote View</span>
              </motion.button>
              <motion.button
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg"
                onClick={() => onSync?.(device.id)}
                whileHover={{ x: 5 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Now</span>
              </motion.button>
              <motion.button
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                whileHover={{ x: 5 }}
              >
                <PowerOff className="w-4 h-4" />
                <span>Disconnect</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Device info */}
        <motion.div
          className="space-y-3 relative z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h3 className="font-semibold text-white text-lg">{device.name}</h3>
            <p className="text-sm text-gray-400">
              {browser.name} {browser.version}
            </p>
            <p className="text-xs text-gray-500">
              Last sync: {device.lastSync}
            </p>
          </div>

          {/* Performance indicators */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400">CPU</span>
              </div>
              <span className="text-white">{performance.cpu}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${performance.cpu}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-gray-400">Memory</span>
              </div>
              <span className="text-white">{performance.memory}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${performance.memory}%` }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <HardDrive className="w-3 h-3 text-orange-400" />
                <span className="text-gray-400">Storage</span>
              </div>
              <span className="text-white">{performance.storage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${performance.storage}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex space-x-2 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="flex-1 glass-button py-2 px-3 rounded-xl text-sm font-medium text-white hover:bg-white/20"
            onClick={() => onRemoteView?.(device.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Remote View
          </motion.button>
          <motion.button
            className="glass-button p-2 rounded-xl text-white hover:bg-white/20"
            onClick={() => onSync?.(device.id)}
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};
