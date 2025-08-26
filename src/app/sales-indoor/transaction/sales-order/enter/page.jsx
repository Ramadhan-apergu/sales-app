"use client";

import InputForm from "@/components/superAdmin/InputForm";
import Layout from "@/components/salesIndoor/Layout";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useNotification from "@/hooks/useNotification";
import CustomerFetch from "@/modules/salesApi/customer";
import ItemFetch from "@/modules/salesApi/item";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { salesOrderAliases } from "@/utils/aliases";
import convertToLocalDate from "@/utils/convertToLocalDate";
import { formatRupiah } from "@/utils/formatRupiah";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";

import {
  CheckOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Divider, FloatButton, Form, Modal, Select, Table } from "antd";
import { Input } from "antd/lib";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";

export default function Enter() {
  const title = "sales-order";
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const { notify, contextHolder: contextNotify } = useNotification();

  const [dataCustomer, setDataCustomer] = useState([]);
  const [dataItem, setDataItem] = useState([]);

  const [customerSelected, setCustomerSelected] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    customer: "",
    message: [],
  });
  const [itemSelected, setItemSelected] = useState({});
  const [summary, setSummary] = useState({
    subtotalbruto: 0,
    discounttotal: 0,
    total: 0,
    subtotal: 0,
    taxtotal: 0,
  });

  const initialState = {
    payloadPrimary: {
      companyname: "",
      entity: "",
      trandate: dayjs(new Date()),
      salesrep: "",
      otherrefnum: "",
    },
    payloadBilling: {
      term: "7",
      paymentoption: "cash",
    },
    payloadShipping: {
      notes: "",
      shippingaddress: "",
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
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  async function fetchCustomer() {
    try {
      const response = await CustomerFetch.get(0, 10000, "active");
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      throw error;
    }
  }

  async function fetchItem() {
    try {
      const response = await ItemFetch.get(0, 10000);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      throw error;
    }
  }

  async function fetchInit() {
    try {
      const getCustomer = await fetchCustomer();
      if (getCustomer) {
        const updateLabelCustomer = getCustomer.list.map((item) => ({
          ...item,
          label: item.customerid,
          value: item.id,
        }));
        setDataCustomer(updateLabelCustomer);
      }

      const getItem = await fetchItem();
      if (getItem) {
        const updateLabelItem = getItem.list.map((item) => ({
          ...item,
          label: item.itemid,
          value: item.id,
        }));
        setDataItem(updateLabelItem);
      }
    } catch (error) {
      console.error(error);
      notify("error", "Failed get data");
    }
  }

  useEffect(() => {
    fetchInit();
  }, []);

  function handleCustomerChange(customer) {
    setCustomerSelected(customer);
    if (customer.id) {
      checkStatusCustomer(customer.id, customer.customerid);
    }

    dispatch({
      type: "SET_PRIMARY",
      payload: {
        entity: customer.id,
        companyname: customer.companyname,
        salesrep: customer.salesrep,
      },
    });
    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingaddress: customer.addressee,
      },
    });
    dispatch({
      type: "SET_BILLING",
      payload: {
        term: customer.terms,
      },
    });
    updateDataItemTable(null, null, customer.id);
  }

  async function checkStatusCustomer(id, name) {
    try {
      const response = await SalesOrderFetch.checkSoVrify(id);
      if (response.status_code != 404) {
        setCustomerInfo({
          customer: name,
          message: response.errors,
        });
      } else {
        setCustomerInfo({
          customer: "",
          message: [],
        });
      }
    } catch (error) {
      notify("error", "Failed", "Failed get customer information");
    }
  }

  function showCustomerInfo() {
    customerInfo.message.forEach((info, i) => {
      const timeout = i > 0 ? 300 : 0;
      setTimeout(() => {
        notify("info", "Customer ID : " + customerInfo.customer, info);
      }, timeout);
    });
  }

  const termOptions = [
    { label: "7 Days", value: "7" },
    { label: "14 Days", value: "14" },
    { label: "30 Days", value: "30" },
  ];

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Credit", value: "credit" },
  ];

  const keyTableItem = [
    "itemid",
    "displayname",
    "quantity",
    "units",
    "rate",
    // "description",
    "taxable",
    "taxrate",
    "totalamount",
    "totaldiscount",
    "subtotal",
  ];

  const initialStateItemTable = {
    item: {
      item: "",
      quantity: 0,
      units: "",
      description: "",
      rate: 0,
      displayname: "",
      itemprocessfamily: "",
      itemid: "",
      agreementcode: "",
    },
    tax: {
      taxable: false,
      taxrate: 0,
    },
    summary: {
      totaldiscount: 0,
      totalamount: 0,
      subtotal: 0,
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
    initialStateItemTable
  );

  const [isModalItemOpen, setIsModalItemOpen] = useState(false);
  const [dataDiscount, setDataDiscount] = useState(null);

  function handleAddItem() {
    if (!state.payloadPrimary.entity || state.payloadPrimary.entity == "") {
      notify(
        "error",
        "Error",
        "Select the customer first in the customer section"
      );
      return;
    }

    if (!state.payloadPrimary.trandate || state.payloadPrimary.trandate == "") {
      notify(
        "error",
        "Error",
        "Fill in the trandate first in the primary section"
      );
      return;
    }

    if (
      !state.payloadBilling.paymentoption ||
      state.payloadBilling.paymentoption == ""
    ) {
      notify(
        "error",
        "Error",
        "Select the payment option first in the billing section."
      );
      return;
    }

    setIsModalItemOpen(true);
  }

  const [dataTableItem, setDataTableItem] = useState([]);
  const [dataItemFree, setDataItemFree] = useState([]);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  async function handleModalItemOk() {
    if (!stateItemTable.item.item) {
      notify("error", "Error", "Select item first");
      return;
    }

    if (stateItemTable.item.quantity <= 0) {
      notify("error", "Error", "Please enter a quantity greater than 0.");
      return;
    }

    if (stateItemTable.tax.taxable && stateItemTable.tax.taxrate <= 0) {
      notify("error", "Error", "Please enter a tax rate greater than 0.");
      return;
    }

    const dataItemNew = {
      ...stateItemTable.item,
      ...stateItemTable.summary,
      ...stateItemTable.tax,
    };
    const updateItemTable = [...dataTableItem, dataItemNew];

    const updateDiscountItem = await getDiscountItem(updateItemTable);

    setDataTableItem(updateDiscountItem);

    handleModalItemCancel();
  }

  function handleModalItemCancel() {
    dispatchItemTable({ type: "RESET" });
    setItemSelected(null);
    setIsModalItemOpen(false);
  }

  async function updateDataItemTable(
    updatedData = null,
    payment_type = null,
    cust_id = null
  ) {
    try {
      const updateDiscountItem = await getDiscountItem(
        updatedData ? updatedData : dataTableItem,
        payment_type,
        cust_id
      );

      if (dataTableItem != updateDataItemTable) {
        setDataTableItem(updateDiscountItem);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getDiscountItem(itemTable, payment_type_params, customer_id) {
    try {
      if (itemTable.length == 0) {
        setDataDiscount(null);
        setDataItemFree([]);
        return [];
      }
      const payload = {
        cust_id: customer_id ? customer_id : customerSelected.id,
        trandate: convertToLocalDate(state.payloadPrimary.trandate),
        payment_type: payment_type_params
          ? payment_type_params
          : state.payloadBilling.paymentoption,
        sales_order_items: itemTable.map((item) => ({
          item_id: item.item,
          itemprocessfamily: item.itemprocessfamily,
          qty: item.quantity,
        })),
      };

      const response = await SalesOrderFetch.getCalDiscount(payload);
      const resData = getResponseHandler(response);

      setDataDiscount(resData);

      if (resData.diskon_group && resData.diskon_group.length > 0) {
        const discountFreeItem = resData.diskon_group.map((discount) => ({
          item: "",
          qtyfree: discount.qtyfree,
          unitfree: discount?.unitfree || "kg",
        }));

        setDataItemFree(discountFreeItem);
      } else {
        setDataItemFree([]);
      }

      const discountItems = resData?.sales_order_items ?? [];

      const updateItemTable = itemTable.map((item) => {
        const findItemDiscount = discountItems.find(
          (discount) => discount.item_id === item.item
        );

        const totalamount = item.quantity * item.rate;
        const totaldiscount = findItemDiscount?.total_diskon || 0;
        const subtotal = totalamount - totaldiscount;

        return {
          ...item,
          agreementcode: findItemDiscount?.agreementcode || "",
          totaldiscount,
          totalamount,
          subtotal,
        };
      });

      return updateItemTable;
    } catch (error) {
      console.error("Error getting discount:", error);
      throw error;
    }
  }

  useEffect(() => {
    if (!dataTableItem || dataTableItem.length === 0) {
      setSummary({
        subtotalbruto: 0,
        subtotal: 0,
        discounttotal: 0,
        total: 0,
        taxtotal: 0,
      });
      return;
    }

    const { totalDiscount, totalAmount, subTotal } = dataTableItem.reduce(
      (acc, item) => {
        acc.totalDiscount += item.totaldiscount || 0;
        acc.totalAmount += item.totalamount || 0;
        acc.subTotal += item.subtotal || 0;
        return acc;
      },
      {
        totalDiscount: 0,
        totalAmount: 0,
        subTotal: 0,
      }
    );

    setSummary({
      subtotalbruto: totalAmount,
      subtotal: subTotal,
      discounttotal: totalDiscount,
      total: subTotal,
      taxtotal: 0,
    });
  }, [dataTableItem]);

  function handleDeleteTableItem(record) {
    const updateData = dataTableItem.filter(
      (item) => item.item !== record.item
    );
    setDataTableItem(updateData);

    updateDataItemTable(updateData);
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      if (dataTableItem.length <= 0) {
        throw new Error("Please enter order items");
      }

      dataItemFree.forEach((item) => {
        if (!item.item) {
          throw new Error("Please enter free item");
        }
      });

      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadBilling,
        ...state.payloadShipping,
        ...summary,
        sales_order_items: dataTableItem.map((item) => {
          delete item.itemprocessfamily;
          delete item.displayname;
          delete item.itemid;

          return item;
        }),
        sales_order_item_free: dataItemFree,
      };

      delete payloadToInsert.companyname;
      delete payloadToInsert.salesrep;

      console.log(payloadToInsert);

      if (!payloadToInsert.entity) {
        throw new Error("Customer is required");
      }

      if (!payloadToInsert.trandate) {
        throw new Error("Date is required");
      }

      if (!payloadToInsert.subtotal) {
        throw new Error("Subtotal invalid");
      }

      if (!payloadToInsert.total) {
        throw new Error("Total invalid");
      }

      if (
        !payloadToInsert.sales_order_items ||
        payloadToInsert.sales_order_items.length == 0
      ) {
        throw new Error("Please enter a value greater than 0.");
      }

      const response = await SalesOrderFetch.add(payloadToInsert);

      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-indoor/transaction/sales-order/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      <Layout>
        {contextNotify}
        <div className="w-full flex flex-col gap-4">
          {/* {headline} */}
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Sales Order Enter
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

          {/* {nav action button} */}
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

          {/* {customer} */}
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
                        handleCustomerChange(customer);
                      }}
                      options={dataCustomer}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>

          {/* {primary} */}
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
                cursorDisable: true,
                rules: [{ required: true, message: ` is required` }],
                placeholder: "Auto-filled after selecting a customer",
              },
              {
                key: "entity",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
                rules: [{ required: true, message: ` is required` }],
                placeholder: "Auto-filled after selecting a customer",
                hidden: true,
              },
              {
                key: "trandate",
                input: "date",
                isAlias: true,
                rules: [{ required: true, message: ` is required` }],
              },
              {
                key: "salesrep",
                input: "input",
                isAlias: true,
                isRead: true,
                cursorDisable: true,
              },
              {
                key: "otherrefnum",
                input: "input",
                isAlias: true,
              },
            ]}
            aliases={salesOrderAliases.primary}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />

          {/* {shipping} */}
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
                cursorDisable: true,
              },
              {
                key: "notes",
                input: "text",
                isAlias: true,
              },
            ]}
            aliases={salesOrderAliases.shipping}
            onChange={(type, payload) => {
              dispatch({ type, payload });
            }}
          />

          {/* {billing} */}
          <InputForm
            title="billing"
            type="SET_BILLING"
            payload={state.payloadBilling}
            data={[
              {
                key: "term",
                input: "select",
                options: termOptions,
                isAlias: true,
              },
              {
                key: "paymentoption",
                input: "select",
                options: paymentOptions,
                isAlias: true,
                rules: [{ required: true, message: ` is required` }],
              },
            ]}
            aliases={salesOrderAliases.billing}
            onChange={(type, payload) => {
              dispatch({ type, payload });

              if (dataTableItem.length > 0) {
                updateDataItemTable(null, payload.paymentoption);
              }
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
              <div className="flex justify-end">
                <Button type="primary" onClick={handleAddItem}>
                  Add
                </Button>
              </div>
              <TableCustom
                onDelete={handleDeleteTableItem}
                data={dataTableItem}
                keys={keyTableItem}
                aliases={salesOrderAliases.item}
              />
            </div>
          </div>

          {/* {item free} */}
          {dataItemFree && dataItemFree.length > 0 && (
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
                      {dataItemFree.map((item, i) => (
                        <Form.Item
                          key={i}
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
                            { required: true, message: `Item is required` },
                          ]}
                        >
                          <Select
                            showSearch
                            placeholder="Select item free"
                            optionFilterProp="label"
                            value={item?.item || undefined}
                            onChange={(value) => {
                              setDataItemFree((prev) =>
                                prev.map((it, idx) =>
                                  idx === i ? { ...it, item: value } : it
                                )
                              );
                            }}
                            // options={dataItem}
                            options={dataItem.filter((data) => {
                              const diskonGroup =
                                dataDiscount?.diskon_group || [];
                              const currentGroup = diskonGroup[i] || {};
                              return (
                                currentGroup.itemprocessfamily ===
                                data.itemprocessfamily
                              );
                            })}
                            style={{ width: "100%" }}
                          />
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
                    {formatRupiah(summary.subtotalbruto)}
                  </p>
                </div>
                <div className="flex w-full">
                  <p className="w-1/2">Discount Item</p>
                  <p className="w-1/2 text-end">
                    {formatRupiah(summary.discounttotal)}
                  </p>
                </div>
                <hr className="border-gray-5" />
                <div className="flex w-full font-semibold">
                  <p className="w-1/2">Total Inc PPN</p>
                  <p className="w-1/2 text-end">
                    {formatRupiah(summary.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      {customerInfo.message.length > 0 && (
        <FloatButton
          onClick={() => {
            showCustomerInfo();
          }}
          style={!isLargeScreen ? { width: "32px", height: "32px" } : {}}
          shape="circle"
          badge={{ count: customerInfo.message.length, size: "small" }}
          icon={<InfoCircleOutlined />}
        />
      )}
      {isLoadingSubmit && <LoadingSpinProcessing />}
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
                <div className="w-full flex gap-2">
                  <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                    <p>Item Name/Number</p>
                    <Select
                      value={itemSelected?.value || undefined}
                      showSearch
                      placeholder="Select an item"
                      optionFilterProp="label"
                      onChange={(_, item) => {
                        const isDuplicate = dataTableItem.some(
                          (tableItem) => tableItem.item === item.value
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
                            itemprocessfamily: item.itemprocessfamily,
                            itemid: item.itemid,
                          },
                        });
                      }}
                      onSearch={{}}
                      options={dataItem.filter(
                        (data) =>
                          !dataTableItem
                            .map((item) => item.item)
                            .includes(data.value)
                      )}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="w-full lg:w-1/2 flex lg:pr-2 flex-col">
                    <p>Display Name</p>
                    <Input disabled value={itemSelected?.displayname || ""} />
                  </div>
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
                  cursorDisable: true,
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
                  cursorDisable: true,
                },
                {
                  key: "rate",
                  input: "number",
                  isAlias: true,
                  isRead: true,
                  cursorDisable: true,
                  accounting: true,
                  isReadOnly: true,
                },
                {
                  key: "description",
                  input: "text",
                  isAlias: true,
                  hidden: true
                },
              ]}
              aliases={salesOrderAliases.item}
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
                  key: "taxrate",
                  input: "number",
                  isAlias: true,
                  disabled: !stateItemTable.tax.taxable,
                  number: true,
                },
              ]}
              aliases={salesOrderAliases.item}
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

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    {
      title: "No",
      key: "no",
      align: "center",
      render: (text, record, index) => index + 1, // nomor urut mulai dari 1
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
          key: key,
          align: "right", // semua kolom di-align ke kanan
          render: (text) => <p>{formatRupiah(text)}</p>,
        };
      } else if (["item"].includes(key)) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "left", // semua kolom di-align ke kanan
          render: (text) => <p>{formatRupiah(text)}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "center", // semua kolom di-align ke kanan
        };
      }
    }),
    {
      title: "Action",
      key: "action",
      align: "right", // kolom action juga ke kanan
      render: (_, record) => (
        <Button type="link" onClick={() => onDelete(record)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="item"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

function DebugState({ state }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <pre className="text-xs">
      {typeof window !== "undefined" ? JSON.stringify(state, null, 2) : null}
    </pre>
  );
}
