"use client";

import React, { useEffect, useState } from "react";
import { Button, Divider, Dropdown, Modal, Table, Tag } from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  EditOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  agreementAliases,
  customerAliases,
  itemAliases,
} from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  deleteResponseHandler,
  getByIdResponseHandler,
} from "@/utils/responseHandlers";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import AgreementFetch from "@/modules/salesApi/agreement";
import ItemFetch from "@/modules/salesApi/item";
import UserManageFetch from "@/modules/salesApi/userManagement";

function TableCustom({ data, keys, aliases, agreementtype }) {
  const columns = keys
    .map((key) => {
      if (agreementtype != "addons" && key == "addons") {
        return null;
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
        };
      }
    })
    .filter(Boolean);

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint("lg");
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [agreementGroupType, setAgreementGroupType] = useState("nominal");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await AgreementFetch.getById(slug);
        const resData = getByIdResponseHandler(response, notify);
        setData(resData);

        if (resData) {
          mapingGroup(resData);

          if (resData.agreement_groups) {
            const agreementGroups = resData.agreement_groups;
            if (
              agreementGroups?.qtyfree > 0 &&
              agreementGroups.unitfree != ""
            ) {
              setAgreementGroupType("freeitem");
            } else {
              setAgreementGroupType("nominal");
            }
          }
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

  const title = "agreement";

  const fieldGroups = {
    general: [
      "id",
      "customform",
      "agreementcode",
      "agreementname",
      "agreementtype",
      "effectivedate",
      "enddate",
      "status",
      "description",
      "createdby",
      "createddate",
    ],
    agreement_groups: ["agreement_groups"],
    agreement_lines: ["agreement_lines"],
  };

  const handleEdit = () => {
    router.push(`/super-admin/master-data/${title}/${data.id}/edit`);
  };

  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.agreementname}"?`,
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
      const response = await AgreementFetch.delete(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  const items = [
    // {
    //   key: '1',
    //   label: 'Approve'
    // },
    {
      key: "2",
      label: "Delete",
      danger: true,
    },
  ];

  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        notify("success", "Approve Boongan", ":P");
        break;
      case "2":
        deleteModal();
        break;
      default:
        console.warn("Unhandled action:", key);
    }
  };

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map((key) => [key, ""]))
  );
  const [agreementGroups, setAgreementGroups] = useState(
    Object.fromEntries(fieldGroups.agreement_groups.map((key) => [key, ""]))
  );
  const [agreementLines, setAgreementLines] = useState(
    Object.fromEntries(fieldGroups.agreement_lines.map((key) => [key, ""]))
  );
  const [agreementGroupItems, setAgreementGroupItems] = useState([]);
  const [agreementLinesWithItem, setAgreementLinesWithItem] = useState([]);

  useEffect(() => {
    async function getDataItem() {
      try {
        if (
          agreementGroups.agreement_groups &&
          typeof agreementGroups.agreement_groups === "object" &&
          agreementGroups.agreement_groups !== null &&
          "id" in agreementGroups.agreement_groups
        ) {
          let items = [];

          if (agreementGroups.agreement_groups.itemcategory) {
            const getItem = await getItemByCategory(
              agreementGroups.agreement_groups.itemcategory
            );
            if (getItem) {
              items = getItem.list;
            }
          }

          setAgreementGroupItems(items);
        }

        if (
          agreementLines.agreement_lines &&
          Array.isArray(agreementLines.agreement_lines) &&
          agreementLines.agreement_lines.length > 0
        ) {
          const promises = agreementLines.agreement_lines.map(
            async (agreement) => {
              let item = { displayname: "", price: "", unitstype: "" };

              const getItem = await getItemById(agreement.itemid);
              if (getItem) {
                item = {
                  displayname: getItem.displayname,
                  price: getItem.price,
                  unitstype: getItem.unitstype,
                };
              }

              return { ...agreement, ...item };
            }
          );

          const result = await Promise.all(promises);
          setAgreementLinesWithItem(result);
        }
      } catch (error) {
        notify("error", "Failed", "Fetch data item");
      }
    }
    getDataItem();
  }, [agreementGroups, agreementLines]);

  async function getItemById(id) {
    try {
      const response = await ItemFetch.getById(id);
      if (response.status_code == 200 && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      notify("error", "Failed", "Fetch data item");
    }
  }

  async function getItemByCategory(category) {
    try {
      const response = await ItemFetch.get(0, 10000, null, null, category);
      if (response.status_code == 200 && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      notify("error", "Failed", "Fetch data item");
    }
  }

  async function mapingGroup(data) {
    const pick = async (keys) => {
      const obj = {};
      for (const k of keys) {
        if (["createddate", "effectivedate", "enddate"].includes(k)) {
          obj[k] = data[k] != null ? formatDateToShort(data[k]) : data[k];
        } else if (["customform"].includes(k)) {
          obj[k] =
            data[k] != null
              ? formOptions[parseInt(data[k] - 1)].label
              : data[k];
        } else if (k === "createdby") {
          obj[k] = data[k] != null ? await getUserById(data[k]) : data[k];
        } else {
          obj[k] = data[k] != null ? data[k] : "";
        }
      }
      return obj;
    };

    const general = await pick(fieldGroups.general);
    const agreementGroups = await pick(fieldGroups.agreement_groups);
    const agreementLines = await pick(fieldGroups.agreement_lines);

    setGeneral(general);
    setAgreementGroups(agreementGroups);
    setAgreementLines(agreementLines);
  }

  const formOptions = [
    { label: "Discount Percentage (%)", value: "1" },
    { label: "Special Price (Rp)", value: "2" },
    { label: "Payment Method", value: "3" },
    { label: "Free Item", value: "4" },
    { label: "Discount Group", value: "5" },
  ];

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

  const keys = [
    [
      "displayname",
      "price",
      "addons",
      "unitstype",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "discountpercent",
      "perunit",
    ],
    [
      "displayname",
      "price",
      "addons",
      "unitstype",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "discountnominal",
      "perunit",
    ],
    [
      "displayname",
      "price",
      "addons",
      "unitstype",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "paymenttype",
      "discountnominal",
      "perunit",
    ],
    [
      "displayname",
      "price",
      "addons",
      "unitstype",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "qtyfree",
      "perunit",
    ],
    ["itemid", "displayname"],
  ];

  const dataformAgreementGroups = [
    [
      { key: "id", input: "input", isAlias: true, hidden: true },
      { key: "agreementid", input: "input", isAlias: true, hidden: true },
      { key: "itemcategory", input: "input", isAlias: true },
      { key: "qtymin", input: "input", isAlias: true },
      { key: "qtymax", input: "input", isAlias: true },
      { key: "discountnominal", input: "input", isAlias: true },
    ],
    [
      { key: "id", input: "input", isAlias: true, hidden: true },
      { key: "agreementid", input: "input", isAlias: true, hidden: true },
      { key: "itemcategory", input: "input", isAlias: true },
      { key: "qtymin", input: "input", isAlias: true },
      { key: "qtymax", input: "input", isAlias: true },
      { key: "qtyfree", input: "input", isAlias: true },
    ],
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Agreement Details
          </p>
          <Button
            icon={<UnorderedListOutlined />}
            type="link"
            onClick={() => {
              router.push(`/super-admin/master-data/${title}`);
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
                      {data.agreementcode + " / " + data.agreementname}
                    </p>
                    <div>
                      <Tag
                        style={{
                          textTransform: "capitalize",
                          fontSize: "16px",
                        }}
                        color={
                          data.status.toLowerCase() === "active"
                            ? "green"
                            : data.status.toLowerCase() === "pending approval"
                            ? "orange"
                            : "red"
                        }
                      >
                        {data.status}
                      </Tag>
                    </div>
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
                    type="Primary"
                    payload={general}
                    data={[
                      {
                        key: "id",
                        input: "input",
                        isAlias: true,
                        hidden: true,
                      },
                      { key: "customform", input: "input", isAlias: true },
                      { key: "agreementcode", input: "input", isAlias: true },
                      { key: "agreementname", input: "input", isAlias: true },
                      {
                        key: "agreementtype",
                        input: "input",
                        isAlias: true,
                        hidden: general.customform != 2,
                      },
                      { key: "effectivedate", input: "input", isAlias: true },
                      { key: "enddate", input: "input", isAlias: true },
                      { key: "status", input: "input", isAlias: true },
                      { key: "description", input: "text", isAlias: true },
                      { key: "createdby", input: "input", isAlias: true },
                      { key: "createddate", input: "input", isAlias: true },
                    ]}
                    aliases={agreementAliases}
                  />
                  {data.customform != 5 ? (
                    <div className="w-full flex flex-col gap-4">
                      <Divider
                        style={{
                          margin: "0",
                          textTransform: "capitalize",
                          borderColor: "#1677ff",
                        }}
                        orientation="left"
                      >
                        {formOptions[parseInt(data.customform) - 1].label}{" "}
                        Detail
                      </Divider>
                      <TableCustom
                        data={agreementLinesWithItem}
                        keys={keys[parseInt(data.customform) - 1]}
                        aliases={agreementAliases}
                        agreementtype={general.agreementtype}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-8">
                      <InputForm
                        isReadOnly={true}
                        type="agreement groups"
                        title={`agreement groups (${
                          agreementGroupType == "nominal"
                            ? "Price"
                            : "Free Item"
                        })`}
                        payload={agreementGroups.agreement_groups}
                        data={
                          agreementGroupType == "nominal"
                            ? dataformAgreementGroups[0]
                            : dataformAgreementGroups[1]
                        }
                        aliases={agreementAliases}
                      />
                      <div className="w-full flex flex-col gap-4">
                        <Divider
                          style={{
                            margin: "0",
                            textTransform: "capitalize",
                            borderColor: "#1677ff",
                          }}
                          orientation="left"
                        >
                          Agreement Groups Detail
                        </Divider>
                        <TableCustom
                          data={agreementGroupItems}
                          keys={keys[parseInt(data.customform) - 1]}
                          aliases={agreementAliases}
                        />
                      </div>
                    </div>
                  )}
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
