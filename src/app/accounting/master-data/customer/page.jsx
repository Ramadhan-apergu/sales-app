"use client";
import Layout from "@/components/accounting/Layout";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import CustomerFetch from "@/modules/salesApi/customer";
import { Button, Dropdown, Modal, Pagination, Select, Table, Tag } from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import FilterCustomer from "@/components/filter/FilterCustomer";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function Customer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchCust, setSearchCust] = useState("");
  const [modal, contextHolder] = Modal.useModal();
  const title = "customer";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await CustomerFetch.get(
          page,
          limit,
          statusFilter,
          searchCust
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
  }, [page, limit, pathname, statusFilter, searchCust]);

  const handleEdit = (record) => {
    router.push(`/accounting/master-data/${title}/${record.id}/edit`);
  };

  const handleStatusChange = ({ key }) => {
    dropdownItems.forEach((item) => {
      if (item.key == key) {
        const label = item.label.toLocaleLowerCase();
        if (label != statusFilter.toLocaleLowerCase()) {
          switch (label) {
            case "all status":
              setStatusFilter("all");
              break;
            case "pending approval":
              setStatusFilter("pending");
              break;
            default:
              setStatusFilter(label);
          }
        }
      }
    });
  };

  const dropdownItems = [
    {
      key: "1",
      label: "All Status",
    },
    {
      key: "2",
      label: "Active",
    },
    {
      key: "3",
      label: "Pending",
    },
    {
      key: "4",
      label: "Inactive",
    },
  ];

  const columns = [
    {
      title: "Customer ID",
      dataIndex: "customerid",
      key: "customerid",
      fixed: isLargeScreen ? "left" : "",
    },
    {
      title: "Name",
      dataIndex: "companyname",
      key: "companyname",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/accounting/master-data/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Sales Rep",
      dataIndex: "salesrep",
      key: "salesrep",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={record.status.toLowerCase() == "active" ? "green" : "orange"}
          className="capitalize"
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
      width: 87,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Button
            type={"link"}
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {isLargeScreen ? "Edit" : ""}
          </Button>
          {contextHolder}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Customer List
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(`/accounting/master-data/${title}/new`)}
          >
            {isLargeScreen ? `New` : ""}
          </Button>
        </div>
        <div className="w-full flex justify-between items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2"></div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Status
              </label>
              <Dropdown
                menu={{
                  items: dropdownItems,
                  onClick: handleStatusChange,
                  style: { textAlign: "right" },
                }}
                placement="bottomRight"
              >
                <Button
                  icon={<FilterOutlined />}
                  style={{ textTransform: "capitalize" }}
                >
                  {isLargeScreen
                    ? statusFilter == "all"
                      ? "all status"
                      : statusFilter
                    : ""}
                </Button>
              </Dropdown>
            </div>
            <FilterCustomer
              value={searchCust}
              onChange={(value, option) => {
                setSearchCust(option?.value || "");
              }}
            />
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
                    `/accounting/master-data/${title}?page=${newPage}&limit=${newLimit}`
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

export default function CustomerPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <Customer />
    </Suspense>
  );
}
