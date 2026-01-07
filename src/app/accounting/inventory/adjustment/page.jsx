"use client";
import Layout from "@/components/accounting/Layout";
import {
  EditOutlined,
  FilterOutlined,
  ImportOutlined,
  PlusOutlined,
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
import { getResponseHandler } from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import ReportSo from "@/modules/salesApi/report/salesAndSo";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const [tableKeys, setTableKeys] = useState([]);
  const title = "adjustment";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await StockAdjustmentFetch.get(
          page,
          limit,
          statusFilter
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(resData.list);
          setTotalItems(resData.total_items);
          setTableKeys(
            Array.isArray(resData.list) && resData.list.length > 0
              ? Object.keys(resData.list[0])
              : []
          );
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, searchName, statusFilter]);

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
              label: data.companyname,
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

  const columns = [
    {
      title: "Date",
      dataIndex: "trandate",
      key: "trandate",
      render: (text) => <p>{formatDateToShort(text)}</p>,
    },
    {
      title: "Document Number",
      dataIndex: "tranid",
      key: "tranid",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/accounting/inventory/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Memo",
      dataIndex: "memo",
      key: "memo",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={
            ["open", "fulfilled", "closed", "active"].includes(
              record.status.toLowerCase()
            )
              ? "green"
              : ["partially fulfilled", "pending approval"].includes(
                  record.status.toLowerCase()
                )
              ? "orange"
              : ["credit hold", "canceled"].includes(
                  record.status.toLowerCase()
                )
              ? "red"
              : "default"
          }
        >
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Stock Adjustment
          </p>
          <div className="flex justify-center items-center gap-4">
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={() =>
                router.push(`/accounting/inventory/${title}/enter-upload`)
              }
            >
              {isLargeScreen ? `Upload Data` : ""}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                router.push(`/accounting/inventory/${title}/enter`)
              }
            >
              {isLargeScreen ? `Enter` : ""}
            </Button>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
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
                  { value: "active", label: "Active" },
                  //   { value: "fulfilled", label: "Fulfilled" },
                  //   { value: "partially fulfilled", label: "Partially Fulfilled" },
                  //   { value: "credit hold", label: "Credit Hold" },
                  //   { value: "closed", label: "Closed" },
                  //   { value: "pending approval", label: "Pending Approval" },
                ]}
                styles={{
                  popup: {
                    root: {
                      minWidth: 250,
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
                    `/accounting/inventory/${title}?page=${newPage}&limit=${newLimit}`
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

export default function SalesOrderPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <SalesOrder />
    </Suspense>
  );
}
