import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, Edit, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Contact {
  id: string;
  name: string;
  details?: string;
  contacted: boolean;
  created_at?: string;
}

const PeopleToContact = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContactName, setNewContactName] = useState("");
  const [contactDetails, setContactDetails] = useState("");
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
      details: contactDetails.trim() || undefined,
      contacted: false,
      created_at: new Date().toISOString(),
    };

    const updatedContacts = [...contacts, newContact];
    saveContacts(updatedContacts);
    
    setNewContactName("");
    setContactDetails("");
    setShowAddDialog(false);
    
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts.`,
    });
  };

  const updateContact = () => {
    if (!editingContact || !newContactName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a contact name.",
        variant: "destructive",
      });
      return;
    }

    const updatedContacts = contacts.map(contact =>
      contact.id === editingContact.id
        ? { ...contact, name: newContactName.trim(), details: contactDetails.trim() || undefined }
        : contact
    );

    saveContacts(updatedContacts);
    
    setEditingContact(null);
    setNewContactName("");
    setContactDetails("");
    
    toast({
      title: "Contact updated",
      description: "Contact details have been updated.",
    });
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

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setNewContactName(contact.name);
    setContactDetails(contact.details || "");
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingContact(null);
    setNewContactName("");
    setContactDetails("");
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
        <Header onSignOut={handleSignOut} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              People to Contact
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Keep track of people you need to reach out to</p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Contacts</h3>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contacts yet. Add someone to get started!</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Details</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id} className={contact.contacted ? "opacity-60" : ""}>
                      <TableCell className="p-2 sm:p-4">
                        <button
                          onClick={() => toggleContacted(contact.id)}
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            contact.contacted
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-green-400"
                          }`}
                        >
                          {contact.contacted && <Check className="h-3 w-3" />}
                        </button>
                      </TableCell>
                      <TableCell className={`p-2 sm:p-4 font-medium ${contact.contacted ? "line-through" : ""}`}>
                        {contact.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell p-2 sm:p-4 text-sm text-gray-600">
                        {contact.details || "No details"}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(contact)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContact(contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddDialog || !!editingContact} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-details">Details (optional)</Label>
              <Textarea
                id="contact-details"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="Phone number, email, notes, etc."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={editingContact ? updateContact : addContact}>
                {editingContact ? "Update" : "Add"} Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeopleToContact;