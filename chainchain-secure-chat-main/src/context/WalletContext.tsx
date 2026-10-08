import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Contract, formatEther, parseEther, parseUnits } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, POLYGON_AMOY_CHAIN_ID, POLYGON_AMOY_RPC } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { WalletConnectModal } from "@/components/WalletConnectModal";

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

// Dedicated read-only RPC provider for state queries & fee calculations (avoids wallet RPC rate limiting)
export const dedicatedRpcProvider = new JsonRpcProvider(
  POLYGON_AMOY_RPC,
  POLYGON_AMOY_CHAIN_ID,
  { staticNetwork: true }
);

// Dedicated read-only contract for view queries
export const readContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, dedicatedRpcProvider);

// Helper to format cryptic provider rate-limit errors into actionable user guidance
function parseRpcError(error: unknown): Error {
  if (!error) return new Error("Transaction failed");
  const errObj = error as Record<string, unknown>;
  const rawMsg = (error as Error).message || "";
  const nestedMsg =
    (errObj.info as { error?: { message?: string } })?.error?.message ||
    (errObj.error as { message?: string })?.message ||
    (errObj.data as { message?: string })?.message ||
    "";
  const errText = `${rawMsg} ${nestedMsg} ${String(error)}`.toLowerCase();

  const isRateLimited =
    errText.includes("rate limit") ||
    errText.includes("rate-limit") ||
    errText.includes("too many requests") ||
    errText.includes("429") ||
    (errText.includes("-32603") && errText.includes("limit")) ||
    (errText.includes("could not coalesce error") && errText.includes("limit"));

  if (isRateLimited) {
    return new Error(
      "Polygon Amoy RPC rate limit reached. The RPC endpoint is currently throttled. Configure a dedicated RPC endpoint (VITE_POLYGON_AMOY_RPC) or try again shortly."
    );
  }

  return error instanceof Error ? error : new Error(rawMsg || String(error));
}

