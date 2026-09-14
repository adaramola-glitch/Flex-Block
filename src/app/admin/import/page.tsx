import { requireRole } from "@/lib/require-role";
import { Card } from "@/components/ui/card";
import { ImportForm } from "@/components/import-form";

export default async function ImportPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Import student roster
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload a spreadsheet of students and their school email addresses. Each student gets
          an account ready and waiting — as soon as they sign in with that exact email, it
          matches up automatically with their name, ID number, and grade already filled in.
        </p>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            File format
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A CSV file (export &ldquo;Comma Separated Values&rdquo; from Excel or Google Sheets) with
            columns named <strong>Student ID</strong>, <strong>Name</strong>,{" "}
            <strong>Email</strong>, and optionally <strong>Grade</strong>. Column order
            doesn&apos;t matter.
          </p>
          <a
            href="/student-roster-template.csv"
            download
            className="mt-2 inline-block text-sm font-medium text-purple-700 hover:underline dark:text-purple-400"
          >
            Download a template CSV
          </a>
        </div>

        <ImportForm />
      </Card>

      <Card className="text-sm text-slate-600 dark:text-slate-400">
        <p>
          Importing again with the same file is safe — matching students (by email) get their
          name, ID, and grade refreshed instead of being duplicated. A row is skipped (not
          overwritten) if that email already belongs to a Teacher or Admin account.
        </p>
      </Card>
    </div>
  );
}
