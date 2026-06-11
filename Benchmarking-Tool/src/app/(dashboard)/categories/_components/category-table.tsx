"use client";

import { Category } from "@/lib/types/facilities";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { faPenToSquare, faLayerGroup, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function CategoryTable({
  data,
  onDeleteAction
}: {data: Category[]; onDeleteAction: (id: number) => void;}) {
  const { user } = useAuth();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLayerGroup} className="w-3.5 h-3.5 text-slate-500" />
              Kategoriename
            </div>
          </th>

          {user?.role === "admin" && (
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
              Aktionen
            </th>
          )}
        </tr>
        </thead>

        <tbody className="bg-white divide-y divide-slate-100">
          {data.map(item => (
            <tr
              key={item.id}
              className="hover:bg-slate-50 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </span>
                </div>
              </td>

              {user?.role === "admin" && (
                <td className="px-6 py-4">
                  <div className="flex justify-end items-center gap-2">
                    <Link
                      href={`/categories/${item.id}/update`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                      border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50
                      hover:border-slate-300 active:bg-slate-100 transition-all shadow-sm"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                      <span>Bearbeiten</span>
                    </Link>

                    <button
                      onClick={() => onDeleteAction(item.id)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border
                      border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300
                      active:bg-red-100 transition-all shadow-sm cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                      <span>Löschen</span>
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
