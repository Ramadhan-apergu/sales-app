"use client";

import EmptyCustom from "@/components/superAdmin/EmptyCustom";
import Layout from "@/components/superAdmin/Layout";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import { Button, Divider, Dropdown, Modal, Table, Tag } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import {
  EditOutlined,
  FileAddOutlined,
  MoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useNotification from "@/hooks/useNotification";
import {
  deleteResponseHandler,
  getResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import { formatDateToShort } from "@/utils/formatDate";
import ItemFetch from "@/modules/salesApi/item";
import { deliveryOrderAliases } from "@/utils/aliases";

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

  const initialState = {
    payloadPrimary: {
      createdfrom: "",
      customer: "",
      dateso: "",
      entity: "",
      id: "",
      memo: "",
      numso: "",
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
    "item",
    "displayname",
    "memo",
    "location",
    "quantityremaining",
    "quantity1",
    "unit1",
    "quantity2",
    "unit2",
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
        dateso: formatDateToShort(data.dateso),
        entity: data.entity,
        id: data.id,
        memo: data.memo,
        numso: data.numso,
        salesorderid: data.salesorderid,
        shipstatus: data.shipstatus,
        trandate: formatDateToShort(data.trandate),
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
  };

  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        notify("success", "Print", ":P");
        break;
      case "2":
        deleteModal();
        break;
      default:
        console.warn("Unhandled action:", key);
    }
  };

  const handleEdit = () => {
    router.push(`/super-admin/transaction/${title}/${data.id}/edit`);
  };

  const deleteModal = () => {
    modal.confirm({
      title: `Cancel ${title} "${data.customer}"?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await FullfillmentFetch.delete(id);

      const resData = deleteResponseHandler(response, notify);

      if (resData) {
        router.push(`/super-admin/master-data/${title}`);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    }
  };

  const [modal, contextHolder] = Modal.useModal();

  const items = [
    {
      key: "1",
      label: "Print",
    },
    {
      key: "2",
      label: "Delete",
      danger: true,
    },
  ];

  return (
    <>
      <Layout>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Delivery Order Details
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
                    <div className="w-full lg:w-1/2 flex gap-1 flex-col">
                      <p className="w-full lg:text-lg">
                        {data.tranid + " / " + data.customer}
                      </p>
                      <div>
                        <Tag
                          style={{
                            textTransform: "capitalize",
                            fontSize: "16px",
                          }}
                          className="capitalize"
                          color={
                            data.shipstatus.toLowerCase() == "open"
                              ? "green"
                              : "red"
                          }
                        >
                          {data.shipstatus}
                        </Tag>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                      <Button
                        icon={<FileAddOutlined />}
                        type={"primary"}
                        onClick={() => {
                          router.push(
                            `/super-admin/transaction/invoice/enter?fulfillmentId=${data.id}`
                          );
                        }}
                      >
                        {isLargeScreen ? "Bill" : ""}
                      </Button>

                      <Button
                        icon={<EditOutlined />}
                        type={"primary"}
                        onClick={handleEdit}
                      >
                        {isLargeScreen ? "Edit" : ""}
                      </Button>

                      {contextHolder}
                      <Dropdown
                        menu={{ items, onClick: handleClickAction }}
                        placement="bottomRight"
                      >
                        <Button icon={!isLargeScreen ? <MoreOutlined /> : null}>
                          {isLargeScreen ? "Action" : ""}
                        </Button>
                      </Dropdown>
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
                        isRead: true,
                      },
                      {
                        key: "customer",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "trandate",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                      {
                        key: "shipstatus",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
                    //   {
                    //     key: "memo",
                    //     input: "text",
                    //     isAlias: true,
                    //     isRead: true,
                    //   },
                      //   {
                      //     key: "dateso",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      //   {
                      //     key: "entity",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      //   {
                      //     key: "id",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      //   {
                      //     key: "numso",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                      //   {
                      //     key: "salesorderid",
                      //     input: "input",
                      //     isAlias: true,
                      //     isRead: true,
                      //   },
                    ]}
                    aliases={deliveryOrderAliases.primary}
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
                      },
                      {
                        key: "notes",
                        input: "text",
                        isAlias: true,
                        isRead: true,
                      },
                    ]}
                    aliases={deliveryOrderAliases.shipping}
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
    </>
  );
}
