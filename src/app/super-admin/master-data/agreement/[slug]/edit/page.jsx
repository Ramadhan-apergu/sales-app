"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Table, Modal, Input, Pagination, Switch } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, LeftOutlined } from "@ant-design/icons";
import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import { agreementAliases } from "@/utils/aliases";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import InputForm from "@/components/superAdmin/InputForm";
import {
  getByIdResponseHandler,
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import ItemFetch from "@/modules/salesApi/item";
import Search from "antd/es/input/Search";
import AgreementFetch from "@/modules/salesApi/agreement";
import dayjs from "dayjs";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";

function SelectItem({ onselect }) {
  const isLargeScreen = useBreakpoint("lg");
  const [page, setPage] = useState(1);
  const offset = (page - 1) * 50;
  const [searchName, setSearchName] = useState("");
  const [searchFamily, setSearchFamily] = useState("");
  const [searchCode, setSearchCode] = useState();
  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(true);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();
  const title = "item";

  const fetchData = async () => {
    try {
      setIsloading(true);
      const response = await ItemFetch.get(
        offset,
        50,
        searchName === "" ? null : searchName,
        !searchCode || searchCode === "" ? null : searchCode,
        searchFamily === "" ? null : searchFamily
      );
      const resData = getResponseHandler(response, notify);
      if (resData) {
        setDatas(resData.list);
        setTotalItems(resData.total_items);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    if (!searchCode && searchName === "" && searchFamily === "") {
      fetchData();
    }
  }, [page]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchData();
    }
  };

  const columns = [
    //   {
    //     title: 'Internal ID',
    //     dataIndex: 'id',
    //     key: 'id',
    //     onHeaderCell: () => ({ style: { minWidth: 200 } }),
    //     onCell: () => ({ style: { minWidth: 200 } }),
    //   },
    {
      title: "Item Name/Number",
      dataIndex: "displayname",
      key: "displayname",
      fixed: isLargeScreen ? "left" : "",
      render: (text) => <span>{text}</span>,
      onHeaderCell: () => ({ style: { minWidth: 200 } }),
      onCell: () => ({ style: { minWidth: 200 } }),
    },
    {
      title: "Display Name/Code",
      dataIndex: "itemid",
      key: "itemid",
      onHeaderCell: () => ({ style: { minWidth: 180 } }),
      onCell: () => ({ style: { minWidth: 180 } }),
    },
    {
      title: "Item Process Family",
      dataIndex: "itemprocessfamily",
      key: "itemprocessfamily",
      onHeaderCell: () => ({ style: { minWidth: 200 } }),
      onCell: () => ({ style: { minWidth: 200 } }),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      {notificationContextHolder}
      <div className="w-full flex justify-between items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
        <div className="flex gap-2">
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="hidden lg:block text-sm font-semibold leading-none">
              Item Name/Number
            </label>
            <Input
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={handleEnter}
              placeholder={isLargeScreen ? "" : "Code"}
              allowClear
            />
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="hidden lg:block text-sm font-semibold leading-none">
              Display Name/Code
            </label>
            <Search
              placeholder={isLargeScreen ? "" : "Name"}
              allowClear
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
              }}
              onSearch={fetchData}
              onKeyDown={(e) => handleEnter(e)}
            />
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="hidden lg:block text-sm font-semibold leading-none">
              Item P.Family
            </label>
            <Search
              placeholder={isLargeScreen ? "" : "Process family"}
              allowClear
              value={searchFamily}
              onChange={(e) => {
                setSearchFamily(e.target.value);
              }}
              onSearch={fetchData}
              onKeyDown={(e) => handleEnter(e)}
            />
          </div>
        </div>
      </div>

      {!isLoading ? (
        <>
          <Table
            rowKey={(record) => record.id}
            size="small"
            pagination={false}
            columns={columns}
            dataSource={datas}
            scroll={{ x: "max-content" }}
            bordered
            tableLayout="auto"
            onRow={(record) => ({
              onClick: () => onselect(record),
            })}
          />
          <div className="mt-2 flex justify-end">
            <Pagination
              total={totalItems}
              pageSize={50}
              current={page}
              onChange={(newPage) => setPage(newPage)}
              size="small"
            />
          </div>
        </>
      ) : (
        <div className="w-full h-96">
          <LoadingSpin />
        </div>
      )}
    </div>
  );
}

