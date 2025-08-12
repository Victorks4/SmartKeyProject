import { Dashboard } from "@/components/Dashboard";
import { Key } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Sistema de Chaves</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <Dashboard />
    </div>
  );
};

export default Index;
