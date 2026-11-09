import { useEffect, useState } from "react";
import { dataService } from "@/lib/dataService";
import CommandCentre from "@/components/CommandCentre";
import Agenda from "@/pages/Agenda";
import { OpportunitiesModule } from "@/components/modules/OpportunitiesModule";

export default function CommandCentrePage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      await dataService.initialize();
      setAuthed(await dataService.isUserAuthenticated());
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <><Agenda hero /><div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8"><OpportunitiesModule /></div></>;
  }

  return <CommandCentre />;
}