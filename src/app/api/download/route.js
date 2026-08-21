import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request) {
  try {
    const { url, filename } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const ref = sheet["!ref"];

    if (ref) {
      const range = XLSX.utils.decode_range(ref);

      // Tambah kolom baru di sebelah kanan kolom terakhir
      const newCol = range.e.c + 1;

      // Header "Convertation"
      const headerCell = XLSX.utils.encode_cell({
        r: range.s.r,
        c: newCol,
      });

      sheet[headerCell] = {
        t: "s",
        v: "Convertation",
      };

      // Isi seluruh baris data dengan string kosong
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: row,
          c: newCol,
        });

        sheet[cellAddress] = {
          t: "s",
          v: "",
        };
      }

      // Update range sheet agar kolom baru ikut tersimpan
      range.e.c = newCol;
      sheet["!ref"] = XLSX.utils.encode_range(range);
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
      { status: 500 }
    );
  }
}