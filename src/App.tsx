
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
import SimpleModulePage from "./pages/SimpleModulePage";
import { CurrentAgendaModule } from "./components/modules/CurrentAgendaModule";
import { SimpleListModule } from "./components/modules/SimpleListModule";
import { FileText, Hourglass, HelpCircle, Briefcase } from "lucide-react";

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
            <Route path="/focus" element={
              <SimpleModulePage title="Focus Now" subtitle="Items you've personally promoted. The system never auto-fills this lane.">
                <CurrentAgendaModule focusOnly span={12} />
              </SimpleModulePage>
            } />
            <Route path="/notes" element={
              <SimpleModulePage title="Quick Notes" subtitle="Lightweight thoughts. No structure required.">
                <SimpleListModule table="notes" title="Notes" icon={FileText} accent="blue"
                  placeholder="A note for later…" emptyHint="Loose thoughts. No structure required." span={12} />
              </SimpleModulePage>
            } />
            <Route path="/waiting-on" element={
              <SimpleModulePage title="Waiting On" subtitle="Things you don't have to act on yet, but want to track.">
                <SimpleListModule table="waiting_on" title="Waiting On" icon={Hourglass} accent="coral"
                  placeholder="Who or what are you waiting on?" emptyHint="Track replies and external deliverables." span={12}
                  extraColumn={(r) => r.who || null} />
              </SimpleModulePage>
            } />
            <Route path="/questions" element={
              <SimpleModulePage title="Open Questions" subtitle="Unresolved threads. Not everything needs an answer today.">
                <SimpleListModule table="open_questions" title="Open Questions" icon={HelpCircle} accent="purple"
                  placeholder="What are you still figuring out?" emptyHint="Sit with the unresolved." span={12} />
              </SimpleModulePage>
            } />
            <Route path="/projects" element={
              <SimpleModulePage title="Projects" subtitle="Spin up project shells. Workspaces with linked agenda items coming soon.">
                <SimpleListModule table="projects" title="Active Projects" icon={Briefcase} accent="blue"
                  placeholder="Project name…" emptyHint="Spin up a project shell." span={12} />
              </SimpleModulePage>
            } />
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
