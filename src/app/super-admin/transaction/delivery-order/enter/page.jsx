"use client";

import React, {
  memo,
  Suspense,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
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
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter, useSearchParams } from "next/navigation";
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
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import SalesOrderSelect from "./SalesOrderSelect";
import { deliveryOrderAliases } from "@/utils/aliases";

function TableCustom({ data, keys, aliases, onEdit, onChecked }) {
  console.log(data);
  const columns = [
    ...keys.map((key) => {
      if (key == "apply") {
        return {
          title: "Apply",
          key: "apply",
          align: "center", // tengah biar rapi
          render: (_, record) => (
            <Checkbox
              checked={record.apply}
              onChange={(e) => {
                onChecked(record.lineid, e.target.checked);
              }}
            />
          ),
        };
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
        <Button
          disabled={!record.apply}
          type="link"
          onClick={() => onEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="lineid"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

function Enter({ salesOrderId }) {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "delivery-order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataSalesOrder, setDataSalesOrder] = useState({});
  const [dataCustomer, setDataCustomer] = useState({});
  const [dataSalesOrderItemRetrieve, setDataSalesOrderItemRetrieve] = useState(
    {}
  );

  const [editItem, setEditItem] = useState(null);
  const [isEditItem, setIsEditItem] = useState(false);

  const initialState = {
    payloadPrimary: {
      salesorderid: "",
      createdfrom: "",
      customer: "",
      entity: "",
      trandate: dayjs(new Date()),
      shipstatus: "open",
      memo: "",
    },
    payloadShipping: {
      notes: "",
      shippingaddress: "",
    },
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
      case "SET_SHIPPING":
        return {
          ...state,
          payloadShipping: {
            ...state.payloadShipping,
            ...action.payload,
          },
        };
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesOrderRes = await SalesOrderFetch.getById(salesOrderId);
        const salesOrderData = getResponseHandler(salesOrderRes);
        if (!salesOrderData) throw new Error("Failed to fetch sales order");

        const customerRes = await CustomerFetch.getById(salesOrderData.entity);
        const customerData = getResponseHandler(customerRes);
        if (!customerData) throw new Error("Failed to fetch customer");

        const soItemRes = await FullfillmentFetch.getSoItem(salesOrderId);
        let soItemData = getResponseHandler(soItemRes);
        if (!soItemData) throw new Error("Failed to fetch fulfillment items");

        setDataSalesOrder(salesOrderData);
        setDataCustomer(customerData);
        setDataSalesOrderItemRetrieve(soItemData);
        setDataTableItem(
          soItemData.map((item) => ({
            apply: false,
            displayname: item.displayname,
            id: item.id,
            itemid: item.itemid,
            memo: item.memo,
            quantityremaining: item.quantityremaining,
            quantity1: item.quantity,
            unit1: item.units,
            quantity2:
              item.units.toLowerCase() == "bal"
                ? item.quantity * 1
                : item.quantity / 25,
            unit2: "bal",
            location: "General Warehouse",
            lineid: crypto.randomUUID(),
          }))
        );

        dispatch({
          type: "SET_PRIMARY",
          payload: {
            salesorderid: salesOrderData.id,
            createdfrom: salesOrderData.tranid,
            customer: customerData.companyname,
            entity: customerData.id,
          },
        });

        dispatch({
          type: "SET_SHIPPING",
          payload: {
            shippingaddress: customerData.addressee,
            notes: salesOrderData.notes,
          },
        });
      } catch (error) {
        notify("error", "Error", error.message || "Failed to fetch data");
      }
    };

    fetchData();
  }, [salesOrderId, router]);

  const shipAddressOptions = [
    { label: "Custom", value: 0 },
    { label: "Default Address", value: 1 },
  ];

  const keyTableItem = [
    "apply",
    "itemid",
    "displayname",
    // "location",
    "quantity1",
    "quantity2",
    "quantityremaining",
    "memo",
  ];

  const [dataTableItem, setDataTableItem] = useState([]);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadShipping,
      };

      delete payloadToInsert.customer;

      let fulfillment_items = dataTableItem.filter(
        (item) => item.apply == true
      );

      fulfillment_items = fulfillment_items.map((data) => {
        return {
          item: data.id,
          memo: data.memo,
          location: data.location,
          quantityremaining: data.quantityremaining,
          quantity: data.quantity1,
          units: data.unit1,
          quantity2: data.quantity2,
          units2: data.unit2,
        };
      });

      if (fulfillment_items.length == 0) {
        notify("error", "Error", "Select at least one item.");
        return;
      }

      payloadToInsert = { ...payloadToInsert, fulfillment_items };

      const response = await FullfillmentFetch.create(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (payloadToInsert.shipstatus.toLowerCase() == "open") {
        notify(
          "info",
          "Info",
          "This Delivery Order is still in draft. Stock will be deducted once status is set to Shipped."
        );
      }

        if (resData) {
          setTimeout(() => {
            router.push(`/super-admin/transaction/${title}/${resData}`);
          }, 3000);
        }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "Shipped", value: "shipped" },
  ];

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Delivery Order Enter
          </p>
          <Button
            icon={<UnorderedListOutlined />}
            type="link"
            onClick={() => {
              router.push(`/super-admin/transaction/${title}`);
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
        <div className="w-full flex flex-col gap-8">
          <InputForm
            title="primary"
            type="SET_PRIMARY"
            payload={state.payloadPrimary}
            data={[
              {
                key: "salesorderid",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
                hidden: true,
              },
              {
                key: "createdfrom",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
              },
              {
                key: "customer",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
              },
              {
                key: "entity",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
                hidden: true,
              },
              {
                key: "trandate",
                input: "date",
                isAlias: true,
              },
              {
                key: "shipstatus",
                input: "select",
                options: statusOptions,
                isAlias: true,
              },
              {
                key: "memo",
                input: "text",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
                hidden: true,
              },
            ]}
            aliases={deliveryOrderAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />

          <InputForm
            title="shipping"
            type="SET_SHIPPING"
            payload={state.payloadShipping}
            data={[
              {
                key: "shippingaddress",
                input: "text",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
              },
              {
                key: "notes",
                input: "text",
                isAlias: true,
                // isRead: true,
                // cursorDisable: true,
              },
            ]}
            aliases={deliveryOrderAliases.shipping}
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
                Item
              </Divider>
              {/* <div className="flex justify-end">
                            <Button type="primary" onClick={handleAddItem}>
                              Add
                            </Button>
                          </div> */}
              <TableCustom
                onEdit={(record) => {
                  setEditItem(record);
                  setIsEditItem(true);
                }}
                data={dataTableItem}
                keys={keyTableItem}
                aliases={deliveryOrderAliases.item}
                onChecked={(lineid, isChecked) => {
                  let updateDataTable = dataTableItem;

                  updateDataTable = updateDataTable.map((item) => ({
                    ...item,
                    apply: item.lineid == lineid ? isChecked : item.apply,
                  }));

                  setDataTableItem(updateDataTable);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
      <Modal
        open={isEditItem}
        onOk={() => {
          if (editItem.quantity1 > editItem.quantityremaining) {
            notify(
              "error",
              "Failed",
              "Quantity kg cannot be more than the Remaining Quantity"
            );
            return;
          }

          const updatedDataTableItem = dataTableItem.map((item) => {
            if (item.id == editItem.id) {
              return editItem;
            } else {
              return item;
            }
          });

          setDataTableItem(updatedDataTableItem);
          setIsEditItem(false);
        }}
        onCancel={() => {
          setIsEditItem(false);
          setEditItem(null);
        }}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
            <InputForm
              title="Edit Item"
              type="SET_ITEM"
              payload={editItem}
              data={[
                {
                  key: "id",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  hidden: true,
                },
                {
                  key: "displayname",
                  input: "number",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "itemid",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "memo",
                  input: "text",
                  isAlias: true,
                },
                {
                  key: "quantity1",
                  input: "number",
                  isAlias: true,
                },
                {
                  key: "unit1",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "quantity2",
                  input: "number",
                  isAlias: true,
                },
                {
                  key: "unit2",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "quantityremaining",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "location",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  hidden: true
                },
              ]}
              aliases={deliveryOrderAliases.item}
              onChange={(type, payload) => {
                setEditItem((prev) => ({
                  ...prev,
                  quantity1: payload.quantity1,
                  quantity2: payload.quantity2,
                  memo: payload.memo,
                }));
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function DeliveryOrderContent() {
  const searchParams = useSearchParams();
  const salesOrderId = searchParams.get("salesOrderId");

  return salesOrderId ? (
    <Enter salesOrderId={salesOrderId} />
  ) : (
    <SalesOrderSelect />
  );
}

export default function DeliveryOrderEnterPage() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinProcessing />}>
        <DeliveryOrderContent />
      </Suspense>
    </Layout>
  );
}
