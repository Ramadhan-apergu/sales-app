"use client";

import React, { Suspense, useEffect, useReducer, useRef, useState } from "react";
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

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right", // semua kolom di-align ke kanan
    })),
    // {
    //   title: "Action",
    //   key: "action",
    //   align: "right", // kolom action juga ke kanan
    //   render: (_, record) => (
    //     <Button type="link" onClick={() => onDelete(record)}>
    //       Delete
    //     </Button>
    //   ),
    // },
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
  const title = "sales order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataSalesOrder, setDataSalesOrder] = useState({});
  const [dataCustomer, setDataCustomer] = useState({});
  const [dataSalesOrderItemRetrieve, setDataSalesOrderItemRetrieve] = useState(
    {}
  );

  const initialState = {
    payloadPrimary: {
      salesorderid: "",
      createdform: "",
      customer: "",
      entity: "",
      trandate: dayjs(new Date()),
      shipstatus: "open",
      memo: "",
    },
    payloadShipping: {
      shippingoption: "",
      shippingaddress: "",
      shippingtype: 0,
    },
  };

  const shippingOptions = [
    { label: "Custom", value: 0 },
    { label: "Default", value: 1 },
  ];

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
    // if (!salesOrderId) {
    //   notify("error", "Missing Parameter", "Sales Order ID is required.");
    //   router.back();
    //   return;
    // }

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
        if (!soItemData) throw new Error("Failed to fetch sales order items");

        // const salesOrderItem = salesOrderData.sales_order_items

        // soItemData = soItemData.map((item) => {
        //     if (item.memo.toLowerCase() != 'free item') {
        //         const findItemSo = salesOrderItem.find((itemSo) => itemSo.item == item.id)

        //         if (findItemSo) {
        //             return {
        //                 ...item,
        //                 quantityremaining: findItemSo.quantity - item.quantity
        //             }
        //         } else {
        //             return item
        //         }
        //     } else {
        //         return item
        //     }
        // })

        setDataSalesOrder(salesOrderData);
        setDataCustomer(customerData);
        setDataSalesOrderItemRetrieve(soItemData);
        setDataTableItem(
          soItemData.map((item) => ({
            ...item,
            location: "General Warehouse",
            lineid: crypto.randomUUID(),
          }))
        );

        dispatch({
          type: "SET_PRIMARY",
          payload: {
            salesorderid: salesOrderData.id,
            createdform: salesOrderData.otherrefnum,
            customer: customerData.companyname,
            entity: customerData.id,
          },
        });

        dispatch({
          type: "SET_SHIPPING",
          payload: {
            shippingaddress: customerData.addressee,
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
    "id",
    "displayname",
    "itemid",
    "location",
    "memo",
    "quantity",
    "quantityremaining",
  ];

  const [dataTableItem, setDataTableItem] = useState([]);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
      };

      let shippingaddress =
        state.payloadShipping.shippingtype == 1
          ? state.payloadShipping?.shippingaddress || ""
          : "";
      let shippingoption =
        state.payloadShipping.shippingtype == 0
          ? state.payloadShipping?.shippingoption || ""
          : "";

      payloadToInsert = {
        ...payloadToInsert,
        shippingaddress,
        shippingoption,
      };

      delete payloadToInsert.customer;

      const fulfillment_items = dataTableItem.map((data) => {
        return {
          item: data.id,
          memo: data.memo,
          location: data.location,
          quantityremaining: data.quantityremaining,
          quantity: data.quantity,
          units: data.units,
        };
      });

      payloadToInsert = { ...payloadToInsert, fulfillment_items };

      const response = await FullfillmentFetch.create(payloadToInsert);

      const resData = createResponseHandler(response, notify);
      console.log(resData);

      //   if (resData) {
      //     router.push(`/super-admin/transaction/sales-order/${resData}`);
      //   }
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
              },
              {
                key: "createdform",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "customer",
                input: "input",
                isAlias: true,
                isRead: true,
              },
              {
                key: "entity",
                input: "input",
                isAlias: true,
                isRead: true,
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
              },
            ]}
            aliases={[]}
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
                // onDelete={handleDeleteTableItem}
                data={dataTableItem}
                keys={keyTableItem}
                aliases={{}}
              />
            </div>
          </div>
          <InputForm
            title="shipping"
            type="SET_SHIPPING"
            payload={state.payloadShipping}
            data={[
              {
                key: "shippingtype",
                input: "select",
                options: shippingOptions,
                isAlias: true,
              },
              {
                key:
                  state.payloadShipping.shippingtype == 0
                    ? "shippingoption"
                    : "shippingaddress",
                input: "text",
                isAlias: true,
              },
            ]}
            aliases={[]}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />
        </div>
      </div>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
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
      <Suspense fallback={<LoadingSpinProcessing/>}>
        <DeliveryOrderContent />
      </Suspense>
    </Layout>
  );
}
