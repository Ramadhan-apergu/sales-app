import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportJSONToExcel(data, headerMap, filename = "data.xlsx") {
  const mappedData = data.map((item) => {
    const newItem = {};
    for (const key in headerMap) {
      newItem[headerMap[key]] = item[key] ?? "";
    }
    return newItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, filename);
}
