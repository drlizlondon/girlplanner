
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
import { Pencil, Trash2, Save, X } from "lucide-react";

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
    <div className="container mx-auto py-6">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Good Ideas</h1>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Enter a new idea..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={addIdea}
          className="bg-gradient-to-r from-pink-400 to-purple-400"
        >
          Add Idea
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Idea</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ideas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No ideas yet. Add your first idea above!
                </TableCell>
              </TableRow>
            ) : (
              ideas.map((idea) => (
                <TableRow key={idea.id}>
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>
                    {editingIdeaId === idea.id ? (
                      <Textarea
                        value={editingDetails}
                        onChange={(e) => setEditingDetails(e.target.value)}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {idea.details || (
                          <span className="text-gray-400 italic">
                            No details added
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingIdeaId === idea.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveDetails(idea.id)}
                            className="h-8 w-8"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditDetails}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditDetails(idea)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteIdea(idea.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
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
  );
};

export default GoodIdeas;
