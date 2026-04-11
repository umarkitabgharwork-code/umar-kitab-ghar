import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export default function UploadListPage() {
  const [note, setNote] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const hasFile = fileUrl != null && fileUrl.length > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!okType) {
      toast.error("Please upload an image or PDF file.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const filePath = `custom-orders/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }
      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setFileUrl(publicData.publicUrl);
      toast.success("List uploaded.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleProceed = () => {
    if (!hasFile || !fileUrl) {
      toast.error("Please upload your list to continue");
      return;
    }

    addItem({
      id: "custom-" + crypto.randomUUID(),
      type: "custom",
      name: "Custom Order",
      price: 0,
      customFileUrl: fileUrl,
      customNote: note.trim() || undefined,
    });

    navigate(ROUTES.CHECKOUT);
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-lg">
        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Upload Your Book List</h1>

            <div className="space-y-2">
              <Label htmlFor="list-file">
                Upload your list <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="list-file"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      {hasFile ? "Replace file" : "Choose image or PDF"}
                    </>
                  )}
                </label>
                <input
                  id="list-file"
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {hasFile && (
                  <p className="text-xs text-muted-foreground break-all">Uploaded: {fileUrl}</p>
                )}
              </div>
              {!hasFile && (
                <p className="text-sm text-destructive" role="alert">
                  Please upload your list to continue
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-note">Notes (optional)</Label>
              <Textarea
                id="list-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Any extra details for your order…"
              />
            </div>

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              You will receive a confirmation call or WhatsApp message to confirm items and pricing.
            </p>

            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={handleProceed}
              disabled={!hasFile || uploading}
            >
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
