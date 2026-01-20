"use client";
import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Select,
  Table,
  Tooltip,
  FloatButton
} from "antd";
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
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
import { truncate } from "lodash";

const formatRupiah = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'Rp 0,-';
  const numberCurrency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
  return numberCurrency + ",-";
};

function TableCustom({ data, keys, aliases, onDelete, onEdit }) {
  const keyTableItem = [
    "itemid",
    "displayname",
    "quantity",
    "units",
    "rate",
    "taxrate",
    "totalamount",
    "totaldiscount",
    "subtotal",
  ];
  const keTableName = [
    "Item Name/Number",
    "Display Name",
    "Qty",
    "Unit",
    "Rate",
    "Tax Rate",
    "Total Amount",
    "Total Discount",
    "Total Amount (after discount)",
  ];
  const columns = [
    {
      title: "No",
      key: "no",
      align: "center",
      width: 50,
      onHeaderCell: () => ({
        className: 'text-sm text-center',
        style: { textAlign: 'center' }
      }),
      onCell: () => ({
        className: 'text-xs'
      }),
      render: (text, record, index) => index + 1,
    },
    ...keyTableItem.map((key, index) => {
      const title = keTableName[index];
      const isDisplayName = key === 'displayname';
      const isItemId = key === 'itemid';
      const column = {
        title: title,
        dataIndex: key,
        key,
        align: [
          'quantity',
          'rate',
          'subtotal',
          'totalamount',
          'totaldiscount',
          'taxrate',
        ].includes(key) ? 'right' : 'left',
        onHeaderCell: () => ({
          className: 'text-sm text-center',
          style: { textAlign: 'center' }
        }),
        onCell: () => ({
          className: 'text-xs'
        }),
        render: (text) => {
          if (isDisplayName || isItemId) {
            return (
              <Tooltip title={text}>
                <div className="truncate" style={{
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {text}
                </div>
              </Tooltip>
            );
          }
          const shouldFormat = [
            'rate',
            'subtotal',
            'totalamount',
            'totaldiscount',
          ].includes(key);
          return shouldFormat ? formatRupiah(text) : text;
        }
      };
      if (isDisplayName) {
        column.fixed = 'left';
        column.width = 100;
        column.ellipsis = {
          showTitle: false
        };
      }
      if (isItemId) {
        column.width = 100;
        column.ellipsis = {
          showTitle: false
        };
      }
      return column;
    }),
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Flex gap={4} justify="center">
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          />
        </Flex>
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
      scroll={{ x: "max-content" }}
      size="small"
    />
  );
}

export default function Enter() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const [modal, contextHolder] = Modal.useModal();
  const title = "sales order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isModalOkLoading, setIsModalOkLoading] = useState(false);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});
  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  // Tambahkan state untuk customer info dan item free
  const [customerInfo, setCustomerInfo] = useState({
    customer: "",
    message: [],
  });
  const [dataItemFree, setDataItemFree] = useState([]);
  const [dataDiscount, setDataDiscount] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await CustomerFetch.get(0, 10000, "active");
        const resData = getResponseHandler(response);
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
      entity: "",
      custName: "",
      trandate: dayjs(new Date()),
      salesrep: "",
      otherrefnum: "",
      isdropship: 0,
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
      shippingaddress: "",
      notes: "",
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

  // Tambahkan fungsi checkStatusCustomer seperti di super admin
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

  const dropshipOption = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ];

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
      iseditable: 0,
      iseditline: false,
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
      case "SET_ALL":
        return {
          ...state,
          item: action.payload.item,
          discount1: action.payload.discount1,
          discount2: action.payload.discount2,
          discount3: action.payload.discount3,
          summary: action.payload.summary,
          tax: action.payload.tax,
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

  // Ganti fungsi getDiscount dengan getDiscountItem seperti di super admin
  async function getDiscountItem(itemTable, payment_type_params, customer_id) {
    try {
      if (itemTable.length == 0) {
        setDataDiscount(null);
        setDataItemFree([]);
        return [];
      }
      const payload = {
        cust_id: customer_id ? customer_id : state.payloadPrimary.entity,
        trandate: convertToLocalDate(state.payloadPrimary.trandate),
        payment_type: payment_type_params
          ? payment_type_params
          : state.payloadBilling.paymentoption,
        isdropship: state.payloadPrimary.isdropship,
        sales_order_items: itemTable.map((item) => ({
          item_id: item.item,
          itemprocessfamily: item.itemprocessfamily,
          qty: item.quantity,
          unit: item.units,
          price: item.rate,
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

    const dataItemNew = {
      ...stateItemTable.item,
      ...stateItemTable.discount1,
      ...stateItemTable.discount2,
      ...stateItemTable.discount3,
      ...stateItemTable.summary,
      ...stateItemTable.tax,
      // Preserve lineid when editing, generate new one when adding
      lineid: editItem ? editItem : Date.now(),
    };

    // Hitung diskon sebelum menambahkan item
    const currentItemTable = editItem ?
      dataTableItem.map(item => item.lineid === editItem ? dataItemNew : item) :
      [...dataTableItem, dataItemNew];

    try {
      setIsModalOkLoading(true);
      const updateDiscountItem = await getDiscountItem(
        currentItemTable,
        state.payloadBilling.paymentoption,
        state.payloadPrimary.entity
      );

      if (editItem) {
        // Update item yang sedang diedit
        setDataTableItem(updateDiscountItem);
      } else {
        // Tambah item baru
        setDataTableItem(updateDiscountItem);
      }

      handleModalItemCancel();
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsModalOkLoading(false);
    }
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
          discount: record.discount,
          displayname: record.displayname,
          itemprocessfamily: record.itemprocessfamily,
          stock: record.stock,
          itemid: record.itemid,
        },
        discount1: {
          discount1: record.discount1,
          discountname1: record.discountname1,
          value1: record.value1,
          discountvalue1: record.discountvalue1,
          perunit1: record.perunit1,
        },
        discount2: {
          discount2: record.discount2,
          discountname2: record.discountname2,
          value2: record.value2,
          discountvalue2: record.discountvalue2,
          perunit2: record.perunit2,
        },
        discount3: {
          discount3: record.discount3,
          discountname3: record.discountname3,
          value3: record.value3,
          discountvalue3: record.discountvalue3,
          perunit3: record.perunit3,
        },
        summary: {
          subtotal: record.subtotal,
          totalamount: record.totalamount,
          qtyfree: record.qtyfree,
          unitfree: record.unitfree,
          totaldiscount: record.totaldiscount,
        },
        tax: {
          taxable: record.taxable,
          taxrate: record.taxrate,
          taxvalue: record.taxvalue,
        },
      },
    });
    setItemSelected(record.item);
    setEditItem(record.lineid);
    setIsModalItemOpen(true);
  }

  // Fungsi ini tidak perlu lagi karena menggunakan API getCalDiscount
  // async function getDiscount(cust_id, item_id, trandate, qty) { ... }

  // Fungsi ini tidak perlu lagi karena menggunakan API getCalDiscount
  // function handleDiscountSelected(isChecked, discount, itemid) { ... }

  // Fungsi ini tidak perlu lagi karena menggunakan API getCalDiscount
  // const getValueDiscount = (discountValue, value, totalamount) => { ... }

  // Ubah useEffect untuk menghitung summary
  useEffect(() => {
    if (!dataTableItem || dataTableItem.length === 0) {
      dispatch({
        type: "SET_SUMMARY",
        payload: {
          subtotalbruto: 0,
          subtotal: 0,
          discounttotal: 0,
          total: 0,
          taxtotal: 0,
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
      {
        totalDiscount: 0,
        totalAmount: 0,
        subTotal: 0,
      }
    );
    dispatch({
      type: "SET_SUMMARY",
      payload: {
        subtotalbruto: totalAmount,
        subtotal: subTotal,
        discounttotal: totalDiscount,
        total: subTotal,
        taxtotal: 0,
      },
    });
  }, [dataTableItem]);

  function handleDeleteTableItem(record) {
    const updateData = dataTableItem.filter(
      (item) => item.lineid !== record.lineid
    );
    setDataTableItem(updateData);
    // Hitung ulang diskon setelah menghapus item
    getDiscountItem(updateData, state.payloadBilling.paymentoption, state.payloadPrimary.entity);
  }

  const handleBack = () => {
    window.history.back();
  };

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
        ...state.payloadSummary,
        ...state.payloadBilling,
        ...state.payloadShipping,
        sales_order_items: dataTableItem.map((item) => {
          delete item.itemprocessfamily;
          delete item.displayname;
          delete item.itemid;
          return item;
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
      if (
        !payloadToInsert.sales_order_items ||
        payloadToInsert.sales_order_items.length == 0
      ) {
        throw new Error("Please enter a value greater than 0.");
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

  // Tambahkan fungsi handleCustomerChange
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
                    <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit} disabled={isLoadingSubmit}>
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
              <InputForm
                isSingleCol={true}
                title="primary"
                type="SET_PRIMARY"
                payload={state.payloadPrimary}
                data={[
                  { key: "custName", input: "input", isAlias: true, disabled: true, isRead: true, placeholder: "Auto-filled after selecting a customer" },
                  { key: "isdropship", input: "select", options: dropshipOption, isAlias: true },
                  { key: "trandate", input: "date", isAlias: true, rules: [{ required: true, message: ` is required` }] },
                  { key: "salesrep", input: "input", isAlias: true, isRead: true, disabled: true },
                  { key: "otherrefnum", input: "input", isAlias: true, placeholder: "Entry No. PO customer" },
                ]}
                aliases={{
                  entity: "Customer Entity",
                  custName: "Customer Name",
                  isdropship: "Dropship",
                  trandate: "Transaction Date",
                  salesrep: "Sales Rep",
                  otherrefnum: "No. PO"
                }}
                onChange={(type, payload) => {
                  dispatch({ type, payload });

                  // Reset items when isdropship changes
                  if (payload.isdropship !== undefined && payload.isdropship !== state.payloadPrimary.isdropship && customerSelected.id) {
                    setDataTableItem([]);
                    setDataItemFree([]);
                  }
                }}
              />
              <InputForm
                isSingleCol={true}
                title="shipping"
                type="SET_SHIPPING"
                payload={state.payloadShipping}
                data={[
                  {
                    key: "shippingaddress",
                    input: "text",
                    isAlias: true,
                    disabled: true
                  },
                  {
                    key: "notes",
                    input: "text",
                    isAlias: true,
                    disabled: false
                  }
                ]}
                aliases={{
                  shippingaddress: "Shipping Address",
                  notes: "Notes"
                }}
                onChange={(type, payload) => {
                  dispatch({ type, payload });
                }}
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
                  // Hitung ulang diskon saat payment option berubah
                  if (dataTableItem.length > 0) {
                    getDiscountItem(dataTableItem, payload.paymentoption, state.payloadPrimary.entity);
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
                    keys={keyTableItem}
                    aliases={{}}
                  />
                </div>
              </div>

              {/* Tampilkan item free seperti di super admin */}
              {dataItemFree && dataItemFree.length > 0 && (
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

              {/* Hapus bagian discount items karena sudah dihitung via API */}
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
                      <p className="w-1/2 text-end text-sm">{formatRupiah(state.payloadSummary.subtotalbruto)}</p>
                    </div>
                    <div className="flex w-full">
                      <p className="w-1/2 text-sm">Discount Item</p>
                      <p className="w-1/2 text-end text-sm">{formatRupiah(state.payloadSummary.discounttotal)}</p>
                    </div>
                    <hr className="border-gray-5" />
                    <div className="flex w-full font-semibold">
                      <p className="w-1/2 text-sm">Total Inc PPN</p>
                      <p className="w-1/2 text-end text-sm">{formatRupiah(state.payloadSummary.total)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Tambahkan FloatButton untuk customer info seperti di super admin */}
      {customerInfo.message.length > 0 && (
        <FloatButton
          onClick={() => {
            showCustomerInfo();
          }}
          shape="circle"
          badge={{ count: customerInfo.message.length, size: "small" }}
          icon={<InfoCircleOutlined />}
        />
      )}

      {isLoadingSubmit && <LoadingSpinProcessing />}
      {contextNotify}
      <Modal
        open={isModalItemOpen}
        onOk={handleModalItemOk}
        onCancel={handleModalItemCancel}
        width={850}
        cancelText="Cancel"
        title={editItem ? "Edit Item" : "Add Item"}
        okButtonProps={{ disabled: isModalOkLoading }}
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
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex flex-col">
                    <p>Item Name/Number</p>
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
                            rate: item.rate || item.price,
                            discount: item.discount,
                            displayname: item.displayname,
                            itemprocessfamily: item.itemprocessfamily,
                            stock: item.stock,
                            itemid: item.itemid,
                            iseditable: item.iseditable,
                            iseditline: false,
                          },
                        });
                      }}
                      options={dataItem.map(item => ({
                        ...item,
                        label: item.itemid,
                      })).filter(
                        (data) =>
                          !dataTableItem
                            .map((item) => item.item)
                            .filter((val) => val !== itemSelected)
                            .includes(data.value)
                      )}
                      style={{ width: "100%" }}
                      disabled={!!editItem}
                    />
                  </div>
                  <div className="w-full flex flex-col">
                    <p>Display Name</p>
                    <Input disabled value={stateItemTable.item.displayname || ""} />
                  </div>
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
                { key: "quantity", input: "number", isAlias: true },
                { key: "units", input: "input", isAlias: true, disabled: true, isRead: true },
                {
                  key: "rate",
                  input: "number",
                  isAlias: true,
                  labeled: `Rate (${stateItemTable.item.iseditable == 1 || state.payloadPrimary.isdropship == 1 ? "Editable" : "Non Editable"})`,
                  isRead: stateItemTable.item.iseditable == 0 && state.payloadPrimary.isdropship == 0,
                  disabled: stateItemTable.item.iseditable == 0 && state.payloadPrimary.isdropship == 0,
                  note: "Base rate item",
                  accounting: true,
                },
                { key: "description", input: "text", isAlias: true },
                { key: "iseditable", input: "input", isAlias: true, hidden: true },
                { key: "iseditline", input: "input", isAlias: true, hidden: true },
              ]}
              aliases={{
                quantity: "Quantity",
                units: "Unit",
                rate: "Rate",
                description: "Description",
              }}
              onChange={(type, payload) => dispatchItemTable({ type, payload })}
            />
            <InputForm
              isSingleCol={true}
              title="Tax Item"
              type="SET_TAX"
              payload={stateItemTable.tax}
              data={[
                { key: "taxable", input: "select", options: [{ label: "Yes", value: true }, { label: "No", value: false }], isAlias: true },
                { key: "taxrate", input: "number", isAlias: true, disabled: !stateItemTable.tax.taxable },
              ]}
              aliases={{
                taxable: "Taxable",
                taxrate: "Tax Rate",
              }}
              onChange={(type, payload) => {
                const updatePayload = {
                  ...payload,
                  taxrate: payload.taxable ? payload.taxrate : 0,
                };
                dispatchItemTable({ type, payload: updatePayload });
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}