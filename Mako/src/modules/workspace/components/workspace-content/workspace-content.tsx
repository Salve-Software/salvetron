export function WorkspaceContent({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full p-4 h-full">
      <div className="flex w-full h-full p-3 bg-olive-950/30 rounded-xl">{children}</div>
    </div>
  );
}
