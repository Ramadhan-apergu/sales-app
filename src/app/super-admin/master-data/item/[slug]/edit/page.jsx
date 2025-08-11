"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import CustomerFetch from "@/modules/salesApi/customer";
import { itemAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  deleteResponseHandler,
  getByIdResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import ItemFetch from "@/modules/salesApi/item";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";

export default function Edit() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await ItemFetch.getById(slug);
        const resData = getByIdResponseHandler(response, notify);

        setData(resData);

        if (resData) {
          mapingGroup(resData);
        }
      } catch (error) {
        const message =
          error?.message ||
          "Login failed! Server error, please try again later.";
        notify("error", "Error", message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const title = "item";

  const fieldGroups = {
    general: ["itemid", "displayname", "itemprocessfamily", "unitstype"],
    pricing: ["price", "discount"],
  };

  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.displayname}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await CustomerFetch.delete(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map((key) => [key, ""]))
  );
  const [pricing, setPricing] = useState(
    Object.fromEntries(fieldGroups.pricing.map((key) => [key, ""]))
  );

  function mapingGroup(data) {
    const pick = (keys) =>
      keys.reduce((obj, k) => {
        if (k == "createddate") {
          obj[k] = data[k] != null ? formatDateToShort(data[k]) : "";
        } else {
          obj[k] = data[k] != null ? data[k] : "";
        }
        return obj;
      }, {});

    setGeneral(pick(fieldGroups.general));
    setPricing(pick(fieldGroups.pricing));
  }

  const items = [
    {
      key: "1",
      label: "Delete",
      danger: true,
    },
  ];

  const unitstypeOptions = [
    { label: "KG", value: "kg" },
    // { label: "Bal", value: "bal" },
  ];

  const itemprocessfamilyOptions = [
    { label: "Assoy Cetak", value: "Assoy Cetak" },
    { label: "K-Item", value: "K-Item" },
    { label: "Emboss", value: "Emboss" },
    { label: "C-Item", value: "C-Item" },
    { label: "B-Item", value: "B-Item" },
    { label: "HD 35B", value: "HD 35B" },
    { label: "PP", value: "PP" },
    { label: "HDP", value: "HDP" },
    { label: "Assoy PE", value: "Assoy PE" },
    { label: "PE Gulungan", value: "PE Gulungan" },
  ];

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "primary":
        setGeneral(payload);
        break;
      default:
        setPricing(payload);
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const payloadToInsert = {
        ...general,
        ...pricing,
      };

      const { itemid, displayname, itemprocessfamily, price, unitstype } =
        payloadToInsert;
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

      if (!price) {
        notify("error", "Failed", `price is required`);
        return;
      }

      if (!unitstype) {
        notify("error", "Failed", `${itemAliases["unitstype"]}`);
        return;
      }

      const response = await ItemFetch.update(data.id, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      <Layout pageTitle="Edit Customer">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Item
            </p>
          </div>
          {!isLoading ? (
            <>
              {data ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1">
                      <Button
                        icon={<CloseOutlined />}
                        variant={"outlined"}
                        onClick={() => {
                          router.back();
                        }}
                      >
                        {isLargeScreen ? "Cancel" : ""}
                      </Button>
                      {contextHolder}
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        icon={<SaveOutlined />}
                        type={"primary"}
                        onClick={handleSubmit}
                      >
                        {isLargeScreen ? "Save" : ""}
                      </Button>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-8">
                    <InputForm
                      type="primary"
                      payload={general}
                      data={[
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
                      ]}
                      aliases={itemAliases}
                      onChange={handleChangePayload}
                    />

                    <InputForm
                      type="pricing"
                      payload={pricing}
                      data={[
                        {
                          key: "price",
                          input: "number",
                          isAlias: false,
                          accounting: true,
                          rules: [
                            { required: true, message: `Price is required` },
                          ],
                        },
                        {
                          key: "discount",
                          input: "number",
                          isAlias: false,
                          accounting: true,
                          rules: [],
                          hidden: true
                        },
                      ]}
                      aliases={itemAliases}
                      onChange={handleChangePayload}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-96">
                  <EmptyCustom />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96">
              <LoadingSpin />
            </div>
          )}
        </div>
      </Layout>
      {contextNotify}
      {isLoadingSubmit && <LoadingSpinProcessing />}
    </>
  );
}
