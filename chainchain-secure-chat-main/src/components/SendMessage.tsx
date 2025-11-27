import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Send, Shield, Key, Upload, FileCheck, Loader2, CheckCircle2 } from "lucide-react";
import { createEncryptedBundle } from "@/lib/crypto";
import { uploadToIPFS } from "@/lib/ipfs";
import { EIP712_DOMAIN, EIP712_TYPES } from "@/lib/constants";

interface EncryptionStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "complete";
}

export function SendMessage() {
  const { account, signer, contract, isCorrectNetwork } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const steps: EncryptionStep[] = [
    { id: "aes", label: "Encrypt Message (AES+RSA)", icon: Key, status: currentStep === "aes" ? "active" : currentStep ? "complete" : "pending" },
    { id: "ipfs", label: "Upload to IPFS", icon: Upload, status: currentStep === "ipfs" ? "active" : ["sign", "send"].includes(currentStep || "") ? "complete" : "pending" },
    { id: "sign", label: "Sign Metadata", icon: FileCheck, status: currentStep === "sign" ? "active" : currentStep === "send" ? "complete" : "pending" },
    { id: "send", label: "Confirm Transaction", icon: Send, status: currentStep === "send" ? "active" : "pending" },
  ];

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
      // 1. Encrypt
      setCurrentStep("aes");
      console.log("Encrypting...");
      // Add a small delay so the UI updates
      await new Promise(r => setTimeout(r, 100)); 
      const bundle = await createEncryptedBundle(message, recipientPublicKey);
      
      // 2. Upload to IPFS
      setCurrentStep("ipfs");
      console.log("Uploading...");
      const cid = await uploadToIPFS(bundle);
      console.log("Uploaded CID:", cid);

      // 3. Sign Metadata
      setCurrentStep("sign");
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signer.signTypedData(
        EIP712_DOMAIN, 
        EIP712_TYPES, 
        { recipient, cid, timestamp }
      );

      // 4. Send Transaction
      setCurrentStep("send");
      const tx = await contract.sendMessage(recipient, cid, signature);
      console.log("Tx Hash:", tx.hash);
      await tx.wait();

      toast({
        title: "Message Sent!",
        description: (
          <div className="font-mono text-xs mt-2 space-y-1">
            <p>CID: {cid.slice(0, 8)}...</p>
            <p>Tx: {tx.hash.slice(0, 10)}...</p>
          </div>
        ),
      });

      setMessage("");
    } catch (error) { // Fixed: Removed ': any' type annotation
      console.error("Send error:", error);
      // Fixed: Safely extract error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({ title: "Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSending(false);
      setCurrentStep(null);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <CardTitle>Send Secure Message</CardTitle>
        </div>
        <CardDescription>End-to-End Encrypted & Decentralized</CardDescription>
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
          <Input variant="cyber" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} disabled={isSending} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground">RECIPIENT PUBLIC KEY</label>
          <Input variant="cyber" placeholder="Paste RSA Public Key..." value={recipientPublicKey} onChange={(e) => setRecipientPublicKey(e.target.value)} disabled={isSending} />
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