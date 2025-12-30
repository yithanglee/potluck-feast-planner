import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

interface ScriptUrlModalProps {
  currentUrl: string | null;
  onSave: (url: string) => void;
}

export function ScriptUrlModal({ currentUrl, onSave }: ScriptUrlModalProps) {
  const [isOpen, setIsOpen] = useState(!currentUrl);
  const [url, setUrl] = useState(currentUrl || "");

  // Keep internal state in sync when `currentUrl` is loaded after mount (e.g. from localStorage).
  useEffect(() => {
    if (currentUrl && currentUrl.trim()) {
      setUrl(currentUrl);
      setIsOpen(false);
      return;
    }

    // If the saved URL is cleared, prompt again.
    setUrl("");
    setIsOpen(true);
  }, [currentUrl]);

  const handleSave = () => {
    if (url.trim()) {
      onSave(url.trim());
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary/20 hover:bg-primary/30 rounded-full transition-colors"
        title="Configure Google Sheet"
      >
        <Settings className="w-5 h-5 text-primary" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          🔗 Connect Google Sheet
        </h2>
        
        <div className="space-y-4 text-sm text-muted-foreground mb-6">
          <p className="font-medium text-foreground">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a new Google Sheet</li>
            <li>Create two sheets named: <code className="bg-muted px-1 rounded">Users</code> and <code className="bg-muted px-1 rounded">Signups</code></li>
            <li>In <strong>Users</strong>: add headers → <code className="bg-muted px-1 rounded">username | name | created_at</code></li>
            <li>In <strong>Signups</strong>: add headers → <code className="bg-muted px-1 rounded">category | item | slot | user_email | user_name | notes | timestamp</code></li>
            <li>Go to <strong>Extensions → Apps Script</strong></li>
            <li>Paste the code from <code className="bg-muted px-1 rounded">GOOGLE_APPS_SCRIPT.js</code></li>
            <li>Click <strong>Deploy → New Deployment → Web app</strong></li>
            <li>Set "Who has access" to <strong>Anyone</strong></li>
            <li>Copy the Web App URL and paste below</li>
          </ol>
        </div>

        <Input
          type="url"
          placeholder="https://script.google.com/macros/s/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-4"
        />

        <div className="flex gap-3">
          {currentUrl && (
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!url.trim()}
            className="flex-1"
          >
            Save & Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
