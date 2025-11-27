import { Header } from "@/components/Header";
import { SendMessage } from "@/components/SendMessage";
import { Inbox } from "@/components/Inbox";
import { KeyGenerator } from "@/components/KeyGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/context/WalletContext";
import { Send, Inbox as InboxIcon, Key, Shield, Lock, Cpu, Database } from "lucide-react";

const Index = () => {
  const { account } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/30">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-mono mb-4">
              <Shield className="w-4 h-4" />
              End-to-End Encrypted • On-Chain Verified
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Decentralized
              <br />
              <span className="text-gradient-cyber">Secure Messaging</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Send encrypted messages with metadata stored on Polygon blockchain and payloads on IPFS. 
              No servers. No middlemen. Just cryptography.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 pt-8 max-w-lg mx-auto">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <Lock className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground font-mono">AES-256-GCM</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <Database className="w-6 h-6 text-accent" />
                <span className="text-xs text-muted-foreground font-mono">IPFS Storage</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <Cpu className="w-6 h-6 text-warning" />
                <span className="text-xs text-muted-foreground font-mono">Polygon Chain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="send" className="w-full max-w-4xl mx-auto">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="send" className="gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger value="inbox" className="gap-2">
              <InboxIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Keys</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="animate-fade-in-up">
            <SendMessage />
          </TabsContent>

          <TabsContent value="inbox" className="animate-fade-in-up">
            <Inbox />
          </TabsContent>

          <TabsContent value="keys" className="animate-fade-in-up">
            <KeyGenerator />
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        {!account && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Client-Side Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  All encryption happens in your browser. Your private key never leaves your device.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">IPFS Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted message payloads are stored on the decentralized IPFS network.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">EIP-712 Signatures</h3>
                <p className="text-sm text-muted-foreground">
                  Messages are signed with typed data signatures, verifiable by anyone.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-mono">ChainChain v1.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {/* WAS: <span className="font-mono">Polygon Mumbai Testnet</span> */}
              {/* CHANGE TO: */}
              <span className="font-mono">Polygon Amoy Testnet</span>
              <span className="text-primary">•</span>
              <span className="font-mono">RSA-2048 + AES-256-GCM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
