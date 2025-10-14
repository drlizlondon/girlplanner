import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, Trash2, History, User, Cloud, HardDrive } from "lucide-react";
import { Header } from "@/components/Header";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";

interface Contact {
  id: string;
  name: string;
  comments?: string;
  contacted: boolean;
  created_at?: string;
}

const PeopleToContact = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactComments, setNewContactComments] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'supabase'>('local');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContacts();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
    setStorageType(dataService.getStorageType());
  };

  const loadContacts = async () => {
    try {
      const data = await dataService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts.",
        variant: "destructive",
      });
    }
  };

  const addContact = async () => {
    if (!newContactName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a contact name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dataService.addContact(newContactName.trim(), newContactComments.trim());
      loadContacts();
      setNewContactName("");
      setNewContactComments("");
      toast({
        title: "Contact added",
        description: `${newContactName} has been added to your contacts.`,
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addContact();
    }
  };

  const updateComments = async (contactId: string, comments: string) => {
    try {
      await dataService.updateContact(contactId, { comments });
      loadContacts();
    } catch (error) {
      console.error("Error updating comments:", error);
      toast({
        title: "Error",
        description: "Failed to update comments.",
        variant: "destructive",
      });
    }
  };

  const markAsContacted = async (contactId: string) => {
    try {
      await dataService.markContactAsContacted(contactId);
      loadContacts();
      toast({
        title: "Contact marked as contacted",
        description: "Moved to history.",
      });
    } catch (error) {
      console.error("Error marking as contacted:", error);
      toast({
        title: "Error",
        description: "Failed to mark as contacted.",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      await dataService.deleteContact(contactId);
      loadContacts();
      toast({
        title: "Contact deleted",
        description: "Contact has been removed from your list.",
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive",
      });
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
    loadContacts();
  };

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
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Your contacts are saved to your account)</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Local Storage</span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Contacts saved on this device only)</span>
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
              People to Contact
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Keep track of who you want to message / respond to</p>
          </div>

          {/* Add Contact Form */}
          <div className="space-y-3 mb-8">
            <Input
              placeholder="Name..."
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Textarea
              placeholder="Comment..."
              value={newContactComments}
              onChange={(e) => setNewContactComments(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={addContact}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              +add
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contacts yet. Add someone to get started!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 sm:w-12 text-xs sm:text-sm">Done</TableHead>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Comments</TableHead>
                    <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">
                      <Trash2 className="h-4 w-4 mx-auto text-gray-400" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => markAsContacted(contact.id)}
                            className="h-4 w-4 sm:h-5 sm:w-5 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-transparent hover:text-gray-400" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 text-xs sm:text-sm">
                        {contact.name}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Textarea
                          value={contact.comments || ""}
                          onChange={(e) => updateComments(contact.id, e.target.value)}
                          placeholder="Add comments..."
                          className="text-xs sm:text-sm min-h-[60px] resize-none"
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContact(contact.id)}
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

          {/* History Link */}
          <div className="flex justify-center pt-4">
            <Button
              variant="link"
              onClick={() => navigate("/contact-history")}
              className="text-purple-600 hover:text-purple-700"
            >
              <History className="h-4 w-4 mr-2" />
              View Contact History
            </Button>
          </div>
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

export default PeopleToContact;
