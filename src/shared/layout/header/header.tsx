interface HeaderProps extends React.PropsWithChildren {
  color?: string;
}

export function Header({ children, color = "#3B82F6" }: HeaderProps) {
  return (
    <div
      data-tauri-drag-region="true"
      className="w-full flex relative"
      style={{
        background: `linear-gradient(to right, ${color}1A 0%, ${color}59 10%, ${color}40 14%, transparent 20%, transparent 100%)`,
      }}
    >
      <div className="flex gap-5 pl-23 min-h-10">{children}</div>
    </div>
  );
}
