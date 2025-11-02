"use client";
import Layout from "@/components/superAdmin/Layout";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  UnlockOutlined,
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
import { Dropdown, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";

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
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const title = "sales-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const [toggleRefetch, setToggleRefetch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await SalesOrderFetch.get(
          offset,
          limit,
          statusFilter,
          searchName,
          dateRange[0],
          dateRange[1]
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
  }, [page, limit, pathname, statusFilter, searchName, dateRange]);

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

  const openCreditModal = (record) => {
    modal.confirm({
      title: `Open Credit ${title} "${record.tranid}"?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        updateHandleStatus(record.id, "Open");
      },
    });
  };

  const closedModal = (record) => {
    modal.confirm({
      title: `Closed ${title} "${record.tranid}"?`,
      content: "This action cannot be undone.",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        updateHandleStatus(record.id, "Closed");
      },
    });
  };

  const approveModal = (record) => {
    modal.confirm({
      title: `Approve ${title} "${record.tranid}"?`,
      content: "Are you sure you want to approve this item?",
      okText: "Approve",
      cancelText: "Cancel",
      okButtonProps: {
        type: "primary",
        style: { backgroundColor: "green", borderColor: "green" },
      },
      onOk: () => {
        updateHandleStatus(record.id, "Open");
      },
    });
  };

  const updateHandleStatus = async (id, status) => {
    try {
      setIsloading(true);

      const response = await SalesOrderFetch.updateStatus(id, {
        status,
      });

      const resData = updateResponseHandler(response, notify);

      if (resData) {
        setDatas((prev) => [
          ...prev.map((data) => ({
            ...data,
            status: data.id == resData ? status : data.status,
          })),
        ]);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  const columns = [
    {
      title: "No. SO",
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
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "No. PO",
      dataIndex: "otherrefnum",
      key: "otherrefnum",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={
            ["fulfilled", "closed"].includes(record.status.toLowerCase())
              ? "green"
              : ["partially fulfilled"].includes(record.status.toLowerCase())
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
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: 90,
      render: (_, record) => {
        const menuItems = [
          {
            key: "edit",
            label: (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                disabled={["credit hold", "fulfilled"].includes(
                  record.status.toLowerCase()
                )}
                className="w-full text-left"
              >
                Edit
              </Button>
            ),
          },
        ];

        if (record.status?.toLowerCase() === "credit hold") {
          menuItems.push({
            key: "openCredit",
            label: (
              <Button
                type="link"
                size="small"
                icon={<UnlockOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => openCreditModal(record)}
                className="w-full text-left"
              >
                Open Credit
              </Button>
            ),
          });
        }

        if (record.status?.toLowerCase() != "closed") {
          menuItems.push({
            key: "closed",
            label: (
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                danger
                onClick={() => closedModal(record)}
                className="w-full text-left"
              >
                Closed
              </Button>
            ),
          });
        }

        if (record.status?.toLowerCase() === "pending approval") {
          menuItems.push({
            key: "approve",
            label: (
              <Button
                variant="link"
                size="small"
                icon={<CheckOutlined />}
                color="green"
                onClick={() => approveModal(record)}
                className="w-full text-left"
              >
                Approve
              </Button>
            ),
          });
        }

        return (
          <>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button size="small" icon={<MoreOutlined />} iconPosition="end">
                More
              </Button>
            </Dropdown>
            {contextHolder}
          </>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Sales Order List
          </p>
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
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2">
            <div className="hidden lg:flex flex-col justify-start items-start gap-1">
              <label className="text-sm font-semibold leading-none">
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
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Date
              </label>
              <div className="flex justify-center items-start gap-2">
                <RangePicker
                  showTime={false}
                  format="YYYY-MM-DD"
                  onChange={(value, dateString) => {
                    setDateRange(dateString);
                  }}
                  //   onOk={(val) => {
                  //   }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex lg:hidden flex-col justify-start items-start gap-1">
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
                dropdownAlign={{ points: ["tr", "br"] }}
              />
            </div>
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
                  { value: "fulfilled", label: "Fulfilled" },
                  {
                    value: "partially fulfilled",
                    label: "Partially Fulfilled",
                  },
                  { value: "credit hold", label: "Credit Hold" },
                  { value: "closed", label: "Closed" },
                  { value: "pending approval", label: "Pending Approval" },
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

export default function SalesOrderPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <SalesOrder />
    </Suspense>
  );
}
