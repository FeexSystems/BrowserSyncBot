import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "../src/contexts/ThemeContext";

const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun className="w-4 h-4" />, label: "Light" },
  { value: "dark", icon: <Moon className="w-4 h-4" />, label: "Dark" },
  { value: "system", icon: <Monitor className="w-4 h-4" />, label: "System" },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const currentIndex = themes.findIndex((t) => t.value === theme);

  return (
    <motion.div
      className="glass-button p-1 rounded-xl flex items-center space-x-1 relative tooltip"
      data-tooltip={`Theme: ${themes[currentIndex]?.label || "System"}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {themes.map((themeOption, index) => (
        <motion.button
          key={themeOption.value}
          className={`relative p-2 rounded-lg transition-all duration-200 ${
            theme === themeOption.value
              ? "text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setTheme(themeOption.value)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Active indicator background */}
          {theme === themeOption.value && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg"
              layoutId="activeTheme"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}

          {/* Active indicator glow */}
          {theme === themeOption.value && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Icon */}
          <div className="relative z-10">{themeOption.icon}</div>
        </motion.button>
      ))}

      {/* Animated slider background */}
      <motion.div
        className="absolute inset-y-1 w-10 bg-white/5 rounded-lg border border-white/10"
        initial={false}
        animate={{
          x: currentIndex * 40 + 4,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />
    </motion.div>
  );
};
