import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export const useTabTransfer = () => {
  const [isTransferring, setIsTransferring] = useState(false);

  const transferTab = useCallback(async (tab, fromDevice, toDevice) => {
    setIsTransferring(true);
    const toastId = toast.loading(
      `Sending tab to ${toDevice.name}...`
    );

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you'd emit a socket event or call an API endpoint
      // e.g., socket.emit('transfer-tab', { tab, fromDevice, toDevice });

      toast.success(
        `Tab "${tab.title}" sent to ${toDevice.name} successfully!`,
        { id: toastId }
      );
    } catch (error) {
      console.error("Tab transfer failed:", error);
      toast.error("Failed to send tab. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsTransferring(false);
    }
  }, []);

  return { isTransferring, transferTab };
};
