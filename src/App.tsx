import "./app.css";

import { Sidebar } from "./shared/layout/sidebar";

import { RealtimeServiceProvider } from "./shared/services/realtime-service/context";

import { Root } from "./shared/navigation/root";

function App() {
  return (
    <RealtimeServiceProvider>
      <Root />
    </RealtimeServiceProvider>
  );
}

export default App;
