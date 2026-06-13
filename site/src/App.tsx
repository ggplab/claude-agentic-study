import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ChapterPage } from "./pages/ChapterPage";
import { PrototypesPage } from "./pages/PrototypesPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chapter/:n" element={<ChapterPage />} />
        <Route path="/prototypes" element={<PrototypesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
