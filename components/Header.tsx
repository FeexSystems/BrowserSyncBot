import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Settings,
  RefreshCw,
  User,
  Search,
  Menu,
  X,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  syncStatus: string;
  onProfileClick?: () => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  syncStatus,
  onProfileClick,
  onMenuClick,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500 shadow-emerald-500/50";
      case "offline":
        return "bg-gray-400 shadow-gray-400/50";
      case "syncing":
        return "bg-blue-500 shadow-blue-500/50";
      default:
        return "bg-gray-400 shadow-gray-400/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Globe className="w-3 h-3" />;
      case "syncing":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  return (
    <motion.header
      className="glass-header sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.button
              className="glass-button p-2 rounded-xl lg:hidden"
              onClick={onMenuClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>

            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center relative card-3d"
              whileHover={{
                rotateY: 360,
                scale: 1.1,
              }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-50"></div>
              <RefreshCw className="w-6 h-6 text-white relative z-10" />
            </motion.div>

            <div className="hidden md:block">
              <motion.h1
                className="text-2xl font-bold text-gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Browser Sync Bot
              </motion.h1>
              <motion.p
                className="text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Unified Browser Management • AI Powered
              </motion.p>
            </div>
          </motion.div>

          {/* Center - Search */}
          <motion.div
            className="hidden md:flex flex-1 max-w-md mx-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative w-full">
              <motion.div
                className={`glass-card rounded-2xl flex items-center px-4 py-3 transition-all duration-300 ${
                  isSearchOpen ? "ring-2 ring-blue-500/50" : ""
                }`}
                whileFocus={{ scale: 1.02 }}
              >
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search devices, tabs, or ask AI..."
                  className="bg-transparent text-white placeholder-gray-400 flex-1 outline-none"
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setIsSearchOpen(false)}
                />
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isSearchOpen ? 1 : 0.7 }}
                >
                  <kbd className="px-2 py-1 text-xs bg-white/10 rounded-lg">
                    ⌘K
                  </kbd>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Status and actions */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Status indicator */}
            <motion.div
              className="flex items-center space-x-3 glass-card px-4 py-2 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <motion.div
                  className={`w-3 h-3 rounded-full ${getStatusColor(syncStatus)} relative`}
                  animate={
                    syncStatus === "syncing" ? { scale: [1, 1.2, 1] } : {}
                  }
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {syncStatus === "syncing" && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500"
                      animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.div>
                <div className="absolute -top-1 -right-1">
                  {getStatusIcon(syncStatus)}
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm text-white font-medium capitalize">
                  {syncStatus}
                </span>
                <div className="text-xs text-gray-400">
                  {syncStatus === "online"
                    ? "4 devices"
                    : syncStatus === "syncing"
                      ? "Syncing..."
                      : "Offline"}
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <motion.button
                className="glass-button p-3 rounded-xl relative tooltip"
                data-tooltip="Notifications"
                whileHover={{ scale: 1.05, rotateZ: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-white" />
                {notifications > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {notifications}
                  </motion.div>
                )}
              </motion.button>

              {/* Settings */}
              <motion.button
                className="glass-button p-3 rounded-xl tooltip"
                data-tooltip="Settings"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>

              {/* Profile */}
              <motion.button
                className="glass-button p-3 rounded-xl tooltip relative overflow-hidden"
                data-tooltip="Profile"
                onClick={onProfileClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <User className="w-5 h-5 text-white relative z-10" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Mobile search */}
        <motion.div
          className="md:hidden mt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-card rounded-2xl flex items-center px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search or ask AI..."
              className="bg-transparent text-white placeholder-gray-400 flex-1 outline-none"
            />
          </div>
        </motion.div>
      </div>

      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: "50%",
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.header>
  );
};