export interface BankTransaction {
  id: string;
  type: "send" | "receive" | "nfc_pay" | "nfc_receive" | "faucet";
  amount: string;
  recipientOrSender: string;
  timestamp: number;
  hash: string;
  status: "confirmed" | "pending" | "failed";
  note?: string;
}

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  readProvider: JsonRpcProvider;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  readContract: Contract;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  transactions: BankTransaction[];
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  recordTransaction: (tx: Omit<BankTransaction, "id">) => void;
  sendPol: (to: string, amount: string, note?: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const openWalletModal = useCallback(() => setIsWalletModalOpen(true), []);
  const closeWalletModal = useCallback(() => setIsWalletModalOpen(false), []);

  const [transactions, setTransactions] = useState<BankTransaction[]>(() => {
    try {
      const saved = localStorage.getItem("chainchat_tx_history_prod");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordTransaction = useCallback((tx: Omit<BankTransaction, "id">) => {
    const newTx: BankTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem("chainchat_tx_history_prod", JSON.stringify(updated.slice(0, 50)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const isCorrectNetwork = chainId === POLYGON_AMOY_CHAIN_ID;

  // Refresh live balance: prioritize dedicated read RPC to prevent hammering the wallet provider
  const refreshBalance = useCallback(async () => {
    if (!account) {
      setBalance(null);
      return;
    }

    try {
      const balWei = await dedicatedRpcProvider.getBalance(account);
      const formatted = parseFloat(formatEther(balWei)).toFixed(4);
      setBalance(formatted);
    } catch (err) {
      console.warn("Dedicated RPC balance fetch failed, attempting browser provider:", err);
      if (provider) {
        try {
          const balWei = await provider.getBalance(account);
          const formatted = parseFloat(formatEther(balWei)).toFixed(4);
          setBalance(formatted);
        } catch (provErr) {
          console.warn("Browser provider balance fetch also failed:", provErr);
        }
      }
    }
  }, [account, provider]);

  useEffect(() => {
    if (account) {
      refreshBalance();
    }
  }, [account, chainId, refreshBalance]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask or a Web3 wallet.",
        variant: "destructive"
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
      });
      setChainId(POLYGON_AMOY_CHAIN_ID);
    } catch (error: unknown) {
      if ((error as { code?: number })?.code === 4902) {
        try {
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
          setChainId(POLYGON_AMOY_CHAIN_ID);
        } catch (addError) {
          console.error("Failed to add Amoy network:", addError);
        }
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized");
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const userSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const currentChain = Number(network.chainId);
      const chainContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userSigner);

      // Route read queries (getMessagesForUser) through dedicated read RPC to prevent wallet rate limiting
      const originalGetMessages = chainContract.getMessagesForUser?.bind(chainContract);
      if (originalGetMessages) {
        chainContract.getMessagesForUser = async (...args: unknown[]) => {
          try {
            return await readContract.getMessagesForUser(...(args as [string]));
          } catch (readErr) {
            console.warn("Dedicated RPC getMessagesForUser failed, falling back to signer:", readErr);
            return await originalGetMessages(...args);
          }
        };
      }

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(userSigner);
      setContract(chainContract);
      setChainId(currentChain);

      // Immediately fetch live balance via dedicated read RPC
      try {
        const balWei = await dedicatedRpcProvider.getBalance(accounts[0]);
        setBalance(parseFloat(formatEther(balWei)).toFixed(4));
      } catch (balErr) {
        console.warn("Dedicated RPC balance fetch failed, falling back to browser provider:", balErr);
        try {
          const balWei = await browserProvider.getBalance(accounts[0]);
          setBalance(parseFloat(formatEther(balWei)).toFixed(4));
        } catch (e) {
          console.warn("Balance fetch failed:", e);
        }
      }

      toast({
        title: "Account Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

      if (currentChain !== POLYGON_AMOY_CHAIN_ID) {
        toast({
          title: "Switch to Polygon Amoy",
          description: "Click Switch Network in header to use Polygon Amoy testnet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
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
    setBalance(null);
    toast({
      title: "Disconnected",
      description: "Wallet session closed.",
    });
  }, []);

  // Real on-chain POL transaction
  const sendPol = useCallback(async (to: string, amount: string, note?: string): Promise<string> => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error("Invalid POL amount");
    }

    if (!account || !signer || !provider) {
      throw new Error("Wallet not connected. Connect your wallet first.");
    }

    if (!isCorrectNetwork) {
      throw new Error("Please switch to Polygon Amoy Testnet (Chain ID 80002).");
    }

    // Query current network fee data: prefer dedicated RPC to avoid wallet rate limits
    let feeData = null;
    try {
      feeData = await dedicatedRpcProvider.getFeeData();
    } catch (readErr) {
      console.warn("Dedicated RPC getFeeData failed, falling back to wallet provider:", readErr);
      try {
        feeData = await provider.getFeeData();
      } catch (provErr) {
        console.warn("Wallet provider getFeeData also failed:", provErr);
      }
    }

    const minPriorityFee = parseUnits("25", "gwei");

    const maxPriorityFeePerGas =
      feeData?.maxPriorityFeePerGas &&
      feeData.maxPriorityFeePerGas > minPriorityFee
        ? feeData.maxPriorityFeePerGas
        : minPriorityFee;

    const maxFeePerGas =
      feeData?.maxFeePerGas &&
      feeData.maxFeePerGas > maxPriorityFeePerGas
        ? feeData.maxFeePerGas
        : maxPriorityFeePerGas + parseUnits("5", "gwei");

    let tx;
    try {
      tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
        maxPriorityFeePerGas,
        maxFeePerGas,
      });
    } catch (sendErr) {
      throw parseRpcError(sendErr);
    }

    recordTransaction({
      type: "send",
      amount,
      recipientOrSender: to,
      timestamp: Date.now(),
      hash: tx.hash,
      status: "pending",
      note
    });

    // Wait for 1 confirmation
    try {
      await tx.wait();
    } catch (waitErr) {
      console.warn("tx.wait() encountered error:", waitErr);
      throw parseRpcError(waitErr);
    }

    // Update transaction status from "pending" to "confirmed"
    setTransactions(prev => {
      const updated = prev.map(t =>
        t.hash === tx.hash ? { ...t, status: "confirmed" as const } : t
      );
      try {
        localStorage.setItem("chainchat_tx_history_prod", JSON.stringify(updated.slice(0, 50)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Refresh balance after confirmation using dedicated RPC
    if (account) {
      try {
        const balWei = await dedicatedRpcProvider.getBalance(account);
        setBalance(parseFloat(formatEther(balWei)).toFixed(4));
      } catch {
        if (provider) {
          try {
            const balWei = await provider.getBalance(account);
            setBalance(parseFloat(formatEther(balWei)).toFixed(4));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    return tx.hash;
  }, [account, signer, isCorrectNetwork, provider, recordTransaction]);

  // Handle account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (!accountList || accountList.length === 0) {
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
        readProvider: dedicatedRpcProvider,
        signer,
        contract,
        readContract,
        chainId,
        balance,
        isConnecting,
        isCorrectNetwork,
        transactions,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        connect,
        disconnect,
        switchNetwork,
        refreshBalance,
        recordTransaction,
        sendPol,
      }}
    >
      {children}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
        onConnectInjected={connect}
        isConnecting={isConnecting}
      />
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