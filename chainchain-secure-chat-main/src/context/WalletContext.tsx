import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, POLYGON_AMOY_CHAIN_ID, POLYGON_AMOY_RPC } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isCorrectNetwork = chainId === POLYGON_AMOY_CHAIN_ID;

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: unknown) {
      // If chain doesn't exist, add it
      if ((error as { code?: number })?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
              chainName: "Polygon Amoy Testnet",
              nativeCurrency: {
                name: "POL",
                symbol: "POL",
                decimals: 18,
              },
              rpcUrls: [POLYGON_AMOY_RPC],
              blockExplorerUrls: ["https://amoy.polygonscan.com"],
            },
          ],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use ChainChain",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      const browserProvider = new BrowserProvider(window.ethereum);
      const userSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const chainContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userSigner);

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(userSigner);
      setContract(chainContract);
      setChainId(Number(network.chainId));

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

      if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Polygon Amoy Testnet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        disconnect();
      } else if (accountList[0] !== account) {
        setAccount(accountList[0]);
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(parseInt(newChainId as string, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        chainId,
        isConnecting,
        isCorrectNetwork,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}