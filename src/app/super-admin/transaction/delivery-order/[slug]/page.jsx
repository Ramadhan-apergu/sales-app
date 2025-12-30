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
  updateResponseHandler,
} from "@/utils/responseHandlers";
import InputForm from "@/components/superAdmin/InputForm";
import { formatDateToShort } from "@/utils/formatDate";
import ItemFetch from "@/modules/salesApi/item";
import { deliveryOrderAliases } from "@/utils/aliases";
import DeliveryOrderPrint from "@/components/superAdmin/DeliveryOrderPrint";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => {
      if (key === "isfree") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "right",
          render: (text) => <p>{text ? "Yes" : "No"}</p>,
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key,
          align: "right",
        };
      }
    }),
  ];

  // Hitung total quantity
  const totalQuantity1 = data.reduce(
    (sum, r) => sum + (Number(r.quantity1) || 0),
    0
  );
  const totalQuantity2 = data.reduce(
    (sum, r) => sum + (Number(r.quantity2) || 0),
    0
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
      summary={() => (
        <Table.Summary.Row>
          {/* iterasi sesuai urutan columns agar posisi total tepat */}
          {columns.map((col) => {
            if (col.dataIndex === "quantity1") {
              return (
                <Table.Summary.Cell
                  key={col.key || col.dataIndex}
                  align="right"
                >
                  <b>{totalQuantity1.toLocaleString()}</b>
                </Table.Summary.Cell>
              );
            }
            if (col.dataIndex === "quantity2") {
              return (
                <Table.Summary.Cell
                  key={col.key || col.dataIndex}
                  align="right"
                >
                  <b>{totalQuantity2.toLocaleString()}</b>
                </Table.Summary.Cell>
              );
            }
            // kolom lainnya kosong agar alignment tetap rapi
            return <Table.Summary.Cell key={col.key || col.dataIndex} />;
          })}
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
      salesrep: "",
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
    "itemid",
    "displayname",
    // "location",
    "isfree",
    "quantity1",
    "unit1",
    "quantity2",
    "unit2",
    "memo",
    "quantityremaining",
    "onhand",
    // "itemprocessfamily",
    // "displayname",
    // "memo",
    // "location",
    // "quantityremaining",
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
        salesrep: data.salesrep,
      },
    });

    dispatch({
      type: "SET_SHIPPING",
      payload: {
        shippingaddress: data.shippingaddress,
        notes: data.notes,
      },
    });

    const dataTable =
      data.fulfillment_items.map((item) => {
        const updateItem = {
          ...item,
          itemid: item?.itemid || "-",
          displayname: item?.displayname || "-",
          quantity1: item.quantity,
          unit1: item.units,
          unit2: item.units2,
          onhand: item.onhand,
        };

        delete updateItem.quantity;
        delete updateItem.units;
        delete updateItem.units2;

        return updateItem;
      }) || [];

    setDataTableItem(dataTable);
  };

  const handleClickAction = ({ key }) => {
    switch (key) {
      case "1":
        window.print();
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
      const response = await FullfillmentFetch.updateCancel(id);

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        router.refresh();
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
      label: "Cancel",
      danger: true,
      disabled: ["canceled", "shiped"].includes(
        data?.shipstatus?.toLocaleLowerCase() || ""
      ),
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
                            data.shipstatus.toLocaleLowerCase() == "shipped"
                              ? "green"
                              : "default"
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
                        disabled={data?.shipstatus?.toLowerCase() == "shipped"}
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
                      {
                        key: "salesrep",
                        input: "input",
                        isAlias: true,
                        isRead: true,
                      },
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
        <div className="to-print hidden">
          <DeliveryOrderPrint data={data} dataTable={dataTableItem} />
        </div>
      </Layout>
      {contextNotify}
      <style jsx>{`
        @media print {
          * {
            display: none !important;
          }

          .ant-dropdown {
            display: none !important;
          }

          .to-print {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
            z-index: 99999;
          }
        }
      `}</style>
    </>
  );
}
