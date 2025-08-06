"use client";

import React, { useEffect, useReducer, useState } from "react";
import {
  Button,
  Divider,
  Form,
  Modal,
  Select,
  Table,
  Tooltip,
  Badge,
} from "antd";
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import {
  CheckOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import CustomerFetch from "@/modules/salesApi/customer";
import {
  createResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/salesOutdoor/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import dayjs from "dayjs";
import { formatRupiah } from "@/utils/formatRupiah";

export default function Enter() {
  const title = "sales order";
  const router = useRouter();
  const { notify, contextHolder: contextNotify } = useNotification();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isModalOkLoading, setIsModalOkLoading] = useState(false);

  const [dataCustomer, setDataCustomer] = useState([]);
  const [dataItem, setDataItem] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});
  const [itemSelected, setItemSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [dataItemFree, setDataItemFree] = useState([]);
  const [dataDiscount, setDataDiscount] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    customer: "",
    message: [],
  });
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);

  const initialState = {
    payloadPrimary: {
      entity: "",
      custName: "",
      trandate: dayjs(new Date()),
      salesrep: "",
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
      term: "7 Days",
      paymentoption: "",
    },
    payloadShipping: {
      shippingaddress: "",
      notes: "",
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
      case "RESET":
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

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
    "displayname",
    "quantity",
    "units",
    "rate",
    "description",
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
      case "SET_ALL":
        return {
          ...state,
          item: action.payload.item,
          tax: action.payload.tax,
          summary: action.payload.summary,
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
  const [dataTableItem, setDataTableItem] = useState([]);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await CustomerFetch.get(0, 1000, "active");
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelCustomer = resData.list.map((customer) => ({
            ...customer,
            label: customer.customerid,
            value: customer.id,
          }));
          setDataCustomer(addLabelCustomer);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      }
    }

    async function fetchItem() {
      try {
        const response = await ItemFetch.get(0, 1000);
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelItem = resData.list.map((item) => ({
            ...item,
            label: item.itemid,
            value: item.id,
          }));
          setDataItem(addLabelItem);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data item");
      }
    }

    fetchCustomer();
    fetchItem();
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
        custName: customer.companyname,
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
    setIsCustomerInfoModalOpen(true);
  }

  function handleAddItem() {
    if (!state.payloadPrimary.entity || state.payloadPrimary.entity === "") {
      notify(
        "error",
        "Error",
        "Select the customer first in the customer section"
      );
      return;
    }

    if (!state.payloadPrimary.trandate || state.payloadPrimary.trandate === "") {
      notify(
        "error",
        "Error",
        "Fill in the trandate first in the primary section"
      );
      return;
    }

    if (
      !state.payloadBilling.paymentoption ||
      state.payloadBilling.paymentoption === ""
    ) {
      notify(
        "error",
        "Error",
        "Select the payment type first in the billing section"
      );
      return;
    }

    setIsModalItemOpen(true);
  }

  function handleModalItemCancel() {
    dispatchItemTable({ type: "RESET" });
    setItemSelected(null);
    setEditItem(null);
    setIsModalItemOpen(false);
    setIsModalOkLoading(false);
  }

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

    setIsModalOkLoading(true);

    try {
      const dataItemNew = {
        ...stateItemTable.item,
        ...stateItemTable.summary,
        ...stateItemTable.tax,
      };
      
      let updatedDataTableItem;
      if (editItem) {
        updatedDataTableItem = dataTableItem.map(item => 
          item.lineid === editItem ? { ...dataItemNew, lineid: editItem } : item
        );
      } else {
        updatedDataTableItem = [...dataTableItem, { ...dataItemNew, lineid: crypto.randomUUID() }];
      }

      const updateDiscountItem = await getDiscountItem(updatedDataTableItem);
      setDataTableItem(updateDiscountItem);

      handleModalItemCancel();
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    }
  }

  async function getDiscountItem(itemTable, payment_type_params, customer_id) {
    try {
      if (!itemTable || itemTable.length === 0) {
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
      const updatedItemTable = itemTable.map((item) => {
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

      return updatedItemTable;
    } catch (error) {
      notify("error", "Error", "Failed to get discount data");
      return itemTable;
    }
  }

  useEffect(() => {
    if (!dataTableItem || dataTableItem.length === 0) {
      dispatch({
        type: "SET_SUMMARY",
        payload: {
          subtotalbruto: 0,
          discounttotal: 0,
          subtotal: 0,
          taxtotal: 0,
          total: 0,
        },
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
      { totalDiscount: 0, totalAmount: 0, subTotal: 0 }
    );

    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotalbruto: totalAmount,
        discounttotal: totalDiscount,
        subtotal: subTotal,
        total: subTotal,
      },
    });
  }, [dataTableItem]);

  function handleDeleteTableItem(record) {
    const updatedData = dataTableItem.filter(
      (item) => item.lineid !== record.lineid
    );
    setDataTableItem(updatedData);
    updateDataItemTable(updatedData);
  }

  function handleEditTableItem(record) {
    dispatchItemTable({
      type: "SET_ALL",
      payload: {
        item: {
          item: record.item,
          quantity: record.quantity,
          units: record.units,
          description: record.description,
          rate: record.rate,
          displayname: record.displayname,
          itemprocessfamily: record.itemprocessfamily,
          itemid: record.itemid,
        },
        tax: {
          taxable: record.taxable,
          taxrate: record.taxrate,
        },
        summary: {
          totaldiscount: record.totaldiscount,
          totalamount: record.totalamount,
          subtotal: record.subtotal,
        },
      },
    });
    setItemSelected({ value: record.item, id: record.item });
    setEditItem(record.lineid);
    setIsModalItemOpen(true);
  }

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      if (dataTableItem.length <= 0) {
        throw new Error("Please enter order items");
      }

      dataItemFree.forEach((item) => {
        if (!item.item) {
          throw new Error("Please select free item");
        }
      });

      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadBilling,
        ...state.payloadShipping,
        sales_order_items: dataTableItem.map((item) => {
          const { itemprocessfamily, displayname, itemid, lineid, ...rest } = item;
          return rest;
        }),
        sales_order_item_free: dataItemFree,
      };

      delete payloadToInsert.custName;
      delete payloadToInsert.salesrep;

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

      const response = await SalesOrderFetch.add(payloadToInsert);
      const resData = createResponseHandler(response, notify);

      if (resData) {
        router.push(`/sales-outdoor/sales-order/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  async function updateDataItemTable(updatedData = null, payment_type = null, cust_id = null) {
    try {
      const updateDiscountItem = await getDiscountItem(
        updatedData ? updatedData : dataTableItem,
        payment_type,
        cust_id
      );
      setDataTableItem(updateDiscountItem);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Layout>
        <FixedHeaderBar bgColor="bg-blue-6" />
        <div className="w-full relative p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <Button onClick={handleBack} className="mb-2">← Kembali</Button>
              <h3 className="font-semibold text-gray-700 mb-3 text-center text-2xl">Create Sales Order</h3>
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col justify-between items-start">
                  <div className="w-full flex gap-1"></div>
                  <div className="w-full flex justify-end items-center gap-2">
                    <Button 
                      type="primary" 
                      icon={<CheckOutlined />} 
                      onClick={handleSubmit} 
                      disabled={isLoadingSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
              <input
                type="hidden"
                name="entity"
                value={state.payloadPrimary.entity}
              />
              <div className="w-full flex flex-col gap-8">
                <div className="w-full flex flex-col gap-2">
                  <Divider
                    style={{ margin: "0", textTransform: "capitalize", borderColor: "#1677ff" }}
                    orientation="left"
                  >
                    Customer
                  </Divider>
                  <div className="w-full flex flex-col">
                    <Form layout="vertical">
                      <Form.Item
                        label={<span className="capitalize">Customer ID</span>}
                        name="customer"
                        style={{ margin: 0 }}
                        className="w-full"
                        labelCol={{ style: { padding: 0 } }}
                        rules={[{ required: true, message: `Customer is required` }]}
                      >
                        <Select
                          showSearch
                          placeholder="Select a customer"
                          optionFilterProp="label"
                          value={customerSelected?.value || undefined}
                          onChange={(_, customer) => handleCustomerChange(customer)}
                          options={dataCustomer}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </div>
              <InputForm
                isSingleCol={true}
                title="primary"
                type="SET_PRIMARY"
                payload={state.payloadPrimary}
                data={[
                  { key: "custName", input: "input", isAlias: true, disabled: true, isRead: true, placeholder: "Auto-filled after selecting a customer" },
                  { key: "trandate", input: "date", isAlias: true, rules: [{ required: true, message: ` is required` }] },
                  { key: "salesrep", input: "input", isAlias: true, isRead: true, disabled: true },
                  { key: "otherrefnum", input: "input", isAlias: true, placeholder: "Entry No. PO customer" },
                ]}
                aliases={{
                  entity: "Customer Entity",
                  custName: "Customer Name",
                  trandate: "Transaction Date",
                  salesrep: "Sales Rep",
                  otherrefnum: "Customer PO Number"
                }}
                onChange={(type, payload) => dispatch({ type, payload })}
              />
              <InputForm
                isSingleCol={true}
                title="shipping"
                type="SET_SHIPPING"
                payload={state.payloadShipping}
                data={[
                  { key: "shippingaddress", input: "text", isAlias: true, disabled: true },
                  { key: "notes", input: "text", isAlias: true, disabled: false }
                ]}
                aliases={{
                  shippingaddress: "Shipping Address",
                  notes: "Notes"
                }}
                onChange={(type, payload) => dispatch({ type, payload })}
              />
              <InputForm
                isSingleCol={true}
                title="billing"
                type="SET_BILLING"
                payload={state.payloadBilling}
                data={[
                  { key: "term", input: "select", options: termOptions, isAlias: true },
                  { key: "paymentoption", input: "select", options: paymentOptions, isAlias: true, rules: [{ required: true, message: ` is required` }] },
                ]}
                aliases={{
                  paymentoption: "Payment Method",
                }}
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
                    style={{ margin: "0", textTransform: "capitalize", borderColor: "#1677ff" }}
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
                    onEdit={handleEditTableItem}
                    data={dataTableItem}
                  />
                </div>
              </div>

              {dataItemFree && dataItemFree.length > 0 && (
                <div className="w-full flex flex-col gap-8">
                  <div className="w-full flex flex-col gap-2">
                    <Divider
                      style={{ margin: 0, textTransform: "capitalize", borderColor: "#1677ff" }}
                      orientation="left"
                    >
                      Item Free
                    </Divider>

                    <div className="w-full flex flex-col">
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
                              style={{ margin: 0, width: "100%" }}
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
                    style={{ margin: "0", textTransform: "capitalize", borderColor: "#1677ff" }}
                    orientation="left"
                  >
                    Summary
                  </Divider>
                  <div className="w-full p-4 border border-gray-5 gap-2 rounded-xl flex flex-col">
                    <div className="flex w-full">
                      <p className="w-1/2 text-sm">Subtotal</p>
                      <p className="w-1/2 text-end text-sm">
                        {formatRupiah(state.payloadSummary.subtotalbruto)}
                      </p>
                    </div>
                    <div className="flex w-full">
                      <p className="w-1/2 text-sm">Discount Item</p>
                      <p className="w-1/2 text-end text-sm">
                        {formatRupiah(state.payloadSummary.discounttotal)}
                      </p>
                    </div>
                    <hr className="border-gray-5" />
                    <div className="flex w-full font-semibold">
                      <p className="w-1/2 text-sm">Total</p>
                      <p className="w-1/2 text-end text-sm">
                        {formatRupiah(state.payloadSummary.total)} Incl. PPN
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}

      {customerInfo.message.length > 0 && (
        <div className="fixed bottom-20 right-4 z-50">
          <Badge count={customerInfo.message.length} size="small">
            <Button
              type="default"
              shape="circle"
              icon={<InfoCircleOutlined />}
              onClick={showCustomerInfo}
              size="large"
            />
          </Badge>
        </div>
      )}

      <Modal
        title={`Customer Information: ${customerInfo.customer}`}
        open={isCustomerInfoModalOpen}
        onCancel={() => setIsCustomerInfoModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsCustomerInfoModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {customerInfo.message.length > 0 ? (
          <ul className="list-disc pl-5">
            {customerInfo.message.map((msg, index) => (
              <li key={index} className="mb-2 text-gray-700">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No customer information available.</p>
        )}
      </Modal>
      <Modal
        open={isModalItemOpen}
        onOk={handleModalItemOk}
        onCancel={handleModalItemCancel}
        width={850}
        cancelText="Cancel"
        title={editItem ? "Edit Item" : "Add Item"}
        okButtonProps={{ loading: isModalOkLoading }}
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
            <div className="w-full flex flex-col gap-8">
              <div className="w-full flex flex-col gap-2">
                <Divider
                  style={{ margin: "0", textTransform: "capitalize", borderColor: "#1677ff" }}
                  orientation="left"
                >
                  Item
                </Divider>
                <div className="w-full flex flex-col">
                  <p>Item ID</p>
                  <Select
                    value={itemSelected?.value || undefined}
                    showSearch
                    placeholder="Select an item"
                    optionFilterProp="label"
                    onChange={(_, item) => {
                      const isDuplicate = dataTableItem.some(
                        (tableItem) => tableItem.item === item.value
                      );

                      if (isDuplicate && !editItem) {
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
                    options={dataItem.filter(
                      (data) =>
                        !dataTableItem
                          .map((item) => item.item)
                          .includes(data.value) || editItem
                    )}
                    style={{ width: "100%" }}
                    disabled={!!editItem}
                  />
                </div>
              </div>
            </div>
            <InputForm
              isSingleCol={true}
              title="Item Quantity"
              type="SET_ITEM"
              payload={stateItemTable.item}
              data={[
                { key: "item", input: "input", isAlias: true, isRead: true, hidden: true },
                { key: "quantity", input: "number", isAlias: true, min: 1 },
                { key: "units", input: "input", isAlias: true, isRead: true, disabled: true },
                { key: "rate", input: "input", isAlias: true, isRead: true, disabled: true },
                { key: "description", input: "text", isAlias: true },
              ]}
              aliases={{}}
              onChange={(type, payload) => dispatchItemTable({ type, payload })}
            />
            <InputForm
              isSingleCol={true}
              title="Tax Item"
              type="SET_TAX"
              payload={stateItemTable.tax}
              data={[
                { key: "taxable", input: "select", options: [{ label: "Yes", value: true }, { label: "No", value: false }], isAlias: true },
                { key: "taxrate", input: "number", isAlias: true, disabled: !stateItemTable.tax.taxable, min: 0 },
              ]}
              aliases={{}}
              onChange={(type, payload) => dispatchItemTable({ type, payload })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function TableCustom({ data, onDelete, onEdit }) {
  const columns = [
    {
      title: "Item",
      dataIndex: "displayname",
      key: "displayname",
      fixed: 'left',
      width: 120,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <div className="truncate" style={{ maxWidth: '120px' }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    { 
      title: "Qty", 
      dataIndex: "quantity", 
      key: "quantity", 
      align: "right",
      width: 110,
    },
    { 
      title: "Unit", 
      dataIndex: "units", 
      key: "units", 
      align: "left", 
      width: 75,
    },
    { 
      title: "Rate", 
      dataIndex: "rate", 
      key: "rate", 
      align: "right",
      render: (text) => formatRupiah(text)
    },
    { 
      title: "Description", 
      dataIndex: "description", 
      key: "description", 
      align: "left" 
    },
    { 
      title: "Taxable", 
      dataIndex: "taxable", 
      key: "taxable", 
      align: "left", 
      render: (text) => text ? "Yes" : "No", 
      width: 95,
    },
    { 
      title: "Tax Rate", 
      dataIndex: "taxrate", 
      key: "taxrate", 
      align: "right",
      render: (text) => text ? `${text}%` : '-'
    },
    { 
      title: "Total Amount", 
      dataIndex: "totalamount", 
      key: "totalamount", 
      align: "right",
      render: (text) => formatRupiah(text)
    },
    { 
      title: "Total Discount", 
      dataIndex: "totaldiscount", 
      key: "totaldiscount", 
      align: "right",
      render: (text) => formatRupiah(text)
    },
    { 
      title: "Subtotal", 
      dataIndex: "subtotal", 
      key: "subtotal", 
      align: "right",
      render: (text) => formatRupiah(text)
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 130,
      render: (_, record) => (
        <div className="flex">
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record)}>
            Delete
          </Button>
        </div>
      ),
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="lineid"
      bordered
      pagination={false}
      scroll={{ x: 1500 }}
    />
  );
}
