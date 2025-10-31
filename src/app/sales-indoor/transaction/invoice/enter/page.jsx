"use client";

import React, {
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
import Layout from "@/components/salesIndoor/Layout";
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
import DeliveryOrderSelect from "./DeliveryOrderSelect";
import InvoiceFetch from "@/modules/salesApi/invoice";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import { invoiceAliases } from "@/utils/aliases";

const formatRupiah = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "Rp 0,-";
  const numberCurrency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return numberCurrency + ",-";
};

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    {
      title: "No",
      key: "no",
      align: "center",
      render: (text, record, index) => index + 1, // nomor urut mulai dari 1
    },
    ...keys.map((key) => {
      if (
        [
          "rate",
          "subtotal",
          "totaldiscount",
          "amount",
          "dpp",
          "taxvalue",
          "discountsatuan",
        ].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right",
          render: (text, record) => <p>{formatRupiah(text)}</p>,
        };
      } else if (key == "isfree") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => <p>{text ? "Yes" : "No"}</p>,
          align: "right",
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right",
        };
      }
    }),
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

function Enter({ fulfillmentId }) {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "invoice";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [dataFulfillment, setDataFulfillment] = useState({});
  const [dataSalesOrder, setDataSalesOrder] = useState({});
  const [dataCustomer, setDataCustomer] = useState({});
  const [dataSalesOrderItemRetrieve, setDataSalesOrderItemRetrieve] = useState(
    {}
  );
  const [termCustomer, setTermCustomer] = useState(0);

  const initialState = {
    payloadPrimary: {
      salesorderid: "",
      fulfillmentid: "",
      entity: "",
      trandate: dayjs(new Date()),
      duedate: dayjs(new Date()).add(termCustomer, "day"),
      salesordernum: "",
      fulfillmentnum: "",
      customer: "",
    },
    payloadShipping: {
      shippingaddress: "",
      memo: "",
    },
    payloadBilling: {
      billingaddress: "",
      term: "Net 30",
    },
    payloadSummary: {
      totalamount: 0,
      discounttotal: 0,
      subtotal: 0,
      taxtotal: 0,
      amount: 0,
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
      case "SET_BILLING":
        return {
          ...state,
          payloadBilling: {
            ...state.payloadBilling,
            ...action.payload,
          },
        };
      case "SET_SUMMARY":
        return {
          ...state,
          payloadSummary: {
            ...state.payloadSummary,
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
        const fulfillmentRes = await FullfillmentFetch.getById(fulfillmentId);
        const fulfillmentData = getResponseHandler(fulfillmentRes);
        if (!fulfillmentData)
          throw new Error("Failed to fetch item fulfillment");

        const salesOrderRes = await SalesOrderFetch.getById(
          fulfillmentData.salesorderid
        );
        const salesOrderData = getResponseHandler(salesOrderRes);
        if (!salesOrderData) throw new Error("Failed to fetch sales order");

        const customerRes = await CustomerFetch.getById(salesOrderData.entity);
        const customerData = getResponseHandler(customerRes);
        if (!customerData) throw new Error("Failed to fetch customer");

        // const soItemRes = await FullfillmentFetch.getSoItem(
        //   fulfillmentData.salesorderid
        // );

        const soItemRes = await InvoiceFetch.getdOItemInv(fulfillmentData.id);
        let soItemData = getResponseHandler(soItemRes);
        if (!soItemData) throw new Error("Failed to fetch sales order items");

        setDataFulfillment(fulfillmentData);
        setDataSalesOrder(salesOrderData);
        setDataCustomer(customerData);
        const terms =
          customerData?.terms && !isNaN(Number(customerData.terms))
            ? Number(customerData.terms)
            : 1;
        setTermCustomer(terms);
        dispatch({
          type: "SET_PRIMARY",
          payload: { duedate: dayjs(new Date()).add(terms, "day") },
        });
        setDataSalesOrderItemRetrieve(soItemData);
        setDataTableItem(
          fulfillmentData.fulfillment_items.map((fulfillment) => {
            const findItemSo = salesOrderData.sales_order_items.find(
              (soItem) => soItem.item === fulfillment.item
            );

            const itemSo = soItemData.find(
              (item) => item.item === fulfillment.item
            );

            const displayname = itemSo?.displayname || "";
            const location = fulfillment?.location || "";

            if (findItemSo) {
              const quantity = fulfillment.quantity;
              const rate = findItemSo.rate;
              const amount = quantity * rate;
              const totaldiscount = findItemSo.totaldiscount;
              const subtotal = amount - totaldiscount;
              const taxrate = findItemSo.taxrate;
              const taxvalue = findItemSo.taxable
                ? Math.ceil((amount / (1 + taxrate / 100)) * (taxrate / 100))
                : 0;

              const dpp = amount - taxvalue;
              const discountsatuan = itemSo?.discountsatuan || 0;
              return {
                item: fulfillment.item,
                displayname,
                quantity,
                units: fulfillment.units,
                quantity2: fulfillment.quantity2,
                units2: fulfillment.units2,
                rate,
                amount,
                totaldiscount,
                discountsatuan,
                subtotal,
                dpp,
                taxrate,
                taxvalue,
                memo: fulfillment.memo,
                lineid: crypto.randomUUID(),
                location,
                isfree: fulfillment.isfree,
              };
            }

            return {
              item: fulfillment.item,
              displayname,
              quantity: fulfillment.quantity,
              units: fulfillment.units,
              quantity2: fulfillment.quantity2,
              units2: fulfillment.units2,
              rate: 0,
              amount: 0,
              totaldiscount: 0,
              discountsatuan: 0,
              subtotal: 0,
              dpp: 0,
              taxrate: 0,
              taxvalue: 0,
              memo: fulfillment.memo,
              lineid: crypto.randomUUID(),
              location,
              isfree: fulfillment.isfree,
            };
          })
        );

        dispatch({
          type: "SET_PRIMARY",
          payload: {
            salesorderid: fulfillmentData.salesorderid,
            fulfillmentid: fulfillmentData.id,
            entity: salesOrderData.entity,
            trandate: dayjs(new Date()),
            // duedate: dayjs(new Date()).add(termCustomer, "day"),
            salesordernum: salesOrderData.tranid,
            fulfillmentnum: fulfillmentData.tranid,
            customer: customerData.companyname,
          },
        });

        dispatch({
          type: "SET_SHIPPING",
          payload: {
            shippingaddress: customerData.addressee,
            memo: salesOrderData.notes,
          },
        });

        dispatch({
          type: "SET_BILLING",
          payload: {
            term: customerData.terms,
            billingaddress: salesOrderData.shippingaddress,
          },
        });
      } catch (error) {
        console.error(error);
        notify("error", "Error", error.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fulfillmentId, router]);

  const shipAddressOptions = [
    { label: "Custom", value: 0 },
    { label: "Default Address", value: 1 },
  ];

  const keyTableItem = [
    "displayname",
    "memo",
    "isfree",
    "location",
    "quantity",
    "units",
    "quantity2",
    "units2",
    "rate",
    "amount",
    "discountsatuan",
    "totaldiscount",
    "subtotal",
    "taxrate",
    "dpp",
    "taxvalue",
  ];

  const [dataTableItem, setDataTableItem] = useState([]);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadBilling,
        ...state.payloadShipping,
      };

      const invoice_items = dataTableItem.map((data) => {
        return {
          item: data.item,
          quantity: data.quantity,
          units: data.units,
          quantity2: data.quantity2,
          units2: data.units2,
          rate: data.rate,
          subtotal: data.subtotal,
          totaldiscount: data.totaldiscount,
          discountsatuan: data.discountsatuan,
          amount: data.amount,
          dpp: data.dpp,
          taxrate: data.taxrate,
          taxvalue: data.taxvalue,
          isfree: data.isfree,
        };
      });

      payloadToInsert = { ...payloadToInsert, invoice_items };

      const response = await InvoiceFetch.create(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/transaction/invoice/${resData}`);
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

  const getValueDiscount = (discountValue, value, totalamount) => {
    switch (discountValue) {
      case "rp":
        return value;
      case "%":
        return (totalamount * value) / 100;
      default:
        return 0;
    }
  };

  useEffect(() => {
    let totalamount = 0;
    let discounttotal = 0;
    let subtotal = 0;
    let taxtotal = 0;
    let amount = 0;

    dataTableItem.forEach((item) => {
      totalamount += item.amount;
      subtotal += item.subtotal;
      amount += item.subtotal;
      if (item.isfree) {
        discounttotal += item.subtotal;
      }
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        totalamount,
        discounttotal,
        subtotal,
        taxtotal,
        amount,
      },
    });
  }, [dataTableItem]);

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }
  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Invoice Enter
          </p>
          <Button
            icon={<UnorderedListOutlined />}
            type="link"
            onClick={() => {
              router.push(`/sales-indoor/transaction/${title}`);
            }}
          >
            {isLargeScreen ? "List" : ""}
          </Button>
        </div>
        {!isLoading ? (
          <>
            {dataFulfillment.id ? (
              <div className="w-full flex flex-col gap-4">
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
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "salesordernum",
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
                        key: "duedate",
                        input: "date",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "fulfillmentnum",
                        input: "input",
                        options: statusOptions,
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                    ]}
                    aliases={invoiceAliases.primary}
                    onChange={(type, payload) => {
                      dispatch({
                        type,
                        payload: {
                          ...payload,
                          duedate: dayjs(payload.trandate).add(
                            termCustomer,
                            "day"
                          ),
                        },
                      });
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
                        key: "memo",
                        input: "text",
                        isAlias: true,
                        // isRead: true,
                        // cursorDisable: true,
                      },
                    ]}
                    aliases={invoiceAliases.shipping}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
                  <InputForm
                    title="billing"
                    type="SET_BILLING"
                    payload={state.payloadBilling}
                    data={[
                      {
                        key: "term",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "billingaddress",
                        input: "text",
                        isAlias: true,
                        hidden: true,
                      },
                    ]}
                    aliases={invoiceAliases.billing}
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
                        Summary
                      </Divider>
                      <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                        <div className="flex w-full">
                          <p className="w-1/2">Subtotal</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.totalamount)}
                          </p>
                        </div>
                        <div className="flex w-full">
                          <p className="w-1/2">Discount Item</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.discounttotal)}
                          </p>
                        </div>
                        {/* <div className="flex w-full">
                          <p className="w-1/2">Subtotal (After Discount)</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.subtotal)} Incl.
                            PPN
                          </p>
                        </div>
                        <div className="flex w-full">
                          <p className="w-1/2">Tax Total</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.taxtotal)}
                          </p>
                        </div> */}
                        <hr className="border-gray-5" />
                        <div className="flex w-full font-semibold">
                          <p className="w-1/2">Total</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <TableCustom
                        data={dataTableItem}
                        keys={keyTableItem}
                        aliases={invoiceAliases.item}
                      />
                    </div>
                  </div>
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
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}

function InvoiceOrderContent() {
  const searchParams = useSearchParams();
  const fulfillmentId = searchParams.get("fulfillmentId");

  return fulfillmentId ? (
    <Enter fulfillmentId={fulfillmentId} />
  ) : (
    <DeliveryOrderSelect />
  );
}

export default function InvoiceOrderEnterPage() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinProcessing />}>
        <InvoiceOrderContent />
      </Suspense>
    </Layout>
  );
}
