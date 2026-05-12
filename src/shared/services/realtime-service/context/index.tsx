import React, { useEffect, useRef } from "react";
import { WebSocketServer } from "../../../../infra/web-socket-server";
import { useAddDevice } from "../../../../modules/devices/store";
import { useAddJSLog } from "../../../../modules/js-logs/store/use-js-logs-store";
import { useAddNetworkLog } from "../../../../modules/network/store/use-network-store";
import { useAddProject } from "../../../../modules/projects/store";

const RealtimeServiceContext = React.createContext(null);

export function RealtimeServiceProvider({ children }: React.PropsWithChildren) {
  const wsRef = useRef<WebSocketServer | null>(null);
  const addDevice = useAddDevice();
  const addJSLog = useAddJSLog();
  const addNetworkLog = useAddNetworkLog();
  const addProject = useAddProject();

  useEffect(() => {
    const ws = new WebSocketServer();
    wsRef.current = ws;

    ws.onProjectConnected = (project) => {
      addProject(project);
      console.log("PROJECT-CONNECTED", project);
    };

    ws.onDeviceConnected = (device) => {
      addDevice(device);
      console.log("DEVICE-CONNECTED", device);
    };
    ws.onNetworkReceived = (network) => {
      addNetworkLog(network);
      console.log("NETWORK-RECEIVED", network);
    };
    ws.onLogReceived = (log) => {
      addJSLog(log);
      console.log("LOG-RECEIVED", log);
    };

    ws.start();

    return () => {
      ws.stop();
    };
  }, [addDevice, addJSLog, addNetworkLog, addProject]);

  return (
    <RealtimeServiceContext.Provider value={null}>
      {children}
    </RealtimeServiceContext.Provider>
  );
}
