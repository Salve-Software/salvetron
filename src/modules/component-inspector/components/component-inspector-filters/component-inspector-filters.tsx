import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import type { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import { Icon } from "../../../../shared/ui/icon";
import { Input } from "../../../../shared/ui/input";
import type { RenderHeatLevel } from "@mako/types";
import {
  useComponentInspectorFilters,
  useSetComponentSearchQuery,
  useSetComponentHeatFilter,
  useSetOnlyMemoized,
  useSetOnlyUnmemoized,
  useClearComponentMetrics,
} from "../../store/use-component-store";

const heatOptions: DropdownOption[] = [
  { label: "All Heat Levels", value: "all" },
  { label: "Cold", value: "cold" },
  { label: "Warm", value: "warm" },
  { label: "Hot", value: "hot" },
  { label: "Critical", value: "critical" },
];

const memoOptions: DropdownOption[] = [
  { label: "All Components", value: "all" },
  { label: "Only Memoized", value: "memoized" },
  { label: "Only Unmemoized", value: "unmemoized" },
];

export function ComponentInspectorFilters() {
  const filters = useComponentInspectorFilters();
  const setSearchQuery = useSetComponentSearchQuery();
  const setHeatFilter = useSetComponentHeatFilter();
  const setOnlyMemoized = useSetOnlyMemoized();
  const setOnlyUnmemoized = useSetOnlyUnmemoized();
  const clearMetrics = useClearComponentMetrics();

  const currentHeatLabel =
    heatOptions.find((opt) => opt.value === filters.heatFilter)?.label ??
    "All Heat Levels";

  const currentMemoValue = filters.onlyMemoized
    ? "memoized"
    : filters.onlyUnmemoized
      ? "unmemoized"
      : "all";
  const currentMemoLabel =
    memoOptions.find((opt) => opt.value === currentMemoValue)?.label ??
    "All Components";

  return (
    <div className="flex px-3 flex-row gap-3 w-full items-center pr-4">
      <div className="flex gap-2 h-full">
        <DropdownMenu
          label={currentHeatLabel}
          options={heatOptions.map((opt) => ({
            ...opt,
            onClick: () =>
              setHeatFilter(
                opt.value === "all" ? null : (opt.value as RenderHeatLevel)
              ),
          }))}
        />
        <DropdownMenu
          label={currentMemoLabel}
          options={memoOptions.map((opt) => ({
            ...opt,
            onClick: () => {
              if (opt.value === "all") {
                setOnlyMemoized(false);
                setOnlyUnmemoized(false);
              } else if (opt.value === "memoized") {
                setOnlyMemoized(true);
                setOnlyUnmemoized(false);
              } else {
                setOnlyMemoized(false);
                setOnlyUnmemoized(true);
              }
            },
          }))}
        />
      </div>
      <div className="flex flex-1">
        <Input
          leftIcon={{ name: "search" }}

          placeholder="Search component name..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        className="duration-150 transition-opacity hover:opacity-90"
        onClick={clearMetrics}
      >
        <Icon name="trash" size={20} className="text-olive-400" />
      </button>
    </div>
  );
}
