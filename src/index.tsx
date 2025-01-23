import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "./WebSocketProvider.tsx";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const WEBSOCKET_URL = "http://localhost:3000";
const queryClient = new QueryClient();
const { networkConfig } = createNetworkConfig({
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork="mainnet"
        children={undefined}
      >
        <WalletProvider autoConnect children={undefined}>
          {/* 2. Pass it to the WebSocketProvider */}
          <WebSocketProvider url={WEBSOCKET_URL}>
            <App />
          </WebSocketProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
