import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import Landing from "./pages/Landing";
import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";
import DependencyGraph from "./pages/DependencyGraph";
import Vulnerabilities from "./pages/Vulnerabilities";
import AICopilot from "./pages/AICopilot";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/graph" element={<DependencyGraph />} />
        <Route path="/vulnerabilities" element={<Vulnerabilities />} />
        <Route path="/copilot" element={<AICopilot />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
