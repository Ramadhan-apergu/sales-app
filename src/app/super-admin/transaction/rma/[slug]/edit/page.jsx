"use client";

import { useEffect, useReducer, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  InputNumber,
  Modal,
  Select,
  Table,
} from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, UnorderedListOutlined } from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import {
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
  onEdit
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
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button
          disabled={!record.ischecked}
          type="link"
          onClick={() => onEdit(record)}
        >
          Edit
        </Button>
      ),
    },
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
      const resData = getResponseHandler(response);

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
      await mappingData(resDataRma);
    }

    init();
  }, []);

  async function mappingData(data) {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        entity: data.entity,
        trandate: dayjs(data.trandate),
        memo: data.memo,
        invoiceid: data.invoiceid,
        total: data.total,
      },
    });

    const resDataInv = await fetchCustomerInv(data.entity);
    setDataCustomerInv(resDataInv);

    const resDataItem = await fetchCustomerInvItem(data.invoiceid);

    const rmaIds = new Set(data.rma_items?.map((i) => i.id));

    const updateDataItem = [
      ...(data.rma_items ?? []).map((item) => ({
        ...item,
        ischecked: true,
        qtymax: item.qtymax ?? item.quantity,
      })),
      ...resDataItem
        .filter((item) => !rmaIds.has(item.id))
        .map((item) => ({
          ...item,
          ischecked: false,
          qtymax: item.qtymax ?? item.quantity,
        })),
    ];

    setDataInvItem(updateDataItem);

    form.setFieldsValue({
      customer: data.entity,

      invoice: data.invoiceid,
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

  const [editItem, setEditItem] = useState(null);

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

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit RMA
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
                      showSearch
                      placeholder="Select a customer"
                      optionFilterProp="label"
                      onChange={async (value, customer) => {
                        const resCustInv = await fetchCustomerInv(value);
                        setDataCustomerInv(resCustInv);

                        form.setFieldsValue({
                          invoice: null,
                        });
                        setDataInvItem([]);
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
                  Invoice
                </Divider>
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <Form.Item
                    label={<span className="capitalize">Invoice ID</span>}
                    name="invoice"
                    style={{ margin: 0 }}
                    className="w-full"
                    labelCol={{ style: { padding: 0 } }}
                    rules={[{ required: true, message: `invoice is required` }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select invoice"
                      optionFilterProp="label"
                      onChange={async (value, inv) => {
                        const invItem = await fetchCustomerInvItem(value);
                        setDataInvItem(
                          invItem.map((inv) => ({ ...inv, ischecked: false })),
                        );
                      }}
                      options={dataCustomerInv}
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
                key: "invoiceid",
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
                key: "memo",
                input: "text",
                isAlias: true,
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
                onEdit={(val) => {
                  setEditItem(val);
                }}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
      <Modal
        open={editItem?.id}
        onOk={() => {
          if (editItem.quantity < 1) {
            notify("error", "Error", "Quantity must be at least 1");
            return;
          }

          if (editItem.quantity > editItem.qtymax) {
            notify(
              "error",
              "Error",
              "Quantity cannot be greater than " + editItem.qtymax,
            );
            return;
          }

          const round2 = (value) => parseFloat(value.toFixed(2));

          const recalcItem = (item, quantity) => {
            const amount = round2(quantity * item.rate);
            const dpp = round2(amount / 1.11);
            const taxvalue = round2(amount - dpp);

            return {
              ...item,
              quantity,
              amount,
              subtotal: amount,
              dpp,
              taxvalue,
            };
          };

          let updatedDataInvItem = dataInvItem.map((item) =>
            item.id === editItem.id
              ? recalcItem(item, editItem.quantity)
              : item,
          );

          setDataInvItem(updatedDataInvItem);

          const total = updatedDataInvItem.reduce(
            (sum, inv) =>
              inv.ischecked ? sum + Number(inv.subtotal || 0) : sum,
            0,
          );

          dispatch({
            type: "SET_PRIMARY",
            payload: { total },
          });

          setEditItem(null);
        }}
        onCancel={() => {
          setEditItem(null);
        }}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
            <Divider
              style={{
                margin: "0",
                textTransform: "capitalize",
                borderColor: "#1677ff",
              }}
              orientation="left"
            >
              Edit Item
            </Divider>
            <div className="w-1/2 flex flex-col">
              <span>Qantity</span>
              <InputNumber
                style={{ width: "100%" }}
                value={editItem?.quantity || 0}
                onChange={(value) => {
                  setEditItem((prev) => ({
                    ...prev,
                    quantity: value,
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
