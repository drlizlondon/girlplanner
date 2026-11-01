import { format } from "date-fns";
import { ProcessingInboxModule } from "./modules/ProcessingInboxModule";
import { TodayList } from "./today/TodayList";

// GPL-1: Today is the list. Activity and the briefings archive live on /summary.
export default function CommandCentre() {
  return (
    <div className="px-3 sm:px-6 lg:px-8 py-5 max-w-3xl mx-auto space-y-5">
      <header className="px-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          {format(new Date(), "EEEE • d MMMM yyyy")}
        </div>
        <h1 className="mt-1 text-4xl font-dancing-script text-purple-700 dark:text-purple-300 font-bold leading-tight">
          Today
        </h1>
      </header>

      <TodayList />

      <ProcessingInboxModule span={12} title="New to review" hideWhenEmpty />
    </div>
  );
}
