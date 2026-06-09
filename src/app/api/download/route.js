import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request) {
  try {
    const { url, filename } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const ref = sheet["!ref"];

    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      const headers = {};
      const keepColumns = ["Item Id", "Item Processing Family"];

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = sheet[cellAddress];
        if (cell) {
          headers[col] = cell.v;
        }
      }

      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const header = headers[col];
          if (header && !keepColumns.includes(header)) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            delete sheet[cellAddress];
          }
        }
      }
    }

    const modifiedBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });

    return new Response(modifiedBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename || "export.xlsx"}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 },
    );
  }
}
