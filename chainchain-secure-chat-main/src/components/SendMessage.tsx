import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Send, Shield, Key, Upload, FileCheck, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { createEncryptedBundle, arrayBufferToBase64 } from "@/lib/crypto";
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
    { id: "aes", label: "Generate AES Key", icon: Key, status: currentStep === "aes" ? "active" : currentStep ? "complete" : "pending" },
    { id: "encrypt", label: "Encrypt Message", icon: Lock, status: currentStep === "encrypt" ? "active" : ["ipfs", "sign", "send"].includes(currentStep || "") ? "complete" : "pending" },
    { id: "ipfs", label: "Upload to IPFS", icon: Upload, status: currentStep === "ipfs" ? "active" : ["sign", "send"].includes(currentStep || "") ? "complete" : "pending" },
    { id: "sign", label: "Sign with EIP-712", icon: FileCheck, status: currentStep === "sign" ? "active" : currentStep === "send" ? "complete" : "pending" },
    { id: "send", label: "Submit to Chain", icon: Send, status: currentStep === "send" ? "active" : "pending" },
  ];

  const handleSend = async () => {
    if (!account || !signer || !contract) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet first", variant: "destructive" });
      return;
    }

    if (!isCorrectNetwork) {
      // WAS: description: "Please switch to Polygon Mumbai",
      // CHANGE TO:
      toast({ title: "Wrong Network", description: "Please switch to Polygon Amoy", variant: "destructive" });
      return;
    }

    if (!recipient || !recipientPublicKey || !message) {
      toast({ title: "Missing Fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      toast({ title: "Invalid Address", description: "Please enter a valid Ethereum address", variant: "destructive" });
      return;
    }

    setIsSending(true);

    try {
      // Step 1: Generate AES key and encrypt
      setCurrentStep("aes");
      await new Promise((r) => setTimeout(r, 500));

      // Step 2: Encrypt message
      setCurrentStep("encrypt");
      const bundle = await createEncryptedBundle(message, recipientPublicKey);
      await new Promise((r) => setTimeout(r, 500));

      // Step 3: Upload to IPFS (simulated for MVP)
      setCurrentStep("ipfs");
      await new Promise((r) => setTimeout(r, 800));
      // In production, this would be: const { cid } = await web3Storage.put([new File([JSON.stringify(bundle)], 'message.json')]);
      const mockCid = `bafybei${arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)).buffer.slice(0)).slice(0, 46).toLowerCase().replace(/[^a-z0-9]/g, 'a')}`;

      // Step 4: Sign with EIP-712
      setCurrentStep("sign");
      const timestamp = Math.floor(Date.now() / 1000);
      const messageData = {
        recipient,
        cid: mockCid,
        timestamp,
      };

      const signature = await signer.signTypedData(EIP712_DOMAIN, EIP712_TYPES, messageData);

      // Step 5: Send to blockchain
      setCurrentStep("send");
      // In production: await contract.sendMessage(recipient, mockCid, signature);
      await new Promise((r) => setTimeout(r, 1000)); // Simulate blockchain tx

      toast({
        title: "Message Sent!",
        description: (
          <div className="font-mono text-xs mt-2 space-y-1">
            <p>CID: {mockCid.slice(0, 20)}...</p>
            <p>To: {recipient.slice(0, 10)}...</p>
          </div>
        ),
      });

      // Reset form
      setRecipient("");
      setRecipientPublicKey("");
      setMessage("");
    } catch (error) {
      console.error("Send error:", error);
      toast({ title: "Send Failed", description: "Failed to send encrypted message", variant: "destructive" });
    } finally {
      setIsSending(false);
      setCurrentStep(null);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Send Encrypted Message</CardTitle>
            <CardDescription>End-to-end encrypted • Stored on IPFS • Verified on-chain</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Encryption Steps */}
        {isSending && (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2 mb-4">
            <p className="text-xs text-muted-foreground font-mono mb-3">ENCRYPTION PIPELINE</p>
            <div className="space-y-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 text-sm transition-all ${
                      step.status === "active"
                        ? "text-primary"
                        : step.status === "complete"
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {step.status === "active" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : step.status === "complete" ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="font-mono text-xs">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recipient Address */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">RECIPIENT ADDRESS</label>
          <Input
            variant="cyber"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSending}
          />
        </div>

        {/* Recipient Public Key */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">RECIPIENT PUBLIC KEY (RSA)</label>
          <Input
            variant="cyber"
            placeholder="Base64 encoded public key..."
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
            disabled={isSending}
          />
          <p className="text-xs text-muted-foreground/70">
            For MVP: Generate a key pair in the Keys tab and share your public key
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-mono">MESSAGE</label>
          <Textarea
            variant="cyber"
            placeholder="Your encrypted message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="min-h-[120px]"
          />
        </div>

        {/* Send Button */}
        <Button
          variant="cyber"
          className="w-full"
          size="lg"
          onClick={handleSend}
          disabled={!account || !isCorrectNetwork || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Encrypted Message
            </>
          )}
        </Button>

        {!account && (
          <p className="text-xs text-center text-muted-foreground">Connect your wallet to send messages</p>
        )}
      </CardContent>
    </Card>
  );
}
