import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { KeyWithdrawal } from "@/components/KeyWithdrawal";
import { Button } from "@/components/ui/button";
import { Key, BarChart3 } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'withdrawal'>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Sistema de Chaves</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentView('dashboard')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant={currentView === 'withdrawal' ? 'default' : 'outline'}
                onClick={() => setCurrentView('withdrawal')}
                className="gap-2"
              >
                <Key className="h-4 w-4" />
                Retirada
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      {currentView === 'dashboard' ? <Dashboard /> : <KeyWithdrawal />}
    </div>
  );
};

export default Index;
