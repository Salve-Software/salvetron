export function WorkspaceContent({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full p-4 overflow-hidden ">
      <div className="flex flex-col w-full h-[86vh] p-3 bg-olive-950/30 rounded-xl overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
