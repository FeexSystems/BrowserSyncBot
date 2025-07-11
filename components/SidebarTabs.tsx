import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Key,
  History,
  Users,
  Settings,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const tabs = [
  {
    id: "sync",
    label: "Tab Sync",
    icon: ArrowRightLeft,
    description: "Sync tabs across devices",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "passwords",
    label: "Password Manager",
    icon: Key,
    description: "Secure password storage",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "history",
    label: "Browser History",
    icon: History,
    description: "View browsing history",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "devices",
    label: "Device Manager",
    icon: Users,
    description: "Manage connected devices",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Usage analytics",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Security settings",
    color: "from-red-500 to-pink-500",
  },
];

interface SidebarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <motion.div
      className="mb-8"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Main tabs */}
      <div className="glass-card rounded-2xl p-3 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-4 rounded-xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? "glass-card scale-105"
                  : "hover:bg-white/5"
              }`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background gradient */}
              {activeTab === tab.id && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl opacity-20`}
                  layoutId="activeTabBg"
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                animate={
                  activeTab === tab.id ? { opacity: 0.3 } : { opacity: 0 }
                }
              />

              <div className="relative z-10 flex flex-col items-center space-y-2">
                <motion.div
                  className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : "text-gray-400 group-hover:text-white"
                  }`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <tab.icon className="w-4 h-4" />
                </motion.div>

                <div className="text-center">
                  <motion.div
                    className={`text-sm font-medium ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                    layout
                  >
                    {tab.label}
                  </motion.div>
                  <motion.div
                    className={`text-xs ${
                      activeTab === tab.id
                        ? "text-gray-300"
                        : "text-gray-500 group-hover:text-gray-400"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeTab === tab.id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.description}
                  </motion.div>
                </div>

                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>

              {/* Particle effect on hover */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${30 + i * 20}%`,
                    }}
                    animate={{
                      y: [-5, 5, -5],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex items-center space-x-4">
          <motion.button
            className="glass-button px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium text-white hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4" />
            <span>Quick Sync</span>
          </motion.button>

          <motion.button
            className="glass-button px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium text-white hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </motion.button>
        </div>

        <motion.div
          className="text-sm text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          AI Assistant Ready
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
