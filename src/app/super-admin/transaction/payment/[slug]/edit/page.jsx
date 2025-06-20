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
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  SaveOutlined,
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

function TableCustom({ data, keys, aliases, onChange }) {
  const columns = [
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
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right",
    })),
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
  const [modal, contextHolder] = Modal.useModal();
  const title = "payment";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { slug } = useParams();

  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);

  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const response = await PaymentFetch.getById(slug);
        const resData = getResponseHandler(response);
        setData(resData);
        if (resData) {
          mappingDataPayload(resData);
          await fetchCustomer(resData);
          fetchInvoiceCustmerInit(resData);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayment();

    async function fetchCustomer(data) {
      try {
        const response = await CustomerFetch.get(0, 10000, "active");
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelCustomer = resData.list.map((customer) => {
            return {
              ...customer,
              label: customer.companyname,
              value: customer.id,
            };
          });
          setDataCustomer(addLabelCustomer);
          const findCustomer = addLabelCustomer.find(
            (customer) => customer.id == data.customer
          );
          setCustomerSelected(findCustomer);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      }
    }
  }, []);

  const initialState = {
    payloadPrimary: {
      customer: "",
      companyname: "",
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
    { label: "Credit", value: "credit" },
  ];

  const keyTableItem = [
    "invoiceid",
    "refnum",
    "applydate",
    "total",
    "due",
    "amount",
  ];

  const [isModalItemOpen, setIsModalItemOpen] = useState(false);

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

  const [dataInvoiceCustomer, setDataInvoiceCustomer] = useState([]);

  function mappingDataPayload(data) {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        customer: data.customer,
        companyname: data.companyname,
        trandate: dayjs(data.trandate),
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
      },
    });

    dispatch({
      type: "SET_PAYMENTAPPLY",
      payload: data.payment_applies,
    });

    dispatch({
      type: "SET_ITEMS",
      payload: data.payment_applies,
    });
  }

  async function fetchInvoiceCustmer(customerid) {
    try {
      const response = await PaymentFetch.getInvoiceCustomer(customerid || "");
      const resData = getResponseHandler(response);

      setDataInvoiceCustomer(resData);

      const mappedItems =
        resData?.map((item) => ({
          ischecked: false,
          invoiceid: item.id,
          refnum: item.tranid,
          applydate: item.trandate,
          total: item.amount,
          due: item.amount,
          amount: item.amountdue,
        })) || [];

      dispatch({
        type: "SET_ITEMS",
        payload:
          customerid === data.customer
            ? [...mappedItems, ...(data.payment_applies || [])]
            : mappedItems,
      });
    } catch (error) {
      notify("error", "Error", "Failed get data Invoice Customer");
    }
  }

  async function fetchInvoiceCustmerInit(data) {
    try {
      const response = await PaymentFetch.getInvoiceCustomer(
        data.customer || ""
      );
      const resData = getResponseHandler(response);

      setDataInvoiceCustomer(resData);

      const mappedItems =
        resData?.map((item) => ({
          ischecked: false,
          invoiceid: item.id,
          refnum: item.tranid,
          applydate: item.trandate,
          total: item.amount,
          due: item.amount,
          amount: item.amountdue,
        })) || [];

      dispatch({
        type: "SET_ITEMS",
        payload: [
          ...mappedItems,
          ...(data.payment_applies.map((payment) => ({
            ...payment,
            ischecked: true,
          })) || []),
        ],
      });
    } catch (error) {
      notify("error", "Error", "Failed get data Invoice Customer Init");
    }
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

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadPayment,
      };

      if (!payloadToInsert.customer) {
        throw new Error("Customer is required!");
      }

      if (payloadToInsert.unapplied != 0) {
        throw new Error("You still have an unapplied balance!");
      }

      if (state.payloadPaymentApplies.length == 0) {
        throw new Error("No invoice selected. Please select an invoice first!");
      }

      if (!payloadToInsert.trandate) {
        throw new Error("Trandate is required!");
      }

      if (!payloadToInsert.paymentoption) {
        throw new Error("Payment Option is required!");
      }

      const updatePaymentApplies = state.payloadPaymentApplies.map((item) => {
        let updateItem = item;
        delete updateItem.ischecked;
        return updateItem;
      });

      payloadToInsert = {
        ...payloadToInsert,
        payment_applies: updatePaymentApplies,
      };

      const response = await PaymentFetch.update(slug, payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/payment/${resData}`);
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
              Payment Enter
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
                        Customer
                      </Divider>
                      <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                        <Form
                          layout="vertical"
                          initialValues={{ customer: customerSelected?.id }}
                        >
                          <Form.Item
                            label={<span className="capitalize">Customer Name</span>}
                            name="customer"
                            style={{ margin: 0 }}
                            className="w-full"
                            labelCol={{ style: { padding: 0 } }}
                            rules={[
                              {
                                required: true,
                                message: `Customer is required`,
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select a customer"
                              optionFilterProp="label"
                              //   defaultValue={customerSelected?.value}
                              onChange={(_, customer) => {
                                setCustomerSelected(customer);
                                dispatch({
                                  type: "RESET",
                                });
                                dispatch({
                                  type: "SET_PRIMARY",
                                  payload: {
                                    customer: customer.id,
                                  },
                                });
                                fetchInvoiceCustmer(customer.id);
                              }}
                              options={dataCustomer}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  </div>
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
                      {
                        key: "trandate",
                        input: "date",
                        isAlias: true,
                      },
                      {
                        key: "memo",
                        input: "text",
                        isAlias: true,
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
                        input: "select",
                        options: paymentOptions,
                        isAlias: true,
                      },
                      {
                        key: "payment",
                        input: "number",
                        isAlias: true,
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
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
