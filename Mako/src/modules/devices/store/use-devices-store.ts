import { useDevicesStore } from "./devices-store";

export function useDevices() {
  return useDevicesStore((state) => state.devices);
}

export function useAddDevice() {
  return useDevicesStore((state) => state.addDevice);
}

export function useRemoveDevice() {
  return useDevicesStore((state) => state.removeDevice);
}
