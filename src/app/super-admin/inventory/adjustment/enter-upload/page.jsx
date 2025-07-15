"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { Button, Table, Tag } from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  DeleteOutlined,
  InboxOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";
import { Upload } from "antd";
import * as XLSX from "xlsx";

function TableCustom({ data, aliases }) {
  if (!data?.length) return null;

  const keys = Object.keys(data[0] || {});
  const columns = keys.map((key) =>
    key == "is_valid"
      ? {
          dataIndex: key,
          key,
          title: aliases?.[key] || key,
          render: (text) => (
            <Tag color={text ? "green" : "red"}>
              {text ? "Valid" : "Invalid"}
            </Tag>
          ),
        }
      : {
          dataIndex: key,
          key,
          title: aliases?.[key] || key,
        }
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={"no"}
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
  const title = "adjustment";

  const [parsedData, setParsedData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const { Dragger } = Upload;

  const props = {
    name: "file",
    multiple: false,
    accept: ".xlsx, .xls",
    beforeUpload(file) {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        notify(
          "error",
          "Invalid File",
          "Only Excel (.xlsx/.xls) files are allowed."
        );
        return false;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (json.length === 0) {
            notify("error", "Invalid Content", "Excel file is empty.");
            return;
          }

          const itemids = json.map((item) => {
            return item["Item Name/Number"];
          });

          let checkData = await checkItem(itemids);
          let updateJson = [];

          if (checkData) {
            const checkMap = new Map(
              checkData.map((item) => [item.itemid, item])
            );

            updateJson = json.map((item, i) => {
              const findCheckItem = checkMap.get(item["Item Name/Number"]);
              return {
                no: i + 1,
                ...item,
                is_valid: findCheckItem ? findCheckItem.is_valid : false,
              };
            });
          }

          setParsedData(updateJson);
          setUploadedFile(file);
        } catch (err) {
          notify("error", "Parse Error", "Failed to read Excel file.");
        }
      };

      reader.onerror = (error) => {
        notify("error", "Read Error", error.message);
      };

      reader.readAsArrayBuffer(file);

      return false; // prevent auto upload
    },
  };

  const checkItem = async (items) => {
    try {
      const response = await StockAdjustmentFetch.validasiItem({
        itemid: items,
      });
      const resData = await getResponseHandler(response, notify);
      return resData;
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    }
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

    if (parsedData.filter((item) => item.is_valid == false).length > 0) {
      notify("error", "Invalid", "There are invalid items.");
      return;
    }

    setIsLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append("files", uploadedFile);

      const response = await StockAdjustmentFetch.addWithFile(formData);
      const resData = await createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/inventory/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Stock Adjustment Upload Data
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => router.push(`/super-admin/inventory/${title}`)}
            >
              {isLargeScreen ? "List" : ""}
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
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
              >
                {isLargeScreen ? "Submit" : ""}
              </Button>
            </div>
            {!uploadedFile && parsedData.length == 0 && (
              <div className="w-full flex justify-center">
                <Dragger {...props}>
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
                </Dragger>
              </div>
            )}

            {parsedData.length > 0 && (
              <TableCustom
                data={parsedData}
                aliases={{ is_valid: "Validated", no: "No" }}
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
