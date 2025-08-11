"use client";

import { Button } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import ReportSo from "@/modules/salesApi/report/salesAndSo";
import { getResponseHandler } from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";
import * as XLSX from "xlsx"; // kalau mau export Excel

export default function ExportProductionReport() {
  const { notify, contextHolder } = useNotification();

  // Mapping field ke nama header
  const fieldLabels = {
    no: "No",
    itemid: "Kode Barang",
    displayname: "Nama Barang",
    qty_belum: "Qty Belum",
    qty_stock: "Qty Stock",
    qty_sisa: "Qty Sisa",
    so_number: "SO Number",
    satuan: "Satuan",
  };

  const handleExport = async () => {
    try {
      const resData = await fetchData();

      if (!resData?.data?.length) {
        notify("warning", "Tidak ada data untuk diexport.");
        return;
      }

      // === Mapping header ===
      const headers = resData.keys.map((key) => fieldLabels[key] || key);

      // === Siapkan data untuk export ===
      const wsData = [
        headers, // header row
        ...resData.data.map((row) => resData.keys.map((key) => row[key])),
      ];

      // === Contoh Export Excel ===
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, "production_report.xlsx");
    } catch (error) {
      notify("error", "Export Failed.");
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await ReportSo.getProduct(null, 10000);
      let resData = getResponseHandler(response, notify);

      if (resData) {
        resData = resData.map((item, i) => ({
          no: i + 1,
          ...item,
        }));

        return {
          data: resData,
          length: resData.length,
          keys:
            Array.isArray(resData) && resData.length > 0
              ? Object.keys(resData[0]).filter(
                  (item) => !["item", "so_number"].includes(item.toLowerCase())
                )
              : [],
        };
      }

      return { data: [], keys: [] };
    } catch (error) {
      throw error;
    }
  };

  return (
    <Button onClick={handleExport} icon={<ExportOutlined />}>
      {contextHolder}
      Export
    </Button>
  );
}