function GroupItemList({ category }) {
  const isLargeScreen = useBreakpoint("lg");
  const [page, setPage] = useState(1);
  const offset = (page - 1) * 50;
  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const fetchData = async () => {
    try {
      setIsloading(true);
      const response = await ItemFetch.get(offset, 50, null, null, category);
      const resData = getResponseHandler(response, notify);
      if (resData) {
        setDatas(resData.list);
        setTotalItems(resData.total_items);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchData();
    }
  }, [page, category]);

  const columns = [
    {
      title: "Item Name/Number",
      dataIndex: "displayname",
      key: "displayname",
      fixed: isLargeScreen ? "left" : "",
      render: (text) => <span>{text}</span>,
      onHeaderCell: () => ({ style: { minWidth: 200 } }),
      onCell: () => ({ style: { minWidth: 200 } }),
    },
    {
      title: "Display Name/Code",
      dataIndex: "itemid",
      key: "itemid",
      onHeaderCell: () => ({ style: { minWidth: 180 } }),
      onCell: () => ({ style: { minWidth: 180 } }),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      {notificationContextHolder}
      {!isLoading ? (
        <>
          <Table
            rowKey={(record) => record.id}
            size="small"
            pagination={false}
            columns={columns}
            dataSource={datas}
            scroll={{ x: "max-content" }}
            bordered
            tableLayout="auto"
          />
          <div className="mt-2 flex justify-end">
            <Pagination
              total={totalItems}
              pageSize={50}
              current={page}
              onChange={(newPage) => setPage(newPage)}
              size="small"
            />
          </div>
        </>
      ) : (
        <div className="w-full h-96">
          <LoadingSpin />
        </div>
      )}
    </div>
  );
}

function TableCustom({ data, keys, aliases, onDelete, agreementtype }) {
  const columns = [
    ...keys.map((key) => {
      if (agreementtype != "addons" && key == "addons") {
        return null;
      } else if (agreementtype != "diskon" && key == "discountnominal") {
        return null;
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right", // semua kolom di-align ke kanan
        };
      }
    }),
    {
      title: "Action",
      key: "action",
      align: "right", // kolom action juga ke kanan
      render: (_, record) => (
        <Button type="link" onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    },
  ].filter(Boolean);

  const dataWithKey = data.map((item, idx) => ({
    ...item,
    _key: `row-${idx}`,
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataWithKey}
      rowKey="_key"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function AgreementEdit() {
  const { slug } = useParams();
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "agreement";
  const [data, setData] = useState(null);
  const [dataItem, setDataItem] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await AgreementFetch.getById(slug);
        const resData = getByIdResponseHandler(response, notify);
        setData(resData);

        if (resData) {
          mapingGroup(resData);

          if (resData.agreement_lines && resData.agreement_lines.length > 0) {
            const promises = resData.agreement_lines.map(async (agreement) => {
              let item = {
                id: "",
                itemid: "",
                displayname: "",
                price: 0,
                unitstype: "",
                addons: 0,
              };

              const getItem = await getItemById(agreement.itemid);
              if (getItem) {
                item = {
                  id: getItem.id,
                  itemid: getItem.itemid,
                  displayname: getItem.displayname,
                  price: getItem.price,
                  unitstype: getItem.unitstype,
                  addons: getItem.addons,
                };
              }

              const {
                qtymin,
                qtyminunit,
                qtymax,
                qtymaxunit,
                discountpercent,
                discountnominal,
                paymenttype,
                qtyfree,
                perunit,
              } = agreement;

              return {
                qtymin,
                qtyminunit,
                qtymax,
                qtymaxunit,
                discountpercent,
                discountnominal,
                paymenttype,
                qtyfree,
                perunit,
                ...item,
              };
            });

            const result = await Promise.all(promises);
            setPayloadDetail(result);
          }

          if (resData.agreement_groups) {
            let items = [];

            if (resData.agreement_groups.itemcategory) {
              const getItem = await getItemByCategory(
                resData.agreement_groups.itemcategory
              );
              if (getItem) {
                items = getItem.list;
              }
            }

            setPayloadDetail(items);
          }

          if (resData.agreement_groups) {
            const agreementGroups = resData.agreement_groups;
            if (
              agreementGroups?.qtyfree > 0 &&
              agreementGroups.unitfree != ""
            ) {
              setIsPayloadGroupItem(true);
            } else {
              setIsPayloadGroupItem(false);
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

    const fetchDataItem = async () => {
      try {
        const response = await ItemFetch.get(0, 10000, null, null, null);
        const resData = getResponseHandler(response);

        if (resData) {
          const dataWithLabel = resData.list.map((item) => {
            return {
              ...item,
              label: item.displayname,
              value: item.id,
            };
          });
          setDataItem(dataWithLabel);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      }
    };

    fetchDataItem();
  }, []);

  const [payloadCustomForm, setPayloadCustomForm] = useState({
    customform: "1",
  });

  const [payloadGeneral, setPayloadGeneral] = useState({
    agreementcode: "",
    agreementname: "",
    agreementtype: "",
    effectivedate: "",
    enddate: "",
    status: "active",
    description: "",
  });

  const [isPayloadGroupItem, setIsPayloadGroupItem] = useState(false);

  const [payloadGroup, setPayloadGroup] = useState({
    itemcategory: "",
    qtymin: 0,
    qtymax: 0,
    discountnominal: 0,
    qtyfree: 0,
  });

  const [payloadDetail, setPayloadDetail] = useState([]);

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "customform":
        setPayloadCustomForm(payload);
        clearPayloadDetail();
        break;
      case "primary":
        setPayloadGeneral(payload);
        break;
      case "detail":
        setPayloadDetail(payload);
        break;
      case "group":
        setPayloadGroup(payload);
        break;
      case "detailinit":
        setPayloadDetailInit(payload);
        payloadDetailInitRef.current = payload;
        break;
    }
  };
  const keys = [
    [
      "itemid",
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
      "itemid",
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
      "itemid",
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
      "itemid",
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

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Dispute", value: "dispute" },
    { label: "Pending Approval", value: "pending approval" },
  ];

  const unitOptions = [
    { label: "KG", value: "kg" },
    { label: "Bal", value: "bal" },
    { label: "Kotak", value: "kotak" },
  ];

  const agreementtypeOptions = [
    { label: "Diskon", value: "diskon" },
    { label: "Addons", value: "addons" },
  ];

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Credit", value: "credit" },
  ];

  const dataInput = [
    [
      {
        key: "id",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "itemid",
        input: "input",
        isAlias: false,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "displayname",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "price",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "addons",
        input: "number",
        isAlias: true,
        accounting: true,
        hidden: payloadGeneral.agreementtype != "addons",
      },
      {
        key: "unitstype",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "qtymin",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtyminunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymax",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymaxunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "discountpercent",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "perunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
    ],
    [
      {
        key: "id",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "itemid",
        input: "input",
        isAlias: false,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "displayname",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "price",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "addons",
        input: "number",
        isAlias: true,
        accounting: true,
        hidden: payloadGeneral.agreementtype != "addons",
      },
      {
        key: "unitstype",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "qtymin",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtyminunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymax",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymaxunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "discountnominal",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        hidden: payloadGeneral.agreementtype != "diskon",
      },
      {
        key: "perunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
    ],
    [
      {
        key: "id",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "itemid",
        input: "input",
        isAlias: false,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "displayname",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "price",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "addons",
        input: "number",
        isAlias: true,
        accounting: true,
        hidden: payloadGeneral.agreementtype != "addons",
      },
      {
        key: "unitstype",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "qtymin",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtyminunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymax",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymaxunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "paymenttype",
        input: "select",
        options: paymentOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "discountnominal",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "perunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
    ],
    [
      {
        key: "id",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "itemid",
        input: "input",
        isAlias: false,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "displayname",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "price",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "addons",
        input: "number",
        isAlias: true,
        accounting: true,
        hidden: payloadGeneral.agreementtype != "addons",
      },
      {
        key: "unitstype",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
      },
      {
        key: "qtymin",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtyminunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymax",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtymaxunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "qtyfree",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
      {
        key: "perunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
    ],
  ];

  function toInitialObject(keys) {
    return Object.fromEntries(keys.map((key) => [key, ""]));
  }

  const [payloadDetailInit, setPayloadDetailInit] = useState(
    toInitialObject(keys[parseInt(payloadCustomForm.customform) - 1])
  );

  const payloadDetailInitRef = useRef(payloadDetailInit);

  useEffect(() => {
    const customForm = parseInt(payloadCustomForm.customform);
    if (customForm < 5) {
      const initValueDetail = toInitialObject(keys[customForm - 1]);
      setPayloadDetailInit(initValueDetail);
      payloadDetailInitRef.current = initValueDetail;
    }
  }, [payloadCustomForm]);

  function clearPayloadDetail() {
    setPayloadDetail([]);
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      const payload = {
        ...payloadGeneral,
        customform: parseInt(payloadCustomForm.customform),
        agreement_lines: payloadDetail.map((line) => {
          return {
            itemid: line.id,
            baseprice: line.price,
            basepriceunit: line.unitstype,
            qtymin: line.qtymin,
            qtyminunit: line.qtyminunit,
            qtymax: line.qtymax,
            qtymaxunit: line.qtymaxunit,
            discountnominal: line?.discountnominal || 0,
            discountpercent: line?.discountpercent || 0,
            paymenttype: line?.paymenttype || "",
            qtyfree: line?.qtyfree || 0,
            perunit: line?.perunit,
            addons:
              payloadGeneral.agreementtype != "addons"
                ? null
                : line?.addons || 0,
          };
        }),
        agreement_groups: {
          ...payloadGroup,
          qtyfree: payloadGroup?.qtyfree || 0,
          discountnominal: payloadGroup?.discountnominal || 0,
        },
      };

      const {
        customform,
        agreementcode,
        agreementname,
        agreementtype,
        status,
      } = payload;

      if (!customform) {
        notify("error", "Error", "Customer Form is required");
        return null;
      }

      if (!agreementcode) {
        notify("error", "Error", "Agreement Code required");
        return null;
      }

      if (!agreementname) {
        notify("error", "Error", "Agreement Name required");
        return null;
      }

      if (!agreementtype) {
        notify("error", "Error", "Agreement Type required");
        return null;
      }

      if (!status) {
        notify("error", "Error", "Status required");
        return null;
      }

      const response = await AgreementFetch.update(slug, payload);

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

  const formOptions = [
    // { label: "Discount Percentage (%)", value: "1" },
    { label: "Special Price (Rp)", value: "2" },
    { label: "Payment Method", value: "3" },
    // { label: "Free Item", value: "4" },
    { label: "Free Item", value: "5" },
  ];

  function handleSelectItem(record) {
    const mapped = {
      ...payloadDetailInit,
      id: record.id,
      itemid: record.itemid,
      price: record.price,
      unitstype: record.unitstype,
      displayname: record.displayname,
    };

    payloadDetailInitRef.current = mapped;
    setPayloadDetailInit(mapped);
  }

  function handleAddModalForm() {
    const instance = modal.confirm({
      icon: null,
      width: 850,
      footer: null,
      content: (
        <div className="w-full flex flex-col gap-4 justify-end">
          <InputForm
            type="detailinit"
            title="Add Detail"
            payload={payloadDetailInitRef.current}
            data={dataInput[parseInt(payloadCustomForm.customform - 1)]}
            onChange={handleChangePayload}
            aliases={agreementAliases}
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                const reset = toInitialObject(
                  keys[parseInt(payloadCustomForm.customform) - 1]
                );
                setPayloadDetailInit(reset);
                instance.destroy();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleAddDetail(instance);
              }}
            >
              OK
            </Button>
          </div>
        </div>
      ),
    });
  }

  function handleAddModalItem() {
    const instance = modal.confirm({
      icon: null,
      footer: null,
      width: 850,
      content: (
        <div className="w-full flex flex-col gap-4 justify-end">
          <SelectItem
            onselect={(record) => {
              handleSelectItem(record);
              instance.destroy();
              handleAddModalForm();
            }}
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                const reset = toInitialObject(
                  keys[parseInt(payloadCustomForm.customform) - 1]
                );
                setPayloadDetailInit(reset);
                instance.destroy();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
    });
  }

  function handleAddDetail(instance) {
    const currentPayload = payloadDetailInitRef.current;

    currentPayload = {
      ...currentPayload,
      discountnominal: !currentPayload.discountnominal
        ? 0
        : currentPayload.discountnominal,
    };

    const isAnyEmpty = Object.values(currentPayload).some(
      (value) => value === "" || value === null || value === undefined
    );

    if (isAnyEmpty) {
      notify("error", "Error", "All fields are required");
      return;
    }

    setPayloadDetail((prev) => [...prev, currentPayload]);

    const reset = toInitialObject(
      keys[parseInt(payloadCustomForm.customform) - 1]
    );
    setPayloadDetailInit(reset);
    payloadDetailInitRef.current = reset;
    instance.destroy();
  }

  function handleDeleteDetail(record) {
    setPayloadDetail((prev) =>
      prev.filter((item) => item.itemid !== record.itemid)
    );
  }

  const mapingGroup = (data) => {
    const customformData = {
      customform:
        typeof data.customform === "number"
          ? String(data.customform)
          : data.customform,
    };
    const generalData = {
      agreementcode: data.agreementcode,
      agreementname: data.agreementname,
      agreementtype: data.agreementtype,
      effectivedate: dayjs(data.effectivedate),
      enddate: dayjs(data.enddate),
      status: data.status,
      description: data.description,
    };

    setPayloadCustomForm(customformData);
    setPayloadGeneral(generalData);
    setPayloadGroup(data.agreement_groups);
    //   setPayloadDetail(data.agreement_lines)
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Agreement
            </p>
          </div>
          {!isLoading ? (
            <>
              {data ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1">
                      <Button
                        icon={<LeftOutlined />}
                        onClick={() => router.back()}
                      >
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
                      type="customform"
                      title="Form Type"
                      payload={payloadCustomForm}
                      data={[
                        {
                          key: "customform",
                          input: "select",
                          options: formOptions,
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${agreementAliases["customform"]} is required`,
                            },
                          ],
                        },
                      ]}
                      onChange={(type, payload) => {
                        handleChangePayload(type, payload);
                        setPayloadGeneral((prev) => ({
                          ...prev,
                          agreementtype: "diskon",
                        }));
                      }}
                      aliases={agreementAliases}
                    />
                    <InputForm
                      title={"primary"}
                      type="primary"
                      payload={payloadGeneral}
                      data={[
                        {
                          key: "agreementcode",
                          input: "input",
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${agreementAliases["agreementcode"]} is required`,
                            },
                          ],
                        },
                        {
                          key: "status",
                          input: "select",
                          isAlias: true,
                          options: statusOptions,
                          rules: [
                            { required: true, message: `Status is required` },
                          ],
                        },
                        {
                          key: "agreementname",
                          input: "input",
                          isAlias: true,
                          rules: [
                            {
                              required: true,
                              message: `${agreementAliases["agreementname"]} is required`,
                            },
                          ],
                        },
                        {
                          key: "agreementtype",
                          input: "select",
                          isAlias: true,
                          options: agreementtypeOptions,
                          rules: [
                            {
                              required: true,
                              message: `Agreement type is required`,
                            },
                          ],
                          hidden: payloadCustomForm.customform != 2,
                        },
                        { key: "effectivedate", input: "date", isAlias: true },
                        { key: "enddate", input: "date", isAlias: true },
                        { key: "description", input: "text", isAlias: true },
                      ]}
                      aliases={agreementAliases}
                      onChange={handleChangePayload}
                    />
                    {payloadCustomForm.customform != 5 ? (
                      <div className="w-full flex flex-col gap-4">
                        <Divider
                          style={{
                            margin: "0",
                            textTransform: "capitalize",
                            borderColor: "#1677ff",
                          }}
                          orientation="left"
                        >
                          {
                            formOptions[
                              parseInt(payloadCustomForm.customform) - 1
                            ].label
                          }{" "}
                          Detail
                        </Divider>
                        <div className="flex justify-end">
                          <Button type="primary" onClick={handleAddModalItem}>
                            Add
                          </Button>
                        </div>
                        <TableCustom
                          onDelete={handleDeleteDetail}
                          data={payloadDetail}
                          keys={
                            keys[parseInt(payloadCustomForm.customform) - 1]
                          }
                          aliases={agreementAliases}
                          agreementtype={payloadGeneral.agreementtype}
                        />
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-4">
                        {/* <div className="flex justify-end gap-2 items-center">
                          <Switch
                            size="small"
                            checked={isPayloadGroupItem}
                            onChange={() => {
                              setIsPayloadGroupItem(!isPayloadGroupItem);
                              setPayloadGroup((prev) => ({
                                ...prev,
                                discountnominal: 0,
                                qtyfree: 0,
                                unitfree: "",
                                itemfree: "",
                              }));
                            }}
                          />
                          <p className="font-semibold">Free Item Type</p>
                        </div> */}
                        {!isPayloadGroupItem ? (
                          <InputForm
                            title="agreement groups (Price)"
                            type="group"
                            payload={payloadGroup}
                            data={[
                              {
                                key: "id",
                                input: "input",
                                isAlias: false,
                                isRead: true,
                                hidden: true,
                              },
                              {
                                key: "agreementid",
                                input: "input",
                                isAlias: false,
                                isRead: true,
                                hidden: true,
                              },
                              {
                                key: "itemcategory",
                                input: "select",
                                options: itemprocessfamilyOptions,
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "qtymin",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "qtymax",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "discountnominal",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                            ]}
                            aliases={agreementAliases}
                            onChange={handleChangePayload}
                          />
                        ) : (
                          <InputForm
                            title="agreement groups (Items)"
                            type="group"
                            payload={payloadGroup}
                            data={[
                              {
                                key: "id",
                                input: "input",
                                isAlias: false,
                                isRead: true,
                                hidden: true,
                              },
                              {
                                key: "agreementid",
                                input: "input",
                                isAlias: false,
                                isRead: true,
                                hidden: true,
                              },
                              {
                                key: "itemcategory",
                                input: "select",
                                options: itemprocessfamilyOptions,
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "qtymin",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "qtymax",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                              {
                                key: "qtyfree",
                                input: "number",
                                isAlias: true,
                                rules: [
                                  { required: true, message: "is required!" },
                                ],
                              },
                            ]}
                            aliases={agreementAliases}
                            onChange={handleChangePayload}
                          />
                        )}
                        <GroupItemList category={payloadGroup.itemcategory} />
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
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextHolder}
      {contextNotify}
    </>
  );
}
