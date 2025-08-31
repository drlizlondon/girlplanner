import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [editingComments, setEditingComments] = useState<{ [key: string]: string }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContacts();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const loadContacts = () => {
    const savedContacts = localStorage.getItem("contacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  };

  const saveContacts = (updatedContacts: Contact[]) => {
    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (!newContactName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a contact name.",
        variant: "destructive",
      });
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      comments: "",
      contacted: false,
      created_at: new Date().toISOString(),
    };

    const updatedContacts = [...contacts, newContact];
    saveContacts(updatedContacts);
    
    setNewContactName("");
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addContact();
    }
  };

  const updateComments = (contactId: string, comments: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, comments }
        : contact
    );
    saveContacts(updatedContacts);
  };

  const toggleContacted = (contactId: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, contacted: !contact.contacted }
        : contact
    );
    saveContacts(updatedContacts);
  };

  const deleteContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    saveContacts(updatedContacts);
    
    toast({
      title: "Contact deleted",
      description: "Contact has been removed from your list.",
    });
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
          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              People to Contact
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Keep track of people you need to reach out to</p>
          </div>

          {/* Add Contact Form */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Add a new contact..."
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={addContact}
              className="bg-gradient-to-r from-pink-400 to-purple-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
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
                    <TableRow key={contact.id} className={contact.contacted ? "opacity-60" : ""}>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleContacted(contact.id)}
                            className="h-4 w-4 sm:h-5 sm:w-5 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-transparent hover:text-gray-400" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className={`p-2 sm:p-4 text-xs sm:text-sm ${contact.contacted ? "line-through" : ""}`}>
                        {contact.name}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <Textarea
                          value={editingComments[contact.id] !== undefined ? editingComments[contact.id] : contact.comments || ""}
                          onChange={(e) => {
                            setEditingComments(prev => ({
                              ...prev,
                              [contact.id]: e.target.value
                            }));
                          }}
                          onBlur={() => {
                            const newComments = editingComments[contact.id] !== undefined ? editingComments[contact.id] : contact.comments || "";
                            updateComments(contact.id, newComments);
                            setEditingComments(prev => {
                              const newState = { ...prev };
                              delete newState[contact.id];
                              return newState;
                            });
                          }}
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
        </div>
      </div>
    </div>
  );
};

export default PeopleToContact;