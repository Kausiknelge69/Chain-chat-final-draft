import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Key, Copy, RefreshCw, Eye, EyeOff, Shield, Download } from "lucide-react";
import { generateRSAKeyPair, exportPublicKey, exportPrivateKey } from "@/lib/crypto";

export function KeyGenerator() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const keyPair = await generateRSAKeyPair();
      const pubKey = await exportPublicKey(keyPair.publicKey);
      const privKey = await exportPrivateKey(keyPair.privateKey);

      setPublicKey(pubKey);
      setPrivateKey(privKey);

      toast({ title: "Keys Generated", description: "New RSA-2048 key pair created" });
    } catch (error) {
      console.error("Key generation error:", error);
      toast({ title: "Generation Failed", description: "Failed to generate keys", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const downloadKey = (key: string, filename: string) => {
    const blob = new Blob([key], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/30">
            <Key className="w-5 h-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-foreground">Key Management</CardTitle>
            <CardDescription>Generate RSA-2048 key pairs for encryption</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="cyber" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
          <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Generating..." : "Generate New Key Pair"}
        </Button>

        {publicKey && (
          <>
            {/* Public Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                  <Shield className="w-3 h-3 text-primary" />
                  PUBLIC KEY (Share this)
                </label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(publicKey, "Public key")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadKey(publicKey, "chainchain-public-key.txt")}>
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border font-mono text-xs text-primary/80 break-all max-h-24 overflow-y-auto">
                {publicKey}
              </div>
            </div>

            {/* Private Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                  <Key className="w-3 h-3 text-destructive" />
                  PRIVATE KEY (Keep secret!)
                </label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                    {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(privateKey, "Private key")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadKey(privateKey, "chainchain-private-key.txt")}>
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 font-mono text-xs text-muted-foreground break-all max-h-24 overflow-y-auto">
                {showPrivateKey ? privateKey : "•".repeat(64)}
              </div>
              <p className="text-xs text-destructive/70 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Never share your private key. Store it securely offline.
              </p>
            </div>
          </>
        )}

        {!publicKey && (
          <div className="py-8 text-center">
            <Key className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">Generate a key pair to start sending encrypted messages</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
