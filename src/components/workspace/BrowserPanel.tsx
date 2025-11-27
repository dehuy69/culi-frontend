import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ExternalLink, AlertCircle } from "lucide-react";

interface BrowserPanelProps {
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
}

const BrowserPanel = ({ url, onUrlChange, onClose }: BrowserPanelProps) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [iframeError, setIframeError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onUrlChange(inputUrl.trim());
      setIframeError(false);
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="w-[600px] border-l border-border flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Browser</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://..."
            className="h-9 text-sm"
          />
          <Button type="submit" size="sm" variant="outline">
            Đi
          </Button>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-muted/30">
        {!iframeError ? (
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="Browser"
            sandbox="allow-same-origin allow-scripts allow-forms"
            onError={handleIframeError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">Không thể nhúng trang web này</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Website này không cho phép hiển thị trong iframe. Bạn có thể mở trong tab mới.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Mở trong tab mới
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserPanel;
