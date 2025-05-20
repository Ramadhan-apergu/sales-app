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
import { formatDateToShort } from "@/utils/formatDate";
import AgreementFetch from "@/modules/salesApi/agreement";
import EmptyCustom from "@/components/superAdmin/EmptyCustom";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right", // semua kolom di-align ke kanan
    })),
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
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

        console.log(resData);

        if (resData) {
          setData(resData);
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
        entity: data.entity,
        trandate: formatDateToShort(data.trandate),
        salesrep: data.salesrep,
        otherrefnum: data.otherrefnum,
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
        term: data.term,
        paymentoption: data.paymentoption,
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingoption: data.shippingoption,
        shippingaddress: data.shippingaddress,
      },
    });

    if (data.sales_order_items && data.sales_order_items.length > 0) {
      const dataSalesOrderFetch = await Promise.all(
        data.sales_order_items.map(async (so) => {
          let data = so;

          const item = await fetchItemById(data.item);

          if (item) {
            data = {
              ...data,
              itemid: item.itemid,
              displayname: item.displayname,
            };
          } else {
            data = {
              ...data,
              itemid: "",
              displayname: "",
            };
          }

          if (data.discountvalue1 && data.value1) {
            data = {
              ...data,
              discountname1: "Discount Price",
              discount1: "itemdiscount",
            };
          } else {
            data = {
              ...data,
              discountname1: "",
              discount1: "",
              discountvalue1: data?.discountvalue1 || "",
              value1: data?.value1 || "",
            };
          }

          if (data.discount2) {
            const agreement = await fetchAgreementById(data.discount2);
            data = {
              ...data,
              discountname2: agreement ? agreement.agreementname : "",
              discountvalue2: data.discountvalue2 == 1 ? "rp" : "%",
            };
          } else {
            data = {
              ...data,
              discountname2: "",
              discountvalue2: "",
              discount2: "",
            };
          }

          if (data.discount3) {
            const agreement = await fetchAgreementById(data.discount3);
            data = {
              ...data,
              discountname3: agreement ? agreement.agreementname : "",
              discountvalue3: data.discountvalue3 == 1 ? "rp" : "%",
            };
          } else {
            data = {
              ...data,
              discountname3: "",
              discountvalue3: "",
              discount3: "",
            };
          }

          return data;
        })
      );

      setDataTableItem(dataSalesOrderFetch);
    }
  }

  async function fetchItemById(id) {
    try {
      const response = await ItemFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      notify("error", "Error", "Failed get data item");
    }
  }

  async function fetchAgreementById(id) {
    try {
      const response = await AgreementFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      notify("error", "Error", "Failed get data agreement");
    }
  }

  const initialState = {
    payloadCustomer: {
      customer: "",
    },
    payloadPrimary: {
      entity: "",
      trandate: dayjs(new Date()),
      salesrep: "sales_indoor",
      otherrefnum: "",
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
      shippingoption: "",
      shippingaddress: "",
      shippingtype: 0,
    },
    dataTableItem: [],
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
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const keyTableItem = [
    "displayname",
    "quantity",
    "units",
    "rate",
    "description",
    "discountname1",
    "value1",
    "discountvalue1",
    "perunit1",
    "discountname2",
    "value2",
    "discountvalue2",
    "perunit2",
    "discountname3",
    "value3",
    "discountvalue3",
    "perunit3",
    "subtotal",
    "totalamount",
    "totaldiscount",
    "qtyfree",
    "unitfree",
    "taxable",
    "taxrate",
    "taxvalue",
    "backordered",
  ];

  const [dataTableItem, setDataTableItem] = useState([]);

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

  const handleEdit = () => {
    router.push(`/super-admin/transaction/${title}/${data.id}/edit`);
  };

  const [modal, contextHolder] = Modal.useModal();

  const items = [
    {
      key: "1",
      label: "Approve",
    },
    {
      key: "2",
      label: "Cancel",
      danger: true,
    },
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
                        {data.id + " / " + data.customer}
                      </p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          color={
                            data.status.toLowerCase() == "open"
                              ? "green"
                              : "red"
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
                  <InputForm
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
                    aliases={[]}
                  />
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
                    aliases={[]}
                  />
                  <InputForm
                    title="shipping"
                    type="SET_SHIPPING"
                    payload={state.payloadShipping}
                    data={[
                      {
                        key: "shippingoption",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "shippingaddress",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={[]}
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
                    aliases={[]}
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
                        data={dataTableItem}
                        keys={keyTableItem}
                        aliases={{}}
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
                            {formatRupiah(state.payloadSummary.subtotalbruto)}
                          </p>
                        </div>
                        <div className="flex w-full">
                          <p className="w-1/2">Discount Item</p>
                          <p className="w-1/2 text-end">
                            {formatRupiah(state.payloadSummary.discounttotal)}
                          </p>
                        </div>
                        <div className="flex w-full">
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
