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
  Input,
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
  updateResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import dayjs from "dayjs";
import { formatDateToShort } from "@/utils/formatDate";
import AgreementFetch from "@/modules/salesApi/agreement";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import { salesOrderAliases } from "@/utils/aliases";

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

function TableCustom({ data, keys, aliases }) {
  const columns = [
    {
      title: "No",
      key: "no",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    ...keys.map((key) => {
      if (
        [
          "rate",
          "value1",
          "value2",
          "value3",
          "subtotal",
          "totalamount",
          "taxvalue",
          "totaldiscount",
        ].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "right",
          render: (text) => <p>{formatRupiah(text)}</p>,
        };
      } else if (key === "quantity") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "right",
          render: (text) => <p>{Number(text) || 0}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "right",
        };
      }
    }),
  ];

  // Perhitungan total untuk kolom tertentu
  const totalQuantity = data.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const totalSubtotal = data.reduce((sum, r) => sum + (r.subtotal || 0), 0);
  const totalAmount = data.reduce((sum, r) => sum + (r.totalamount || 0), 0);
  const totalDiscount = data.reduce(
    (sum, r) => sum + (r.totaldiscount || 0),
    0
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
      summary={() => (
        <Table.Summary.Row>
          {/* Kolom pertama: label Total */}
          <Table.Summary.Cell index={0} align="center">
            <b>Total</b>
          </Table.Summary.Cell>

          {/* Loop semua kolom agar posisi total sesuai urutan kolom */}
          {keys.map((key, i) => {
            if (key === "quantity")
              return (
                <Table.Summary.Cell key={key} index={i + 1} align="right">
                  <b>{totalQuantity}</b>
                </Table.Summary.Cell>
              );
            if (key === "subtotal")
              return (
                <Table.Summary.Cell key={key} index={i + 1} align="right">
                  <b>{formatRupiah(totalSubtotal)}</b>
                </Table.Summary.Cell>
              );
            if (key === "totalamount")
              return (
                <Table.Summary.Cell key={key} index={i + 1} align="right">
                  <b>{formatRupiah(totalAmount)}</b>
                </Table.Summary.Cell>
              );
            if (key === "totaldiscount")
              return (
                <Table.Summary.Cell key={key} index={i + 1} align="right">
                  <b>{formatRupiah(totalDiscount)}</b>
                </Table.Summary.Cell>
              );

            // Kolom lainnya dikosongkan
            return <Table.Summary.Cell key={key} index={i + 1} />;
          })}
        </Table.Summary.Row>
      )}
    />
  );
}

