import { Icon, IconPress } from "../../../../shared/ui/icon";

export function WorkspaceDeviceSelection() {
  return (
    <div
      data-tauri-drag-region="true"
      className="flex w-auto gap-1 p-1 items-center cursor-pointer rounded-xl transition-all duration-150 hover:opacity-90 "
    >
      <div className="w-9 h-9 shadow rounded-lg flex items-center justify-center">
        <Icon name="android" size={20} className="text-green-400" />
      </div>
      <p className="font-medium text-md">Samsung SM-20</p>

      <IconPress
        name="chevronDown"
        onPress={() => {}}
        size={22}
        className="text-olive-400 ml-2"
      />
    </div>
  );
}
