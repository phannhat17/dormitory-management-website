"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { Usertable } from "@/components/data-table/columns";

async function exportToExcel(users: Usertable[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ALL Users");

  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Name", key: "name", width: 32 },
    { header: "Email", key: "email", width: 32 },
    { header: "Role", key: "role", width: 32 },
    { header: "Status", key: "status", width: 32 },
  ];

  users.forEach((user) => {
    worksheet.addRow(user);
  });

  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const now = new Date();

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const date = now.toISOString().split("T")[0].replace(/-/g, "");

    saveAs(blob, `AllUsers_${hours}h${minutes}_${date}.xlsx`);
  });
}

interface ExportButtonProps {
  users: Usertable[];
}

export function ExportButton({ users }: ExportButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-sm"
      onClick={() => exportToExcel(users)}
    >
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only">Export</span>
    </Button>
  );
}