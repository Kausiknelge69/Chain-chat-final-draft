import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Link2, LogOut, AlertTriangle, Wallet } from "lucide-react";
import { POLYGON_AMOY_CHAIN_ID } from "@/lib/constants";

export function Header() {
  const { account, chainId, isConnecting, isCorrectNetwork, connect, disconnect, switchNetwork } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    if (id === POLYGON_AMOY_CHAIN_ID) return "Amoy";
    if (id === 1) return "Mainnet";
    if (id === 137) return "Polygon";
    return "Unknown";
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-cyber">
                <Link2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-sm -z-10 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Chain<span className="text-gradient-cyber">Chain</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">Secure • Decentralized • Private</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {account ? (
              <>
                {/* Network Badge */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${
                    isCorrectNetwork
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-destructive/10 text-destructive border border-destructive/30"
                  }`}
                >
                  {!isCorrectNetwork && <AlertTriangle className="w-3 h-3" />}
                  <span>{getNetworkName(chainId)}</span>
                </div>

                {/* Wrong Network Button */}
                {!isCorrectNetwork && (
                  <Button variant="cyberOutline" size="sm" onClick={switchNetwork}>
                    Switch Network
                  </Button>
                )}

                {/* Address Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border font-mono text-xs text-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {formatAddress(account)}
                </div>

                {/* Disconnect Button */}
                <Button variant="ghost" size="icon" onClick={disconnect} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="cyber" onClick={connect} disabled={isConnecting} className="gap-2">
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}