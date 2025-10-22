"use client";

import React, { useState } from "react";
import { Button } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, LeftOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { itemAliases } from "@/utils/aliases";
import InputForm from "@/components/superAdmin/InputForm";
import { createResponseHandler } from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import ItemFetch from "@/modules/salesApi/item";

export default function CustomerNew() {
  const title = "item";
  const { notify, contextHolder } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");

  const [payloadGeneral, setPayloadGeneral] = useState({
    itemid: "",
    displayname: "",
    itemprocessfamily: "",
    dimensi: "",
    itemcategory: "Plastik",
  });

  const [payloadPricing, setPayloadPricing] = useState({
    price: 0,
    discount: 0,
    addons: 0,
    iseditable: 0,
  });

  const [payloadConversion, setPayloadConversion] = useState({
    unitstype: "KG",
    conversion: 0,
    unitstype2: "Bal",
  });

  const unitstypeOptions = [
    { label: "KG", value: "KG" },
    { label: "Bal", value: "Bal" },
    { label: "Kotak", value: "Kotak" },
  ];

  const editableOptions = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ];

  const categoryOptions = [
    { label: "Plastik", value: "Plastik" },
    { label: "Chemical", value: "Chemical" },
    { label: "Other", value: "Other" },
  ];

  const itemprocessfamilyOptions = [
    { label: "ASSOY B ITEM", value: "ASSOY B ITEM" },
    { label: "ASSOY C ITEM", value: "ASSOY C ITEM" },
    { label: "ASSOY DC BELANG", value: "ASSOY DC BELANG" },
    { label: "ASSOY EMBOSS", value: "ASSOY EMBOSS" },
    { label: "ASSOY HD", value: "ASSOY HD" },
    { label: "ASSOY HD CETAK", value: "ASSOY HD CETAK" },
    { label: "ASSOY HD CUSTOM", value: "ASSOY HD CUSTOM" },
    { label: "ASSOY HD35B", value: "ASSOY HD35B" },
    { label: "ASSOY K ITEM", value: "ASSOY K ITEM" },
    { label: "ASSOY PE CETAK", value: "ASSOY PE CETAK" },
    { label: "ASSOY PE CUSTOM", value: "ASSOY PE CUSTOM" },
    { label: "KANTONGAN HD", value: "KANTONGAN HD" },
    { label: "KANTONGAN HD CUSTOM", value: "KANTONGAN HD CUSTOM" },
    { label: "KANTONGAN PP", value: "KANTONGAN PP" },
    { label: "SARUNG TANGAN", value: "SARUNG TANGAN" },
    { label: "SELANG POMPA", value: "SELANG POMPA" },
    { label: "Y ITEM", value: "Y ITEM" },
    { label: "GULUNGAN PE", value: "GULUNGAN PE" },
  ];

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "primary":
        setPayloadGeneral(payload);
        break;
      case "conversion":
        setPayloadConversion(payload);
        break;
      default:
        setPayloadPricing(payload);
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const payloadToInsert = {
        ...payloadGeneral,
        ...payloadPricing,
        ...payloadConversion,
      };

      const {
        itemid,
        displayname,
        itemprocessfamily,
        price,
        unitstype,
        unitstype2,
        conversion,
        itemcategory,
      } = payloadToInsert;
      if (!itemid) {
        notify("error", "Failed", `${itemAliases["itemid"]} is required`);
        return;
      }

      if (!displayname) {
        notify("error", "Failed", `${itemAliases["displayname"]} is required`);
        return;
      }

      if (!itemprocessfamily) {
        notify(
          "error",
          "Failed",
          `${itemAliases["itemprocessfamily"]} is required`
        );
        return;
      }

      if (!price && itemcategory == "Plastik") {
        notify("error", "Failed", `price is required`);
        return;
      }

      if (!unitstype) {
        notify("error", "Failed", `${itemAliases["unitstype"]} is required`);
        return;
      }

      if (!unitstype2) {
        notify("error", "Failed", `${itemAliases["unitstype2"]} is required`);
        return;
      }

      if (!conversion) {
        notify("error", "Failed", `Conversation is required`);
        return;
      }

      const response = await ItemFetch.add(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}/${resData}`);
      }
    } catch (error) {
      console.error(error);
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
              Add New Item
            </p>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1">
                <Button icon={<LeftOutlined />} onClick={() => router.back()}>
                  {isLargeScreen ? "Back" : ""}
                </Button>
              </div>
              <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                <Button
                  type={"primary"}
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                >
                  {isLargeScreen ? "Submit" : ""}
                </Button>
              </div>
            </div>
            <div className="w-full flex flex-col gap-8">
              <InputForm
                type="primary"
                payload={payloadGeneral}
                data={[
                  {
                    key: "itemid",
                    input: "input",
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["itemid"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "displayname",
                    input: "input",
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["displayname"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "itemcategory",
                    input: "select",
                    options: categoryOptions,
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["itemcategory"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "itemprocessfamily",
                    input: "select",
                    options: itemprocessfamilyOptions,
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["itemprocessfamily"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "dimensi",
                    input: "input",
                    isAlias: true,
                  },
                ]}
                aliases={itemAliases}
                onChange={handleChangePayload}
              />

              <InputForm
                type="pricing"
                payload={payloadPricing}
                data={[
                  {
                    key: "price",
                    input: "number",
                    isAlias: false,
                    accounting: true,
                    rules: [{ required: true, message: `Price is required` }],
                  },
                  {
                    key: "addons",
                    input: "number",
                    isAlias: false,
                    accounting: true,
                  },
                  {
                    key: "discount",
                    input: "number",
                    isAlias: false,
                    accounting: true,
                    rules: [],
                    hidden: true,
                  },
                  {
                    key: "iseditable",
                    input: "select",
                    options: editableOptions,
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["iseditable"]} is required`,
                      },
                    ],
                  },
                ]}
                aliases={itemAliases}
                onChange={handleChangePayload}
              />

              <InputForm
                type="conversion"
                payload={payloadConversion}
                data={[
                  {
                    key: "unitstype",
                    input: "select",
                    options: unitstypeOptions,
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["unitstype"]} is required`,
                      },
                    ],
                  },
                  {
                    key: "unitstype2",
                    input: "select",
                    options: unitstypeOptions,
                    isAlias: true,
                    rules: [
                      {
                        required: true,
                        message: `${itemAliases["unitstype2"]} is required`,
                      },
                    ],
                    note: "Unit 2 bernilai 1",
                  },
                  {
                    key: "conversion",
                    input: "number",
                    isAlias: false,
                    rules: [
                      { required: true, message: `Conversion is required` },
                    ],
                    note: `
                    Isi Conversion untuk menentukan berapa Base Unit yang setara dengan Unit 2.`,
                  },
                ]}
                aliases={itemAliases}
                onChange={handleChangePayload}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextHolder}
    </>
  );
}
