import {
  Earth,
  List,
  Search,
  Terminal,
  Trash,
  ChevronDown,
  PanelRight,
  PanelRightOpen,
  Apple,
  Info,
  TriangleAlert,
  CircleX,
  Bug,
  X,
} from "lucide-react";
import { Android } from "../../../../assets/icons/android";

export const mappedIcons = {
  search: Search,
  trash: Trash,
  list: List,
  earth: Earth,
  terminal: Terminal,
  chevronDown: ChevronDown,
  panelRightOpen: PanelRightOpen,
  panelRight: PanelRight,
  apple: Apple,
  android: Android,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
  debug: Bug,
  close: X,
};

export function buildIcon(iconName: keyof typeof mappedIcons) {
  return mappedIcons[iconName];
}
