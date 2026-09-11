import { requireRole } from "@/lib/require-role";
import { createSessionAction } from "@/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { Card } from "@/components/ui/card";
import { todayIso } from "@/lib/dates";

export default async function NewSessionPage() {
  await requireRole("TEACHER");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        New Flex session
      </h1>
      <Card>
        <SessionForm
          action={createSessionAction}
          submitLabel="Create session"
          defaults={{
            title: "",
            description: "",
            date: todayIso(),
            startTime: "10:30",
            endTime: "11:00",
            room: "",
            capacity: 20,
            mandatory: false,
          }}
        />
      </Card>
    </div>
  );
}
