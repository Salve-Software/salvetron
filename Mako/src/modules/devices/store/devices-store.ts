import { create } from "zustand";
import { Device } from "../domain/types";

interface DevicesState {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
}

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
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
