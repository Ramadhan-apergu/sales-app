"use client";

import React, { useEffect, useState } from "react";
import { Button, Dropdown, Modal } from "antd";
import Layout from "@/components/salesIndoor/Layout";
import {
  EditOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import { itemAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  deleteResponseHandler,
  getByIdResponseHandler,
} from "@/utils/responseHandlers";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import ItemFetch from "@/modules/salesApi/item";
import UserManageFetch from "@/modules/salesApi/userManagement";
import { formatRupiah } from "@/utils/formatRupiah";

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    general: [
      "id",
      "itemid",
      "displayname",
      "itemprocessfamily",
      "saleunit",
      "stockunit",
      "createdby",
      "createddate",
      "dimensi",
      "itemcategory",
    ],
    pricing: ["price", "discount", "addons", "iseditable"],
    conversion: ["unitstype2", "conversion", "unitstype"],
  };

  const handleEdit = () => {
    router.push(`/sales-indoor/master-data/${title}/${data.id}/edit`);
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
      const response = await ItemFetch.delete(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/master-data/${title}`);
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

  const [conversion, setConversion] = useState(
    Object.fromEntries(fieldGroups.pricing.map((key) => [key, ""]))
  );

  async function mapingGroup(data) {
    const pick = async (keys) => {
      const obj = {};
      for (const k of keys) {
        if (k === "createddate") {
          obj[k] = data[k] != null ? formatDateToShort(data[k]) : "";
        } else if (k === "createdby") {
          obj[k] = data[k] != null ? await getUserById(data[k]) : "";
        } else if (k === "iseditable") {
          obj[k] = data[k] ? "Yes" : "No";
        } else if (["price", "discount"].includes(k)) {
          obj[k] = data[k] != null ? await formatRupiah(data[k]) : "";
        } else {
          obj[k] = data[k] != null ? data[k] : "";
        }
      }
      return obj;
    };

    setGeneral(await pick(fieldGroups.general));
    setPricing(await pick(fieldGroups.pricing));
    setConversion(await pick(fieldGroups.conversion));
  }

  async function getUserById(id) {
    try {
      const response = await UserManageFetch.getById(id);
      if (response.status_code == 200 && response.data) {
        return response?.data.name || "";
      } else {
        return null;
      }
    } catch (error) {
      notify("error", "Failed", "Fetch data item");
    }
  }

  const items = [
    {
      key: "1",
      label: "Delete",
      danger: true,
    },
  ];

  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        deleteModal();
        break;
      default:
        console.warn("Unhandled action:", key);
    }
  };

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Item Details
          </p>
          <Button
            icon={<UnorderedListOutlined />}
            type="link"
            onClick={() => {
              router.push(`/sales-indoor/master-data/${title}`);
            }}
          >
            {isLargeScreen ? "List" : ""}
          </Button>
        </div>
        {!isLoading ? (
          <>
            {data ? (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                  <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                    <p className="w-full lg:text-lg">
                      {data.displayname + " / " + data.itemid}
                    </p>
                    {/* <div>
                                                        <Tag style={{textTransform: 'capitalize', fontSize: '16px'}} color={data.status =='active' ? 'green' : 'red'}>{data.status}</Tag>
                                                    </div> */}
                  </div>
                  <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                    <Button
                      icon={<EditOutlined />}
                      type={"primary"}
                      onClick={handleEdit}
                    >
                      {isLargeScreen ? "Edit" : ""}
                    </Button>
                    {contextHolder}
                    <Dropdown
                      menu={{ items, onClick: handleClickAction }}
                      placement="bottomRight"
                    >
                      <Button icon={!isLargeScreen ? <MoreOutlined /> : null}>
                        {isLargeScreen ? "Action" : ""}
                      </Button>
                    </Dropdown>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-8">
                  <InputForm
                    isReadOnly={true}
                    type="primary"
                    payload={general}
                    data={[
                      { key: "displayname", input: "input", isAlias: true },
                      {
                        key: "id",
                        input: "input",
                        isAlias: true,
                        hidden: true,
                      },
                      { key: "itemid", input: "input", isAlias: true },
                      {
                        key: "itemcategory",
                        input: "input",
                        isAlias: true,
                      },
                      {
                        key: "itemprocessfamily",
                        input: "input",
                        isAlias: true,
                      },
                      {
                        key: "saleunit",
                        input: "input",
                        isAlias: true,
                        hidden: true,
                      },
                      {
                        key: "stockunit",
                        input: "input",
                        isAlias: true,
                        hidden: true,
                      },
                      { key: "dimensi", input: "input", isAlias: true },
                      { key: "createddate", input: "input", isAlias: true },
                    ]}
                    aliases={itemAliases}
                  />
                  <InputForm
                    isReadOnly={true}
                    type="pricing"
                    payload={pricing}
                    data={[
                      { key: "price", input: "input", isAlias: false },
                      { key: "addons", input: "input", isAlias: false },
                      {
                        key: "discount",
                        input: "input",
                        isAlias: false,
                        hidden: true,
                      },
                      { key: "iseditable", input: "input", isAlias: true },
                    ]}
                    aliases={itemAliases}
                  />

                  <InputForm
                    isReadOnly={true}
                    type="conversion"
                    payload={conversion}
                    data={[
                      { key: "unitstype", input: "input", isAlias: true },
                      {
                        key: "unitstype2",
                        input: "input",
                        isAlias: true,
                        note: "Unit 2 bernilai 1",
                      },
                      {
                        key: "conversion",
                        input: "input",
                        isAlias: true,
                        note: `
                    Conversion untuk menentukan berapa Base Unit yang setara dengan Unit 2.`,
                      },
                    ]}
                    aliases={itemAliases}
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
      {contextNotify}
    </Layout>
  );
}
