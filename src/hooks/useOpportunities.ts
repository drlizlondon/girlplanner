import { useState, useEffect } from "react";
import { Opportunity } from "@/types/opportunity";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/lib/dataService";

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      await dataService.initialize();
      fetchOpportunities();
    };
    initializeData();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const data = await dataService.getOpportunities();
      setOpportunities(data.map(opp => ({
        ...opp,
        deadline_date: opp.deadline_date ? new Date(opp.deadline_date) : undefined,
      })));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: "Error loading opportunities",
        description: "There was a problem loading your opportunities.",
      });
    }
  };

  const addOpportunity = async (title: string, deadline_date?: Date, details?: string) => {
    if (!title.trim()) return;

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

      setOpportunities([formattedOpportunity, ...opportunities]);
      toast({
        title: "Opportunity added",
        description: "Your new opportunity has been added.",
      });
    } catch (error) {
      console.error('Error adding opportunity:', error);
      toast({
        title: "Error adding opportunity",
        description: "There was a problem adding your opportunity.",
      });
    }
  };

  const updateOpportunity = async (opportunityId: string, updates: Partial<Opportunity>) => {
    try {
      const localUpdates = {
        ...updates,
        deadline_date: updates.deadline_date?.toISOString(),
      };

      delete localUpdates.deadline_date;

      const updatedOpportunity = await dataService.updateOpportunity(opportunityId, localUpdates);
      
      if (!updatedOpportunity) {
        toast({
          title: "Error updating opportunity",
          description: "Opportunity not found.",
        });
        return;
      }

      setOpportunities(
        opportunities.map((opp) => {
          if (opp.id === opportunityId) {
            return { ...opp, ...updates };
          }
          return opp;
        })
      );
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast({
        title: "Error updating opportunity",
        description: "There was a problem updating your opportunity.",
      });
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
        return;
      }

      setOpportunities(opportunities.filter((opp) => opp.id !== opportunityId));
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed.",
      });
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: "Error deleting opportunity",
        description: "There was a problem deleting your opportunity.",
      });
    }
  };

  return {
    opportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
};
