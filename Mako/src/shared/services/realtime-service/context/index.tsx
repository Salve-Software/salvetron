import React, { useEffect, useRef } from "react";
import { WebSocketServer } from "../../../../infra/web-socket-server";
import { useAddDevice } from "../../../../modules/devices/store";

const RealtimeServiceContext = React.createContext(null);

export function RealtimeServiceProvider({ children }: React.PropsWithChildren) {
  const wsRef = useRef<WebSocketServer | null>(null);
  const addDevice = useAddDevice();

  useEffect(() => {
    const ws = new WebSocketServer();
    wsRef.current = ws;

    ws.onDeviceConnected = (device) => {
      addDevice(device);
      console.log("DEVICE-CONNECTED", device);
    };
    ws.onLogReceived = (log) => {
      console.log("LOG-RECEIVED", log);
    };

    ws.start();

    return () => {
      ws.stop();
    };
  }, []);

  return (
    <RealtimeServiceContext.Provider value={null}>
      {children}
    </RealtimeServiceContext.Provider>
  );
}
