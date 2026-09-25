import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { ProjectListPage } from "./pages/ProjectList/ProjectListPage";
import { StoryWorkspacePage } from "./pages/StoryWorkspace/StoryWorkspacePage";
import { StoryboardPage } from "./pages/Storyboard/StoryboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/workspace" element={<StoryWorkspacePage />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
