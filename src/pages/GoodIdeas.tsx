
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { localStorageAPI, initializeLocalStorage } from "@/lib/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  details: string | null;
  created_at: string;
}

const GoodIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    initializeLocalStorage();
    fetchIdeas();
  }, []);

  const fetchIdeas = () => {
    try {
      const data = localStorageAPI.getIdeas();
      setIdeas(data);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      toast({
        title: "Error fetching ideas",
        description: "There was a problem loading your ideas.",
        variant: "destructive",
      });
    }
  };

  const addIdea = () => {
    if (!newIdea.trim()) return;

    try {
      localStorageAPI.addIdea(newIdea);
      setNewIdea("");
      fetchIdeas();
      toast({
        title: "Idea added",
        description: "Your idea has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding idea:", error);
      toast({
        title: "Error adding idea",
        description: "There was a problem adding your idea.",
        variant: "destructive",
      });
    }
  };

  const startEditDetails = (idea: Idea) => {
    setEditingIdeaId(idea.id);
    setEditingDetails(idea.details || "");
  };

  const cancelEditDetails = () => {
    setEditingIdeaId(null);
    setEditingDetails("");
  };

  const saveDetails = (ideaId: string) => {
    try {
      localStorageAPI.updateIdea(ideaId, { details: editingDetails });
      setEditingIdeaId(null);
      fetchIdeas();
      toast({
        title: "Details updated",
        description: "The idea details have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating idea details:", error);
      toast({
        title: "Error updating details",
        description: "There was a problem updating the details.",
        variant: "destructive",
      });
    }
  };

  const deleteIdea = (ideaId: string) => {
    try {
      localStorageAPI.deleteIdea(ideaId);
      fetchIdeas();
      toast({
        title: "Idea deleted",
        description: "The idea has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast({
        title: "Error deleting idea",
        description: "There was a problem deleting your idea.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addIdea();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              Good Ideas
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Capture and organize your brilliant thoughts</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Input
              placeholder="Enter a new idea..."
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm sm:text-base"
            />
            <Button
              onClick={addIdea}
              className="bg-gradient-to-r from-pink-400 to-purple-400 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Idea</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          <div className="bg-white rounded-md shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Idea</TableHead>
                  <TableHead className="text-xs sm:text-sm">Details</TableHead>
                  <TableHead className="w-16 sm:w-24 text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ideas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 sm:py-8 text-sm sm:text-base">
                      No ideas yet. Add your first idea above!
                    </TableCell>
                  </TableRow>
                ) : (
                  ideas.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium p-2 sm:p-4 text-xs sm:text-sm">
                        <div className="max-w-[120px] sm:max-w-none break-words">
                          {idea.title}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        {editingIdeaId === idea.id ? (
                          <Textarea
                            value={editingDetails}
                            onChange={(e) => setEditingDetails(e.target.value)}
                            className="min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-xs sm:text-sm">
                            <div className="max-w-[150px] sm:max-w-none break-words">
                              {idea.details || (
                                <span className="text-gray-400 italic">
                                  No details added
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          {editingIdeaId === idea.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveDetails(idea.id)}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                              >
                                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditDetails}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditDetails(idea)}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteIdea(idea.id)}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodIdeas;
