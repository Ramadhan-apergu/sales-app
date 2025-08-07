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
  InfoCircleOutlined,
  LeftOutlined,
  MoreOutlined,
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
import { formatDateToShort } from "@/utils/formatDate";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import { paymentAliases } from "@/utils/aliases";
import { formatRupiah } from "@/utils/formatRupiah";

function TableCustom({ data, keys, aliases, onChange }) {
  const columns = [
    ...keys.map((key) => {
      if (["total", "due", "amount"].includes(key)) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center",
          render: (text, record) => <p>{formatRupiah(text)}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center",
        };
      }
    }),
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="invoiceid"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function Details() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "payment";
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const response = await PaymentFetch.getById(slug);
        const resData = getResponseHandler(response);
        setData(resData);
        if (resData) {
          mappingDataPayload(resData);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayment();
  }, []);

  const initialState = {
    payloadPrimary: {
      customer: "",
      companymane: "",
      trandate: dayjs(new Date()),
      memo: "",
    },
    payloadSummary: {
      toapply: 0,
      applied: 0,
      unapplied: 0,
    },
    payloadPayment: {
      paymentoption: "cash",
      payment: 0,
      depositedate: "",
      bankaccount: "",
    },
    payloadPaymentApplies: [],
    dataTableItem: [],
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
      case "SET_PAYMENTAPPLY":
        return {
          ...state,
          payloadPaymentApplies: action.payload,
        };
      case "SET_ITEMS":
        return {
          ...state,
          dataTableItem: action.payload,
        };
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Bank Transfer", value: "transfer" },
    { label: "Giro", value: "giro" },
  ];

  const keyTableItem = [
    // "invoiceid",
    "refnum",
    "applydate",
    "total",
    "due",
    "amount",
  ];

  function mappingDataPayload(data) {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        customer: data.customer,
        companyname: data.companyname,
        trandate: formatDateToShort(data.trandate),
        memo: data.memo,
      },
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        toapply: data.toapply,
        applied: data.applied,
        unapplied: data.unapplied,
      },
    });

    dispatch({
      type: "SET_PAYMENT",
      payload: {
        paymentoption: data.paymentoption,
        payment: data.payment,
        depositedate: formatDateToShort(data?.depositedate || null),
        bankaccount: data.bankaccount,
      },
    });

    dispatch({
      type: "SET_PAYMENTAPPLY",
      payload: data.payment_applies,
    });

    dispatch({
      type: "SET_ITEMS",
      payload: data.payment_applies.map((item) => ({
        ...item,
        applydate: formatDateToShort(item.applydate),
      })),
    });
  }

  const handleChecked = (data, isChecked) => {
    let updatedData = state.payloadPaymentApplies;

    if (isChecked) {
      updatedData = [...updatedData, data];
    } else {
      updatedData = updatedData.filter(
        (item) => item.invoiceid !== data.invoiceid
      );
    }

    const totalApplied = updatedData.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    dispatch({
      type: "SET_PAYMENTAPPLY",
      payload: updatedData,
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        applied: totalApplied,
        unapplied: (Number(state.payloadSummary.toapply) || 0) - totalApplied,
      },
    });
    dispatch({
      type: "SET_ITEMS",
      payload: state.dataTableItem.map((item) => {
        if (item.invoiceid == data.invoiceid) {
          return {
            ...item,
            ischecked: isChecked,
          };
        } else {
          return item;
        }
      }),
    });
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Payment Details
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
              {data && data.id ? (
                <>
                  <div className="w-full flex flex-col lg:flex-row justify-between items-start">
                    <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                      <p className="w-full lg:text-lg">
                        {data.tranid + " / " + data.companyname}
                      </p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          color={
                            ["payment received", "deposited"].includes(
                              data?.status.toLowerCase()
                            )
                              ? "green"
                              : ["undeposited"].includes(
                                  data?.status.toLowerCase()
                                )
                              ? "orange"
                              : [""].includes(data?.status.toLowerCase())
                              ? "red"
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
                        disabled={
                          (data?.paymentoption.toLowerCase() == "giro" &&
                          data.status.toLowerCase() == "deposited") || data.status.toLowerCase() == "payment received"
                        }
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/super-admin/transaction/payment/${
                              data?.id || ""
                            }/edit`
                          );
                        }}
                      >
                        {isLargeScreen ? "Edit" : ""}
                      </Button>
                    </div>
                  </div>
                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "companyname",
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
                    aliases={paymentAliases.primary}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
                  <InputForm
                    title="payment"
                    type="SET_PAYMENT"
                    payload={state.payloadPayment}
                    data={[
                      {
                        key: "paymentoption",
                        input: "input",
                        options: paymentOptions,
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "payment",
                        input: "number",
                        isAlias: true,
                        isRead: true,
                        accounting: true,
                      },
                      {
                        key: "depositedate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        hidden: state.payloadPayment.paymentoption != "giro",
                      },
                      {
                        key: "bankaccount",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        hidden: state.payloadPayment.paymentoption != "transfer",
                      },
                    ]}
                    aliases={paymentAliases.payment}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });

                      const toApply = Number(payload.payment) || 0;
                      const applied = Number(state.payloadSummary.applied) || 0;

                      dispatch({
                        type: "SET_SUMMARY",
                        payload: {
                          toapply: toApply,
                          unapplied: toApply - applied,
                        },
                      });
                    }}
                  />
                  <div className="w-full flex flex-col gap-8">
                    <TableCustom
                      onChange={handleChecked}
                      data={state.dataTableItem}
                      keys={keyTableItem}
                      aliases={paymentAliases.payment}
                    />
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
                          <p className="w-1/2">To Apply</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.toapply)}
                          </p>
                        </div>
                        <div className="flex w-full">
                          <p className="w-1/2">Applied</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.applied)}
                          </p>
                        </div>
                        <div className="flex w-full font-semibold">
                          <p className="w-1/2">Unapplied</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.unapplied)}
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
      {contextNotify}
    </>
  );
}
