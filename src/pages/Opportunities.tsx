import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, User, Cloud, HardDrive, CalendarIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Opportunities = () => {
  const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const [newOpportunityTitle, setNewOpportunityTitle] = useState("");
  const [newOpportunityDeadline, setNewOpportunityDeadline] = useState<Date | undefined>();
  const [newOpportunityDetails, setNewOpportunityDetails] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'supabase'>('local');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
    setStorageType(dataService.getStorageType());
  };

  const handleAddOpportunity = async () => {
    if (!newOpportunityTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an opportunity title.",
        variant: "destructive",
      });
      return;
    }

    await addOpportunity(newOpportunityTitle, newOpportunityDeadline, newOpportunityDetails);
    setNewOpportunityTitle("");
    setNewOpportunityDeadline(undefined);
    setNewOpportunityDetails("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddOpportunity();
    }
  };

  const handleSignOut = async () => {
    if (isAuthenticated) {
      await dataService.signOut();
      setIsAuthenticated(false);
      setStorageType('local');
      toast({
        title: "Signed out",
        description: "You've been signed out.",
      });
    } else {
      navigate("/");
    }
  };

  const handleAuthSuccess = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
    setStorageType(dataService.getStorageType());
  };

  // Sort opportunities by deadline date (earliest first, undefined last)
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (!a.deadline_date && !b.deadline_date) return 0;
    if (!a.deadline_date) return 1;
    if (!b.deadline_date) return -1;
    return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onSignOut={handleSignOut} showSignOut={isAuthenticated} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Storage Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-muted/50 rounded-lg p-3 sm:p-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              {storageType === 'supabase' ? (
                <>
                  <Cloud className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Synced to Cloud</span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Your opportunities are saved to your account)</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Local Storage</span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Opportunities saved on this device only)</span>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign In to Sync</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>

          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              Opportunities
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Track exciting opportunities and their deadlines</p>
          </div>

          {/* Add Opportunity Form */}
          <div className="space-y-3 mb-8">
            <Input
              placeholder="Opportunity title..."
              value={newOpportunityTitle}
              onChange={(e) => setNewOpportunityTitle(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            
            {/* Deadline Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newOpportunityDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newOpportunityDeadline ? format(newOpportunityDeadline, "PPP") : <span>Pick deadline date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newOpportunityDeadline}
                  onSelect={setNewOpportunityDeadline}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Textarea
              placeholder="Details (optional)..."
              value={newOpportunityDetails}
              onChange={(e) => setNewOpportunityDetails(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleAddOpportunity}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              + Add
            </Button>
          </div>

          {sortedOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No opportunities yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Opportunity</TableHead>
                    <TableHead className="text-xs sm:text-sm">Deadline</TableHead>
                    <TableHead className="text-xs sm:text-sm">Details</TableHead>
                    <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">
                      <Trash2 className="h-4 w-4 mx-auto text-gray-400" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOpportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="p-2 sm:p-4">
                        <Input
                          value={opportunity.title}
                          onChange={(e) => updateOpportunity(opportunity.id, { title: e.target.value })}
                          className="text-xs sm:text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-left font-normal text-xs sm:text-sm",
                                !opportunity.deadline_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              {opportunity.deadline_date ? format(opportunity.deadline_date, "PPP") : <span>No deadline</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={opportunity.deadline_date}
                              onSelect={(date) => updateOpportunity(opportunity.id, { deadline_date: date })}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Textarea
                          value={opportunity.details || ""}
                          onChange={(e) => updateOpportunity(opportunity.id, { details: e.target.value })}
                          placeholder="Add details..."
                          className="text-xs sm:text-sm min-h-[60px] resize-none"
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOpportunity(opportunity.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Opportunities;
