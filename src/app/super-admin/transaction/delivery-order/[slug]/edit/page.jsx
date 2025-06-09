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

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right", // semua kolom di-align ke kanan
    })),
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
      shippingoption: "",
      shippingaddress: "",
      shippingtype: 0,
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
    "item",
    "displayname",
    "memo",
    "location",
    "quantityremaining",
    "quantity",
    "units",
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
        shippingoption: data.shippingoption,
        shippingtype: data.shippingaddress == "" ? 0 : 1,
      },
    });

    const dataFulfillmentWithItem = await Promise.all(
      data.fulfillment_items.map(async (doItem) => {
        const item = await fetchItemById(doItem.item);

        return {
          ...doItem,
          displayname: item ? item.displayname : "",
        };
      })
    );

    setDataTableItem(dataFulfillmentWithItem);
  };

  const shippingOptions = [
    { label: "Custom", value: 0 },
    { label: "Default", value: 1 },
  ];

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      let payloadToInsert = {
        ...state.payloadPrimary,
        ...state.payloadSummary,
      };

      let shippingaddress =
        state.payloadShipping.shippingtype == 1
          ? state.payloadShipping?.shippingaddress || ""
          : "";
      let shippingoption =
        state.payloadShipping.shippingtype == 0
          ? state.payloadShipping?.shippingoption || ""
          : "";

      payloadToInsert = {
        ...payloadToInsert,
        shippingaddress,
        shippingoption,
      };

      delete payloadToInsert.customer;

      const fulfillment_items = dataTableItem.map((data) => {
        return {
          item: data.id,
          memo: data.memo,
          location: data.location,
          quantityremaining: data.quantityremaining,
          quantity: data.quantity,
          units: data.units,
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
                      },
                      {
                        key: "createdfrom",
                        input: "input",
                        isAlias: true,
                      },
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
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
                      },
                      {
                        key: "memo",
                        input: "text",
                        isAlias: true,
                      },
                    ]}
                    aliases={[]}
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
                        data={dataTableItem}
                        keys={keyTableItem}
                        aliases={{}}
                      />
                    </div>
                  </div>

                  <InputForm
                    title="shipping"
                    type="SET_SHIPPING"
                    payload={state.payloadShipping}
                    data={[
                      {
                        key: "shippingtype",
                        input: "select",
                        options: shippingOptions,
                        isAlias: true,
                      },
                      {
                        key:
                          state.payloadShipping.shippingtype == 0
                            ? "shippingoption"
                            : "shippingaddress",
                        input: "text",
                        isAlias: true,
                      },
                    ]}
                    aliases={[]}
                    onChange={(type, payload) => {
                      dispatch({ type, payload });
                    }}
                  />
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
    </>
  );
}
