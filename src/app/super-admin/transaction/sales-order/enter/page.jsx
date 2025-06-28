"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Empty,
  FloatButton,
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
import { salesOrderAliases } from "@/utils/aliases";

function formatRupiah(number) {
  if (typeof number !== "number" || isNaN(number)) {
    return "Rp0,-";
  }

  try {
    return "Rp" + number.toLocaleString("id-ID") + ",-";
  } catch (e) {
    return "Rp0,-";
  }
}

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
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
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          align: "right", // semua kolom di-align ke kanan
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
      rowKey="lineid"
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
  const title = "sales-order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});

  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await CustomerFetch.get(0, 10000, "active");
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelCustomer = resData.list.map((customer, i) => {
            return {
              ...customer,
              label: customer.customerid || customer.companyname,
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

    async function fetchItem() {
      try {
        const response = await ItemFetch.get(0, 10000);
        const resData = getResponseHandler(response);

        if (resData) {
          const addLabelItem = resData.list.map((item) => {
            return {
              ...item,
              label: item.displayname,
              value: item.id,
            };
          });
          setDataItem(addLabelItem);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data item");
      }
    }
    fetchItem();
  }, []);

  const initialState = {
    payloadPrimary: {
      companyname: "",
      entity: "",
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
      term: "7",
      paymentoption: "",
    },
    payloadShipping: {
      notes: "",
      shippingaddress: "",
    },
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

  const shipAddressOptions = [
    { label: "Custom", value: 0 },
    { label: "Default Address", value: 1 },
  ];

  const shipAddressOption = [
    { label: "Custom", value: "custom" },
    { label: "Default Address", value: "default address" },
  ];

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
    // "discountname1",
    // "value1",
    // "discountvalue1",
    // "perunit1",
    // "discountname2",
    // "value2",
    // "discountvalue2",
    // "perunit2",
    // "discountname3",
    // "value3",
    // "discountvalue3",
    // "perunit3",
    "subtotal",
    "totalamount",
    "qtyfree",
    "unitfree",
    "taxable",
    "taxrate",
    "taxvalue",
    "totaldiscount",
  ];

  const [dataTableItem, setDataTableItem] = useState([]);

  const initialStateItemTable = {
    item: {
      item: "",
      quantity: 0,
      units: "",
      description: "",
      rate: 0,
      discount: 0,
      displayname: "",
      itemprocessfamily: "",
      stock: 0,
      itemid: "",
    },
    discount1: {
      discount1: "",
      discountname1: "",
      value1: 0,
      discountvalue1: "",
      perunit1: "",
    },
    discount2: {
      discount2: "",
      discountname2: "",
      value2: 0,
      discountvalue2: "",
      perunit2: "",
    },
    discount3: {
      discount3: "",
      discountname3: "",
      value3: 0,
      discountvalue3: "",
      perunit3: "",
    },
    summary: {
      subtotal: 0,
      totalamount: 0,
      qtyfree: 0,
      unitfree: "",
      totaldiscount: 0,
    },
    tax: {
      taxable: false,
      taxrate: 0,
      taxvalue: 0,
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
      case "SET_DISCOUNT1":
        return {
          ...state,
          discount1: {
            ...state.discount1,
            ...action.payload,
          },
        };
      case "SET_DISCOUNT2":
        return {
          ...state,
          discount2: {
            ...state.discount2,
            ...action.payload,
          },
        };
      case "SET_DISCOUNT3":
        return {
          ...state,
          discount3: {
            ...state.discount3,
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

  const [discountItems, setDiscountItems] = useState([]);

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
        "Select the payment type first in the billing section"
      );
      return;
    }

    setIsModalItemOpen(true);
  }

  function handleModalItemCancel() {
    dispatchItemTable({ type: "RESET" });
    setItemSelected(null);
    setIsModalItemOpen(false);
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

    const discountItem = await getDiscount(
      state.payloadPrimary.entity,
      stateItemTable.item.item,
      convertToLocalDate(state.payloadPrimary.trandate),
      stateItemTable.item.quantity,
      stateItemTable.item.itemprocessfamily
    );

    setDiscountItems((prev) => [...prev, discountItem]);

    handleAddItemToTable();

    handleModalItemCancel();
  }

  function handleAddItemToTable() {
    const subtotal = stateItemTable.item.quantity * stateItemTable.item.rate;
    const totalamount = subtotal;
    const taxrate = stateItemTable.tax.taxable
      ? Number(stateItemTable.tax.taxrate)
      : 0;

    const taxvalue = stateItemTable.tax.taxable
      ? Math.ceil((subtotal / (1 + taxrate / 100)) * (taxrate / 100))
      : 0;

    dispatchItemTable({
      type: "SET_SUMMARY",
      payload: {
        subtotal,
        totalamount,
      },
    });

    dispatchItemTable({
      type: "SET_TAX",
      payload: {
        taxvalue,
        taxrate,
      },
    });

    const mergePayloadItemTable = {
      lineid: crypto.randomUUID(),

      ...stateItemTable.item,

      ...stateItemTable.discount1,

      ...stateItemTable.discount2,

      ...stateItemTable.discount3,

      subtotal,
      totalamount,
      qtyfree: stateItemTable.summary.qtyfree,
      unitfree: stateItemTable.summary.unitfree,
      totaldiscount: stateItemTable.summary.totaldiscount,

      taxable: stateItemTable.tax.taxable,
      taxrate,
      taxvalue,
    };

    setDataTableItem((prev) => [...prev, mergePayloadItemTable]);
  }

  async function getDiscount(cust_id, item_id, trandate, qty, item_categories) {
    try {
      let initData = {
        id: itemSelected,
        displayname: stateItemTable.item.displayname,
        discount: [],
      };

      if (stateItemTable.item.discount && stateItemTable.item.discount > 0) {
        initData.discount.push({
          id: "itemdiscount",
          type: "Discount Item",
          discounttype: "nominal",
          discount: "Discount Price",
          value: stateItemTable.item.discount,
          discountvalue: "rp",
          perunit: "",
          paymenttype: "",
          isChecked: false,
        });
      }

      const resAgreement = await SalesOrderFetch.getSoAgreement(
        item_id,
        cust_id,
        qty,
        trandate
      );

      const dataAgreement = getResponseHandler(resAgreement);
      if (dataAgreement && dataAgreement.length > 0) {
        const discountAgreement = dataAgreement.map((agreement) => {
          return {
            id: agreement.agreementid,
            type:
              agreement.paymenttype != ""
                ? "Discount Payment"
                : "Discount Agreement",
            discounttype: agreement.discounttype,
            discount: agreement.agreementname,
            value: agreement.discountvalue,
            discountvalue:
              agreement.discounttype == "nominal"
                ? "rp"
                : agreement.discounttype == "percent"
                ? "%"
                : "",
            perunit: agreement.perunit,
            paymenttype: agreement?.paymenttype || "",
            isChecked: false,
          };
        });
        initData.discount.push(...discountAgreement);
      }

      // const resAgreementGroup = await SalesOrderFetch.getSoAgreementGroup(
      //   item_categories,
      //   cust_id,
      //   qty,
      //   trandate
      // );

      // const dataAgreementGroup = getResponseHandler(resAgreementGroup);

      // if (
      //   dataAgreementGroup &&
      //   dataAgreementGroup[itemSelected.itemprocessfamily]
      // ) {
      //   const discountAgreementGroup =
      //     dataAgreementGroup[itemSelected.itemprocessfamily];

      //   initData.discount.push({
      //     id: discountAgreementGroup.agreementid,
      //     type: "Discount Agreement",
      //     discounttype:
      //       discountAgreementGroup.unitfree == "" ? "nominal" : "freeitem",
      //     discount: discountAgreementGroup.agreementname,
      //     value: discountAgreementGroup.discountvalue,
      //     discountvalue: discountAgreementGroup?.unitfree == "" ? "rp" : "",
      //     perunit: discountAgreementGroup.unitfree,
      //     paymenttype: "",
      //     isChecked: false,
      //   });
      // }
      return initData;
    } catch (error) {
      notify("error", "Error", "Failed get data discount");
      return null;
    }
  }

  function handleDiscountSelected(isChecked, discount, itemid) {
    let updatedItem = dataTableItem.find((item) => item.item === itemid);

    if (updatedItem) {
      // Jika dicentang (Checked)
      if (isChecked) {
        if (discount.type === "Discount Item") {
          if (!updatedItem.discount1) {
            updatedItem = {
              ...updatedItem,
              discountname1: discount.discount,
              discount1: discount.id,
              discountvalue1: discount.discountvalue,
              perunit1: discount.perunit,
              value1: discount.value,
            };
          } else return;
        } else if (discount.type === "Discount Agreement") {
          if (!updatedItem.discount2) {
            updatedItem = {
              ...updatedItem,
              discountname2: discount.discount,
              discount2: discount.id,
              discountvalue2: discount.discountvalue,
              perunit2: discount.perunit,
              value2: discount.value,
            };
          } else return;
        } else if (discount.type === "Discount Payment") {
          if (!updatedItem.discount3) {
            updatedItem = {
              ...updatedItem,
              discountname3: discount.discount,
              discount3: discount.id,
              discountvalue3: discount.discountvalue,
              perunit3: discount.perunit,
              value3: discount.value,
            };
          } else return;
        }
      }

      // Jika tidak dicentang (Unchecked)
      else {
        if (
          discount.type === "Discount Item" &&
          updatedItem.discount1 === discount.id
        ) {
          updatedItem = {
            ...updatedItem,
            discountname1: "",
            discount1: "",
            discountvalue1: "",
            perunit1: "",
            value1: 0,
          };
        } else if (
          discount.type === "Discount Agreement" &&
          updatedItem.discount2 === discount.id
        ) {
          updatedItem = {
            ...updatedItem,
            discountname2: "",
            discount2: "",
            discountvalue2: "",
            perunit2: "",
            value2: 0,
          };
        } else if (
          discount.type === "Discount Payment" &&
          updatedItem.discount3 === discount.id
        ) {
          updatedItem = {
            ...updatedItem,
            discountname3: "",
            discount3: "",
            discountvalue3: "",
            perunit3: "",
            value3: 0,
          };
        } else return;
      }

      // Update item ke table
      const updatedDataTableItem = dataTableItem.map((item) =>
        item.item === itemid ? updatedItem : item
      );
      setDataTableItem(updatedDataTableItem);

      // Update status isChecked di discountItems
      const updatedDiscountItems = discountItems.map((item) => {
        if (item.id === itemid) {
          return {
            ...item,
            discount: item.discount.map((dis) => {
              if (dis.id === discount.id) {
                return {
                  ...dis,
                  isChecked,
                };
              }
              return dis;
            }),
          };
        }
        return item;
      });
      setDiscountItems(updatedDiscountItems);
    }
  }

  const getValueDiscount = (discountValue, value, totalamount) => {
    switch (discountValue) {
      case "rp":
        return value;
      case "%":
        return (totalamount * value) / 100;
      default:
        return 0;
    }
  };

  useEffect(() => {
    let updatedDataTableItem = dataTableItem.map((dataItem) => {
      let data = { ...dataItem };

      data.totalamount = data.quantity * data.rate;

      const discount1 = getValueDiscount(
        data.discountvalue1,
        data.value1,
        data.totalamount
      );
      const discount2 = getValueDiscount(
        data.discountvalue2,
        data.value2,
        data.totalamount
      );
      const discount3 = getValueDiscount(
        data.discountvalue3,
        data.value3,
        data.totalamount
      );

      const totaldiscount = discount1 + discount2 + discount3;

      data.subtotal = data.totalamount - totaldiscount;
      data.totaldiscount = totaldiscount;

      if (["kg", "bal"].includes(data.perunit2?.toLowerCase?.())) {
        data.qtyfree = data.value2;
        data.unitfree = data.perunit2;
      }

      if (data.taxable) {
        data.taxvalue = Math.ceil(
          (data.subtotal / (1 + data.taxrate / 100)) * (data.taxrate / 100)
        );
      }

      return data;
    });

    // Cek apakah ada perubahan signifikan sebelum update
    const isChanged =
      JSON.stringify(updatedDataTableItem) !== JSON.stringify(dataTableItem);
    if (isChanged) {
      setDataTableItem(updatedDataTableItem);
    }

    // Hitung summary
    const subtotalbruto = updatedDataTableItem.reduce(
      (acc, curr) => acc + curr.totalamount,
      0
    );
    const subtotal = updatedDataTableItem.reduce(
      (acc, curr) => acc + curr.subtotal,
      0
    );
    const discounttotal = updatedDataTableItem.reduce(
      (acc, curr) => acc + curr.totaldiscount,
      0
    );

    const setSummary = {
      subtotalbruto,
      discounttotal,
      subtotal,
      taxtotal: 0,
      total: subtotal,
    };

    dispatch({ type: "SET_SUMMARY", payload: setSummary });
  }, [dataTableItem]);

  function handleDeleteTableItem(record) {
    setDataTableItem((prev) =>
      prev.filter((item) => item.lineid !== record.lineid)
    );

    setDiscountItems((prev) =>
      prev.filter((discount) => discount.id !== record.item)
    );
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadBilling,
        ...state.payloadShipping,
      };

      delete payloadToInsert.companyname;

      if (dataTableItem.length <= 0) {
        throw new Error("Please enter order items");
      }

      const sales_order_items = dataTableItem.map((data) => {
        return {
          item: data.item,
          quantity: data.quantity,
          units: data.units,
          description: data.description,
          rate: data.rate,
          discount1: "",
          value1: data.value1,
          discountvalue1: data.discountvalue1,
          perunit1: data.perunit1,
          discount2: data.discount2,
          value2: data.value2,
          discountvalue2: data.discountvalue2 == "rp" ? 0 : 1,
          perunit2: data.perunit2,
          discount3: data.discount3,
          value3: data.value3,
          discountvalue3: data.discountvalue3 == "rp" ? 0 : 1,
          perunit3: data.perunit3,
          subtotal: data.subtotal,
          totalamount: data.totalamount,
          qtyfree: data.qtyfree,
          unitfree: data.unitfree == "kg" ? 0 : 1,
          taxable: data.taxable,
          taxrate: data.taxrate,
          totaldiscount: data.totaldiscount,
        };
      });

      payloadToInsert = { ...payloadToInsert, sales_order_items };

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
        router.push(`/super-admin/transaction/sales-order/${resData}`);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const [customerInfo, setCustomerInfo] = useState({
    customer: "",
    message: [],
  });

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
      const timeout = i > 0 ? 300 : 0 ;
      setTimeout(() => {
        notify("info", "Customer ID : " + customerInfo.customer, info);
      }, timeout);
    });
  }

  return (
    <>
      {customerInfo.message.length > 0 && (
        <FloatButton
          onClick={() => {
            showCustomerInfo();
          }}
          style={!isLargeScreen ? {width: '32px', height: '32px'} : {}}
          shape="circle"
          badge={{ count: customerInfo.message.length, size: "small" }}
          icon={<InfoCircleOutlined />}
        />
      )}
      <Layout pageTitle="">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Sales Order Enter
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
                      value={customerSelected}
                      onChange={(_, customer) => {
                        setCustomerSelected(customer);
                        if (customer.id) {
                          checkStatusCustomer(customer.id, customer.customerid);
                        }
                        setDataTableItem([]);
                        setDiscountItems([]);
                        dispatch({ type: "RESET" });
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
                      }}
                      //   onSearch={{}}
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
                hidden: true
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
          {discountItems && discountItems.length > 0 && (
            <div className="w-full flex flex-col gap-8">
              <Collapse
                accordion
                items={discountItems.map((discountItem) => ({
                  key: discountItem.id,
                  label: discountItem.displayname,
                  children: (
                    <div className="w-full flex lg:pr-2 flex-col">
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={discountItem.discount || []}
                        header="Discount 1"
                        renderItem={(item, index) => (
                          <>
                            {item.type == "Discount Item" && (
                              <List.Item>
                                <Checkbox
                                  checked={item.isChecked}
                                  style={{ marginRight: "16px" }}
                                  onChange={(e) => {
                                    handleDiscountSelected(
                                      e.target.checked,
                                      item,
                                      discountItem.id
                                    );
                                  }}
                                />
                                <List.Item.Meta
                                  title={<p>{item.discount}</p>}
                                  description={`Type: ${
                                    item.discounttype
                                  }, Value: ${
                                    item.discounttype == "nominal"
                                      ? "Rp. " + item.value
                                      : item.discounttype == "percent"
                                      ? item.value + "%"
                                      : item.value
                                  }`}
                                />
                              </List.Item>
                            )}
                          </>
                        )}
                      />
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={discountItem.discount || []}
                        header="Discount 2"
                        renderItem={(item, index) => (
                          <>
                            {item.type == "Discount Agreement" && (
                              <List.Item>
                                <Checkbox
                                  checked={item.isChecked}
                                  onChange={(e) => {
                                    handleDiscountSelected(
                                      e.target.checked,
                                      item,
                                      discountItem.id
                                    );
                                  }}
                                  defaultChecked={false}
                                  style={{ marginRight: "16px" }}
                                />
                                <List.Item.Meta
                                  title={<p>{item.discount}</p>}
                                  description={`Type: ${
                                    item.discounttype
                                  }, Value: ${
                                    item.discounttype == "nominal"
                                      ? "Rp. " + item.value
                                      : item.discounttype == "percent"
                                      ? item.value + "%"
                                      : item.value
                                  }`}
                                />
                              </List.Item>
                            )}
                          </>
                        )}
                      />
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={discountItem.discount || []}
                        header={
                          <div className="flex justify-start items-center gap-2">
                            <p>Discount 3</p>
                            <Tooltip title="Discount is only available when using an eligible payment method.">
                              <InfoCircleOutlined className="text-sm" />
                            </Tooltip>
                          </div>
                        }
                        renderItem={(item, index) => (
                          <>
                            {item.type == "Discount Payment" && (
                              <List.Item>
                                <Checkbox
                                  checked={item.isChecked}
                                  disabled={
                                    item.paymenttype !=
                                    state.payloadBilling.paymentoption
                                  }
                                  onChange={(e) => {
                                    handleDiscountSelected(
                                      e.target.checked,
                                      item,
                                      discountItem.id
                                    );
                                  }}
                                  defaultChecked={false}
                                  style={{ marginRight: "16px" }}
                                />
                                <List.Item.Meta
                                  title={<p>{item.discount}</p>}
                                  description={`Type: ${
                                    item.discounttype
                                  }, Value: ${
                                    item.discounttype == "nominal"
                                      ? "Rp. " + item.value
                                      : item.discounttype == "percent"
                                      ? item.value + "%"
                                      : item.value
                                  }, Payment: ${item.paymenttype}`}
                                />
                              </List.Item>
                            )}
                          </>
                        )}
                      />
                    </div>
                  ),
                }))}
              />
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
                    {formatRupiah(state.payloadSummary.subtotal)} Incl. PPN
                  </p>
                </div> */}
                {/* <div className="flex w-full">
                  <p className="w-1/2">Tax Total</p>
                  <p className="w-1/2 text-end">
                    {formatRupiah(state.payloadSummary.taxtotal)}
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
                  <p>Display Name</p>
                  <Select
                    value={itemSelected}
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

                      setItemSelected(item.value);

                      dispatchItemTable({
                        type: "SET_ITEM",
                        payload: {
                          item: item.id,
                          units: item.unitstype,
                          rate: item.price,
                          discount: item.discount,
                          displayname: item.displayname,
                          itemprocessfamily: item.itemprocessfamily,
                          stock: item.stock,
                          itemid: item.itemid,
                        },
                      });
                    }}
                    onSearch={{}}
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
                  cursorDisable: true,
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
                  input: "input",
                  isAlias: true,
                  isRead: true,
                  cursorDisable: true,
                },
                {
                  key: "description",
                  input: "text",
                  isAlias: true,
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
