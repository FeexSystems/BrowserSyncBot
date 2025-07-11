import { useEffect, useState } from 'react';

export const useDeviceStatus = (devices) => {
  const [deviceStatus, setDeviceStatus] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      devices.forEach((device) => {
        updated[device.id] = Math.random() > 0.1 ? 'online' : 'offline';
      });
      setDeviceStatus(updated);
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [devices]);

  return deviceStatus;
};
