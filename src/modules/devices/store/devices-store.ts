import { create } from "zustand";
import type { Device } from "@mako/types";

interface DevicesState {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
}

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [
    {
      deviceId: "1",
      deviceName: "Samsung SM-20",
      platform: "android",
      type: "mobile",
      appName: "Mako",
      bundleId: "123",
      projectId: "123",
    },
    {
      deviceId: "2",
      deviceName: "Iphone 16",
      platform: "ios",
      type: "mobile",
      appName: "Mako",
      bundleId: "123",
      projectId: "123",
    },
  ],
  addDevice: (device) => {
    const devicesState = get().devices;
    if (devicesState.find(({ deviceId }) => deviceId === device.deviceId))
      return;

    set((state) => ({
      devices: [...state.devices, device],
    }));
  },
  removeDevice: (deviceId: string) => {
    set((state) => ({
      devices: state.devices.filter((device) => device.deviceId !== deviceId),
    }));
  },
}));
