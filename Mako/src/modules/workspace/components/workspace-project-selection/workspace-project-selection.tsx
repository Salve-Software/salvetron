import { IconPress } from "../../../../shared/ui/icon";

export function WorkspaceProjectSelection() {
  return (
    <div
      data-tauri-drag-region="true"
      className="flex w-auto gap-1 p-1 items-center cursor-pointer rounded-xl transition-all duration-150 hover:opacity-90"
    >

      <div className="w-9 h-9 shadow rounded-lg bg-blue-900 flex items-center justify-center">
        <p className="font-bold text-md">V</p>
      </div>
      <p className="font-medium text-md">Vitest</p>
      <IconPress
        name="chevronDown"
        onPress={() => {}}
        size={22}
        className="text-olive-400 ml-2"
      />
    </div>
  );
}
