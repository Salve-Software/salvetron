import React, { useEffect, useRef } from "react";
import { WebSocketServer } from "../../../../infra/web-socket-server";
import { useAddDevice } from "../../../../modules/devices/store";
import { useAddJSLog } from "../../../../modules/js-logs/store/use-js-logs-store";
import { useAddOrUpdateNetworkLog } from "../../../../modules/network/store/use-network-store";
import { useAddProject } from "../../../../modules/projects/store";
import { transformLogEvent } from "../utils";
import { useAddNativeLog } from "../../../../modules/native/store";
import { useHandleComponentRender, useHandleComponentTree } from "../../../../modules/component-inspector/store/use-component-store";
import { useAddPerformanceSnapshot } from "../../../../modules/perf-monitor/store";
import { calculateHealthLevel } from "@mako/types";

const RealtimeServiceContext = React.createContext(null);

export function RealtimeServiceProvider({ children }: React.PropsWithChildren) {
  const wsRef = useRef<WebSocketServer | null>(null);
  const addDevice = useAddDevice();
  const addJSLog = useAddJSLog();
  const addOrUpdateNetworkLog = useAddOrUpdateNetworkLog();
  const addNativeLog = useAddNativeLog();
  const addProject = useAddProject();
  const handleComponentRender = useHandleComponentRender();
  const handleComponentTree = useHandleComponentTree();
  const addPerformanceSnapshot = useAddPerformanceSnapshot();

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

    ws.onComponentRenderReceived = (event) => {
      handleComponentRender(event);
      console.log("COMPONENT-RENDER", event);
    };

    ws.onComponentTreeReceived = (event) => {
      handleComponentTree(event);
      console.log("COMPONENT-TREE", event);
    };

    ws.onPerformanceMetricsReceived = (event) => {
      console.log("ON-PERFORMANCE-METRIC-EVENT",event)
      if (event.deviceId) {
        const snapshot = {
          timestamp: event.timestamp,
          deviceId: event.deviceId,
          uiFps: event.uiFps,
          jsFps: event.jsFps,
          memoryUsage: event.memoryUsage,
          cpuUsage: event.cpuUsage,
          healthLevel: calculateHealthLevel(
            event.uiFps,
            event.jsFps,
            event.memoryUsage,
            event.cpuUsage
          ),
        };
        addPerformanceSnapshot(snapshot);
        console.log("PERFORMANCE-METRICS", snapshot);
      }
    };

    ws.start();

    return () => {
      ws.stop();
    };
  }, [addDevice, addJSLog, addOrUpdateNetworkLog, addNativeLog, addProject, handleComponentRender, handleComponentTree, addPerformanceSnapshot]);

  return (
    <RealtimeServiceContext.Provider value={null}>
      {children}
    </RealtimeServiceContext.Provider>
  );
}
