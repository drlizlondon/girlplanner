import { useState, useEffect } from "react";
import { Opportunity } from "@/types/opportunity";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/lib/dataService";
import { opportunityUpdates, sortOpportunities } from "@/lib/opportunities";

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      fetchOpportunities();
    };
    initializeData();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(false);
    try {
      await dataService.initialize();
      const data = await dataService.getOpportunities();
      setOpportunities(data.map(opp => ({
        ...opp,
        deadline_date: opp.deadline_date ? new Date(opp.deadline_date) : undefined,
      })));
    } catch (error) {
      setError(true);
      console.error('Error fetching opportunities:', error);
      toast({
        title: "Error loading opportunities",
        description: "There was a problem loading your opportunities.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOpportunity = async (title: string, deadline_date?: Date, details?: string) => {
    if (!title.trim()) return false;

    try {
      const createdOpportunity = await dataService.addOpportunity(
        title.trim(),
        deadline_date?.toISOString(),
        details?.trim()
      );
      
      const formattedOpportunity: Opportunity = {
        ...createdOpportunity,
        deadline_date: createdOpportunity.deadline_date ? new Date(createdOpportunity.deadline_date) : undefined,
      };

      setOpportunities(previous => [formattedOpportunity, ...previous]);
      toast({
        title: "Opportunity added",
        description: "Your new opportunity has been added.",
      });
      return true;
    } catch (error) {
      console.error('Error adding opportunity:', error);
      toast({
        title: "Error adding opportunity",
        description: "There was a problem adding your opportunity.",
      });
      return false;
    }
  };

  const updateOpportunity = async (opportunityId: string, updates: Partial<Opportunity>) => {
    try {
      const localUpdates = opportunityUpdates(updates);

      const updatedOpportunity = await dataService.updateOpportunity(opportunityId, localUpdates);
      
      if (!updatedOpportunity) {
        toast({
          title: "Error updating opportunity",
          description: "Opportunity not found.",
        });
        return false;
      }

      setOpportunities(
        previous => previous.map((opp) => {
          if (opp.id === opportunityId) {
            return { ...opp, ...updates };
          }
          return opp;
        })
      );
      return true;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast({
        title: "Error updating opportunity",
        description: "There was a problem updating your opportunity.",
      });
      return false;
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    try {
      const success = await dataService.deleteOpportunity(opportunityId);
      
      if (!success) {
        toast({
          title: "Error deleting opportunity",
          description: "Opportunity not found.",
        });
        return false;
      }

      setOpportunities(previous => previous.filter((opp) => opp.id !== opportunityId));
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: "Error deleting opportunity",
        description: "There was a problem deleting your opportunity.",
      });
      return false;
    }
  };

  return {
    opportunities: sortOpportunities(opportunities),
    loading,
    error,
    retry: fetchOpportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
};
