
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.user_name || "");
        setPhotoUrl(profile.photo_url || "");
      }
    };

    loadProfile();
  }, [navigate]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        setPhotoUrl(publicUrl);

        // Update profile with new photo URL
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            photo_url: publicUrl,
            user_name: name
          });

        if (updateError) throw updateError;

        toast({
          title: "Photo uploaded",
          description: "Your profile photo has been updated.",
        });
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your photo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_name: name,
          photo_url: photoUrl,
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your profile.",
        variant: "destructive",
      });
    }
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
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-dancing-script font-semibold text-gray-800">
              Welcome, {name || "Friend"}
            </h1>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera size={40} />
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  Upload Photo
                </Button>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
