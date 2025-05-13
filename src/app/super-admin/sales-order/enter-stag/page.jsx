"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Empty,
  List,
  Modal,
  Select,
  Table,
  Tooltip,
} from "antd";
import Layout from "@/components/superAdmin/Layout";
import { CheckOutlined, InfoCircleOutlined, LeftOutlined } from "@ant-design/icons";

import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import { createResponseHandler, getResponseHandler } from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import ItemFetch from "@/modules/salesApi/item";
import convertToLocalDate from "@/utils/convertToLocalDate";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right", // semua kolom di-align ke kanan
    })),
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

export default function AgreementNew() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const [modal, contextHolder] = Modal.useModal();
  const title = "sales order";
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [dataCustomer, setDataCustomer] = useState([]);
  const [customerSelected, setCustomerSelected] = useState({});

  const [dataItem, setDataItem] = useState([]);
  const [itemSelected, setItemSelected] = useState({});

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await CustomerFetch.get(0, 1000, "active");
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
        }
      } catch (error) {
        notify("error", "Error", "Failed get data customer");
      }
    }
    fetchCustomer();

    async function fetchItem() {
      try {
        const response = await ItemFetch.get(0, 1000);
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

  const [payloadPrimary, setPayloadPrimary] = useState({
    entity: "",
    trandate: "",
    salesrep: "sales_indoor",
    otherrefnum: "",
  });

  const [payloadSummary, setPayloadSummary] = useState({
    subtotalbruto: 0,
    discounttotal: 0,
    subtotal: 0,
    taxtotal: 0,
    total: 0,
  });

  const [payloadBilling, setPayloadBilling] = useState({
    term: "Net 30",
    paymentoption: "",
  });

  const [payloadShipping, setPayloadShipping] = useState({
    shippingoption: "",
    shippingaddress: "",
    shippingtype: 0,
  });

  const [dataTableItem, setDataTableItem] = useState([]);

  useEffect(() => {
    function updateSummary() {
      if (dataTableItem.length > 0) {
        let totalAmountItem = 0;
        let totalAmountItemAfterDiscount = 0;
        let totalDiscountItem = 0;

        dataTableItem.forEach((data) => {
          totalAmountItem = totalAmountItem + data.totalamount;
          totalAmountItemAfterDiscount =
            totalAmountItemAfterDiscount + data.subtotal;
          totalDiscountItem =
            totalDiscountItem + data.totaldiscount;
        });

        let setSummary = {
          subtotalbruto: totalAmountItem,
          discounttotal: totalDiscountItem,
          subtotal: totalAmountItemAfterDiscount,
          taxtotal: 0,
          total: totalAmountItemAfterDiscount,
        };

        setSummary = {
          ...setSummary,
          total: setSummary.subtotal + setSummary.taxtotal,
        };

        setPayloadSummary(setSummary);
      } else {
        setPayloadSummary({
          subtotalbruto: 0,
          discounttotal: 0,
          subtotal: 0,
          taxtotal: 0,
          total: 0,
        });
      }
    }

    updateSummary();
  }, [dataTableItem]);

  const [discountItem, setDiscountItem] = useState([]);
  const [discountItemTemp, setDiscountItemTemp] = useState({});
  const [discountItemTempSelected, setDiscountItemTempSelected] = useState({
    1: null,
    2: null,
    3: null,
  });

  const shipAddressOptions = [
    { label: "Custom", value: 0 },
    { label: "Default Address", value: 1 },
  ];

  const termOptions = [
    { label: "Net 30", value: "Net 30" },
    { label: "Net 90", value: "Net 90" },
    { label: "Net 120", value: "Net 120" },
  ];

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Credit", value: "credit" },
  ];

  const handleChangePayload = (type, payload) => {
    switch (type) {
      case "primary":
        setPayloadPrimary(payload);
        break;
      case "billing":
        setPayloadBilling(payload);
        break;
      case "shipping":
        setPayloadShipping(payload);
        break;
      case "modalitem":
        setDataItemTemp(payload);
        break;
      case "taxitemtemp":
        if (payload.taxable == false) {
          setDataItemTaxTemp({
            taxable: false,
            taxrate: 0,
          });
        }
        setDataItemTaxTemp(payload);
        break;
    }
  };

  const keyTableItem = [
    "item",
    "quantity",
    "units",
    "description",
    "rate",
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

  const [isModalItemOpen, setIsModalItemOpen] = useState(false);
  const [modalItemPage, setModalItemPage] = useState(1);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);

  const [dataItemTemp, setDataItemTemp] = useState({
    item: "",
    quantity: 1,
    units: "",
    description: "",
    rate: 0,
  });

  const [dataItemTaxTemp, setDataItemTaxTemp] = useState({
    taxable: false,
    taxrate: 0,
  });

  async function getDiscount(cust_id, item_id, trandate, qty, item_categories) {
    try {
      setIsLoadingDiscount(true);

      let initData = {
        id: itemSelected.id,
        discount: [],
      };

      if (itemSelected.discount && itemSelected.discount > 0) {
        initData.discount.push({
          id: "itemdiscount",
          type: "Discount Item",
          discounttype: "nominal",
          discount: "Discount Price",
          value: itemSelected.discount,
          discountvalue: "rp",
          perunit: "",
          paymenttype: ["cash", "credit"],
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
            type: agreement.paymenttype != ""
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

      const resAgreementGroup = await SalesOrderFetch.getSoAgreementGroup(
        item_categories,
        cust_id,
        qty,
        trandate
      );

      const dataAgreementGroup = getResponseHandler(resAgreementGroup);

      if (
        dataAgreementGroup &&
        dataAgreementGroup[itemSelected.itemprocessfamily]
      ) {
        const discountAgreementGroup =
          dataAgreementGroup[itemSelected.itemprocessfamily];

        initData.discount.push({
          id: discountAgreementGroup.agreementid,
          type: "Discount Agreement",
          discounttype:
            discountAgreementGroup.unitfree == "" ? "nominal" : "freeitem",
          discount: discountAgreementGroup.agreementname,
          value: discountAgreementGroup.discountvalue,
          discountvalue: discountAgreementGroup?.unitfree == "" ? "rp" : "",
          perunit: discountAgreementGroup.unitfree,
          paymenttype: "",
          isChecked: false,
        });
      }
      setDiscountItemTemp(initData);
    } catch (error) {
      notify("error", "Error", "Failed get data discount");
    } finally {
      setIsLoadingDiscount(false);
    }
  }

  function handleModalItemCancel() {
    setIsModalItemOpen(false);
    setDataItemTemp({
      item: "",
      quantity: 1,
      units: "",
      description: "",
      rate: 0,
    });
    setItemSelected({});
    setDiscountItemTemp({});
    setModalItemPage(1);
    setDiscountItemTempSelected({
      1: null,
      2: null,
      3: null,
    });
    setDataItemTaxTemp({
      taxable: false,
      taxrate: 0,
    });
  }

  function handleInsertTableItem() {
    let data = {
      lineid: crypto.randomUUID(),
      id: itemSelected?.id || "",
      item: itemSelected?.displayname || "",
      quantity: dataItemTemp?.quantity || 0,
      units: itemSelected?.unitstype || "",
      description: dataItemTemp?.description || "",
      rate: itemSelected?.price || 0,

      discount1: discountItemTempSelected[1]?.id || "",
      discountname1: discountItemTempSelected[1]?.discount || "",
      value1: discountItemTempSelected[1]?.value || 0,
      discountvalue1: discountItemTempSelected[1]?.discountvalue || "",
      perunit1: discountItemTempSelected[1]?.perunit || "",

      discount2: discountItemTempSelected[2]?.id || "",
      discountname2: discountItemTempSelected[2]?.discount || "",
      value2: discountItemTempSelected[2]?.value || 0,
      discountvalue2: discountItemTempSelected[2]?.discountvalue || "",
      perunit2: discountItemTempSelected[2]?.perunit || "",

      discount3: discountItemTempSelected[3]?.id || "",
      discountname3: discountItemTempSelected[3]?.discount || "",
      value3: discountItemTempSelected[3]?.value || 0,
      discountvalue3: discountItemTempSelected[3]?.discountvalue || "",
      perunit3: discountItemTempSelected[3]?.perunit || "",

      totalamount: 0,
      subtotal: 0,
      qtyfree: 0,
      unitfree: "",
      taxable: dataItemTaxTemp?.taxable,
      taxrate: dataItemTaxTemp.taxrate,
      taxvalue: 0,
      totaldiscount: 0,
    };

    data = {
      ...data,
      totalamount: data.quantity * data.rate,
    };

    const getValueDiscount = (discountValue, value) => {
      switch (discountValue) {
        case "rp":
          return value;
        case "%":
          return (data.totalamount * value) / 100;
        default:
          return 0;
      }
    };

    const discount1 = getValueDiscount(data.discountvalue1, data.value1);
    const discount2 = getValueDiscount(data.discountvalue2, data.value2);
    const discount3 = getValueDiscount(data.discountvalue3, data.value3);

    const totaldiscount = discount1 + discount2 + discount3;

    data = {
      ...data,
      subtotal: data.totalamount - totaldiscount,
      totaldiscount: totaldiscount,
    };

    if (["kg", "bal"].includes(data.perunit2.toLowerCase())) {
      data = {
        ...data,
        qtyfree: data.qtyfree + data.value2,
        unitfree: data.perunit2,
      };
    }

    if (data.taxable == true) {
      data = {
        ...data,
        taxvalue: (data.subtotal / (100 / 100 + data.taxrate)) * data.taxrate,
      };
    }
    setDataTableItem((prev = []) => [...prev, data]);
  }

  function handleModalPage() {
    if (modalItemPage == 1) {
      if (!dataItemTemp.item || dataItemTemp.item == "") {
        notify("error", "Error", "Select item first");
        return;
      }
      if (!dataItemTemp.quantity || dataItemTemp.quantity < 1) {
        notify("error", "Error", "Minimum quantity is 1");
        return;
      }
      getDiscount(
        payloadPrimary.entity,
        dataItemTemp.item,
        convertToLocalDate(payloadPrimary.trandate),
        dataItemTemp.quantity,
        itemSelected.itemprocessfamily
      );
      setModalItemPage((prev) => prev + 1);
    } else if (modalItemPage == 2) {
      setModalItemPage((prev) => prev + 1);
    } else if (modalItemPage == 3) {
      handleInsertTableItem();
      handleModalItemCancel();
    }
  }

  function handleAddItem() {
    if (!payloadPrimary.entity || payloadPrimary.entity == "") {
      notify(
        "error",
        "Error",
        "Select the customer first in the customer section"
      );
      return;
    }

    if (!payloadPrimary.trandate || payloadPrimary.trandate == "") {
      notify(
        "error",
        "Error",
        "Fill in the trandate first in the primary section"
      );
      return;
    }

    if (!payloadBilling.paymentoption || payloadBilling.paymentoption == "") {
      notify(
        "error",
        "Error",
        "Select the payment type first in the billing section"
      );
      return;
    }

    setIsModalItemOpen(true);
  }

  function handleSelectDiscount(isChecked, item) {
    if (isChecked) {
      if (item.type === "Discount Item") {
        if (!discountItemTempSelected[1]) {
          setDiscountItemTempSelected((prev) => ({ ...prev, 1: item }));
        } else {
          return;
        }
      } else if (item.type === "Discount Agreement") {
        if (!discountItemTempSelected[2]) {
          setDiscountItemTempSelected((prev) => ({ ...prev, 2: item }));
        } else {
          return;
        }
      } else if (item.type === "Discount Payment") {
        if (!discountItemTempSelected[3]) {
          setDiscountItemTempSelected((prev) => ({ ...prev, 3: item }));
        } else {
          return;
        }
      }

      // update isChecked to true in discount list
      setDiscountItemTemp((prev) => ({
        ...prev,
        discount: prev.discount.map((data) =>
          data.id === item.id ? { ...data, isChecked: true } : data
        ),
      }));
    } else {
      // Uncheck logic
      for (let i = 1; i <= 3; i++) {
        const selectedItem = discountItemTempSelected[i];
        if (selectedItem && selectedItem.id === item.id) {
          setDiscountItemTempSelected((prev) => ({ ...prev, [i]: null }));
          break;
        }
      }

      // update isChecked to false in discount list
      setDiscountItemTemp((prev) => ({
        ...prev,
        discount: prev.discount.map((data) =>
          data.id === item.id ? { ...data, isChecked: false } : data
        ),
      }));
    }
  }

  function handleDeleteTableItem(record) {
    setDataTableItem((prev) =>
      prev.filter((item) => item.lineid !== record.lineid)
    );
  }

  const clearState = () => {
    setPayloadPrimary({
      entity: "",
      trandate: "",
      salesrep: "sales_indoor",
      otherrefnum: "",
    });
  
    setPayloadSummary({
      subtotalbruto: 0,
      discounttotal: 0,
      subtotal: 0,
      taxtotal: 0,
      total: 0,
    });
  
    setPayloadBilling({
      term: "Net 30",
      paymentoption: "",
    });
  
    setPayloadShipping({
      shippingoption: "",
      shippingaddress: "",
      shippingtype: 0,
    });
  
    setDataTableItem([]);
    setDiscountItem([]);
    setDiscountItemTemp({});
    setDiscountItemTempSelected({
      1: null,
      2: null,
      3: null,
    });
  };
  

  function formatRupiah(number) {
    return number.toLocaleString("id-ID") + ",-";
  }

      const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {

            let payloadToInsert = {
                ...payloadPrimary,
                ...payloadSummary,
                ...payloadBilling
            }

            let shippingaddress = payloadShipping?.shippingaddress || ""
            let shippingoption = payloadShipping?.shippingoption || ""

            payloadToInsert = {
                ...payloadToInsert,
                shippingaddress,
                shippingoption
            }

            const sales_order_items = dataTableItem.map((data) => {
                return {
                    item: data.id,
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
                    discountvalue2: data.discountvalue2 == 'rp' ? 0 : 1,
                    perunit2: data.perunit2,
                    discount3: data.discount3,
                    value3: data.value3,
                    discountvalue3: data.discountvalue3 == 'rp' ? 0 : 1,
                    perunit3: data.perunit3,
                    subtotal: data.subtotal,
                    totalamount: data.totalamount,
                    qtyfree: data.qtyfree,
                    unitfree: data.unitfree == 'kg' ? 0 : 1,
                    taxable: data.taxable,
                    taxrate: data.taxrate,
                    totaldiscount: data.totaldiscount
                }
            })

            payloadToInsert = {...payloadToInsert, sales_order_items}
            
            if (!payloadToInsert.entity) {
                throw new Error ('Customer is required')
            }

            if (!payloadToInsert.trandate) {
                throw new Error ('Date is required')
            }

            if (!payloadToInsert.subtotal) {
                throw new Error ('Subtotal invalid')
            }

            if (!payloadToInsert.total) {
                throw new Error ('Total invalid')
            }

            if (!payloadToInsert.sales_order_items || payloadToInsert.sales_order_items.length == 0) {
                throw new Error ('Please enter a value greater than 0.')
            }
    
          const response = await SalesOrderFetch.add(payloadToInsert);
    
          const resData = createResponseHandler(response, notify);

          if (resData) {
            // router.push(`/super-admin/sales-order/${resData}`)
            clearState()
          }
        } catch (error) {
          notify('error', 'Error', error.message || 'Internal server error');
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
              Sales Order Enter
            </p>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1">
                {/* <Button icon={<LeftOutlined />} onClick={() => router.back()}>
                  {isLargeScreen ? "Back" : ""}
                </Button> */}
              </div>
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
                  <p>Customer</p>
                  <Select
                    showSearch
                    placeholder="Select a customer"
                    optionFilterProp="label"
                    onChange={(_, customer) => {
                      setCustomerSelected(customer);
                      setPayloadShipping((prev) => ({
                        ...prev,
                        shippingaddress: customer.addressee,
                      }));
                      setPayloadPrimary((prev) => ({
                        ...prev,
                        entity: customer.id,
                      }));
                    }}
                    onSearch={{}}
                    options={dataCustomer}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <InputForm
              title="primary"
              type="primary"
              payload={payloadPrimary}
              data={[
                {
                  key: "entity",
                  input: "input",
                  isAlias: true,
                  isRead: true,
                  rules: [{ required: true, message: ` is required` }],
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
                },
                {
                  key: "otherrefnum",
                  input: "input",
                  isAlias: true,
                  rules: [{ required: true, message: ` is required` }],
                },
              ]}
              aliases={[]}
              onChange={handleChangePayload}
            />
            <InputForm
              title="shipping"
              type="shipping"
              payload={payloadShipping}
              data={[
                {
                  key: "shippingtype",
                  input: "select",
                  options: shipAddressOptions,
                  isAlias: true,
                },
                {
                  key:
                    payloadShipping.shippingtype == 1
                      ? "shippingaddress"
                      : "shippingoption",
                  input: "text",
                  isAlias: true,
                },
              ]}
              aliases={[]}
              onChange={handleChangePayload}
            />
            <InputForm
              title="billing"
              type="billing"
              payload={payloadBilling}
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
                },
              ]}
              aliases={[]}
              onChange={handleChangePayload}
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
                      {formatRupiah(payloadSummary.subtotalbruto)}
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2">Discount Item</p>
                    <p className="w-1/2 text-end">
                      {formatRupiah(payloadSummary.discounttotal)}
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2">Subtotal (After Discount)</p>
                    <p className="w-1/2 text-end">
                      {formatRupiah(payloadSummary.subtotal)} Incl. PPN
                    </p>
                  </div>
                  <div className="flex w-full">
                    <p className="w-1/2">Tax Total</p>
                    <p className="w-1/2 text-end">
                      {formatRupiah(payloadSummary.taxtotal)}
                    </p>
                  </div>
                  <hr className="border-gray-5" />
                  <div className="flex w-full font-semibold">
                    <p className="w-1/2">Total</p>
                    <p className="w-1/2 text-end">
                      {formatRupiah(payloadSummary.total)}
                    </p>
                  </div>
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
        onOk={handleModalPage}
        onCancel={handleModalItemCancel}
        width={850}
        okText={modalItemPage == 3 ? "OK" : "Next"}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          {modalItemPage == 1 && (
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
                      showSearch
                      placeholder="Select an item"
                      optionFilterProp="label"
                      onChange={(_, item) => {
                        setDataItemTemp((prev) => ({
                          ...prev,
                          item: item.id,
                          units: item.unitstype,
                          rate: item.price,
                        }));
                        setItemSelected(item);
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
                type="modalitem"
                payload={dataItemTemp}
                data={[
                  {
                    key: "item",
                    input: "input",
                    isAlias: true,
                    isRead: true,
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
                    input: "input",
                    isAlias: true,
                    isRead: true,
                  },
                  {
                    key: "description",
                    input: "text",
                    isAlias: true,
                  },
                ]}
                aliases={[]}
                onChange={handleChangePayload}
              />
            </div>
          )}
          {modalItemPage == 2 && (
            <>
              {!isLoadingDiscount ? (
                <div className="w-full flex flex-col gap-2">
                  <Divider
                    style={{
                      margin: "0",
                      textTransform: "capitalize",
                      borderColor: "#1677ff",
                    }}
                    orientation="left"
                  >
                    Discount Item
                  </Divider>
                  {discountItemTemp.discount &&
                  discountItemTemp.discount.length > 0 ? (
                    <div className="w-full flex lg:pr-2 flex-col">
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={discountItemTemp.discount || []}
                        header="Discount 1"
                        renderItem={(item, index) => (
                          <>
                            {item.type == "Discount Item" && (
                              <List.Item>
                                <Checkbox
                                  checked={item.isChecked}
                                  style={{ marginRight: "16px" }}
                                  onChange={(e) => {
                                    handleSelectDiscount(
                                      e.target.checked,
                                      item
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
                        dataSource={discountItemTemp.discount || []}
                        header="Discount 2"
                        renderItem={(item, index) => (
                          <>
                            {item.type == "Discount Agreement" && (
                              <List.Item>
                                <Checkbox
                                  checked={item.isChecked}
                                  onChange={(e) => {
                                    handleSelectDiscount(
                                      e.target.checked,
                                      item
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
                        dataSource={discountItemTemp.discount || []}
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
                                    payloadBilling.paymentoption
                                  }
                                  onChange={(e) => {
                                    handleSelectDiscount(
                                      e.target.checked,
                                      item
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
                  ) : (
                    <Empty description="This item has no available discounts." />
                  )}
                </div>
              ) : (
                <div className="w-full flex justify-center items-center">
                  <LoadingSpin />
                </div>
              )}
            </>
          )}
          {modalItemPage == 3 && (
            <InputForm
              title="Tax Item"
              type="taxitemtemp"
              payload={dataItemTaxTemp}
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
                  disabled: !dataItemTaxTemp.taxable,
                },
              ]}
              aliases={[]}
              onChange={handleChangePayload}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
