export interface JSLogsListProps extends React.PropsWithChildren {
  logs: unknown[];
}
export function JSLogsList({ children }: React.PropsWithChildren) {
  return <div className="flex flex-col gap-2">{children}</div>;
}
