import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import CommandCentrePage from "./pages/CommandCentrePage";
import ProcessingInbox from "./pages/ProcessingInbox";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Agenda from "./pages/Agenda";
import Summary from "./pages/Summary";
import Customise from "./pages/Customise";
import VoiceGuidePage from "./pages/VoiceGuidePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCentrePage />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/inbox" element={<ProcessingInbox />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/guide" element={<VoiceGuidePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/customise" element={<Customise />} />

            {/* Redirect pruned legacy routes */}
            <Route path="/focus" element={<Navigate to="/agenda" replace />} />
            <Route path="/notes" element={<Navigate to="/inbox" replace />} />
            <Route path="/waiting-on" element={<Navigate to="/agenda" replace />} />
            <Route path="/questions" element={<Navigate to="/inbox" replace />} />
            <Route path="/projects" element={<Navigate to="/agenda" replace />} />
            <Route path="/ideas" element={<Navigate to="/inbox" replace />} />
            <Route path="/people-to-contact" element={<Navigate to="/agenda" replace />} />
            <Route path="/contact-history" element={<Navigate to="/agenda" replace />} />
            <Route path="/opportunities" element={<Navigate to="/inbox" replace />} />
            <Route path="/calendar" element={<Navigate to="/agenda" replace />} />
            <Route path="/archive" element={<Navigate to="/inbox" replace />} />
            <Route path="/search" element={<Navigate to="/agenda" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
