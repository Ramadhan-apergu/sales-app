"use client";

import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import Layout from "@/components/accounting/Layout";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import { Button, Checkbox, Divider, Dropdown, Modal, Table, Tag } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import {
  CloseOutlined,
  EditOutlined,
  FileAddOutlined,
  MoreOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useNotification from "@/hooks/useNotification";
import {
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import { formatDateToShort } from "@/utils/formatDate";
import ItemFetch from "@/modules/salesApi/item";
import dayjs from "dayjs";
import CustomerFetch from "@/modules/salesApi/customer";
import { deliveryOrderAliases } from "@/utils/aliases";

function TableCustom({ data, keys, aliases, onEdit, onChecked, onCheckAll }) {
  const allCheckableItems = data;
  const isAllChecked =
    allCheckableItems.length > 0 &&
    allCheckableItems.every((item) => item.apply);
  const isIndeterminate =
    allCheckableItems.some((item) => item.apply) && !isAllChecked;

  const columns = [
    ...keys.map((key) => {
      if (key === "apply") {
        return {
          title: (
            <Checkbox
              indeterminate={isIndeterminate}
              checked={isAllChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                // lempar ke parent untuk handle check all
                onCheckAll?.(checked);
              }}
            />
          ),
          key,
          align: "center",
          render: (_, record) => (
            <Checkbox
              checked={record.apply}
              onChange={(e) => {
                onChecked(record.lineid, e.target.checked);
              }}
            />
          ),
        };
      }

      if (key === "isfree") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "center",
          render: (text) => (text ? "Yes" : "No"),
        };
      }

      return {
        title: aliases?.[key] || key,
        dataIndex: key,
        key,
        align: ["quantity1", "quantity2"].includes(key) ? "right" : "left",
      };
    }),
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => onEdit(record)}
          disabled={!record.apply}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Hitung total quantity
  const totalQuantity1 = data.reduce((sum, r) => sum + (r.quantity1 || 0), 0);
  const totalQuantity2 = data.reduce((sum, r) => sum + (r.quantity2 || 0), 0);

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(r) => r.id || r.lineid}
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
      summary={() => (
        <Table.Summary.Row>
          {keys.map((key, i) => {
            if (i === 0) {
              return (
                <Table.Summary.Cell key={key} index={i} align="center">
                  <b>Total</b>
                </Table.Summary.Cell>
              );
            }

            if (key === "quantity1") {
              return (
                <Table.Summary.Cell key={key} index={i} align="right">
                  <b>{totalQuantity1.toLocaleString()}</b>
                </Table.Summary.Cell>
              );
            }
            if (key === "quantity2") {
              return (
                <Table.Summary.Cell key={key} index={i} align="right">
                  <b>{totalQuantity2.toLocaleString()}</b>
                </Table.Summary.Cell>
              );
            }

            return <Table.Summary.Cell key={key} index={i} />;
          })}

          <Table.Summary.Cell key="action" index={keys.length} align="center" />
        </Table.Summary.Row>
      )}
    />
  );
}

