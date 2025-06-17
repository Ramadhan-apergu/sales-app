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
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  EditOutlined,
  FileAddOutlined,
  InfoCircleOutlined,
  LeftOutlined,
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
      memo: "",
      salesordernum: "",
      fulfillmentnum: "",
      customer: "",
      sales: ""
    },
    payloadShipping: {
      shippingaddress: "",
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
    async function fetchInvoice() {
      try {
        const response = await InvoiceFetch.getById(slug);
        const resData = getResponseHandler(response);

        console.log(resData);

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
        trandate: formatDateToShort(data.trandate),
        memo: data.memo,
        salesordernum: data.salesordernum,
        fulfillmentnum: data.fulfillmentnum,
        customer: data.customer,
        duedate: formatDateToShort(data.trandate),
        sales: data.sales
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingaddress: data.shippingaddress,
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
    "item",
    "quantity",
    "units",
    "quantity2",
    "units2",
    "rate",
    "subtotal",
    "totaldiscount",
    "amount",
    "taxrate",
    "taxvalue",
    "memo",
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
          amount: data.amount,
          taxrate: data.taxrate,
          taxvalue: data.taxvalue,
        };
      });

      payloadToInsert = { ...payloadToInsert, invoice_items };

      const response = await InvoiceFetch.create(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/invoice/${resData}`);
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
    { label: "Net 30", value: "Net 30" },
    { label: "Net 90", value: "Net 90" },
    { label: "Net 120", value: "Net 120" },
  ];

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

    const items = [
    {
      key: "1",
      label: "Print",
    },
    // {
    //   key: "2",
    //   label: "Cancel",
    //   danger: true,
    // },
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

  const deleteModal = () => {
    modal.confirm({
      title: `Cancel ${title} "${data.customer}"?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id);
      },
    });
  };

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Invoice Details
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
        {!isLoading ? (
          <>
            {data ? (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                  <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                    <p className="w-full lg:text-lg">
                      {data.tranid + " / " + data.customer}
                    </p>
                    <div>
                      <Tag
                        style={{
                          textTransform: "capitalize",
                          fontSize: "16px",
                        }}
                          color={
                            ["paid in full"].includes(
                              data.status.toLowerCase()
                            )
                              ? "green"
                              : [
                                  "partial paid", "open"
                                ].includes(data.status.toLowerCase())
                              ? "orange"
                              : "default"
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
                      onClick={() => {
                        router.push(
                          `/super-admin/transaction/invoice/${data.id}/edit`
                        );
                      }}
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
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
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
                    //   {
                    //     key: "entity",
                    //     input: "input",
                    //     isAlias: true,
                    //     isRead: true,
                    //   },
                      {
                        key: "trandate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                                            {
                        key: "duedate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                                            {
                        key: "sales",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "salesordernum",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "fulfillmentnum",
                        input: "input",
                        options: statusOptions,
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "memo",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={invoiceAliases.primary}
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
                      <TableCustom
                        data={dataTableItem}
                        keys={keyTableItem}
                        aliases={invoiceAliases.item}
                      />
                    </div>
                  </div>
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
                      },
                      {
                        key: "billingaddress",
                        input: "text",
                        isAlias: true,
                        isRead: true,
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
