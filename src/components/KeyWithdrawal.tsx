import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Key, 
  User, 
  Clock, 
  Building,
  BookOpen,
  GraduationCap,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Professor {
  id: string;
  name: string;
  room: string;
  time: string;
  subject: string;
  course: string;
  requiresLogin: boolean;
}

const mockProfessors: Professor[] = [
  {
    id: "1",
    name: "Prof. Maria Silva",
    room: "Sala 101", 
    time: "08:00 - 10:00",
    subject: "Matemática",
    course: "Engenharia",
    requiresLogin: true
  },
  {
    id: "2",
    name: "Prof. João Santos",
    room: "Lab 203",
    time: "10:00 - 12:00", 
    subject: "Física",
    course: "Ciências",
    requiresLogin: false
  },
  {
    id: "3",
    name: "Prof. Ana Costa",
    room: "Sala 305",
    time: "14:00 - 16:00",
    subject: "História", 
    course: "Humanidades",
    requiresLogin: true
  }
];

export function KeyWithdrawal() {
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [professorLogin, setProfessorLogin] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const handleProfessorSelect = (professorId: string) => {
    const professor = mockProfessors.find(p => p.id === professorId);
    setSelectedProfessor(professor || null);
    setProfessorLogin("");
  };

  const handleWithdrawal = async () => {
    if (!selectedProfessor) return;

    if (selectedProfessor.requiresLogin && !professorLogin.trim()) {
      toast({
        title: "Login necessário",
        description: "Por favor, informe o login do professor para prosseguir.",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);

    // Simular processo de retirada
    setTimeout(() => {
      setIsWithdrawing(false);
      toast({
        title: "Chave retirada com sucesso!",
        description: `Chave da ${selectedProfessor.room} retirada por ${selectedProfessor.name}`,
      });
      
      // Reset form
      setSelectedProfessor(null);
      setProfessorLogin("");
    }, 1500);
  };

  const toggleLoginRequirement = (checked: boolean) => {
    if (selectedProfessor) {
      setSelectedProfessor({
        ...selectedProfessor,
        requiresLogin: checked
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            Retirada de Chaves
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecione o professor e configure a retirada
          </p>
        </div>

        {/* Selection Card */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleção do Professor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professor">Professor</Label>
              <Select onValueChange={handleProfessorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {professor.name} - {professor.room}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Professor Details */}
        {selectedProfessor && (
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Detalhes da Alocação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Professor</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessor.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sala</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessor.room}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Horário</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessor.time}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Matéria</Label>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessor.subject}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Curso</Label>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessor.course}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tipo de Retirada</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedProfessor.requiresLogin ? "default" : "outline"}>
                      {selectedProfessor.requiresLogin ? "Com Login" : "Livre"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Login Requirement Toggle */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Switch
                  id="require-login"
                  checked={selectedProfessor.requiresLogin}
                  onCheckedChange={toggleLoginRequirement}
                />
                <Label htmlFor="require-login">Exigir login do professor</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Card */}
        {selectedProfessor && selectedProfessor.requiresLogin && (
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Login do Professor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Identificação do Professor</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Digite o login ou identificação"
                  value={professorLogin}
                  onChange={(e) => setProfessorLogin(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {selectedProfessor && (
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="pt-6">
              <Button
                onClick={handleWithdrawal}
                disabled={isWithdrawing}
                variant="hero"
                size="lg"
                className="w-full gap-2"
              >
                {isWithdrawing ? (
                  "Processando..."
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirmar Retirada
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}