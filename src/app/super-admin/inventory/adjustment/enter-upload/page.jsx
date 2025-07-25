"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { Button, Flex, Table, Tag } from "antd";
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

  // Ambil keys TANPA is_valid
  const filteredKeys = keys.filter(
    (key) => key !== "is_valid" && key !== "messages"
  );

  // Kolom data normal
  const columns = filteredKeys.map((key) => ({
    dataIndex: key,
    key,
    title: aliases?.[key] || key,
  }));

  // Tambahkan kolom Validated di akhir
  columns.push({
    dataIndex: "messages",
    key: "validated",
    title: "Validated",
    render: (_, record) => {
      if (record.is_valid) {
        return <Tag color="green">Validated</Tag>;
      } else {
        return (
          <Flex gap="small" wrap="wrap">
            {record.messages?.map((msg, idx) => (
              <Tag key={idx} color="red">
                {msg}
              </Tag>
            ))}
          </Flex>
        );
      }
    },
  });

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
              console.log(findCheckItem);
              return {
                no: i + 1,
                ...item,
                is_valid: findCheckItem.is_valid,
                messages: findCheckItem.is_valid ? [] : ["Invalid Item"],
              };
            });

            console.log(updateJson);

            const countMap = {};

            updateJson.forEach((item) => {
              const name = item["Item Name/Number"];
              countMap[name] = (countMap[name] || 0) + 1;
            });

            // 2. Update is_valid jika duplikat
            updateJson = updateJson.map((item) => {
              const name = item["Item Name/Number"];
              if (countMap[name] > 1) {
                return {
                  ...item,
                  is_valid: false,
                  messages: [...item.messages, "Duplicate Item"],
                };
              }
              return item;
            });

            console.log(updateJson);
          }

          setParsedData(updateJson);
          setUploadedFile(file);
        } catch (err) {
          console.log(err);
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
