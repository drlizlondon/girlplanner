import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ContactHistoryItem {
  id: string;
  name: string;
  comments?: string;
  contacted_at: string;
  created_at?: string;
}

const ContactHistory = () => {
  const [history, setHistory] = useState<ContactHistoryItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const loadHistory = async () => {
    try {
      const data = await dataService.getContactHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading contact history:", error);
      toast({
        title: "Error",
        description: "Failed to load contact history.",
        variant: "destructive",
      });
    }
  };

  const deleteHistoryItem = async (historyId: string) => {
    try {
      await dataService.deleteContactHistory(historyId);
      loadHistory();
      toast({
        title: "Deleted",
        description: "History item removed.",
      });
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast({
        title: "Error",
        description: "Failed to delete history item.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    if (isAuthenticated) {
      await dataService.signOut();
      setIsAuthenticated(false);
      toast({
        title: "Signed out",
        description: "You've been signed out.",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onSignOut={handleSignOut} showSignOut={isAuthenticated} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/people-to-contact")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </div>

          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              Contact History
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">People you've already contacted</p>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contact history yet.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Comments</TableHead>
                    <TableHead className="text-xs sm:text-sm">Contacted On</TableHead>
                    <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">
                      <Trash2 className="h-4 w-4 mx-auto text-gray-400" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2 sm:p-4 text-xs sm:text-sm font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 text-xs sm:text-sm text-gray-600">
                        {item.comments || "-"}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 text-xs sm:text-sm text-gray-500">
                        {new Date(item.contacted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.id)}
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
    </div>
  );
};

export default ContactHistory;
