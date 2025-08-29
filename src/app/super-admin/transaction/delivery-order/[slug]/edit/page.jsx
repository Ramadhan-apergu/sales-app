"use client";

import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import Layout from "@/components/superAdmin/Layout";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import { Button, Divider, Dropdown, Modal, Table, Tag } from "antd";
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

function TableCustom({ data, keys, aliases, onEdit }) {
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
        <Button type="link" onClick={() => onEdit(record)}>
          Edit
        </Button>
      ),
    },
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

export default function Page() {
  const { slug } = useParams();
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isLargeScreen = useBreakpoint("lg");
  const { notify, contextHolder: contextNotify } = useNotification();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [customerSelected, setCustomerSelected] = useState({});

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

    "displayname",
    // "location",
    "memo",
    "quantity1",
    "quantity2",
    "quantityremaining",
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

    const dataFulfillmentWithItem = await Promise.all(
      data.fulfillment_items.map(async (doItem) => {
        const item = await fetchItemById(doItem.item);

        let updateData = {
          ...doItem,
          displayname: item ? item.displayname : "",
          quantity1: doItem.quantity,
          unit1: doItem.units,
          unit2: doItem.units2,
        };

        delete updateData.quantity;
        delete updateData.units;
        delete updateData.units2;

        return updateData;
      })
    );

    setDataTableItem(dataFulfillmentWithItem);

    const getCustomer = await fetchCustomerById(data.entity);

    setCustomerSelected(getCustomer);
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
        ...state.payloadShipping,
      };

      delete payloadToInsert.customer;

      const fulfillment_items = dataTableItem.map((data) => {
        return {
          item: data.item,
          memo: data.memo,
          location: data.location,
          quantityremaining: data.quantityremaining,
          quantity: data.quantity1,
          units: data.unit1,
          quantity2: data.quantity2,
          units2: data.unit2,
        };
      });

      payloadToInsert = { ...payloadToInsert, fulfillment_items };

      const response = await FullfillmentFetch.update(data.id, payloadToInsert);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/transaction/${title}/${resData}`);
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
                        hidden: true
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
          if (editItem.quantity1 > editItem.quantityremaining) {
            notify(
              "error",
              "Failed",
              "Quantity 1 cannot be more than the Remaining Quantity"
            );
            return;
          }

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
                  hidden: true
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
                  hidden: true
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
                  hidden: true
                },
              ]}
              aliases={deliveryOrderAliases.item}
              onChange={(type, payload) => {
                setEditItem((prev) => ({
                  ...prev,
                  quantity1: payload.quantity1,
                  quantity2: payload.quantity2,
                  memo: payload.memo,
                }));
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
