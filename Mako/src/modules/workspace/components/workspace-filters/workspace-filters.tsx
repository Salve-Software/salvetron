import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import { Icon } from "../../../../shared/ui/icon";
import { Input } from "../../../../shared/ui/input";

export function WorkspaceFilters() {
  return (
    <div className="flex flex-row gap-3 w-full  items-center  pr-4">
      <div className="flex gap-2 h-full">
        <DropdownMenu
          label="Level"
          options={[
            {
              label: "Profile",
              value: "profile",
              iconName:"earth",
              onClick: () => console.log("Profile"),
            },
            {
              label: "Settings",
              value: "settings",
              iconName: "terminal",
              onClick: () => console.log("Settings"),
            },
            {
              label: "Logout",
              value: "logout",
              iconName: "list",
              onClick: () => console.log("Logout"),
            },
          ]}
        />
      </div>
      <div className="flex flex-2 flex-wrap">
        <Input
          leftIcon={{
            name: "search",
          }}
        />
      </div>
      <button
        className="duration-150 transition-opacity hover:opacity-90"
        onClick={() => {}}
      >
        <Icon name="trash" size={20} className="text-olive-400" />
      </button>
    </div>
  );
}
