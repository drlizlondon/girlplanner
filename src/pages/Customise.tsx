import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect, KeyboardEvent } from "react";

interface TaskTypeOption {
  id: string;
  value: string;
}

const Customise = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [taskTypes, setTaskTypes] = useState<TaskTypeOption[]>([]);
  const [newType, setNewType] = useState("");

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    const { data, error } = await supabase
      .from('task_types')
      .select('*')
      .order('value', { ascending: true });

    if (error) {
      toast({
        title: "Error fetching task types",
        description: "There was a problem loading your task types.",
      });
      return;
    }

    setTaskTypes(data || []);
  };

  const handleAddType = async () => {
    if (!newType.trim()) return;

    const { error } = await supabase
      .from('task_types')
      .insert([{ value: newType.trim() }]);

    if (error) {
      toast({
        title: "Error adding task type",
        description: "There was a problem adding the new task type.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "New task type added successfully.",
    });
    setNewType("");
    fetchTaskTypes();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddType();
    }
  };

  const handleUpdateType = async (id: string, newValue: string) => {
    const { error } = await supabase
      .from('task_types')
      .update({ value: newValue })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating task type",
        description: "There was a problem updating the task type.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task type updated successfully.",
    });
    fetchTaskTypes();
  };

  const handleDeleteType = async (id: string) => {
    const { error } = await supabase
      .from('task_types')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting task type",
        description: "There was a problem deleting the task type.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task type deleted successfully.",
    });
    fetchTaskTypes();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Header onSignOut={handleSignOut} />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-dancing-script text-purple-700 font-bold text-center mb-6">
            Customise Task Types
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="Add new task type..."
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleAddType}
                className="bg-gradient-to-r from-pink-400 to-purple-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>

            <div className="space-y-4">
              {taskTypes.map((type) => (
                <div key={type.id} className="flex items-center gap-4">
                  <Input
                    value={type.value}
                    onChange={(e) => handleUpdateType(type.id, e.target.value)}
                    className="flex-1"
                    disabled={type.value === '_none'}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteType(type.id)}
                    disabled={type.value === '_none'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customise;
