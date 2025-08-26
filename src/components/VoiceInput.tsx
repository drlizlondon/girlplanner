import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onAddAndListen: () => void;
}

export const VoiceInput = ({ onTranscript, onAddAndListen }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const setupRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes("enter") || lowerTranscript.includes("submit")) {
          onTranscript("");
          onAddAndListen();
        } else if (lowerTranscript.includes("new item")) {
          onTranscript("");
          onAddAndListen();
        } else {
          onTranscript(transcript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        if (event.error !== 'aborted') {
          setIsListening(false);
          toast({
            title: "Recognition Error",
            description: `Error: ${event.error}. Try clicking the microphone again.`,
            variant: "destructive",
          });
        }
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          try {
            recognitionInstance.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
          }
        }
      };

      return recognitionInstance;
    } catch (error) {
      console.error('Error creating speech recognition:', error);
      toast({
        title: "Recognition Error",
        description: "Failed to initialize speech recognition. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [onTranscript, onAddAndListen, toast, isListening]);

  useEffect(() => {
    const recognitionInstance = setupRecognition();
    if (recognitionInstance) {
      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch (error) {
          console.error('Error aborting recognition:', error);
        }
      }
    };
  }, [setupRecognition]);

  const toggleListening = () => {
    if (isListening) {
      if (recognition) {
        try {
          recognition.stop();
          setIsListening(false);
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    } else {
      if (!recognition) {
        const newRecognition = setupRecognition();
        if (!newRecognition) return;
        setRecognition(newRecognition);
      }

      try {
        recognition.start();
        setIsListening(true);
        toast({
          title: "Listening",
          description: "Say your task. Say 'ENTER' to submit or 'NEW ITEM' to add and continue.",
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={`h-10 w-10 rounded-full ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
    </Button>
  );
};
