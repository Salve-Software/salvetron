export function WorkspaceContent({ children }: React.PropsWithChildren) {
  return (
    <div className="flex-1 min-h-0 w-full p-4 overflow-y-auto">
      <div className="flex flex-col w-full p-3 bg-olive-950/30 rounded-xl">
        {children}
      </div>
    </div>
  );
}
