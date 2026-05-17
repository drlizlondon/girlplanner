
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import CommandCentrePage from "./pages/CommandCentrePage";
import ProcessingInbox from "./pages/ProcessingInbox";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Agenda from "./pages/Agenda";
import Summary from "./pages/Summary";
import Customise from "./pages/Customise";
import GoodIdeas from "./pages/GoodIdeas";
import PeopleToContact from "./pages/PeopleToContact";
import ContactHistory from "./pages/ContactHistory";
import Opportunities from "./pages/Opportunities";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCentrePage />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/inbox" element={<ProcessingInbox />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/customise" element={<Customise />} />
            <Route path="/ideas" element={<GoodIdeas />} />
            <Route path="/people-to-contact" element={<PeopleToContact />} />
            <Route path="/contact-history" element={<ContactHistory />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/projects" element={<ComingSoon title="Projects" subtitle="Project workspaces with linked tasks, ideas and updates. Coming soon." />} />
            <Route path="/calendar" element={<ComingSoon title="Calendar" subtitle="A calm view of due dates and meetings. Coming soon." />} />
            <Route path="/archive" element={<ComingSoon title="Archive" subtitle="Everything you've parked or set aside. Coming soon." />} />
            <Route path="/search" element={<ComingSoon title="Search" subtitle="Find anything across your system. Coming soon." />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
