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
  CircleCheck,
  Clock,
  ArrowRight,
  Loader,
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
  success: CircleCheck,
  clock: Clock,
  redirect: ArrowRight,
  pending: Loader,
};

export function buildIcon(iconName: keyof typeof mappedIcons) {
  return mappedIcons[iconName];
}
