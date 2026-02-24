"use client";

import React, { useEffect, useReducer, useState } from "react";
import { Button, Checkbox, Divider, Form, Select, Table } from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, UnorderedListOutlined } from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import dayjs from "dayjs";
import { rmaAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import CustomerRefundFetch from "@/modules/salesApi/customerRefund";

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "customer refund";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { slug } = useParams();

  const [form] = Form.useForm();

  const [dataCustomer, setDataCustomer] = useState([]);
  const [data, setData] = useState({});

  const [dataCustomerCredit, setDataCustomerCredit] = useState([]);

  const [creditMemoSelected, setCreditMemoSelected] = useState({});

  async function fetchCustomer() {
    try {
      const response = await CustomerFetch.get(0, 10000, "active");
      const resData = getResponseHandler(response, notify);

      if (resData) {
        return resData.list.map((customer) => ({
          ...customer,
          label: customer.customerid,
          value: customer.id,
        }));
      } else {
        return [];
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer");
      return [];
    }
  }

  async function fetchCustomercreditMemo(custId) {
    try {
      const response = await CustomerRefundFetch.getCreditMemo(
        0,
        10000,
        custId,
      );
      const resData = getResponseHandler(response, notify);

      if (resData) {
        return (
          resData?.list.map((cred) => ({
            ...cred,
            label: cred.tranid,
            value: cred.id,
          })) || []
        );
      } else {
        return [];
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer");
      return [];
    }
  }

  async function fetchDataCustomerRefund(id) {
    try {
      const response = await CustomerRefundFetch.getById(id);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        return resData;
      } else {
        return {};
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer");
      return [];
    }
  }

  useEffect(() => {
    async function init() {
      const resDataCustomer = await fetchCustomer();
      setDataCustomer(resDataCustomer);

      const resData = await fetchDataCustomerRefund(slug);
      setData(resData);

      mappingData(resData);
    }

    init();
  }, []);

  async function mappingData(data) {
    form.setFieldValue("customer", data.entity);
    form.setFieldValue("creditmemo", data.creditmemonum);

    dispatch({
      type: "SET_PRIMARY",
      payload: {
        entity: data.entity,
        trandate: dayjs(data.trandate),
        memo: data.memo,
        creditmemoid: data.creditmemoid,
        creditmemonum: data.creditmemonum,
      },
    });

    dispatch({
      type: "SET_PAYMENT",
      payload: {
        refundmethod: data.refundmethod,
        bankaccount: data.bankaccount
          ? data.bankaccount
          : "Bank BCA/CV SUKSES MANDIRI/3831487788",
        amount: data.amount,
      },
    });
  }

  const initialState = {
    payloadPrimary: {
      entity: "",
      trandate: dayjs(new Date()),
      memo: "",
      creditmemoid: "",
      creditmemonum: "",
    },
    payloadPayment: {
      refundmethod: "transfer",
      bankaccount: "Bank BCA/CV SUKSES MANDIRI/3831487788",
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
      case "SET_PAYMENT":
        return {
          ...state,
          payloadPayment: {
            ...state.payloadPayment,
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

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadPayment,
      };

      payloadToInsert = {
        ...payloadToInsert,
        entity: data?.entity || "",
        creditmemoid: data?.creditmemoid || "",
        creditmemonum: data?.creditmemonum || "",
      };

      if (!payloadToInsert.entity) {
        throw new Error("Customer is required!");
      }

      if (!payloadToInsert.creditmemoid || !payloadToInsert.creditmemonum) {
        throw new Error("Credit memo is required!");
      }

      if (payloadToInsert.amount <= 0) {
        throw new Error("Amount must be greater than 0.");
      }

      if (!payloadToInsert.refundmethod) {
        throw new Error("Refund method is required");
      }

      if (payloadToInsert.refundmethod == "transfer") {
        if (!payloadToInsert.bankaccount) {
          throw new Error("Bank account is required.");
        }
      } else {
        payloadToInsert = {
          ...payloadToInsert,
          bankaccount: "",
        };
      }

      const response = await CustomerRefundFetch.update(slug, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/customer-refund/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Bank Transfer", value: "transfer" },
    { label: "Giro", value: "giro" },
  ];

  const bankOptions = [
    {
      label: "Bank BCA - CV SUKSES MANDIRI - 3831487788",
      value: "Bank BCA/CV SUKSES MANDIRI/3831487788",
    },
    {
      label: "Bank BCA - SJAFRUDIN HARIS EFFENDI - 3832508877",
      value: "Bank BCA/SJAFRUDIN HARIS EFFENDI/3832508877",
    },
  ];

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              RMA Enter
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

          {/* customer */}
          <Form form={form} layout="vertical">
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
                  Customer
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <Form.Item
                    label={<span className="capitalize">Customer ID</span>}
                    name="customer"
                    style={{ margin: 0 }}
                    className="w-full"
                    labelCol={{ style: { padding: 0 } }}
                    rules={[
                      { required: true, message: `Customer is required` },
                    ]}
                  >
                    <Select
                      disabled
                      showSearch
                      placeholder="Select a customer"
                      optionFilterProp="label"
                      onChange={async (value, customer) => {
                        setCreditMemoSelected({});

                        const creditMemo = await fetchCustomercreditMemo(
                          customer.customerid,
                        );

                        setDataCustomerCredit(creditMemo);

                        form.setFieldsValue({
                          creditmemo: null,
                        });
                      }}
                      options={dataCustomer}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            {/* end customer */}

            {/* invoice */}
            <div className="w-full flex flex-col gap-8 pt-4">
              <div className="w-full flex flex-col gap-2">
                <Divider
                  style={{
                    margin: "0",
                    textTransform: "capitalize",
                    borderColor: "#1677ff",
                  }}
                  orientation="left"
                >
                  Credit Memo
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <Form.Item
                    label={<span className="capitalize">Credit Memo Num</span>}
                    name="creditmemo"
                    style={{ margin: 0 }}
                    className="w-full"
                    labelCol={{ style: { padding: 0 } }}
                    rules={[
                      { required: true, message: `Credit memo is required` },
                    ]}
                  >
                    <Select
                      disabled
                      showSearch
                      placeholder="Select credit memo"
                      optionFilterProp="label"
                      onChange={async (value, opt) => {
                        setCreditMemoSelected(opt);
                      }}
                      options={dataCustomerCredit}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Form>
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
                hidden: true,
              },
              {
                key: "trandate",
                input: "date",
                isAlias: true,
              },
              {
                key: "creditmemonum",
                input: "input",
                isAlias: true,
                hidden: true,
              },
              {
                key: "memo",
                input: "text",
                isAlias: true,
              },
              {
                key: "creditmemoid",
                input: "input",
                isAlias: true,
                hidden: true,
              },
            ]}
            aliases={rmaAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />
          {/* end primary */}

          {/* payment */}
          <InputForm
            title="payment"
            type="SET_PAYMENT"
            payload={state.payloadPayment}
            data={[
              {
                key: "refundmethod",
                input: "select",
                isAlias: true,
                options: paymentOptions,
              },
              {
                key: "bankaccount",
                input: "select",
                isAlias: true,
                option: bankOptions,
                hidden: state.payloadPayment.refundmethod != "transfer",
              },
              {
                key: "amount",
                input: "number",
                isAlias: true,
                accounting: true,
              },
            ]}
            aliases={rmaAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />
          {/* end payment */}
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
