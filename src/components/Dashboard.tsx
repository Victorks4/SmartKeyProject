import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Key, 
  Clock, 
  User, 
  Building, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

interface KeyRecord {
  id: string;
  professorName: string;
  room: string;
  time: string;
  subject: string;
  course: string;
  status: 'retirada' | 'devolvida' | 'em_uso';
  withdrawalTime: string;
  returnTime?: string;
  requiresLogin: boolean;
}

const mockData: KeyRecord[] = [
  {
    id: "1",
    professorName: "Prof. Maria Silva",
    room: "Sala 101",
    time: "08:00 - 10:00",
    subject: "Matemática",
    course: "Engenharia",
    status: "em_uso",
    withdrawalTime: "07:45",
    requiresLogin: true
  },
  {
    id: "2", 
    professorName: "Prof. João Santos",
    room: "Lab 203",
    time: "10:00 - 12:00",
    subject: "Física",
    course: "Ciências",
    status: "devolvida",
    withdrawalTime: "09:30",
    returnTime: "11:45",
    requiresLogin: false
  },
  {
    id: "3",
    professorName: "Prof. Ana Costa",
    room: "Sala 305",
    time: "14:00 - 16:00",
    subject: "História",
    course: "Humanidades",
    status: "retirada",
    withdrawalTime: "13:45",
    requiresLogin: true
  }
];

export function Dashboard() {
  const [records] = useState<KeyRecord[]>(mockData);

  const getStatusBadge = (status: KeyRecord['status']) => {
    const variants = {
      'em_uso': { variant: 'default' as const, label: 'Em Uso' },
      'devolvida': { variant: 'outline' as const, label: 'Devolvida' },
      'retirada': { variant: 'secondary' as const, label: 'Retirada' }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: records.length,
    emUso: records.filter(r => r.status === 'em_uso').length,
    devolvidas: records.filter(r => r.status === 'devolvida').length,
    retiradas: records.filter(r => r.status === 'retirada').length
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Key className="h-8 w-8 text-primary" />
              Sistema de Controle de Chaves
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitore e controle a retirada de chaves por professores
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.emUso}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devolvidas</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.devolvidas}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retiradas</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.retiradas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Monitoramento de Chaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professor</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Horário da Aula</TableHead>
                  <TableHead>Matéria</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retirada</TableHead>
                  <TableHead>Devolução</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {record.professorName}
                    </TableCell>
                    <TableCell>{record.room}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {record.subject}
                    </TableCell>
                    <TableCell>{record.course}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.withdrawalTime}</TableCell>
                    <TableCell>{record.returnTime || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={record.requiresLogin ? "default" : "outline"}>
                        {record.requiresLogin ? "Com Login" : "Livre"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={record.status === 'em_uso'}
                        className="gap-1"
                      >
                        <Key className="h-3 w-3" />
                        Retirar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}