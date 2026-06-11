import CategoryCreateForm from "@/app/(dashboard)/categories/_components/category-create-form";
import { getServerUser } from "@/lib/auth/server";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Erstellen Sie eine Kategorie"
}

export default async function CategoryCreatePage() {
  const user = await getServerUser();
    
  if (user?.role !== "admin") {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">Berechtigungsfehler</h3>
          <p className="text-sm text-red-600 mt-1">Entschuldigung, Sie haben keine Berechtigung, diese Seite zu besuchen.</p>
        </div>
      </div>
    );
  }

  return <CategoryCreateForm />;
}
