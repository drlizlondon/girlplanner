
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { User, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    navigate("/agenda");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 py-8 sm:py-12">
        <div className="text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-dancing-script bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text pb-2">
            My Agenda
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">Your Personal Task Manager</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 sm:space-y-6 mx-4 sm:mx-0">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Welcome!</h2>
            <p className="text-sm sm:text-base text-gray-600">Choose how you'd like to use your task manager</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 sm:py-4 rounded-lg transition-all duration-200 hover:shadow-lg text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Login / Sign Up
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/agenda")}
              variant="outline"
              className="w-full py-3 sm:py-4 rounded-lg transition-all duration-200 hover:shadow-lg text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Use Without Login
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Without login: Tasks stored locally on your device
            </p>
            <p className="text-xs text-gray-500">
              With login: Tasks synced across all your devices
            </p>
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

export default Index;
