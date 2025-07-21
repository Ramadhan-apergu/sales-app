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
  Tag,
  Tooltip,
} from "antd";
import Layout from "@/components/salesIndoor/Layout";
import {
  CheckOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
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
import PaymentFetch from "@/modules/salesApi/payment";
import CreditMemoFetch from "@/modules/salesApi/creditMemo";
import { formatDateToShort } from "@/utils/formatDate";
import InvoiceFetch from "@/modules/salesApi/invoice";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import { creditMemoAliases } from "@/utils/aliases";

function TableCustom({
  data,
  keys,
  aliases,
  onChange,
  checkbox,
  keyRow,
  onDelete = null,
}) {
  let columns = [
    {
      title: "Apply",
      dataIndex: "apply",
      key: "apply",
      align: "center",
      render: (_, record) => (
        <Checkbox
          checked={record.ischecked}
          onChange={(e) => {
            const isChecked = e.target.checked;
            onChange?.(record, isChecked);
          }}
        />
      ),
    },
    ...keys.map((key) => {
      if (key == "taxable") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right",
          render: (text) => <p>{text ? "Yes" : "No"}</p>,
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
  ];

  if (!checkbox) {
    columns = columns.filter((col) => col.title.toLowerCase() !== "apply");
  }

  if (onDelete) {
    columns.push({
      title: "Action",
      key: "action",
      align: "right", // kolom action juga ke kanan
      render: (_, record) => (
        <Button type="link" onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={keyRow}
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
  const title = "credit-memo";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const { slug } = useParams();

  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        async function fetchCustomer() {
          try {
            const response = await CustomerFetch.get(0, 10000, "active");
            const resData = getResponseHandler(response, notify);

            if (resData) {
              const addLabelCustomer = resData.list.map((customer) => {
                return {
                  ...customer,
                  label: customer.companyname,
                  value: customer.id,
                };
              });
              setDataCustomer(addLabelCustomer);
            }
          } catch (error) {
            notify("error", "Error", "Failed get data customer");
          } finally {
            setIsLoading(false);
          }
        }
        fetchCustomer();

        async function fecthCreditMemo() {
          try {
            const response = await CreditMemoFetch.getById(slug);
            const resData = getResponseHandler(response, notify);

            if (resData) {
              setData(resData);
              mappingData(resData);
            }
          } catch (error) {
            notify("error", "Error", "Failed get data customer");
          } finally {
            setIsLoading(false);
          }
        }

        fecthCreditMemo();
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    run()
  }, []);

  const initialState = {
    payloadPrimary: {
      entity: "",
      trandate: "",
      memo: "",
    },
    payloadSummary: {
      subtotal: 0,
      taxtotal: 0,
      total: 0,
    },
    payloadPayment: {
      unapplied: 0,
      applied: 0,
    },
    credit_memo_items: [],
    credit_memo_applies: [],
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
      case "SET_SUMMARY":
        return {
          ...state,
          payloadSummary: {
            ...state.payloadSummary,
            ...action.payload,
          },
        };
      case "SET_PAYMENT":
        return {
          ...state,
          payloadPayment: {
            ...state.payloadPayment,
            ...action.payload,
          },
        };
      case "SET_APPLIES":
        return {
          ...state,
          credit_memo_applies: action.payload,
        };
      case "SET_ITEMS":
        return {
          ...state,
          credit_memo_items: action.payload,
        };
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  async function mappingData(data) {
    const customerSelectedFetch = await fetchCustomerById(data.entity);

    setCustomerSelected({
      ...customerSelectedFetch,
      label: customerSelectedFetch.companyname,
      value: customerSelectedFetch.id,
    });

    dispatch({
      type: "SET_PRIMARY",
      payload: {
        entity: data.entity,
        trandate: formatDateToShort(data.trandate),
        memo: data.memo,
      },
    });

    dispatch({
      type: "SET_PAYMENT",
      payload: {
        unapplied: data.unapplied,
        applied: data.applied,
      },
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotal: data.subtotal,
        taxtotal: data.taxtotal,
        total: data.total,
      },
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotal: data.subtotal,
        taxtotal: data.taxtotal,
        total: data.total,
      },
    });

    const creditMemoItemAddInfo = await Promise.all(
      data.credit_memo_items.map(async (memoItem) => {
        try {
          const dataItem = await fetchItemById(memoItem.item);
          return {
            ...memoItem,
            displayname: dataItem.displayname || "",
          };
        } catch (error) {
          console.error("Gagal fetch item ID:", memoItem.item, error);
          return {
            ...memoItem,
            displayname: "",
          };
        }
      })
    );

    dispatch({
      type: "SET_ITEMS",
      payload: creditMemoItemAddInfo,
    });

    const creditMemoAppliesAddInfo = await Promise.all(
      data.credit_memo_applies.map(async (memoApply) => {
        try {
          const dataInv = await fetchInvoiceById(memoApply.invoiceid);
          return {
            ...memoApply,
            refnum: dataInv.fulfillmentnum || "",
            trandate: formatDateToShort(dataInv.trandate)
          };
        } catch (error) {
          console.error("Gagal fetch invoice ID:", memoApply.invoiceid, error);
          return {
            ...memoApply,
            refnum: "",
            trandate: formatDateToShort(dataInv.trandate)
          };
        }
      })
    );

    dispatch({
      type: "SET_APPLIES",
      payload: creditMemoAppliesAddInfo,
    });
  }

  async function fetchItemById(id) {
    try {
      const response = await ItemFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData || {};
    } catch (error) {
      notify("error", "Error", "Failed get data item");
      return {}; // supaya tetap aman dipakai
    }
  }

  async function fetchCustomerById(id) {
    try {
      const response = await CustomerFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData || {};
    } catch (error) {
      notify("error", "Error", "Failed get data customer");
      return {}; // supaya tetap aman dipakai
    }
  }

  async function fetchInvoiceById(id) {
    try {
      const response = await InvoiceFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData || {};
    } catch (error) {
      notify("error", "Error", "Failed get data invoice");
      return {}; // supaya tetap aman dipakai
    }
  }

  const keyTableItem = [
    "invoiceid",
    "refnum",
    "trandate",
    "due",
    "amount",
    "payment",
  ];

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Credit Memo Details
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
              {data && data.id ? (
                <>
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                      <p className="w-full lg:text-lg">
                        {`${data?.tranid || ""} / ${
                          customerSelected?.companyname || ""
                        }`}
                      </p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          color={"default"}
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
                            `/sales-indoor/transaction/credit-memo/${
                              data?.id || ""
                            }/edit`
                          );
                        }}
                      >
                        {isLargeScreen ? "Edit" : ""}
                      </Button>
                    </div>
                  </div>

                  {/* customer */}
                  <InputForm
                    title="customer"
                    type="customer"
                    payload={customerSelected}
                    data={[
                      {
                        key: "companyname",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={{
                        companyname: 'Customer Name'
                    }}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
                  {/* end customer */}

                  {/* primary */}
                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "entity",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "trandate",
                        input: "input",
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
                    aliases={creditMemoAliases.primary}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
                  {/* end primary */}

                  {/* item */}
                  <InputForm
                    title="item"
                    type="SET_PAYMENT"
                    payload={state.payloadPayment}
                    data={[
                      {
                        key: "unapplied",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "applied",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={creditMemoAliases.item}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />

                  <TableCustom
                    data={state.credit_memo_items}
                    keys={[
                      "item",
                      "displayname",
                      "quantity",
                      "units",
                      "itemdescription",
                      "rate",
                      "taxable",
                      "amount",
                      "taxrate1",
                      "taxamount",
                    ]}
                    aliases={creditMemoAliases.item}
                    checkbox={false}
                    keyRow={"item"}
                  />
                  {/* end item */}

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
                        Apply Credit Memo
                      </Divider>
                      <TableCustom
                        data={state.credit_memo_applies}
                        keys={keyTableItem}
                        aliases={creditMemoAliases.apply}
                        keyRow={"invoiceid"}
                        checkbox={false}
                      />
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
                        Summary
                      </Divider>
                      <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                        <div className="flex w-full">
                          <p className="w-1/2">Subtotal</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.subtotal)}
                          </p>
                        </div>
                        <div className="flex w-full">
                          <p className="w-1/2">Tax Total</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.taxtotal)}
                          </p>
                        </div>
                        <hr className="border-gray-5" />
                        <div className="flex w-full font-semibold">
                          <p className="w-1/2">Total</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
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
      {contextNotify}
    </>
  );
}