export default function Page() {
  const { slug } = useParams();
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const { notify, contextHolder: contextNotify } = useNotification();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [customerSelected, setCustomerSelected] = useState({});
  const [soItem, setSoItem] = useState([]);

  const initialState = {
    payloadPrimary: {
      createdfrom: "",
      customer: "",
      entity: "",
      memo: "",
      salesorderid: "",
      shipstatus: "",
      trandate: "",
      tranid: "",
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

  const title = "delivery-order";
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataTableItem, setDataTableItem] = useState([]);
  const keyTableItem = [
    "apply",
    "itemid",
    "displayname",
    "isfree",
    "quantity1",
    "unit1",
    "quantity2",
    "unit2",
    "quantityremaining",
    "onhand",
    "memo",
    "availability",
  ];

  useEffect(() => {
    async function fetchSalesOrder() {
      try {
        const response = await FullfillmentFetch.getById(slug);
        const resData = getResponseHandler(response);

        if (resData) {
          setData(resData);
          mappingDataDeliveryOrder(resData);
        }
      } catch (error) {
        notify("error", "Error", "Failed get data Sales Order");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSalesOrder();
  }, []);

  async function fetchItemById(id) {
    try {
      const response = await ItemFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      notify("error", "Error", "Failed get data item");
    }
  }

  async function fetchCustomerById(id) {
    try {
      const response = await CustomerFetch.getById(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      notify("error", "Error", "Failed get data item");
    }
  }

  const mappingDataDeliveryOrder = async (data) => {
    dispatch({
      type: "SET_PRIMARY",
      payload: {
        createdfrom: data.createdfrom,
        customer: data.customer,
        entity: data.entity,
        memo: data.memo,
        salesorderid: data.salesorderid,
        shipstatus: data.shipstatus,
        trandate: dayjs(data.trandate),
        tranid: data.tranid,
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingaddress: data.shippingaddress,
        notes: data.notes,
      },
    });

    let dataTable =
      data.fulfillment_items.map((item) => {
        const updateItem = {
          ...item,
          lineid: crypto.randomUUID(),
          apply: true,
          itemid: item?.itemid || "-",
          displayname: item?.displayname || "-",
          quantity1: item.quantity,
          unit1: item.units,
          unit2: item.units2,
        };

        delete updateItem.quantity;
        delete updateItem.units;
        delete updateItem.units2;

        return updateItem;
      }) || [];

    const getCustomer = await fetchCustomerById(data.entity);

    setCustomerSelected(getCustomer);

    const fetchSoItem = (await getSoItem(data.salesorderid)) || [];

    if (fetchSoItem.length > 0) {
      const dataTableSoItem = fetchSoItem.map((item) => {
        const updateItem = {
          ...item,
          lineid: crypto.randomUUID(),
          apply: false,
          itemid: item?.itemid || "",
          item: item?.id || "",
          displayname: item?.displayname || "",
          quantity1: item.quantity,
          unit1: item.units,
          unit2: item.units2,
          location: "General Warehouse",
        };

        delete updateItem.quantity;
        delete updateItem.units;
        delete updateItem.units2;

        return updateItem;
      });

      const filteredDataTableSoItem = dataTableSoItem.filter(
        (soItem) =>
          !dataTable.some(
            (fulfillItem) =>
              fulfillItem.item === soItem.item &&
              fulfillItem.isfree === soItem.isfree,
          ),
      );

      dataTable = [...dataTable, ...filteredDataTableSoItem];
    }

    setDataTableItem(dataTable);
  };

  async function getSoItem(id) {
    try {
      const response = await FullfillmentFetch.getSoItem(id);
      const resData = getResponseHandler(response);
      return resData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadShipping,
      };

      delete payloadToInsert.customer;

      let fulfillment_items = dataTableItem.filter(
        (item) => item.apply == true,
      );

      fulfillment_items = fulfillment_items.map((data) => {
        return {
          item: data.item,
          memo: data.memo,
          location: data.location,
          quantityremaining: data.quantityremaining,
          quantity: data.quantity1,
          units: data.unit1,
          quantity2: data.quantity2,
          units2: data.unit2,
          isfree: data.isfree,
          onhand: data.onhand,
          availability: data.availability,
        };
      });

      payloadToInsert = { ...payloadToInsert, fulfillment_items };

      const response = await FullfillmentFetch.update(data.id, payloadToInsert);

      if (
        response?.message.toLowerCase() == "warning" &&
        response?.errors.length > 0
      ) {
        for (let i = 0; i < response.errors.length; i++) {
          const error = response.errors[i];
          notify("warning", "Warning", `${error}`);
        }
      }

      const resData = updateResponseHandler(response, notify);

      if (payloadToInsert.shipstatus.toLowerCase() == "open") {
        notify(
          "info",
          "Info",
          "This Delivery Order is still in draft. Stock will be deducted once status is set to Shipped.",
        );
      }

      if (resData) {
        setTimeout(() => {
          router.push(`/accounting/transaction/${title}/${resData}`);
        }, 3000);
      }
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "Shipped", value: "shipped" },
  ];

  const [editItem, setEditItem] = useState(null);
  const [isEditItem, setIsEditItem] = useState(false);

  return (
    <>
      <Layout>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Edit Delivery Order
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/accounting/transaction/${title}`);
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
                    <div className="w-full lg:w-1/2 flex gap-1">
                      <Button
                        icon={<CloseOutlined />}
                        onClick={() => router.back()}
                      >
                        {isLargeScreen ? "Cancel" : ""}
                      </Button>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        type={"primary"}
                        icon={<SaveOutlined />}
                        onClick={handleSubmit}
                      >
                        {isLargeScreen ? "Save" : ""}
                      </Button>
                    </div>
                  </div>
                  <InputForm
                    title="primary"
                    type="SET_PRIMARY"
                    payload={state.payloadPrimary}
                    data={[
                      {
                        key: "tranid",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "createdfrom",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "trandate",
                        input: "date",
                        isAlias: true,
                      },
                      {
                        key: "shipstatus",
                        input: "select",
                        options: statusOptions,
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                      },
                      {
                        key: "memo",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                        cursorDisable: true,
                        hidden: true,
                      },
                    ]}
                    aliases={deliveryOrderAliases.primary}
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
                        // isRead: true,
                        // cursorDisable: true,
                      },
                    ]}
                    aliases={deliveryOrderAliases.shipping}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
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
                        onEdit={(record) => {
                          setEditItem(record);
                          setIsEditItem(true);
                        }}
                        data={dataTableItem}
                        keys={keyTableItem}
                        aliases={deliveryOrderAliases.item}
                        onChecked={(lineid, isChecked) => {
                          const updateDataTable = dataTableItem.map((item) => ({
                            ...item,
                            apply:
                              item.lineid == lineid ? isChecked : item.apply,
                          }));

                          setDataTableItem(updateDataTable);
                        }}
                        onCheckAll={(isChecked) => {
                          const updateDataTable = dataTableItem.map((item) => ({
                            ...item,
                            apply: isChecked,
                          }));

                          setDataTableItem(updateDataTable);
                        }}
                      />
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
      {contextNotify}
      <Modal
        open={isEditItem}
        onOk={() => {
          const updatedDataTableItem = dataTableItem.map((item) => {
            if (item.id == editItem.id) {
              return editItem;
            } else {
              return item;
            }
          });

          setDataTableItem(updatedDataTableItem);
          setIsEditItem(false);
        }}
        onCancel={() => {
          setIsEditItem(false);
          setEditItem(null);
        }}
        width={850}
        cancelText="Cancel"
      >
        <div className="w-full mt-6">
          <div className="w-full flex flex-col gap-4 mt-6">
            <InputForm
              title="Edit Item"
              type="SET_ITEM"
              payload={editItem}
              data={[
                {
                  key: "id",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  hidden: true,
                },
                {
                  key: "displayname",
                  input: "number",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "itemid",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  hidden: true,
                },
                {
                  key: "memo",
                  input: "text",
                  isAlias: true,
                },
                {
                  key: "quantity1",
                  input: "number",
                  isAlias: true,
                },
                {
                  key: "unit1",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "quantity2",
                  input: "number",
                  isAlias: true,
                },
                {
                  key: "unit2",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "quantityremaining",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                },
                {
                  key: "location",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  hidden: true,
                },
                {
                  key: "conversion",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  //   hidden: true,
                },
                {
                  key: "onhand",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  //   hidden: true,
                },
                {
                  key: "availability",
                  input: "input",
                  isAlias: true,
                  disabled: true,
                  //   hidden: true,
                },
              ]}
              aliases={deliveryOrderAliases.item}
              onChange={(type, payload, key) => {
                if (key == "quantity1") {
                  setEditItem((prev) => ({
                    ...prev,
                    quantity1: payload.quantity1,
                    quantity2:
                      Math.ceil((payload.quantity1 / prev.conversion) * 10) /
                      10,
                    memo: payload.memo,
                  }));
                } else {
                  setEditItem((prev) => ({
                    ...prev,
                    [key]: payload[key],
                  }));
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
