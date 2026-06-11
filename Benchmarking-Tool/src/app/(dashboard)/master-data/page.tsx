import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import MasterDataUploadForm from "./master-data-upload-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daten-Upload"
}

export default function MasterDataPage() {
  return (
    <>
      <div className="flex items-start gap-3.5 mb-7">
        <div className="w-[42px] h-[42px] rounded-xl bg-brand-50 flex items-center justify-center text-lg shrink-0">
          <FontAwesomeIcon icon={faFileArrowUp} className="text-brand-500" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-bold text-gray-900">
            Einrichtungsdaten importieren
          </h1>
          <p className="mt-1 mb-0 text-gray-500 text-[13px]">
            Laden Sie eine Excel-Datei hoch, um Stammdaten zu importieren
          </p>
        </div>
      </div>

      <MasterDataUploadForm />
    </>
  );
}
