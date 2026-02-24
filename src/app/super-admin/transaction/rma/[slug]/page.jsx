"use client";

import React, { useEffect, useReducer, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  Table,
  Tag,
} from "antd";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  DeliveredProcedureOutlined,
  EditOutlined,
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
import dayjs from "dayjs";
import { rmaAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import RmaFetch from "@/modules/salesApi/rma";

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
    ...keys.map((key) => {
      if (key == "isfree") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center",
          render: (text) => <p>{text ? "Yes" : "No"}</p>,
        };
      } else if (key == "trandate") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center",
          render: (text) => <p>{formatDateToShort(text)}</p>,
        };
      } else if (
        [
          "subtotal",
          "amount",
          "taxvalue",
          "rate",
          "dpp",
          "totaldiscount",
        ].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "left",
          render: (text) => <p>{formatRupiah(text)}</p>,
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
  const title = "rma";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const { slug } = useParams();

  const [form] = Form.useForm();

  const [dataCustomer, setDataCustomer] = useState([]);

  const [dataCustomerInv, setDataCustomerInv] = useState([]);

  const [dataInvItem, setDataInvItem] = useState([]);
  const [invItemSelected, setInvItemSelected] = useState({});

  const [data, setData] = useState([]);

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

  async function fetchCustomerInv(custId) {
    try {
      const response = await RmaFetch.getInvoiceCustomer(custId);
      const resData = getResponseHandler(response, notify);
      if (resData) {
        return resData.map((inv) => ({
          ...inv,
          label: inv.tranid,
          value: inv.id,
        }));
      } else {
        return [];
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer invoice");
      return [];
    }
  }

  async function fetchCustomerInvItem(invId) {
    try {
      const response = await RmaFetch.getInvoiceCustomerItem(invId);
      const resData = getResponseHandler(response, notify);

      if (resData) {
        return resData;
      } else {
        return [];
      }
    } catch (error) {
      notify("error", "Error", "Failed get data customer invoice item");
      return [];
    }
  }

  async function fetchRma(id) {
    try {
      const response = await RmaFetch.getById(id);
      const resData = getResponseHandler(response, notify);
      if (resData) {
        return resData;
      } else {
        return {};
      }
    } catch (error) {
      notify("error", "Error", "Failed get data detail");
      return {};
    }
  }

  useEffect(() => {
    async function init() {
      const resDataCustomer = await fetchCustomer();
      const resDataRma = await fetchRma(slug);

      setDataCustomer(resDataCustomer);
      setData(resDataRma);
      await mappingData(resDataRma, resDataCustomer);
    }

    init();
  }, []);

  async function mappingData(data, dataCustomer) {
    const resDataInv = await fetchCustomerInv(data.entity);
    setDataCustomerInv(resDataInv);

    const resDataItem = await fetchCustomerInvItem(data.invoiceid);

    setDataInvItem(resDataItem);

    const entity =
      dataCustomer.find((customer) => customer.id == data.entity)
        ?.companyname || "";

    const invoiceid =
      resDataInv.find((inv) => inv.id == data.invoiceid)?.tranid || "";

    dispatch({
      type: "SET_PRIMARY",
      payload: {
        entity: entity,
        trandate: formatDateToShort(data.trandate),
        memo: data.memo,
        invoiceid: invoiceid,
        total: data.total,
      },
    });

    form.setFieldsValue({
      customer: entity,

      invoice: invoiceid,
    });
  }

  const initialState = {
    payloadPrimary: {
      entity: "",
      trandate: "",
      memo: "",
      invoiceid: "",
      total: 0,
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
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const keyTableItem = [
    // "item",
    "displayname",
    "quantity",
    "units",
    "rate",
    "amount",
    "totaldiscount",
    "subtotal",
    "dpp",
    "taxrate",
    "taxvalue",
    "isfree",
  ];

  const [isModalItemOpen, setIsModalItemOpen] = useState(false);

  const [dataInvoiceCustomer, setDataInvoiceCustomer] = useState([]);

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        rma_items: [...dataInvItem.filter((inv) => inv.ischecked == true)].map(
          (inv) => {
            let updateInv = inv;
            delete updateInv.ischecked;
            return updateInv;
          },
        ),
      };

      if (!payloadToInsert.rma_items.length) {
        throw new Error("At least one item is required!");
      }

      payloadToInsert = {
        ...payloadToInsert,
        entity: form.getFieldValue("customer"),
        invoiceid: form.getFieldValue("invoice"),
      };

      if (!payloadToInsert.entity) {
        throw new Error("Customer is required!");
      }

      if (!payloadToInsert.invoiceid) {
        throw new Error("Invoice is required!");
      }

      const response = await RmaFetch.update(slug, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/rma/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleChecked = (data, ischecked) => {
    setDataInvItem((prev) => {
      const updated = prev.map((inv) =>
        inv.id === data.id ? { ...inv, ischecked } : inv,
      );

      const total = updated.reduce(
        (sum, inv) => (inv.ischecked ? sum + Number(inv.subtotal || 0) : sum),
        0,
      );

      dispatch({
        type: "SET_PRIMARY",
        payload: { total },
      });

      return updated;
    });
  };

  async function handleReceive() {
    try {
      const response = await RmaFetch.updateReceive(slug);
      const resData = updateResponseHandler(response, notify);

      if (resData) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", error.message);
    }
  }

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              RMA Details
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

          <div className="w-full flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-1/2 flex gap-1 flex-col">
              <p className="w-full lg:text-lg">
                {`${data?.tranid || ""} / ${
                  state.payloadPrimary?.entity || ""
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
                icon={<DeliveredProcedureOutlined />}
                type={"primary"}
                onClick={() => {
                  handleReceive();
                }}
                disabled={data?.status?.toLowerCase() == "received"}
              >
                {isLargeScreen ? "Receive" : ""}
              </Button>
              <Button
                icon={<EditOutlined />}
                type={"primary"}
                onClick={() => {
                  router.push(
                    `/super-admin/transaction/rma/${
                      data?.id || ""
                    }/edit`,
                  );
                }}
                disabled={data?.status?.toLowerCase() == "received"}
              >
                {isLargeScreen ? "Edit" : ""}
              </Button>
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
                    label={<span className="capitalize">Customer</span>}
                    name="customer"
                    style={{ margin: 0 }}
                    className="w-full"
                    labelCol={{ style: { padding: 0 } }}
                  >
                    <Input readOnly style={{ width: "100%" }} />
                  </Form.Item>
                </div>
              </div>
            </div>
            {/* end customer */}

            {/* invoice */}
            <div className="w-full flex flex-col gap-8 mt-4">
              <div className="w-full flex flex-col gap-2">
                <Divider
                  style={{
                    margin: "0",
                    textTransform: "capitalize",
                    borderColor: "#1677ff",
                  }}
                  orientation="left"
                >
                  Invoice
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <Form.Item
                    label={<span className="capitalize">Invoice ID</span>}
                    name="invoice"
                    style={{ margin: 0 }}
                    className="w-full"
                    labelCol={{ style: { padding: 0 } }}
                  >
                    <Input readOnly style={{ width: "100%" }} />
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
                key: "invoiceid",
                input: "input",
                isAlias: true,
                isRead: true,
                hidden: true,
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
              {
                key: "total",
                input: "number",
                isAlias: true,
                accounting: true,
                isRead: true,
              },
            ]}
            aliases={rmaAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />
          {/* end primary */}

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
                onChange={handleChecked}
                data={dataInvItem}
                keys={keyTableItem}
                aliases={rmaAliases.item}
                keyRow={"id"}
                checkbox={true}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
    </>
  );
}