export default function Detail() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const { slug } = useParams();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const title = "sales-order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState({});

  useEffect(() => {
    async function fetchSalesOrder() {
      try {
        const response = await SalesOrderFetch.getById(slug);
        const resData = getResponseHandler(response);

        if (resData) {
          setData(resData);
          console.log(resData);
          mappingDataSalesOrder(resData);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data Sales Order");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSalesOrder();
  }, []);

  async function mappingDataSalesOrder(data) {
    dispatch({
      type: "SET_CUSTOMER",
      payload: {
        customer: data.customer,
      },
    });

    dispatch({
      type: "SET_PRIMARY",
      payload: {
        customer: data.customer,
        entity: data.entity,
        trandate: formatDateToShort(data.trandate),
        salesrep: data.salesrep,
        otherrefnum: data.otherrefnum,
        isdropship: data.isdropship ? "Yes" : "No",
      },
    });

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotalbruto: data.subtotalbruto,
        discounttotal: data.discounttotal,
        subtotal: data.subtotal,
        taxtotal: data.taxtotal,
        total: data.total,
      },
    });

    dispatch({
      type: "SET_BILLING",
      payload: {
        term: data.term + " Days",
        paymentoption: data.paymentoption,
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        notes: data.notes,
        shippingaddress: data.shippingaddress,
      },
    });

    dispatch({
      type: "SET_ITEMS",
      payload: data.sales_order_items,
    });

    dispatch({
      type: "SET_ITEM_FREE",
      payload: data.sales_order_item_free,
    });
  }

  const initialState = {
    payloadCustomer: {
      customer: "",
    },
    payloadPrimary: {
      customer: "",
      entity: "",
      trandate: dayjs(new Date()),
      salesrep: "sales_indoor",
      otherrefnum: "",
      isdropship: "",
    },
    payloadSummary: {
      subtotalbruto: 0,
      discounttotal: 0,
      subtotal: 0,
      taxtotal: 0,
      total: 0,
    },
    payloadBilling: {
      term: "Net 30",
      paymentoption: "",
    },
    payloadShipping: {
      notes: "",
      shippingaddress: "",
    },
    dataTableItem: [],
    dataItemFree: [],
  };

  function reducer(state, action) {
    switch (action.type) {
      case "SET_CUSTOMER":
        return {
          ...state,
          payloadCustomer: {
            ...state.payloadCustomer,
            ...action.payload,
          },
        };
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
      case "SET_BILLING":
        return {
          ...state,
          payloadBilling: {
            ...state.payloadBilling,
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
      case "SET_ITEMS":
        return {
          ...state,
          dataTableItem: action.payload,
        };
      case "SET_ITEM_FREE":
        return {
          ...state,
          dataItemFree: action.payload,
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
    "rate",
    "quantity",
    "units",
    // "description",
    "totalamount",
    "totaldiscount",
    "subtotal",
    "taxrate",
    "backordered",
  ];

  const handleEdit = () => {
    router.push(`/super-admin/transaction/${title}/${data.id}/edit`);
  };

  const [modal, contextHolder] = Modal.useModal();

  const items = [
    {
      key: "1",
      label: "Approve",
      disabled:
        !data.status || data.status.toLowerCase() !== "pending approval",
    },
    {
      key: "2",
      label: "Cancel",
      danger: true,
      disabled:
        !data.status || data.status.toLowerCase() !== "pending approval",
    },
  ];

  async function handleApproval() {
    try {
      setIsLoadingSubmit(true);
      const response = await SalesOrderFetch.approveSoPending(
        data.id,
        "approved"
      );
      updateResponseHandler(response, notify);
      router.refresh();
    } catch (error) {
      notify("error", "Error", "Failed approval customer");
    } finally {
      setIsLoadingSubmit(false);
    }
  }
  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        handleApproval();
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

  const handleDelete = async (id) => {
    try {
      const response = await SalesOrderFetch.approveSoPending(id, "rejected");

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Sales Order Details
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
                            ["fulfilled", "closed"].includes(
                              data.status.toLowerCase()
                            )
                              ? "green"
                              : ["partially fulfilled"].includes(
                                  data.status.toLowerCase()
                                )
                              ? "orange"
                              : ["credit hold", "canceled"].includes(
                                  data.status.toLowerCase()
                                )
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
                        icon={<FileAddOutlined />}
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/super-admin/transaction/delivery-order/enter?salesOrderId=${data.id}`
                          );
                        }}
                      >
                        {isLargeScreen ? "Fulfill" : ""}
                      </Button>

                      <Button
                        disabled={["credit hold", "fulfilled"].includes(
                          data.status.toLowerCase()
                        )}
                        icon={<EditOutlined />}
                        type={"primary"}
                        onClick={handleEdit}
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
                  {/* <InputForm
                    title="customer"
                    type="SET_CUSTOMER"
                    payload={state.payloadCustomer}
                    data={[
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={salesOrderAliases.customer}
                  /> */}
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
                        key: "entity",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        hidden: true,
                      },
                      {
                        key: "isdropship",
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
                        key: "salesrep",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "otherrefnum",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={salesOrderAliases.primary}
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
                      },
                      {
                        key: "notes",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={salesOrderAliases.shipping}
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
                        key: "paymentoption",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={salesOrderAliases.billing}
                  />
                  <div className="w-full flex flex-col gap-8">
                    <div className="w-full flex flex-col gap-4">
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
                        data={state.dataTableItem}
                        keys={keyTableItem}
                        aliases={salesOrderAliases.item}
                      />
                    </div>
                  </div>

                  {state.dataItemFree && state.dataItemFree.length > 0 && (
                    <div className="w-full flex flex-col gap-8">
                      <div className="w-full flex flex-col gap-2">
                        <Divider
                          style={{
                            margin: 0,
                            textTransform: "capitalize",
                            borderColor: "#1677ff",
                          }}
                          orientation="left"
                        >
                          Item Free
                        </Divider>

                        <div className="w-full flex lg:pr-2 flex-col">
                          <Form layout="vertical">
                            <div className="w-full flex gap-4 flex-wrap">
                              {state.dataItemFree.map((item, i) => (
                                <Form.Item
                                  key={i}
                                  initialValue={item.itemcode}
                                  label={
                                    <span className="capitalize">
                                      Free {item.qtyfree}
                                    </span>
                                  }
                                  name={`freeitem${i}`}
                                  style={{ margin: 0, width: "50%" }}
                                  className="w-full"
                                  labelCol={{ style: { padding: 0 } }}
                                  rules={[
                                    {
                                      required: true,
                                      message: `Item is required`,
                                    },
                                  ]}
                                >
                                  <Input readOnly />
                                </Form.Item>
                              ))}
                            </div>
                          </Form>
                        </div>
                      </div>
                    </div>
                  )}

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
                            {formatRupiah(state.payloadSummary.subtotalbruto)}
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
                        </div> */}

                        <hr className="border-gray-5" />
                        <div className="flex w-full font-semibold">
                          <p className="w-1/2">Total Inc PPN</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.total)}
                          </p>
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
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
