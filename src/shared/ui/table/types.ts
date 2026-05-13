import { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  width: string;
  render: (item: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  isSelected?: (item: T) => boolean;
  emptyState?: ReactNode;
}
