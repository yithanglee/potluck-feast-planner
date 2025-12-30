import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface UserHeaderProps {
  userName: string;
  onLogout: () => void;
}

const UserHeader = ({ userName, onLogout }: UserHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">已登录</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
