import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  Camera,
  Mouse,
  Keyboard,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Settings,
  X,
} from "lucide-react";

interface RemoteScreenProps {
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}

export const RemoteScreen: React.FC<RemoteScreenProps> = ({
  deviceId,
  deviceName,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlEnabled, setIsControlEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [screenData, setScreenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading screen data
    const timer = setTimeout(() => {
      setScreenData({
        screenshot: "/api/placeholder/800/600",
        activeTab: {
          title: "Browser Sync Dashboard",
          url: "localhost:3000",
        },
        timestamp: Date.now(),
      });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [deviceId]);

  const controlButtons = [
    {
      icon: isControlEnabled ? Mouse : Mouse,
      label: isControlEnabled ? "Disable Control" : "Enable Control",
      onClick: () => setIsControlEnabled(!isControlEnabled),
      active: isControlEnabled,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Camera,
      label: "Take Screenshot",
      onClick: () => console.log("Screenshot taken"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: isMuted ? VolumeX : Volume2,
      label: isMuted ? "Unmute" : "Mute",
      onClick: () => setIsMuted(!isMuted),
      active: isMuted,
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: RotateCcw,
      label: "Refresh",
      onClick: () => setLoading(true),
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <motion.div
      className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-xl ${
        isFullscreen ? "" : "p-4"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          className="glass-header p-4 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Monitor className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Remote View - {deviceName}
              </h2>
              <p className="text-sm text-gray-400">
                Real-time screen sharing • ID: {deviceId}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">85%</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                className="glass-button p-2 rounded-lg"
                onClick={() => setIsFullscreen(!isFullscreen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white" />
                )}
              </motion.button>

              <motion.button
                className="glass-button p-2 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-4 h-4 text-white" />
              </motion.button>

              <motion.button
                className="glass-button p-2 rounded-lg hover:bg-red-500/20"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Screen area */}
          <motion.div
            className="flex-1 p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-full glass-card rounded-2xl p-4 relative overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="loading-spinner mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    />
                    <p className="text-white">Connecting to {deviceName}...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Establishing secure connection
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full relative">
                  {/* Screen content */}
                  <motion.div
                    className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {/* Mock browser interface */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 flex items-center px-4 space-x-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 mx-4 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300">
                        {screenData?.activeTab?.url}
                      </div>
                    </div>

                    {/* Mock screen content */}
                    <div className="mt-10 p-4 h-full">
                      <div className="grid grid-cols-4 gap-4 h-full">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="glass-card rounded-lg p-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="w-full h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded mb-2"></div>
                            <div className="space-y-1">
                              <div className="h-2 bg-white/20 rounded w-3/4"></div>
                              <div className="h-2 bg-white/10 rounded w-1/2"></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Control overlay */}
                    {isControlEnabled && (
                      <motion.div
                        className="absolute inset-0 bg-blue-500/10 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <Mouse className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-400 font-medium">
                            Remote Control Active
                          </p>
                          <p className="text-sm text-gray-400">
                            Click and drag to control
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Screen info overlay */}
                  <motion.div
                    className="absolute top-4 right-4 glass-card p-3 rounded-lg"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className="text-xs text-gray-400">Resolution</p>
                    <p className="text-sm text-white font-medium">1920x1080</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Control panel */}
          <motion.div
            className="w-80 p-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card rounded-2xl p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-6">
                Remote Control
              </h3>

              <div className="space-y-4">
                {controlButtons.map((button, index) => (
                  <motion.button
                    key={index}
                    className={`w-full glass-button p-4 rounded-xl flex items-center space-x-3 text-left transition-all duration-300 ${
                      button.active ? "ring-2 ring-white/20" : ""
                    }`}
                    onClick={button.onClick}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${button.color} rounded-lg flex items-center justify-center`}
                    >
                      <button.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {button.label}
                      </p>
                      {button.active && (
                        <p className="text-xs text-emerald-400">Active</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Performance stats */}
              <motion.div
                className="mt-8 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="text-sm font-medium text-gray-400">
                  Performance
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Latency</span>
                      <span>12ms</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "88%" }}
                        transition={{ delay: 1, duration: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Quality</span>
                      <span>HD</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ delay: 1.2, duration: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Bandwidth</span>
                      <span>2.4 MB/s</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "72%" }}
                        transition={{ delay: 1.4, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
