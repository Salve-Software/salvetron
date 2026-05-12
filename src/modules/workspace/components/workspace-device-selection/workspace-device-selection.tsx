import { useCallback, useEffect, useMemo } from "react";
import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import { Icon } from "../../../../shared/ui/icon";
import { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import { useDevices } from "../../../devices/store";
import { useSetWorkspaceDevice, useWorkspaceDevice } from "../../store";

export function WorkspaceDeviceSelection() {
  const devices = useDevices();
  const workspaceDevice = useWorkspaceDevice();
  const setWorkspaceDevice = useSetWorkspaceDevice();

  const formattedDevices = useMemo(
    (): DropdownOption[] =>
      devices.map((device) => ({
        label: device.deviceName,
        value: device.deviceId,
        iconName: device.platform === "ios" ? "apple" : "android",
      })),
    [],
  );

  useEffect(() => {
    if (devices.length > 0) {
      setWorkspaceDevice(devices[0]);
    }
  }, []);

  function handleDeviceSelect(option: DropdownOption) {
    const device = devices.find((d) => d.deviceId === option.value);
    if (device) {
      setWorkspaceDevice(device);
    }
  }

  const renderItem = useCallback((option: DropdownOption) => {
    return (
      <button
        key={option.value}
        type="button"
        className="flex gap-2 items-center truncate px-3 py-2 text-left transition-colors hover:opacity-85"
        onClick={() => handleDeviceSelect(option)}
      >
        {option.iconName && (
          <Icon
            name={option.iconName}
            size={20}
            className={
              option.iconName === "apple" ? "text-blue-500" : "text-green-500"
            }
          />
        )}
        <span className="flex-1 truncate ml-3">{option.label}</span>
      </button>
    );
  }, []);

  console.log("WORKSPACE DEVICE", workspaceDevice)
  return (
    <div
      data-tauri-drag-region="true"
      className="flex w-auto items-center cursor-pointer rounded-xl transition-all duration-150 hover:opacity-90 "
    >
      <DropdownMenu
        containerWidth
        variant="outline"
        leftElement={
          <div className="w-9 h-9 shadow rounded-lg flex items-center justify-center">
            <Icon
              name={workspaceDevice?.platform === "ios" ? "apple" : "android"}
              size={20}
              className={
                workspaceDevice?.platform === "ios"
                  ? "text-blue-500"
                  : "text-green-500"
              }
            />
          </div>
        }
        label={workspaceDevice?.deviceName ?? "Select Device"}
        renderItem={renderItem}
        options={formattedDevices}
      />
    </div>
  );
}
