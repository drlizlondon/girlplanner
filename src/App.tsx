
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Agenda from "./pages/Agenda";
import Summary from "./pages/Summary";
import Customise from "./pages/Customise";
import GoodIdeas from "./pages/GoodIdeas";
import PeopleToContact from "./pages/PeopleToContact";
import ContactHistory from "./pages/ContactHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/customise" element={<Customise />} />
          <Route path="/ideas" element={<GoodIdeas />} />
          <Route path="/people-to-contact" element={<PeopleToContact />} />
          <Route path="/contact-history" element={<ContactHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
