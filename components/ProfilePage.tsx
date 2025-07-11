import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Shield,
  Bell,
  Eye,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
  Edit3,
  Camera,
  Key,
  Globe,
  Activity,
  Download,
  Upload,
  Clock,
  BarChart3,
  Zap,
  Star,
  Award,
  Target,
} from "lucide-react";

interface ProfilePageProps {
  onClose: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "devices",
      label: "Devices",
      icon: Monitor,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Eye,
      color: "from-violet-500 to-purple-500",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const userStats = [
    {
      label: "Devices Connected",
      value: "4",
      icon: Monitor,
      color: "text-blue-400",
    },
    {
      label: "Tabs Synced",
      value: "1,247",
      icon: Globe,
      color: "text-emerald-400",
    },
    {
      label: "Security Score",
      value: "98%",
      icon: Shield,
      color: "text-purple-400",
    },
    {
      label: "Uptime",
      value: "99.9%",
      icon: Activity,
      color: "text-orange-400",
    },
  ];

  const recentActivity = [
    {
      action: "Synced tabs",
      device: "MacBook Pro",
      time: "2 min ago",
      icon: Globe,
    },
    {
      action: "Password updated",
      device: "iPhone 15",
      time: "1 hour ago",
      icon: Key,
    },
    {
      action: "New device connected",
      device: "iPad Air",
      time: "3 hours ago",
      icon: Smartphone,
    },
    {
      action: "Security scan completed",
      device: "All devices",
      time: "1 day ago",
      icon: Shield,
    },
  ];

  const achievements = [
    {
      title: "Sync Master",
      description: "Synced 1000+ tabs",
      icon: Target,
      earned: true,
    },
    {
      title: "Security Expert",
      description: "Perfect security score for 30 days",
      icon: Shield,
      earned: true,
    },
    {
      title: "Multi-Device Pro",
      description: "Connected 5+ devices",
      icon: Monitor,
      earned: false,
    },
    {
      title: "Power User",
      description: "Used for 100+ hours",
      icon: Zap,
      earned: true,
    },
  ];

  const renderOverview = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <User className="w-12 h-12 text-white" />
            </motion.div>
            <motion.button
              className="absolute -bottom-2 -right-2 glass-button p-2 rounded-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Camera className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">John Doe</h2>
              <motion.button
                className="glass-button p-1 rounded-lg"
                onClick={() => setIsEditing(!isEditing)}
                whileHover={{ scale: 1.1 }}
              >
                <Edit3 className="w-4 h-4 text-white" />
              </motion.button>
            </div>
            <p className="text-gray-400 mb-1">john.doe@example.com</p>
            <p className="text-sm text-gray-500">
              Premium Member • Since January 2024
            </p>

            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white">Pro User</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <motion.div
            key={index}
            className="glass-card rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <activity.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-sm text-gray-400">{activity.device}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                achievement.earned
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : "border-white/10 bg-white/5"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    achievement.earned
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  <achievement.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      achievement.earned ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <Award className="w-5 h-5 text-yellow-400 ml-auto" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "security":
        return (
          <motion.div
            className="glass-card rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-button rounded-xl">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-400">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
              {/* Add more security settings */}
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            className="glass-card rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-400">This section is under development.</p>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-full flex">
        {/* Sidebar */}
        <motion.div
          className="w-80 glass-header p-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
            <motion.button
              className="glass-button p-2 rounded-lg"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? "glass-card ring-2 ring-white/20"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setActiveSection(item.id)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}
                >
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="flex-1 p-6 overflow-y-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderSection()}
        </motion.div>
      </div>
    </motion.div>
  );
};
