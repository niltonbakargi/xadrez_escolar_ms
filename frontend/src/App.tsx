import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Aluno
import StudentDashboard from "./pages/student/Dashboard";
import StudentGameMap from "./pages/student/GameMap";
import StudentPuzzles from "./pages/student/Puzzles";
import StudentDiary from "./pages/student/Diary";
import StudentCertificates from "./pages/student/Certificates";

// Professor
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherWeeklyReview from "./pages/teacher/WeeklyReview";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherReports from "./pages/teacher/Reports";

// Gestão
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSchools from "./pages/admin/Schools";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Área do Aluno */}
          <Route path="/aluno" element={<StudentDashboard />} />
          <Route path="/aluno/mapa" element={<StudentGameMap />} />
          <Route path="/aluno/puzzles" element={<StudentPuzzles />} />
          <Route path="/aluno/diario" element={<StudentDiary />} />
          <Route path="/aluno/certificados" element={<StudentCertificates />} />

          {/* Área do Professor */}
          <Route path="/professor" element={<TeacherDashboard />} />
          <Route path="/professor/revisao" element={<TeacherWeeklyReview />} />
          <Route path="/professor/turmas" element={<TeacherClasses />} />
          <Route path="/professor/turmas/:id" element={<TeacherClasses />} />
          <Route path="/professor/relatorios" element={<TeacherReports />} />

          {/* Área de Gestão */}
          <Route path="/gestao" element={<AdminDashboard />} />
          <Route path="/gestao/escolas" element={<AdminSchools />} />
          <Route path="/gestao/usuarios" element={<AdminUsers />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
