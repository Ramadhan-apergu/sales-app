"use client";
import Layout from "@/components/salesIndoor/Layout";
import {
  DeliveredProcedureOutlined,
  EditOutlined,
  FilterOutlined,
  LoadingOutlined,
  PlusOutlined,
  PrinterOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import {
  Button,
  Modal,
  Pagination,
  Table,
  Tag,
  Select,
  DatePicker,
  Checkbox,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import {
  getByIdResponseHandler,
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import DeliveryOrderPrintBulk from "@/components/superAdmin/DeliveryOrderPrintBulk";
import ItemFetch from "@/modules/salesApi/item";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function DeliveryOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [doDetailDatas, setDoDetailDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const [toggleRefetch, setToggleRefetch] = useState(false);
  const title = "delivery-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await FullfillmentFetch.get(
          offset,
          limit,
          statusFilter,
          searchName
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(resData.list);
          setTotalItems(resData.total_items);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, statusFilter, searchName, toggleRefetch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await CustomerFetch.get(0, 10000, null);

        const resData = getResponseHandler(response, notify);

        if (resData) {
          const mapingCustomerOption = resData.list.map((data) => {
            return {
              ...data,
              value: data.id,
              label: data.customerid || data.companyname,
            };
          });
          setDataCustomer(mapingCustomerOption);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (record) => {
    router.push(`/sales-indoor/transaction/${title}/${record.id}/edit`);
  };

  const [isStatusUpdate, setIsStatusUpdate] = useState(false);
  const [idsSelected, setIdsSelected] = useState([]);
  const [isLoadingItemFetch, setIsLoadingFetchItem] = useState(false);

  const columns = [
    {
      title: (
        <Checkbox
          checked={idsSelected.length === datas.length && datas.length > 0}
          indeterminate={
            idsSelected.length > 0 && idsSelected.length < datas.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      dataIndex: "checkbox",
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={idsSelected.includes(record.id)}
          onChange={(e) => handleSelect(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "No. DO",
      dataIndex: "tranid",
      key: "tranid",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/sales-indoor/transaction/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Date",
      dataIndex: "trandate",
      key: "trandate",
      render: (text) => <p>{formatDateToShort(text)}</p>,
    },
    {
      title: "Sales Rep",
      dataIndex: "salesrep",
      key: "salesrep",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Status",
      dataIndex: "shipstatus",
      key: "shipstatus",
      render: (text, record) => (
        <Tag
          className="capitalize"
          color={
            record.shipstatus.toLocaleLowerCase() == "shipped"
              ? "green"
              : "default"
          }
        >
          {text}
        </Tag>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   fixed: "right",
    //   align: "right",
    //   width: isLargeScreen ? 87 : 30,
    //   render: (_, record) => (
    //     <div className="flex flex-col justify-center items-center gap-2">
    //       <Button
    //         type={"link"}
    //         size="small"
    //         icon={<EditOutlined />}
    //         onClick={() => handleEdit(record)}
    //       >
    //         {isLargeScreen ? "Edit" : ""}
    //       </Button>
    //       {record.shipstatus && record.shipstatus.toLowerCase() == "open" && (
    //         <Button
    //           type={"link"}
    //           style={{ color: "#52c41a" }}
    //           size="small"
    //           icon={<TruckOutlined />}
    //           onClick={() => shipOrderModal(record)}
    //         >
    //           {isLargeScreen ? "Ship Order" : ""}
    //         </Button>
    //       )}
    //       {contextHolder}
    //     </div>
    //   ),
    // },
  ];

  const shipOrderModal = (record) => {
    modal.confirm({
      title: `Open Credit ${title} "${record.tranid}"?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        updateHandleStatus(record.id, "Shipped");
      },
    });
  };

  const updateHandleStatus = async (id, status) => {
    try {
      setIsloading(true);

      const response = await FullfillmentFetch.bulkUpdateStatus({
        shipstatus: status,
        id: [id],
      });

      if (response.status_code == 200) {
        notify("success", "successfully updated the status ship");
        setToggleRefetch(!toggleRefetch);
      } else {
        response.errors.forEach((error) => {
          notify("error", "Failed", error);
        });
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  const handleSelect = async (id, checked) => {
    try {
      setIsLoadingFetchItem(true);
      if (checked) {
        setIdsSelected((prev) => [...prev, id]);

        const response = await FullfillmentFetch.getById(id);
        let resData = getByIdResponseHandler(response);

        if (resData) {
          const promisesItem = resData.fulfillment_items.map(
            async (itemFullfil) => {
              const responseItem = await ItemFetch.getById(itemFullfil.item);
              let resDataItem = getByIdResponseHandler(responseItem);

              return {
                ...itemFullfil,
                itemid: resDataItem.itemid,
                displayname: resDataItem.displayname,
              };
            }
          );

          const fulfillmentItems = await Promise.all(promisesItem);
          resData = { ...resData, fulfillment_items: fulfillmentItems };

          setDoDetailDatas((prev) => [...prev, resData]);
        }
      } else {
        setIdsSelected((prev) => prev.filter((item) => item !== id));
        setDoDetailDatas((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingFetchItem(false);
    }
  };

  const handleSelectAll = async (checked) => {
    setIsLoadingFetchItem(true);
    try {
      if (checked) {
        const allIds = datas.map((item) => item.id);
        setIdsSelected(allIds);

        const promises = allIds.map(async (id) => {
          const response = await FullfillmentFetch.getById(id);
          let resData = getByIdResponseHandler(response);

          if (resData) {
            const promisesItem = resData.fulfillment_items.map(
              async (itemFullfil) => {
                const responseItem = await ItemFetch.getById(itemFullfil.item);
                let resDataItem = getByIdResponseHandler(responseItem);

                return {
                  ...itemFullfil,
                  itemid: resDataItem.itemid,
                  displayname: resDataItem.displayname,
                };
              }
            );

            const fulfillmentItems = await Promise.all(promisesItem);
            return { ...resData, fulfillment_items: fulfillmentItems };
          }
        });

        const datasAll = await Promise.all(promises);
        setDoDetailDatas(datasAll);
      } else {
        setIdsSelected([]);
        setDoDetailDatas([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingFetchItem(false);
    }
  };

  async function handlePrint() {
    if (doDetailDatas.length === 0) {
      notify("error", "Failed", "No data selected!");
      return;
    } else {
      window.print();
    }
  }

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Bulk Print Delivery Order
          </p>
          <div className="flex justify-center items-center gap-2">
            <Button
              disabled={doDetailDatas.length == 0 || isLoadingItemFetch}
              type="primary"
              icon={
                isLoadingItemFetch ? <LoadingOutlined /> : <PrinterOutlined />
              }
              onClick={() => handlePrint()}
            >
              {isLargeScreen ? `Print` : ""}
            </Button>
          </div>
        </div>
        <div className="w-full flex flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Customer ID
              </label>
              <Select
                showSearch
                placeholder="Select a person"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={dataCustomer}
                styles={{
                  popup: {
                    root: {
                      minWidth: 250,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                onChange={(value, option) => {
                  setSearchName(option?.companyname || "");
                }}
                allowClear
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Status
              </label>
              <Select
                defaultValue="all"
                onChange={(e) => {
                  setStatusFilter(e);
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "shipped", label: "Shipped" },
                ]}
                styles={{
                  popup: {
                    root: {
                      minWidth: 100,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                dropdownAlign={{ points: ["tr", "br"] }}
              />
            </div>
          </div>
        </div>
        {!isLoading ? (
          <>
            <div>
              <Table
                rowKey={(record) => record.id}
                size="small"
                pagination={false}
                columns={columns}
                dataSource={datas}
                scroll={{ x: "max-content" }}
                bordered
                tableLayout="auto"
              />
            </div>
            <div>
              <Pagination
                total={totalItems}
                defaultPageSize={limit}
                defaultCurrent={page}
                onChange={(newPage, newLimit) => {
                  router.push(
                    `/sales-indoor/transaction/${title}?page=${newPage}&limit=${newLimit}`
                  );
                }}
                size="small"
                align={"end"}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-96">
            <LoadingSpin />
          </div>
        )}
      </div>
      <div className="to-print hidden">
        <DeliveryOrderPrintBulk datas={doDetailDatas} />
      </div>
      {notificationContextHolder}
      <style jsx>{`
        @media print {
          * {
            display: none !important;
          }

          .ant-dropdown {
            display: none !important;
          }

          .ant-layout-sider {
            display: none !important;
          }

          .to-print {
            display: block !important;
            width: 100%;
            background: white;
          }
        }
      `}</style>
    </Layout>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <DeliveryOrder />
    </Suspense>
  );
}
