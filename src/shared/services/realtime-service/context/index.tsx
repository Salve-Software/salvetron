import React, { useEffect, useRef } from "react";
import { WebSocketServer } from "../../../../infra/web-socket-server";
import { useAddDevice } from "../../../../modules/devices/store";
import { useAddJSLog } from "../../../../modules/js-logs/store/use-js-logs-store";
import { useAddOrUpdateNetworkLog } from "../../../../modules/network/store/use-network-store";
import { useAddProject } from "../../../../modules/projects/store";
import { transformLogEvent } from "../utils";
import { useAddNativeLog } from "../../../../modules/native/store";

const RealtimeServiceContext = React.createContext(null);

export function RealtimeServiceProvider({ children }: React.PropsWithChildren) {
  const wsRef = useRef<WebSocketServer | null>(null);
  const addDevice = useAddDevice();
  const addJSLog = useAddJSLog();
  const addOrUpdateNetworkLog = useAddOrUpdateNetworkLog();
  const addNativeLog = useAddNativeLog();
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
      addOrUpdateNetworkLog(network);
      console.log("NETWORK-RECEIVED", network);
    };
    ws.onLogReceived = (log) => {
      const transformedLog = transformLogEvent(log);

      if (transformedLog.type === "native") {
        addNativeLog(transformedLog);
      } else {
        addJSLog(transformedLog);
      }
      console.log("LOG-RECEIVED", log);
    };

    ws.start();

    return () => {
      ws.stop();
    };
  }, [addDevice, addJSLog, addOrUpdateNetworkLog, addNativeLog, addProject]);

  return (
    <RealtimeServiceContext.Provider value={null}>
      {children}
    </RealtimeServiceContext.Provider>
  );
}
