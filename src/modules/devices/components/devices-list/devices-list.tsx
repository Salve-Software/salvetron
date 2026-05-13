import { useSetWorkspaceDevice } from "../../../workspace/store";
import type { Device } from "@mako/types";
import { useDevices } from "../../store";
import { DeviceItem } from "../device-item";

export function DevicesList() {
  const devices = useDevices();
  const setWorkspaceDevice = useSetWorkspaceDevice();

  function handleDeviceClick(device: Device) {
    setWorkspaceDevice(device);
  }

  return (
    <div className="flex flex-col flex-1 gap-2 mt-4 justify-between ">

      <div className="flex flex-col gap-2 flex-1">
        {devices.map((device) => (
          <div
            onClick={() => handleDeviceClick(device)}
            className="cursor-pointer"
          >
            <DeviceItem device={device} />
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-t-olive-700 mt-2">
        <p className="text-lg font-bold text-olive-400">Devices</p>
      </div>
    </div>
  );
}
