"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Dropdown,
  Empty,
  Form,
  List,
  Modal,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Layout from "@/components/salesIndoor/Layout";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FileAddOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import InvoiceFetch from "@/modules/salesApi/invoice";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import { formatDateToShort } from "@/utils/formatDate";
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

export default function EnterPage() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "invoice";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { slug } = useParams();

  const [data, setData] = useState(null);

  const [dataFulfillment, setDataFulfillment] = useState({});
  const [dataSalesOrder, setDataSalesOrder] = useState({});
  const [dataCustomer, setDataCustomer] = useState({});
  const [dataSalesOrderItemRetrieve, setDataSalesOrderItemRetrieve] = useState(
    {}
  );

  const initialState = {
    payloadPrimary: {
      salesorderid: "",
      fulfillmentid: "",
      entity: "",
      trandate: dayjs(new Date()),
      duedate: dayjs(new Date()),
      tranid: "",
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
      term: "",
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
    async function fetchInvoice() {
      try {
        const response = await InvoiceFetch.getById(slug);
        const resData = getResponseHandler(response);

        if (resData) {
          setData(resData);
          mappingDataInvoice(resData);
        }
      } catch (error) {
        console.log(error);
        notify("error", "Error", "Failed get data Invoice");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [slug, router]);

  async function getItem(id) {
    try {
      const response = await ItemFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      notify("error", "Error", "Failed get data Item");
    }
  }

  async function mappingDataInvoice(data) {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        salesorderid: data.salesorderid,
        fulfillmentid: data.fulfillmentid,
        entity: data.entity,
        trandate: dayjs(data.trandate),
        duedate: dayjs(data.duedate),
        tranid: data.tranid,
        salesordernum: data.salesordernum,
        fulfillmentnum: data.fulfillmentnum,
        customer: data.customer,
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingaddress: data.shippingaddress,
        memo: data.memo,
      },
    });

    dispatch({
      type: "SET_BILLING",
      payload: {
        billingaddress: data.billingaddress,
        term: data.term,
      },
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        totalamount: data.totalamount,
        discounttotal: data.discounttotal,
        subtotal: data.subtotal,
        taxtotal: data.taxtotal,
        amount: data.amount,
      },
    });

    let updatedInvoiceItems = await Promise.all(
      data.invoice_items.map(async (invoiceItem) => {
        const item = await getItem(invoiceItem.item);
        return {
          ...invoiceItem,
          displayname: item ? item.displayname : "",
          lineid: crypto.randomUUID(),
        };
      })
    );

    setDataTableItem(updatedInvoiceItems);
  }

  const shipAddressOptions = [
    { label: "Custom", value: 0 },
    { label: "Default Address", value: 1 },
  ];

  const keyTableItem = [
    "displayname",
    "memo",
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

      delete payloadToInsert.customer;

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
          amount: data.amount,
          dpp: data.dpp,
          location: data?.location || "",
          taxrate: data.taxrate,
          taxvalue: data.taxvalue,
        };
      });

      payloadToInsert = { ...payloadToInsert, invoice_items };

      const response = await InvoiceFetch.update(slug, payloadToInsert);

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

  const termOptions = [
    { label: "7 Days", value: "7" },
    { label: "14 Days", value: "14" },
    { label: "30 Days", value: "30" },
  ];

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Edit Invoice
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
            {data ? (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                  <div className="w-full lg:w-1/2 flex gap-1">
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => router.back()}
                    >
                      {isLargeScreen ? "Cancel" : ""}
                    </Button>
                  </div>
                  <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                    <Button
                      type={"primary"}
                      icon={<SaveOutlined />}
                      onClick={handleSubmit}
                    >
                      {isLargeScreen ? "Save" : ""}
                    </Button>
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
                      //   {
                      //     key: "salesorderid",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      //   {
                      //     key: "fulfillmentid",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      {
                        key: "entity",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                        hidden: true,
                      },
                      {
                        key: "tranid",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
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
                        disabled: true,
                      },
                      {
                        key: "salesordernum",
                        input: "input",
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
                            !isNaN(Number(state.payloadBilling.term))
                              ? Number(state.payloadBilling.term)
                              : 1,
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
    </Layout>
  );
}
