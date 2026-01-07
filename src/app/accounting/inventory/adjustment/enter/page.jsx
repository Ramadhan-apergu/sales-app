"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Empty,
  Form,
  List,
  Modal,
  Select,
  Table,
  Tooltip,
} from "antd";
import Layout from "@/components/accounting/Layout";
import {
  CheckOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import dayjs from "dayjs";
import { salesOrderAliases, stockAdjustmentAliases } from "@/utils/aliases";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";

function formatRupiah(number) {
  if (typeof number !== "number" || isNaN(number)) {
    return "Rp 0,-";
  }

  try {
    return "Rp " + number.toLocaleString("id-ID") + ",-";
  } catch (e) {
    return "Rp 0,-";
  }
}

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => {
      if (
        [
            "price"
        ].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center", // semua kolom di-align ke kanan
          render: (text) => <p>{formatRupiah(text)}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center", // semua kolom di-align ke kanan
        };
      }
    }),
    {
      title: "Action",
      key: "action",
      align: "center", // kolom action juga ke kanan
      render: (_, record) => (
        <Button type="link" onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="itemid"
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
  const [modal, contextHolder] = Modal.useModal();
  const title = "adjustment";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await ItemFetch.get(0, 10000);
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelItem = resData.list.map((item) => {
            return {
              ...item,
              label: item.displayname,
              value: item.id,
            };
          });
          setDataItem(addLabelItem);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data item");
      }
    }
    fetchItem();
  }, []);

  const initialState = {
    payloadPrimary: {
      trandate: dayjs(new Date()),
      memo: "",
    },
    stock_opname_det: [],
  };

  function reducer(state, action) {
    switch (action.type) {
      case "SET_PRIMARY":
        return {
          ...state,
          payloadPrimary: {
            ...state.payloadPrimary,
            ...action.payload,
          },
        };
      case "SET_STOCK":
        return {
          ...state,
          stock_opname_det: action.payload,
        };
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const keyTableItem = [
    "itemcode",
    "displayname",
    "onhand",
    "stockreal",
    "qty",
    "units",
    "price",
  ];

  const [itemTableTemp, setItemTableTemp] = useState({
    itemid: "",
    itemcode: "",
    displayname: "",
    onhand: 0,
    stockreal: 0,
    qty: 0,
    units: "",
    price: 0,
  });

  const [isModalItemOpen, setIsModalItemOpen] = useState(false);

  function handleModalItemCancel() {
    setItemTableTemp({
      itemid: "",
      itemcode: "",
      displayname: "",
      onhand: 0,
      stockreal: 0,
      qty: 0,
      units: "",
      price: 0,
    });
    setItemSelected(null);
    setIsModalItemOpen(false);
  }

  async function handleModalItemOk() {
    if (!itemTableTemp.itemid) {
      notify("error", "Error", "Select item first");
      return;
    }

    const isDuplicate = state.stock_opname_det.some(
      (tableItem) => tableItem.itemid === itemTableTemp.itemid
    );

    if (isDuplicate) {
      notify("error", "Error", "Item has been added.");
      return;
    }

   /*if (itemTableTemp.qty <= 0) {
      notify("error", "Error", "Please enter a quantity greater than 0.");
      return;
    }*/

    dispatch({
      type: "SET_STOCK",
      payload: [...state.stock_opname_det, itemTableTemp],
    });

    handleModalItemCancel();
  }

  function handleDeleteTableItem(record) {
    dispatch({
      type: "SET_STOCK",
      payload: state.stock_opname_det.filter(
        (item) => item.itemid !== record.itemid
      ),
    });
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
      };

      if (state.stock_opname_det.length <= 0) {
        throw new Error("Please enter item adjustment");
      }

      const stock_opname_det = state.stock_opname_det.map((data) => {
        let updateData = data;
        delete updateData.displayname;
        return updateData;
      });

      payloadToInsert = { ...payloadToInsert, stock_opname_det };

      if (!payloadToInsert.trandate) {
        throw new Error("Date is required");
      }

      if (
        !payloadToInsert.stock_opname_det ||
        payloadToInsert.stock_opname_det.length == 0
      ) {
        throw new Error("Please enter a item adjustment");
      }

      const response = await StockAdjustmentFetch.add(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/accounting/inventory/${title}`);
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
              Stock Adjustment Enter
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/accounting/inventory/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1"></div>
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
          </div>
          <InputForm
            title="primary"
            type="SET_PRIMARY"
            payload={state.payloadPrimary}
            data={[
              {
                key: "trandate",
                input: "date",
                isAlias: true,
                rules: [{ required: true, message: ` is required` }],
              },
              {
                key: "memo",
                input: "text",
                isAlias: true,
              },
            ]}
            aliases={stockAdjustmentAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />
          <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col gap-2">
              <Divider
                style={{
                  margin: "0",
                  textTransform: "capitalize",
                  borderColor: "#1677ff",
                }}
                orientation="left"
              >
                Adjustment
              </Divider>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    setIsModalItemOpen(true);
                  }}
                >
                  Add
                </Button>
              </div>
              <TableCustom
                onDelete={handleDeleteTableItem}
                data={state.stock_opname_det}
                keys={keyTableItem}
                aliases={stockAdjustmentAliases.adjustment}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
      <Modal
        open={isModalItemOpen}
        onOk={handleModalItemOk}
        onCancel={handleModalItemCancel}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
            <div className="w-full flex flex-col gap-8">
              <div className="w-full flex flex-col gap-2">
                <Divider
                  style={{
                    margin: "0",
                    textTransform: "capitalize",
                    borderColor: "#1677ff",
                  }}
                  orientation="left"
                >
                  Item
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <p>Item</p>
                  <Select
                    value={itemSelected?.value || undefined}
                    showSearch
                    placeholder="Select an item"
                    optionFilterProp="label"
                    onChange={(_, item) => {
                      const isDuplicate = state.stock_opname_det.some(
                        (tableItem) => tableItem.itemid === item.value
                      );

                      if (isDuplicate) {
                        notify("error", "Error", "Item has been added.");
                        setItemSelected(null);
                        setItemTableTemp({
                          itemid: "",
                          itemcode: "",
                          displayname: "",
                          onhand: 0,
                          stockreal: 0,
                          qty: 0,
                          units: "",
                          price: 0,
                        });
                        return;
                      }

                      setItemSelected(item);

                      setItemTableTemp((prev) => ({
                        ...prev,
                        itemid: item.id,
                        itemcode: item.itemid,
                        displayname: item.displayname,
                        onhand: item.stock,
                        stockreal: item.stock,
                        units: item.unitstype,
                        price: item.price,
                      }));
                    }}
                    options={dataItem}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <InputForm
                title="primary"
                type="SET_PRIMARY"
                payload={itemTableTemp}
                data={[
                  {
                    key: "itemid",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    hidden: true,
                  },
                  {
                    key: "itemcode",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                  },
                  {
                    key: "displayname",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                  },
                  {
                    key: "onhand",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                  },
                  {
                    key: "stockreal",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                  },
                  {
                    key: "qty",
                    input: "number",
                    isAlias: true,
                  },
                  {
                    key: "units",
                    input: "input",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                  },
                  {
                    key: "price",
                    input: "number",
                    isAlias: true,
                    isRead: true,
                    disabled: true,
                    accounting: true
                  },
                ]}
                aliases={stockAdjustmentAliases.adjustment}
                onChange={(type, payload) => {
                  setItemTableTemp({
                    ...payload,
                    stockreal: Number(payload.onhand) + Number(payload.qty),
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
