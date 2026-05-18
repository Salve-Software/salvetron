import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../layout/app-layout";
import { JSLogsView } from "../../modules/js-logs/screens/logs-view";
import { NetworkLogsView } from "../../modules/network/screens/network-logs-view";
import { NativeLogsView } from "../../modules/native/screens/native-logs-view/native-logs-view";
import { ComponentInspectorView } from "../../modules/component-inspector/screens/component-inspector-view";
import { PerfMonitorView } from "../../modules/perf-monitor/screens/perf-monitor-view";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "js-logs",
        element: <JSLogsView />,
      },
      {
        path: "network",
        element: <NetworkLogsView />,
      },
      {
        path: "native",
        element: <NativeLogsView />,
      },
      {
        path: "components",
        element: <ComponentInspectorView />,
      },
      {
        path: "performance",
        element: <PerfMonitorView />,
      },
    ],
  },
]);

export function Root() {
  return <RouterProvider router={router} />;
}
