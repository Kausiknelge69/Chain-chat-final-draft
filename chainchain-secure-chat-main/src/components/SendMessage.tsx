import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Send, Shield, Key, Upload, FileCheck, Loader2, CheckCircle2, QrCode, ClipboardPaste, History, Clock } from "lucide-react";
import { createEncryptedBundle } from "@/lib/crypto";
import { uploadToIPFS } from "@/lib/ipfs";
import { EIP712_DOMAIN, EIP712_TYPES } from "@/lib/constants";
import { Scanner } from "@yudiel/react-qr-scanner";

interface EncryptionStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "complete";
}

// Type for sent messages history
interface SentMessage {
  id: string;
  recipient: string;
  timestamp: number;
  cid: string;
}

export function SendMessage() {
  const { account, signer, contract, isCorrectNetwork } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // History State
  const [sentHistory, setSentHistory] = useState<SentMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const steps: EncryptionStep[] = [
    { id: "aes", label: "Encrypt Message", icon: Key, status: currentStep === "aes" ? "active" : currentStep ? "complete" : "pending" },
    { id: "ipfs", label: "Upload to IPFS", icon: Upload, status: currentStep === "ipfs" ? "active" : ["sign", "send"].includes(currentStep || "") ? "complete" : "pending" },
    { id: "sign", label: "Sign Metadata", icon: FileCheck, status: currentStep === "sign" ? "active" : currentStep === "send" ? "complete" : "pending" },
    { id: "send", label: "Confirm Transaction", icon: Send, status: currentStep === "send" ? "active" : "pending" },
  ];

  const handlePaste = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setter(text);
        toast({ title: "Pasted", description: "Content pasted from clipboard" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to read clipboard", variant: "destructive" });
    }
  };

  const handleScan = (result: string) => {
    if (result) {
      if (result.startsWith("0x") && result.length === 42) {
        setRecipient(result);
        setIsScannerOpen(false);
        toast({ title: "Scanned", description: `Address: ${result.slice(0, 6)}...` });
      } else if (result.startsWith("ethereum:")) {
        const address = result.split(":")[1];
        if (address && address.startsWith("0x")) {
            setRecipient(address);
            setIsScannerOpen(false);
            toast({ title: "Scanned", description: `Address: ${address.slice(0, 6)}...` });
        }
      }
    }
  };

  const fetchHistory = async () => {
    if (!contract || !account) return;
    setIsLoadingHistory(true);
    try {
      // Create a filter for "MessageSent" events where "sender" is the current user
      // Event: MessageSent(uint256 id, address indexed sender, address indexed recipient, ...)
      // Arg 1 is sender.
      const filter = contract.filters.MessageSent(null, account);
      const events = await contract.queryFilter(filter);

      const historyData = events.map((e: any) => ({
        id: e.args[0].toString(),
        recipient: e.args[2],
        timestamp: Number(e.args[3]),
        cid: e.args[4]
      })).reverse(); // Newest first

      setSentHistory(historyData);
    } catch (error) {
      console.error("History fetch error", error);
      toast({ title: "Error", description: "Failed to fetch history", variant: "destructive" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!account || !signer || !contract) {
      toast({ title: "Error", description: "Connect wallet first", variant: "destructive" });
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: "Wrong Network", description: "Switch to Polygon Amoy", variant: "destructive" });
      return;
    }
    if (!recipient || !recipientPublicKey || !message) {
      toast({ title: "Missing Fields", description: "Fill in all fields", variant: "destructive" });
      return;
    }

    setIsSending(true);

    try {
      setCurrentStep("aes");
      await new Promise(r => setTimeout(r, 100)); 
      const bundle = await createEncryptedBundle(message, recipientPublicKey);
      
      setCurrentStep("ipfs");
      const cid = await uploadToIPFS(bundle);

      setCurrentStep("sign");
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signer.signTypedData(
        EIP712_DOMAIN, 
        EIP712_TYPES, 
        { recipient, cid, timestamp }
      );

      setCurrentStep("send");
      const tx = await contract.sendMessage(recipient, cid, signature);
      await tx.wait();

      toast({ title: "Message Sent!", description: `CID: ${cid.slice(0, 8)}...` });
      setMessage("");
    } catch (error: any) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSending(false);
      setCurrentStep(null);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
                <CardTitle>Send Message</CardTitle>
                <CardDescription>Secure & Decentralized</CardDescription>
            </div>
          </div>
          
          {/* History Button */}
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchHistory}>
                    <History className="w-4 h-4 mr-2" /> History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Sent Messages</DialogTitle>
                    <DialogDescription>Messages you have sent on-chain.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                    {isLoadingHistory ? (
                        <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>
                    ) : sentHistory.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm">No sent messages found.</p>
                    ) : (
                        sentHistory.map((msg) => (
                            <div key={msg.id} className="p-3 bg-secondary/30 rounded border border-border text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="text-muted-foreground">To:</span>
                                    <span className="font-mono">{msg.recipient.slice(0,6)}...{msg.recipient.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span>{new Date(msg.timestamp * 1000).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">CID:</span>
                                    <span className="font-mono text-primary">{msg.cid.slice(0, 10)}...</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSending && (
          <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
            {steps.map((step) => (
              <div key={step.id} className={`flex items-center gap-2 text-sm ${step.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.status === 'active' ? <Loader2 className="w-4 h-4 animate-spin" /> : <step.icon className="w-4 h-4" />}
                {step.label}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground">RECIPIENT ADDRESS</label>
          <div className="flex gap-2">
            <Input variant="cyber" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} disabled={isSending} />
            <Button variant="outline" size="icon" onClick={() => handlePaste(setRecipient)} title="Paste">
                <ClipboardPaste className="w-4 h-4" />
            </Button>
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Scan QR">
                        <QrCode className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-border">
                    <div className="aspect-square relative">
                        <Scanner 
                            onScan={(result) => {
                                if (result && result.length > 0) handleScan(result[0].rawValue);
                            }}
                            styles={{ container: { width: "100%", height: "100%" } }}
                        />
                        {/* Overlay to close scanner easily on mobile */}
                        <Button 
                            variant="ghost" 
                            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 p-0"
                            onClick={() => setIsScannerOpen(false)}
                        >
                            <span className="sr-only">Close</span>
                            <span className="text-lg">×</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground">RECIPIENT PUBLIC KEY</label>
          <div className="flex gap-2">
            <Input variant="cyber" placeholder="Paste RSA Public Key..." value={recipientPublicKey} onChange={(e) => setRecipientPublicKey(e.target.value)} disabled={isSending} />
            <Button variant="outline" size="icon" onClick={() => handlePaste(setRecipientPublicKey)} title="Paste">
                <ClipboardPaste className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground">MESSAGE</label>
          <Textarea variant="cyber" placeholder="Type your secret..." value={message} onChange={(e) => setMessage(e.target.value)} disabled={isSending} />
        </div>

        <Button variant="cyber" className="w-full" onClick={handleSend} disabled={isSending || !account}>
          {isSending ? "Processing..." : "Encrypt & Send"}
        </Button>
      </CardContent>
    </Card>
  );
}