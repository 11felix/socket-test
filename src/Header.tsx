import React, { useEffect, useRef, useState } from "react";
import {
  useCurrentAccount,
  ConnectModal,
  useDisconnectWallet,
  useAccounts,
  useSwitchAccount,
} from "@mysten/dapp-kit";

const windowWidth: any = window.innerWidth;

interface Props {
  isLandingPage?: boolean;
}
const Header: React.FC<Props> = ({ isLandingPage }) => {
  const currentAccount = useCurrentAccount();
  const { mutate: switchAccount } = useSwitchAccount();
  const accounts = useAccounts();
  const [openWalletOptions, setOpenWalletOptions] = useState(false);
  const [showDisconnectPopup, setShowDisconnectPopup] = useState(false);
  const { mutate: disconnect } = useDisconnectWallet();
  const [shortAddress, setShortAddress] = useState("connect wallet");
  const walletPopUpRef = useRef<HTMLDivElement>(null);
  const walletPopUpRefMob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentAccount && currentAccount.address) {
      const mini_address = getAddress(currentAccount);
      setShortAddress(mini_address);
    }
  }, [currentAccount]);

  const handleOutsideClick = (event: any) => {
    if (window.innerWidth > 800) {
      if (
        walletPopUpRef.current &&
        walletPopUpRef.current.contains(event.target)
      ) {
      } else {
        setShowDisconnectPopup(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [walletPopUpRef]);

  const handleOutsideClickMob = (event: any) => {
    if (window.innerWidth <= 800) {
      if (
        walletPopUpRefMob.current &&
        walletPopUpRefMob.current.contains(event.target)
      ) {
      } else {
        setShowDisconnectPopup(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClickMob);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClickMob);
    };
  }, [walletPopUpRefMob]);

  const getAddress = (addressObj: any) => {
    const address = addressObj.address;
    const add1 = address.substring(0, 4);
    const add2 = address.substring(address.length - 4);
    const finalAdd = `${add1}....${add2}`;
    return finalAdd;
  };

  const callDisconnect = () => {
    disconnect();
    setShowDisconnectPopup(false);
    setOpenWalletOptions(false);
  };

  return (
    <header className="flex items-center justify-between px-3 md:px-[5.83vw] py-4 md:py-[1.82vw] bg-[#E9EFF4] text-black relative">
      {/* <div className="flex md:hidden"> */}
        {!isLandingPage && (
          <>
            {currentAccount && currentAccount.address ? (
              <button
                className="flex items-center bg-black px-[3.02vw] py-[1.62vw] mr-[3.02vw] rounded-[2.32vw] text-white text-[3.02vw] font-poppins font-medium"
                onClick={() => setShowDisconnectPopup(!showDisconnectPopup)}
              >
                {shortAddress}
              </button>
            ) : (
              <ConnectModal
                trigger={
                  <button className="flex items-center bg-black px-[3.02vw] py-[1.62vw] mr-[3.02vw] rounded-[2.32vw] text-white text-[3.02vw] font-poppins font-medium">
                    Connect Wallet
                  </button>
                }
                open={openWalletOptions}
                onOpenChange={(isOpen) => setOpenWalletOptions(isOpen)}
              />
            )}
            {/* Mobile Menu Icon */}
            {showDisconnectPopup && windowWidth < 800 && (
              <div
                className="flex flex-col right-[4vw] top-[14vw] absolute bg-[#FFFFFF] shadow-[0 0.052vw 0.416vw #2D9EFF1A] w-fit h-fit p-[4.5vw] rounded-[3.5vw] z-10"
                ref={walletPopUpRefMob}
              >
                <p className="font-intermedium text-[#829CB2] text-[3.5vw]">
                  Connected
                </p>
                {accounts.map((account) => (
                  <div
                    className="flex flex-row items-center mt-[1.5vw] cursor-pointer"
                    onClick={() => {
                      switchAccount(
                        { account },
                        {
                          onSuccess: () => {},
                        }
                      );
                    }}
                    key={account.address}
                  >
                    <div className="flex items-center">
                      {currentAccount &&
                      currentAccount.address === account.address ? (
                        <div className="w-[1.5vw] h-[1.5vw] bg-green-500 rounded-full mr-[1.5vw]"></div>
                      ) : (
                        <div className="w-[1.5vw] h-[1.5vw] mr-[1.5vw]"></div>
                      )}
                      <div className="font-poppinsmedium text-[#000000] text-[3.04vw]">
                        {getAddress(account)}
                      </div>
                    </div>
                    <br />
                  </div>
                ))}
                <div
                  className="flex justify-center text-[3.5vw] rounded-[1.6vw] font-poppinssemibold px-[3.802vw] py-[0.416vw] border-[2px] border-[#000000] mt-[1.406vw] cursor-pointer"
                  onClick={callDisconnect}
                >
                  DISCONNECT
                </div>
              </div>
            )}
          </>
        )}
      {/* </div> */}
    </header>
  );
};

export default Header;
