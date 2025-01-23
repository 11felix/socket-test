import React, { useState, useEffect } from "react";
import "./App.css";
import {
  // ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import io, { Socket } from "socket.io-client";
import Header from "./Header.tsx";

// Define types for the data we'll receive
interface PoolMap {
  [key: string]: any; // Adjust the type based on your actual pool data structure
}

function App() {
  // Wallet connection state
  const currentAccount = useCurrentAccount();
  // const { mutate: disconnect } = useDisconnectWallet();

  // WebSocket and data state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [protocolData, setProtocolData] = useState<PoolMap>({});
  const [portfolioData, setPortfolioData] = useState<string | null>(null);
  // const [openWalletOptions, setOpenWalletOptions] = useState<Boolean>(false);

  // Disconnect wallet handler
  // const callDisconnect = () => {
  //   disconnect();
  //   // Optionally disconnect socket when wallet is disconnected
  //   if (socket) {
  //     socket.disconnect();
  //     setSocket(null);
  //     setPortfolioData(null);
  //   }
  // };

  // Establish WebSocket connection
  useEffect(() => {
    // Websocket server URL - replace with your actual server URL
    const WS_URL = "http://localhost:3000";

    // Create socket connection
    const newSocket = io(WS_URL, {
      // If user is connected, pass their address
      query: currentAccount ? { userAddress: currentAccount.address } : {},
    });

    // Listen for protocol data
    newSocket.on("protocolData", (data: PoolMap) => {
      console.log("Received protocol data:", data);
      setProtocolData(data);
    });

    // Listen for portfolio data (only if wallet is connected)
    if (currentAccount) {
      newSocket.on("portfolioData", (data: string) => {
        console.log("Received portfolio data:", data);
        setPortfolioData(data);
      });
    }

    // Save socket to state
    setSocket(newSocket);

    // Cleanup socket on component unmount or wallet disconnect
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [currentAccount]); // Re-run if account changes

  return (
    <div className="p-4">
      {/* Wallet Connection Button */}
      {/* <>
        {currentAccount && currentAccount.address ? (
          <button
            onClick={callDisconnect}
            className="flex items-center border-[0.104vw] border-[#000000] bg-[#E9EFF4] h-[2.5vw] px-[1.204vw] rounded-[0.62vw] hover:bg-black hover:text-white text-[1.04vw] font-poppins font-medium group"
          >
            {currentAccount.address}
          </button>
        ) : (
          <ConnectModal
            trigger={
              <button className="flex items-center border-[0.104vw] border-[#000000] bg-[#E9EFF4] h-[2.5vw] px-[1.204vw] rounded-[0.62vw] hover:bg-black hover:text-white text-[1.04vw] font-poppins font-medium group">
                Connect Wallet
              </button>
            }
            open={true}
            onOpenChange={(isOpen) => setOpenWalletOptions(isOpen)}
          />
        )}
      </> */}
      <Header isLandingPage={false}/>

      {/* Protocol Data (always shown) */}
      <div className="mt-4">
        <h2 className="text-lg font-bold">Protocol Data:</h2>
        {Object.keys(protocolData).length > 0 ? (
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(protocolData, null, 2)}
          </pre>
        ) : (
          <p>Loading protocol data...</p>
        )}
      </div>

      {/* Portfolio Data (only shown when wallet is connected) */}
      {currentAccount && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Portfolio Data:</h2>
          {portfolioData ? (
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(portfolioData, null, 2)}
            </pre>
          ) : (
            <p>Waiting for portfolio data...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
