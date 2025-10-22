"use client";

import React, { useState } from "react";
import { Button, Flex, Table, Tag, Upload } from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { createResponseHandler } from "@/utils/responseHandlers";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";
import * as XLSX from "xlsx";
import ItemFetch from "@/modules/salesApi/item";

function TableCustom({ data, aliases }) {
  if (!data?.length) return null;

  // Ambil semua key
  const keys = Object.keys(data[0] || {});

  // Pastikan "No" muncul paling depan
  const orderedKeys = ["No", ...keys.filter((k) => k !== "No")];

  const columns = orderedKeys.map((key) => ({
    dataIndex: key,
    key,
    title: aliases?.[key] || key,
  }));

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record, idx) => idx}
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "item";

  const [parsedData, setParsedData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const { Dragger } = Upload;

  const allowedHeaders = [
    "Item Id",
    "Item Processing Family",
    "Price Family",
    "Addons",
    "Price",
  ];

  const props = {
    name: "file",
    multiple: false,
    accept: ".xlsx",
    beforeUpload(file) {
      const isXlsx =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isXlsx) {
        notify(
          "error",
          "Invalid File",
          "Only Excel (.xlsx) files are allowed."
        );
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          if (!rows || rows.length <= 1) {
            notify("error", "Invalid File", "Excel file has no valid data.");
            return;
          }

          // Ambil header
          const rawHeaders = rows[0].map((h) => (h ? String(h).trim() : ""));

          // Map header yang valid
          const normalizedAllowed = allowedHeaders.map((h) =>
            h.toLowerCase().trim()
          );
          const headerIndexMap = {};
          rawHeaders.forEach((h, idx) => {
            const low = h.toLowerCase().trim();
            if (normalizedAllowed.includes(low)) {
              const allowedOriginal =
                allowedHeaders[normalizedAllowed.indexOf(low)];
              headerIndexMap[allowedOriginal] = idx;
            }
          });

          // Validasi header
          const missing = allowedHeaders.filter(
            (h) => headerIndexMap[h] === undefined
          );
          if (missing.length > 0) {
            notify(
              "error",
              "Invalid Header",
              `Missing columns: ${missing.join(", ")}`
            );
            return;
          }

          // Buat data JSON
          const json = rows
            .slice(1)
            .map((row, i) => {
              const obj = {};
              let allEmpty = true;
              Object.keys(headerIndexMap).forEach((key) => {
                const idx = headerIndexMap[key];
                const val = row[idx] ? String(row[idx]).trim() : "";
                obj[key] = val;
                if (val !== "") allEmpty = false;
              });
              obj["No"] = i + 1;
              return allEmpty ? null : obj;
            })
            .filter(Boolean);

          if (json.length === 0) {
            notify("error", "Invalid Data", "No valid data found in Excel.");
            return;
          }

          setParsedData(json);
          setUploadedFile(file);
        } catch (err) {
          console.error(err);
          notify("error", "Parse Error", "Failed to read Excel file.");
        }
      };

      reader.readAsArrayBuffer(file);
      return Upload.LIST_IGNORE;
    },
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
    setParsedData([]);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      notify("error", "No File", "Please upload a file first.");
      return;
    }

    setIsLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("files", uploadedFile);

      const response = await ItemFetch.updateUploadPrice(formData);
      const resData = await createResponseHandler(response, notify);

      if (resData) {
        setParsedData([]);
        setUploadedFile(null);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleDownloadTemplate = () => {
    const header = [
      ["Item Id", "Item Processing Family", "Price Family", "Addons", "Price"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(header);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "template.xlsx");
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Upload Item Price Data
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => router.push(`/super-admin/master-data/${title}`)}
            >
              {isLargeScreen ? "List Item" : ""}
            </Button>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-end items-center gap-2">
              {uploadedFile && (
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={handleDeleteFile}
                >
                  {uploadedFile.name}
                </Button>
              )}
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
              >
                {isLargeScreen ? "Template" : ""}
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
              >
                {isLargeScreen ? "Submit" : ""}
              </Button>
            </div>

            {!uploadedFile && parsedData.length === 0 && (
              <div className="w-full flex justify-center">
                <Upload.Dragger {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag Excel file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Only .xlsx or .xls files are accepted. Max 1 file per
                    upload.
                  </p>
                </Upload.Dragger>
              </div>
            )}

            {parsedData.length > 0 && (
              <TableCustom
                data={parsedData}
                aliases={{
                  No: "No",
                  "Item Id": "Item Id",
                  "Item Processing Family": "Item Processing Family",
                  "Price Family": "Price Family",
                  Addons: "Addons",
                  Price: "Price",
                }}
              />
            )}
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
