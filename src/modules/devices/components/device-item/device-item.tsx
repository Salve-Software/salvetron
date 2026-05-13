import { Icon } from "../../../../shared/ui/icon";
import type { Device } from "@mako/types";

export interface DeviceItemProps {
  device: Device;
}

export function DeviceItem({ device }: DeviceItemProps) {
  return (
    <div className="flex flex-row gap-3 justify-between items-center cursor-pointer transition-all duration-150 ease-in rounded-xl p-3 hover:bg-olive-800">
      <div>
        <Icon
          name={device.platform === "android" ? "android" : "apple"}
          size={32}
          className={
            device.platform === "android" ? "text-green-400" : "text-blue-400"
          }
          strokeWidth={2}
        />
      </div>
      <div className="flex flex-1  flex-col gap-1">
        <p className="text-sm font-bold line-clamp-1">{device.deviceName}</p>
        <p className="text-xs text-gray-500 line-clamp-1">{device.appName}</p>
      </div>
      <div>
        <div className="w-3 h-3 rounded-full bg-gray-500" />
      </div>
    </div>
  );
}
