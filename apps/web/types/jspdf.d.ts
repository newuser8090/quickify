declare module "jspdf/dist/jspdf.umd.min" {
  import type { jsPDF as JsPDFType } from "jspdf";

  export const jsPDF: typeof JsPDFType;
}