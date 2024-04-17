"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

async function exportToExcel(data: any[], columns: any[], filename: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Worksheet");

  worksheet.columns = columns;

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    const timestamp = `${day}_${month}_${year}`;

    saveAs(blob, `${timestamp}_${filename}.xlsx`);
  });
}

interface ExportButtonProps {
  data: any[];
  columns: any[];
  filename: string;
}

export function ExportButton({ data, columns, filename }: ExportButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-sm"
      onClick={() => exportToExcel(data, columns, filename)}
    >
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only">Export</span>
    </Button>
  );
}