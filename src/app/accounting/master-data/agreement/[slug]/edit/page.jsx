"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Divider,
  Table,
  Modal,
  Input,
  Pagination,
  Switch,
  Checkbox,
} from "antd";
import Layout from "@/components/accounting/Layout";
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

function SelectItem({ onselect, dataExist }) {
  const isLargeScreen = useBreakpoint("lg");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchName, setSearchName] = useState("");
  const [searchFamily, setSearchFamily] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const isFilter = searchName || searchFamily || searchCode;
      if (isFilter) {
        setPage(null);
        setLimit(null);
      } else {
        if (page == null || limit == null) {
          setPage(1);
          setLimit(50);
        }
      }
      const response = await ItemFetch.get(
        isFilter ? null : page == null ? 1 : page,
        isFilter ? null : limit == null ? 50 : limit,
        searchName || null,
        searchCode || null,
        searchFamily || null
      );
      const resData = getResponseHandler(response, notify);
      if (resData) {
        setDatas(resData.list);
        setTotalItems(resData.total_items);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsLoading(false);
      setSelectedItems([]);
      onselect([]);
    }
  };

  useEffect(() => {
    if (!searchCode && searchName === "" && searchFamily === "") {
      fetchData();
    }
  }, [page, limit]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchData();
    }
  };

  const toggleSelect = (item) => {
    if (dataExist.some((data) => data.itemid === item.id)) {
      notify("error", "Failed", "Data has already been added");
      return;
    }
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      const updated = exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item];
      onselect(updated);
      return updated;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = selectedItems.length === datas.length;
    const updated = allSelected ? [] : datas;
    setSelectedItems(updated);
    onselect(updated);
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedItems.length === datas.length && datas.length > 0}
          indeterminate={
            selectedItems.length > 0 && selectedItems.length < datas.length
          }
          onChange={toggleSelectAll}
        />
      ),
      dataIndex: "checkbox",
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedItems.some((i) => i.id === record.id)}
          onChange={() => toggleSelect(record)}
        />
      ),
    },
    {
      title: "Item Name/Number",
      dataIndex: "displayname",
      key: "displayname",
      fixed: isLargeScreen ? "left" : "",
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
          <div className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-1">
            <label className="hidden lg:block text-sm font-semibold leading-none">
              Display Name/Code
            </label>
            <Search
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onSearch={fetchData}
              onKeyDown={handleEnter}
              allowClear
              placeholder={isLargeScreen ? "" : "Name"}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="hidden lg:block text-sm font-semibold leading-none">
              Item P.Family
            </label>
            <Search
              value={searchFamily}
              onChange={(e) => setSearchFamily(e.target.value)}
              onSearch={fetchData}
              onKeyDown={handleEnter}
              allowClear
              placeholder={isLargeScreen ? "" : "Process family"}
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
          />
          {page && limit && (
            <div className="mt-2 flex justify-end">
              <Pagination
                total={totalItems}
                pageSize={limit}
                current={page}
                onChange={(newPage) => setPage(newPage)}
                size="small"
                onShowSizeChange={(current, size) => {
                  setLimit(size);
                }}
                pageSizeOptions={["50", "100"]}
              />
            </div>
          )}
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
  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await ItemFetch.get(page, 50, null, null, category);
      const resData = getResponseHandler(response, notify);
      if (resData) {
        setDatas(resData.list);
        setTotalItems(resData.total_items);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsLoading(false);
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    ...keys.map((key) => {
      if (agreementtype !== "addons" && key === "addons") return null;
      if (agreementtype !== "diskon" && key === "discountnominal") return null;
      return {
        title: aliases?.[key] || key,
        dataIndex: key,
        key,
        align: "right",
      };
    }),
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button type="link" danger onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    },
  ].filter(Boolean);

  const dataWithKey = paginatedData.map((item, idx) => ({
    ...item,
    _key: `row-${(currentPage - 1) * pageSize + idx}`,
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataWithKey}
      rowKey="_key"
      bordered
      pagination={{
        size: "small",
        current: currentPage,
        pageSize,
        total: data.length,
        onChange: (page) => setCurrentPage(page),
        showSizeChanger: false,
        showTotal: (total, range) =>
          `${range[0]}–${range[1]} of ${total} items`,
      }}
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
  const [itemprocessfamilyOptions, setItemprocessfamilyOptions] = useState([]);
  const [payloadCustomForm, setPayloadCustomForm] = useState({
    customform: "2",
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

  const fetchItemFamily = async () => {
    try {
      const response = await ItemFetch.getItemFamily();
      const resData = getResponseHandler(response, notify);
      if (resData && resData.list && resData.list.length > 0) {
        const listActive =
          resData.list.filter((item) => item.isdeleted == 0) || [];
        setItemprocessfamilyOptions(
          listActive.map((item) => ({ label: item.name, value: item.name }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

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
            const mappedData = resData.agreement_lines.map((item) => ({
              displayname: item.displayname,
              itemid: item.itemid,
              baseprice: item.baseprice,
              basepriceunit: item.basepriceunit,
              qtymin: item.qtymin,
              qtyminunit: item.qtyminunit,
              qtymax: item.qtymax,
              qtymaxunit: item.qtymaxunit,
              discountnominal: item.discountnominal,
              discountpercent: item.discountpercent,
              paymenttype: item.paymenttype,
              qtyfree: item.qtyfree,
              perunit: item.perunit,
              addons: item.addons,
            }));
            setPayloadDetail(mappedData);
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
          const dataWithLabel = resData.list.map((item) => ({
            ...item,
            label: item.displayname,
            value: item.id,
          }));
          setDataItem(dataWithLabel);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      }
    };

    fetchDataItem();
    fetchItemFamily();
  }, []);

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
      "displayname",
      "baseprice",
      "addons",
      "basepriceunit",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "discountpercent",
      "perunit",
    ],
    [
      "displayname",
      "baseprice",
      "addons",
      "basepriceunit",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "discountnominal",
      "perunit",
    ],
    [
      "displayname",
      "baseprice",
      "addons",
      "basepriceunit",
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
      "baseprice",
      "addons",
      "basepriceunit",
      "qtymin",
      "qtyminunit",
      "qtymax",
      "qtymaxunit",
      "qtyfree",
      "perunit",
    ],
    ["displayname"],
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Dispute", value: "dispute" },
    { label: "Pending Approval", value: "pending approval" },
  ];

  const agreementtypeOptions = [
    { label: "Diskon", value: "diskon" },
    { label: "Addons", value: "addons" },
  ];

  const unitOptions = [
    { label: "KG", value: "kg" },
    { label: "Bal", value: "bal" },
    { label: "Kotak", value: "kotak" },
  ];

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Credit", value: "credit" },
  ];

  const generateDataInput = (customform, agreementtype) => {
    const baseFields = [
      {
        key: "itemid",
        input: "input",
        isAlias: false,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
        hidden: true,
      },
      {
        key: "displayname",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
        hidden: true,
      },
      {
        key: "baseprice",
        input: "number",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
        hidden: true,
      },
      {
        key: "addons",
        input: "number",
        isAlias: true,
        accounting: true,
        hidden: agreementtype != "addons",
      },
      {
        key: "basepriceunit",
        input: "input",
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        disabled: true,
        hidden: true,
      },
      {
        key: "qtymin",
        input: "number",
        isAlias: true,
      },
      {
        key: "qtyminunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        hidden: true,
      },
      {
        key: "qtymax",
        input: "number",
        isAlias: true,
      },
      {
        key: "qtymaxunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
        hidden: true,
      },
      {
        key: "perunit",
        input: "select",
        options: unitOptions,
        isAlias: true,
        rules: [{ required: true, message: "is required!" }],
      },
    ];
    const specificFields = {
      1: [
        {
          key: "discountpercent",
          input: "number",
          isAlias: true,
          rules: [{ required: true, message: "is required!" }],
        },
      ],
      2: [
        {
          key: "discountnominal",
          input: "number",
          isAlias: true,
          rules: [{ required: true, message: "is required!" }],
          hidden: agreementtype != "diskon",
          accounting: true,
        },
      ],
      3: [
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
          accounting: true,
        },
      ],
      4: [
        {
          key: "qtyfree",
          input: "number",
          isAlias: true,
          rules: [{ required: true, message: "is required!" }],
        },
      ],
    };
    return baseFields.concat(specificFields[customform] || []);
  };

  function toInitialObject(keys) {
    return Object.fromEntries(keys.map((key) => [key, ""]));
  }

  const [payloadDetailInit, setPayloadDetailInit] = useState(
    toInitialObject(keys[parseInt(payloadCustomForm.customform) - 1])
  );

  const payloadDetailInitRef = useRef(payloadDetailInit);

  const applyDetail = useRef([]);

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
        agreement_lines: payloadDetail.map((line) => ({
          itemid: line.itemid,
          baseprice: line.baseprice,
          basepriceunit: line.basepriceunit,
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
            payloadGeneral.agreementtype != "addons" ? null : line?.addons || 0,
        })),
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
        return;
      }
      if (!agreementcode) {
        notify("error", "Error", "Agreement Code required");
        return;
      }
      if (!agreementname) {
        notify("error", "Error", "Agreement Name required");
        return;
      }
      if (!agreementtype && customform == 2) {
        notify("error", "Error", "Agreement Type required");
        return;
      }
      if (!status) {
        notify("error", "Error", "Status required");
        return;
      }

      const response = await AgreementFetch.update(slug, payload);
      const resData = updateResponseHandler(response, notify);
      if (resData) {
        router.push(`/accounting/master-data/${title}/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const formOptions = [
    { label: "Discount Percentage (%)", value: "1" },
    { label: "Special Price (Rp)", value: "2" },
    { label: "Payment Method", value: "3" },
    { label: "Free Item", value: "4" },
    { label: "Free Item", value: "5" },
  ];

  function handleSelectItem(instance) {
    let currentPayload = payloadDetailInitRef.current;
    let currentApplyDetail = applyDetail.current;

    if (currentApplyDetail.length == 0) {
      notify("error", "Error", "No items selected.");
      return;
    }

    const updatePayloadDetail = currentApplyDetail.map((record) => ({
      ...currentPayload,
      itemid: record.id,
      baseprice: record.price,
      basepriceunit: record.unitstype,
      displayname: record.displayname,
      qtyminunit: record.unitstype,
      qtymaxunit: record.unitstype,
    }));

    setPayloadDetail((prev) => [...prev, ...updatePayloadDetail]);

    const reset = toInitialObject(
      keys[parseInt(payloadCustomForm.customform) - 1]
    );
    setPayloadDetailInit(reset);
    payloadDetailInitRef.current = reset;
    applyDetail.current = [];
    instance.destroy();
  }

  function handleAddModalForm() {
    const instance = modal.confirm({
      icon: null,
      width: 1200,
      footer: null,
      content: (
        <div className="w-full flex flex-col gap-4 justify-end">
          <InputForm
            type="detailinit"
            title="Add Detail"
            payload={payloadDetailInitRef.current}
            data={generateDataInput(
              parseInt(payloadCustomForm.customform),
              payloadGeneral.agreementtype
            )}
            onChange={handleChangePayload}
            aliases={agreementAliases}
          />
          <Divider
            style={{
              margin: "0",
              textTransform: "capitalize",
              borderColor: "#1677ff",
            }}
            orientation="left"
          >
            Select Item
          </Divider>{" "}
          <SelectItem
            onselect={(records) => {
              applyDetail.current = records;
            }}
            dataExist={payloadDetail}
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                const reset = toInitialObject(
                  keys[parseInt(payloadCustomForm.customform) - 1]
                );
                setPayloadDetailInit(reset);
                applyDetail.current = [];
                instance.destroy();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => handleAddDetail(instance)}>
              OK
            </Button>
          </div>
        </div>
      ),
    });
  }

  function handleAddDetail(instance) {
    let currentPayload = payloadDetailInitRef.current;

    if (payloadGeneral.agreementtype.toLowerCase() === "addons") {
      if (!currentPayload?.addons || currentPayload.addons.length === 0) {
        notify("error", "Error", "Addons is required");
        return;
      }
    } else {
      if (
        !currentPayload?.discountnominal ||
        currentPayload.discountnominal.length === 0
      ) {
        notify("error", "Error", "Discount is required");
        return;
      }
    }

    if (!currentPayload.perunit) {
      notify("error", "Error", "per unit is required");
      return;
    }

    if (
      payloadCustomForm.customform == "3" ||
      payloadCustomForm.customform == 3
    ) {
      if (!currentPayload.paymenttype) {
        notify("error", "Error", "Payment type is required");
        return;
      }
    }

    currentPayload = {
      ...currentPayload,
      qtymin: !currentPayload.qtymin ? 0 : currentPayload.qtymin,
      qtymax: !currentPayload.qtymax ? 0 : currentPayload.qtymax,
    };

    payloadDetailInitRef.current = currentPayload;

    instance.destroy();
    handleSelectItem(instance);
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
                          cursorDisable: true,
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
                          <Button
                            type="primary"
                            onClick={() => {
                              const mapped = {
                                ...payloadDetailInit,
                                itemid: "",
                                baseprice: 0,
                                addons: 0,
                                basepriceunit: "",
                                displayname: "",
                                qtyminunit: "",
                                qtymaxunit: "",
                                discountnominal: 0,
                                paymenttype: "",
                              };
                              payloadDetailInitRef.current = mapped;
                              setPayloadDetailInit(mapped);
                              handleAddModalForm();
                            }}
                          >
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
                        <InputForm
                          title="Free Items"
                          type="group"
                          payload={payloadGroup}
                          data={[
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
