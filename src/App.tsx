import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { ProjectListPage } from "./pages/ProjectList/ProjectListPage";
import { StoryWorkspacePage } from "./pages/StoryWorkspace/StoryWorkspacePage";
import { StoryboardPage } from "./pages/Storyboard/StoryboardPage";
import { ProjectProvider } from "./contexts/ProjectContext";

function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/workspace" element={<StoryWorkspacePage />} />
          <Route path="/storyboard" element={<StoryboardPage />} />
        </Routes>
      </ProjectProvider>
    </BrowserRouter>
  );
}

export default App;
