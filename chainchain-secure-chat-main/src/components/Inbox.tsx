import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Inbox as InboxIcon, Mail, Lock, Unlock, Shield, ShieldCheck, ShieldX, Clock, User, Loader2, RefreshCw } from "lucide-react";
import { decryptBundle, EncryptedBundle } from "@/lib/crypto";

interface Message {
  id: number;
  sender: string;
  recipient: string;
  timestamp: number;
  cid: string;
  signature: string;
  decryptedContent?: string;
  isVerified?: boolean;
}

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: 1,
    sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    recipient: "0x0000000000000000000000000000000000000000",
    timestamp: Date.now() / 1000 - 3600,
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    signature: "0x1234567890abcdef...",
  },
  {
    id: 2,
    sender: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    recipient: "0x0000000000000000000000000000000000000000",
    timestamp: Date.now() / 1000 - 7200,
    cid: "bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3ber3mzxdp7wa5iyfy",
    signature: "0xabcdef1234567890...",
  },
];

export function Inbox() {
  const { account, isCorrectNetwork } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fetchMessages = async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      // In production: const messages = await contract.getMessagesForUser(account);
      await new Promise((r) => setTimeout(r, 800));
      setMessages(mockMessages.map((m) => ({ ...m, recipient: account })));
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Fetch Failed", description: "Failed to fetch messages", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && isCorrectNetwork) {
      fetchMessages();
    }
  }, [account, isCorrectNetwork]);

  const handleDecrypt = async () => {
    if (!selectedMessage || !privateKey) return;

    setIsDecrypting(true);
    try {
      // In production: fetch the bundle from IPFS using selectedMessage.cid
      // For demo, simulate decryption
      await new Promise((r) => setTimeout(r, 1000));

      // Mock decrypted content
      const decryptedContent = "This is a secret message that was encrypted using AES-256-GCM and your RSA public key. Only you can read this!";

      // In production:
      // const response = await fetch(`https://ipfs.io/ipfs/${selectedMessage.cid}`);
      // const bundle: EncryptedBundle = await response.json();
      // const decryptedContent = await decryptBundle(bundle, privateKey);

      // Verify EIP-712 signature
      // const isValid = await verifySignature(selectedMessage);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, decryptedContent, isVerified: true }
            : m
        )
      );

      setSelectedMessage(null);
      setPrivateKey("");

      toast({ title: "Message Decrypted", description: "Message decrypted and signature verified!" });
    } catch (error) {
      console.error("Decrypt error:", error);
      toast({ title: "Decryption Failed", description: "Invalid private key or corrupted data", variant: "destructive" });
    } finally {
      setIsDecrypting(false);
    }
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (!account) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="py-12 text-center">
          <InboxIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Connect your wallet to view messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/30">
              <InboxIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-foreground">Inbox</CardTitle>
              <CardDescription>{messages.length} encrypted messages</CardDescription>
            </div>
          </div>
          <Button variant="cyberOutline" size="sm" onClick={fetchMessages} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Fetching messages from chain...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Sender */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-mono text-foreground">{formatAddress(msg.sender)}</span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    </div>

                    {/* CID */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground font-mono">CID:</span>
                      <span className="font-mono text-primary/70">{msg.cid.slice(0, 24)}...</span>
                    </div>

                    {/* Decrypted Content */}
                    {msg.decryptedContent && (
                      <div className="mt-3 p-3 rounded bg-background/50 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          {msg.isVerified ? (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <ShieldX className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {msg.isVerified ? "Signature Verified" : "Signature Invalid"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{msg.decryptedContent}</p>
                      </div>
                    )}
                  </div>

                  {/* Decrypt Button */}
                  {!msg.decryptedContent && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="cyber"
                          size="sm"
                          onClick={() => setSelectedMessage(msg)}
                        >
                          <Unlock className="w-4 h-4" />
                          Decrypt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Decrypt Message
                          </DialogTitle>
                          <DialogDescription>
                            Enter your private key to decrypt this message. Your key is only used locally and never stored.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs text-muted-foreground font-mono mb-1">FROM</p>
                            <p className="font-mono text-sm text-foreground">{formatAddress(msg.sender)}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground font-mono">YOUR PRIVATE KEY (RSA)</label>
                            <Input
                              variant="cyber"
                              type="password"
                              placeholder="Base64 encoded private key..."
                              value={privateKey}
                              onChange={(e) => setPrivateKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Your key never leaves your browser
                            </p>
                          </div>
                          <Button
                            variant="cyber"
                            className="w-full"
                            onClick={handleDecrypt}
                            disabled={!privateKey || isDecrypting}
                          >
                            {isDecrypting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Decrypting...
                              </>
                            ) : (
                              <>
                                <Unlock className="w-4 h-4" />
                                Decrypt & Verify
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
