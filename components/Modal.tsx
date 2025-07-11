import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showHeader = true,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-2xl";
      case "lg":
        return "max-w-4xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "max-w-7xl mx-4";
      default:
        return "max-w-2xl";
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${getSizeClasses()} max-h-[90vh] overflow-hidden`}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              {showHeader && (
                <motion.div
                  className="flex items-center justify-between p-6 border-b border-white/10"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {title && (
                    <h2 className="text-xl font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  <motion.button
                    className="glass-button p-2 rounded-lg hover:bg-white/10"
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                className="overflow-y-auto max-h-[calc(90vh-80px)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
