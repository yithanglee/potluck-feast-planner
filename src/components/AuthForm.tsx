import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { User } from "lucide-react";

interface AuthFormProps {
  onLogin: (username: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

const AuthForm = ({ onLogin, error, loading }: AuthFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = name.trim();
    await onLogin(username);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="card-picnic p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧺</div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            欢迎！
          </h2>
          <p className="text-muted-foreground mt-2">
            输入名字即可继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="名字 / 用户名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-12"
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="grass"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "请稍候..." : "继续 🌿"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
