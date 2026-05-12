import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../layout/app-layout";
import { JSLogsView } from "../../modules/js-logs/screens/logs-view";
import { NetworkLogsView } from "../../modules/network/screens/network-logs-view";
import { NativeLogsView } from "../../modules/native/screens/native-logs-view/native-logs-view";

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
    ],
  },
]);

export function Root() {
  return <RouterProvider router={router} />;
}
