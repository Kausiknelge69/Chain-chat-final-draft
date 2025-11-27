import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Inbox as InboxIcon, Mail, Lock, Unlock, ShieldCheck, ShieldX, Clock, User, Loader2, RefreshCw } from "lucide-react";
import { decryptBundle } from "@/lib/crypto";
import { fetchFromIPFS } from "@/lib/ipfs";

interface RawMessage {
  id: bigint;
  sender: string;
  recipient: string;
  timestamp: bigint;
  cid: string;
  signature: string;
}

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

export function Inbox() {
  const { account, isCorrectNetwork, contract } = useWallet();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch messages from Blockchain
  const fetchMessages = useCallback(async () => {
    if (!account || !contract) return;

    setIsLoading(true);
    try {
      console.log("Fetching from chain...");
      const data = (await contract.getMessagesForUser(account)) as RawMessage[];
      
      const formattedMessages = data.map((msg: RawMessage) => ({
        id: Number(msg.id),
        sender: msg.sender,
        recipient: msg.recipient,
        timestamp: Number(msg.timestamp),
        cid: msg.cid,
        signature: msg.signature,
        decryptedContent: undefined,
        isVerified: false
      }));

      setMessages(formattedMessages.reverse());
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Error", description: "Could not fetch messages", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    if (account && isCorrectNetwork && contract) fetchMessages();
  }, [account, isCorrectNetwork, contract, fetchMessages]);

  // Decrypt logic: IPFS -> Decrypt
  const handleDecrypt = async () => {
    if (!selectedMessage || !privateKey) return;

    setIsDecrypting(true);
    try {
      // 1. Fetch from IPFS
      console.log("Fetching CID:", selectedMessage.cid);
      const bundle = await fetchFromIPFS(selectedMessage.cid);
      
      // 2. Decrypt
      console.log("Decrypting bundle...");
      const decryptedText = await decryptBundle(bundle, privateKey);

      // 3. Update State
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, decryptedContent: decryptedText, isVerified: true }
            : m
        )
      );

      setSelectedMessage(null);
      setPrivateKey("");
      toast({ title: "Success", description: "Message decrypted!" });

    } catch (error) {
      console.error("Decrypt error:", error);
      toast({ title: "Decryption Failed", description: "Invalid key or IPFS error", variant: "destructive" });
    } finally {
      setIsDecrypting(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTime = (ts: number) => new Date(ts * 1000).toLocaleString();

  if (!account) return <div className="p-8 text-center text-muted-foreground">Connect Wallet</div>;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <InboxIcon className="w-5 h-5 text-primary" />
            <CardTitle>Inbox</CardTitle>
          </div>
          <Button variant="outline" size="icon" onClick={fetchMessages} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>{messages.length} messages found</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="w-3 h-3" /> {formatAddress(msg.sender)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {formatTime(msg.timestamp)}
                </div>
              </div>
              {!msg.decryptedContent ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="cyber" onClick={() => setSelectedMessage(msg)}>
                      <Unlock className="w-3 h-3 mr-1" /> Decrypt
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Decrypt Message</DialogTitle>
                      <DialogDescription>Paste your RSA Private Key</DialogDescription>
                    </DialogHeader>
                    <Input 
                      type="password" 
                      placeholder="Private Key..." 
                      value={privateKey} 
                      onChange={(e) => setPrivateKey(e.target.value)} 
                    />
                    <Button className="w-full mt-2" onClick={handleDecrypt} disabled={isDecrypting}>
                      {isDecrypting ? "Decrypting..." : "Decrypt"}
                    </Button>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              )}
            </div>
            
            {msg.decryptedContent && (
              <div className="mt-2 p-3 bg-background/50 rounded text-sm border border-primary/20">
                {msg.decryptedContent}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}