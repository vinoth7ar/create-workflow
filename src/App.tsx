import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ViewPage from "./pages/View";
import { CreateWorkflow } from "./components/workflow/create/CreateWorkflow";
import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/view" element={<ViewPage />} />
    <Route path="/editor" element={<CreateWorkflow />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;