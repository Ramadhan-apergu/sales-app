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
  InfoCircleOutlined,
  LeftOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
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
import { creditMemoAliases } from "@/utils/aliases";
import { formatDateToShort } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

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
        ["due", "amount", "payment", "rate", "taxamount"].includes(key)
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
  const [modal, contextHolder] = Modal.useModal();
  const title = "rma";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});

  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await CustomerFetch.get(0, 10000, "active");
        const resData = getResponseHandler(response, notify);

        if (resData) {
          const addLabelCustomer = resData.list.map((customer) => {
            return {
              ...customer,
              label: customer.customerid,
              value: customer.id,
            };
          });
          setDataCustomer(addLabelCustomer);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      }
    }
    fetchCustomer();
  }, []);

  const initialState = {
    payloadPrimary: {
      entity: "",
      trandate: dayjs(new Date()),
      memo: "",
      invoiceid: "",
      total: 0,
    },
    rma_items: [],
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
    "item",
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

  async function fetchItemCustomerInv(customerId) {
    try {
      const response = await CreditMemoFetch.getInvoiceCustomerItem(customerId);
      const resData = getResponseHandler(response);

      if (resData) {
        const addLabelItem = resData.map((item) => {
          return {
            ...item,
            label: item.itemid,
            value: item.id,
          };
        });
        setDataItem(addLabelItem);
      } else {
        setDataItem([]);
      }
    } catch (error) {
      console.log(error.message);
      notify("error", "Error", "Failed get data item");
    }
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadPayment,
      };

      if (!payloadToInsert.entity) {
        throw new Error("Customer is required!");
      }

      if (state.credit_memo_applies.length == 0) {
        throw new Error("No invoice selected. Please select an invoice first!");
      }

      if (state.credit_memo_items.length == 0) {
        throw new Error("No item selected. Please select an item first!");
      }

      if (!payloadToInsert.trandate) {
        throw new Error("Trandate is required!");
      }

      let updateCreditApplies = state.credit_memo_applies
        .filter((item) => item.ischecked === true)
        .map((item) => {
          let updateItem = { ...item };
          delete updateItem.ischecked;
          delete updateItem.refnum;
          delete updateItem.due;
          return updateItem;
        });

      let updateCreditItems = state.credit_memo_items.map((item) => {
        let updateItem = { ...item };
        delete updateItem.displayname;
        return updateItem;
      });

      payloadToInsert = {
        ...payloadToInsert,
        credit_memo_applies: updateCreditApplies,
        credit_memo_items: updateCreditItems,
      };

      const response = await CreditMemoFetch.create(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/rma/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const initialStateItemTable = {
    item: {
      item: "",
      quantity: 0,
      units: "",
      itemdescription: "",
      rate: 0,
    },
    summary: {
      amount: 0,
    },
    tax: {
      taxable: false,
      taxrate1: 0,
      taxamount: 0,
    },
  };

  function reducerItemTable(state, action) {
    switch (action.type) {
      case "SET_ITEM":
        return {
          ...state,
          item: {
            ...state.item,
            ...action.payload,
          },
        };
      case "SET_SUMMARY":
        return {
          ...state,
          summary: {
            ...state.summary,
            ...action.payload,
          },
        };
      case "SET_TAX":
        return {
          ...state,
          tax: {
            ...state.tax,
            ...action.payload,
          },
        };
      case "RESET":
        return initialStateItemTable;
      default:
        return state;
    }
  }

  const [stateItemTable, dispatchItemTable] = useReducer(
    reducerItemTable,
    initialStateItemTable,
  );

  async function handleModalItemOk() {
    if (!stateItemTable.item.item) {
      notify("error", "Error", "Select item first");
      return;
    }

    if (
      Number(stateItemTable.item.quantity) < 1 ||
      Number(stateItemTable.item.quantity) > itemSelected.qty_invoice
    ) {
      notify(
        "error",
        "Error",
        "Quantity must be between 1 and " + itemSelected.qty_invoice,
      );
      return;
    }

    if (stateItemTable.tax.taxable && stateItemTable.tax.taxrate <= 0) {
      notify("error", "Error", "Please enter a tax rate greater than 0.");
      return;
    }

    handleAddItemToTable();

    handleModalItemCancel();
  }

  function handleAddItemToTable() {
    const rate = Number(stateItemTable.item.rate) || 0;
    const quantity = Number(stateItemTable.item.quantity) || 0;
    const taxrate1 = Number(stateItemTable.tax.taxrate1) || 0;
    const taxable = stateItemTable.tax.taxable;

    const amount = rate * quantity;
    const taxamount = taxable
      ? Math.ceil((amount / (1 + taxrate1 / 100)) * (taxrate1 / 100))
      : 0;

    const payload = {
      ...stateItemTable.item,
      ...stateItemTable.summary,
      ...stateItemTable.tax,
      amount,
      taxamount,
    };

    dispatch({
      type: "SET_ITEMS",
      payload: [...state.credit_memo_items, payload],
    });

    countSummary([...state.credit_memo_items, payload]);
  }

  function countSummary(newDataItem) {
    let total = newDataItem.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );

    let taxtotal = newDataItem.reduce(
      (total, item) => total + (Number(item.taxamount) || 0),
      0,
    );

    let subtotal = total - taxtotal;

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotal,
        taxtotal,
        total,
      },
    });
  }

  function handleModalItemCancel() {
    dispatchItemTable({ type: "RESET" });
    setItemSelected(null);
    setIsModalItemOpen(false);
  }

  async function fetchInvoiceCustmer(id) {
    try {
      const response = await PaymentFetch.getInvoiceCustomer(id || "");
      const resData = getResponseHandler(response);

      setDataInvoiceCustomer(resData);

      console.log(resData);

      //   dispatch({
      //     type: "SET_APPLIES",
      //     payload:
      //       resData?.map((item) => ({
      //         ischecked: false,
      //         invoiceid: item.id,
      //         refnum: item.tranid,
      //         trandate: item.trandate,
      //         amount: item.amount,
      //         due: item.amountdue,
      //         payment: 0,
      //       })) || [],
      //   });
    } catch (error) {
      notify("error", "Error", "Failed get data Invoice Customer");
    }
  }

  const handleChecked = (data, isChecked) => {
    let updatedData = state.credit_memo_applies;

    if (isChecked) {
      if (state.payloadPayment.unapplied > 0) {
        if (state.payloadPayment.unapplied > data.due) {
          updatedData = updatedData.map((inv) => {
            if (data.invoiceid == inv.invoiceid) {
              return {
                ...inv,
                ischecked: isChecked,
                payment: data.due,
              };
            } else {
              return inv;
            }
          });
        } else {
          updatedData = updatedData.map((inv) => {
            if (data.invoiceid == inv.invoiceid) {
              return {
                ...inv,
                ischecked: isChecked,
                payment: state.payloadPayment.unapplied,
              };
            } else {
              return inv;
            }
          });
        }
      } else {
        notify(
          "error",
          "Error",
          "Cannot apply credit memo because unapplied amount is 0.",
        );
      }
    } else {
      updatedData = updatedData.map((inv) => {
        if (data.invoiceid == inv.invoiceid) {
          return {
            ...inv,
            ischecked: isChecked,
            payment: 0,
          };
        } else {
          return inv;
        }
      });
    }

    dispatch({
      type: "SET_APPLIES",
      payload: updatedData,
    });
  };

  return (
    <>
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Credit Memo Enter
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
                <Form layout="vertical">
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
                      value={customerSelected?.value || undefined}
                      onChange={(_, customer) => {
                        setCustomerSelected(customer);
                        dispatch({
                          type: "RESET",
                        });
                        dispatch({
                          type: "SET_PRIMARY",
                          payload: {
                            entity: customer.id,
                          },
                        });
                        fetchInvoiceCustmer(customer.id);
                        fetchItemCustomerInv(customer.id);
                      }}
                      options={dataCustomer}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
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
                key: "memo",
                input: "text",
                isAlias: true,
              },
            ]}
            aliases={creditMemoAliases.primary}
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
                data={state.credit_memo_applies}
                keys={keyTableItem}
                aliases={creditMemoAliases.apply}
                keyRow={"invoiceid"}
                checkbox={true}
              />
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
      <Modal
        open={isModalItemOpen}
        onOk={handleModalItemOk}
        onCancel={handleModalItemCancel}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
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
                <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                  <p>Item Name/Number</p>
                  <Select
                    value={itemSelected?.value || undefined}
                    showSearch
                    placeholder="Select an item"
                    optionFilterProp="label"
                    onChange={(_, item) => {
                      const isDuplicate = state.credit_memo_items.some(
                        (tableItem) => tableItem.item === item.value,
                      );

                      if (isDuplicate) {
                        notify("error", "Error", "Item has been added.");
                        return;
                      }

                      setItemSelected(item);

                      dispatchItemTable({
                        type: "SET_ITEM",
                        payload: {
                          item: item.id,
                          units: item.unitstype,
                          rate: item.price,
                          displayname: item.displayname,
                          quantity: 0,
                        },
                      });
                    }}
                    options={dataItem}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <InputForm
              title="Item Quantity"
              type="SET_ITEM"
              payload={stateItemTable.item}
              data={[
                {
                  key: "item",
                  input: "input",
                  isAlias: true,
                  isRead: true,
                  hidden: true,
                },
                {
                  key: "quantity",
                  input: "number",
                  isAlias: true,
                },
                {
                  key: "units",
                  input: "input",
                  isAlias: true,
                  isRead: true,
                },
                {
                  key: "rate",
                  input: "number",
                  isAlias: true,
                  isRead: true,
                  accounting: true,
                },
                {
                  key: "itemdescription",
                  input: "text",
                  isAlias: true,
                },
              ]}
              aliases={creditMemoAliases.item}
              onChange={(type, payload) => {
                dispatchItemTable({ type, payload });
              }}
            />
            <InputForm
              title="Tax Item"
              type="SET_TAX"
              payload={stateItemTable.tax}
              data={[
                {
                  key: "taxable",
                  input: "select",
                  options: [
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ],
                  isAlias: true,
                },
                {
                  key: "taxrate1",
                  input: "number",
                  isAlias: true,
                  disabled: !stateItemTable.tax.taxable,
                },
              ]}
              aliases={creditMemoAliases.item}
              onChange={(type, payload) => {
                dispatchItemTable({ type, payload });
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
