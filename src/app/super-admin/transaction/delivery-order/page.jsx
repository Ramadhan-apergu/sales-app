"use client";
import Layout from "@/components/superAdmin/Layout";
import {
  DeliveredProcedureOutlined,
  EditOutlined,
  FilterOutlined,
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
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import {
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";

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
    router.push(`/super-admin/transaction/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "No. DO",
      dataIndex: "tranid",
      key: "tranid",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/super-admin/transaction/${title}/${record.id}`}>
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
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "right",
      width: isLargeScreen ? 87 : 30,
      render: (_, record) => (
        <div className="flex flex-col justify-center items-center gap-2">
          <Button
          disabled={record?.shipstatus?.toLowerCase() == 'shipped'}
            type={"link"}
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {isLargeScreen ? "Edit" : ""}
          </Button>
          {record.shipstatus && record.shipstatus.toLowerCase() == "open" && (
            <Button
              type={"link"}
              style={{ color: "#52c41a" }}
              size="small"
              icon={<TruckOutlined />}
              onClick={() => shipOrderModal(record)}
            >
              {isLargeScreen ? "Ship Order" : ""}
            </Button>
          )}
          {contextHolder}
        </div>
      ),
    },
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
      console.log(response)

      if (response.status_code == 200) {
        notify('success', 'successfully updated the status ship')
        setToggleRefetch(!toggleRefetch);
      } else {
        response.errors.forEach((error) => {
            notify('error', 'Failed', error)
        })
      }

    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  const [isStatusUpdate, setIsStatusUpdate] = useState(false);
  const [idsSelected, setIdsSelected] = useState([]);

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Delivery Order List
          </p>
          <div className="flex justify-center items-center gap-2">
            <Button
              type=""
              icon={<PrinterOutlined />}
              onClick={() =>
                router.push(`/super-admin/transaction/${title}/bulk-print`)
              }
            >
              {isLargeScreen ? `Bulk Print` : ""}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                router.push(`/super-admin/transaction/${title}/enter`)
              }
            >
              {isLargeScreen ? `Enter` : ""}
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
                dropdownStyle={{ minWidth: "100px", whiteSpace: "nowrap" }}
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
                    `/super-admin/transaction/${title}?page=${newPage}&limit=${newLimit}`
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
      {notificationContextHolder}
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
