"use client";
import Layout from "@/components/salesIndoor/Layout";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
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
  Input,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import UserManageFetch from "@/modules/salesApi/userManagement";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function UserRoles() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [searchNameTemp, setSearchNameTemp] = useState("");
  const title = "user";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await UserManageFetch.get(
          offset,
          limit,
          statusFilter.toLowerCase() == "all" ? "" : statusFilter,
          roleFilter.toLowerCase() == "all" ? "" : roleFilter,
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
  }, [page, limit, pathname, statusFilter, roleFilter, searchName]);

  const handleEdit = (record) => {
    router.push(`/sales-indoor/access-control/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/sales-indoor/access-control/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      render: (text) => (
        <p className="capitalize">{text.split("-").join(" ")}</p>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          className="capitalize"
          color={
            ["active"].includes(record.status.toLowerCase())
              ? "green"
              : ["inactive"].includes(record.status.toLowerCase())
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
      align: "right",
      width: isLargeScreen ? 87 : 30,
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

  // const fetchData = async () => {
  //   try {
  //     setIsloading(true);
  //     const response = await SalesOrderFetch.get(offset, limit, statusFilter, searchName);
  //     const resData = getResponseHandler(response, notify)

  //     if (resData) {
  //         setDatas(resData.list)
  //         setTotalItems(resData.total_items)
  //     }
  //   } catch (error) {
  //       notify('error', 'Error', error?.message || "Internal Server error");
  //   } finally {
  //     setIsloading(false);
  //   }
  // };

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            User List
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              router.push(`/sales-indoor/access-control/${title}/new`)
            }
          >
            {isLargeScreen ? `Enter` : ""}
          </Button>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2 flex-col md:flex-row">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Name
              </label>
              <Input
                placeholder="Search User"
                styles={{
                  popup: {
                    root: {
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                value={searchNameTemp}
                onChange={(e) => {
                  if (e.target.value.length == 0) {
                    setSearchName("");
                  }
                  setSearchNameTemp(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchName(searchNameTemp);
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="hidden md:block text-sm font-semibold leading-none">
                  Role
                </label>
                <Select
                  defaultValue="all"
                  onChange={(e) => {
                    setRoleFilter(e);
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "admin", label: "Admin" },
                    { value: "sales-indoor", label: "Sales Indoor" },
                    { value: "sales-outdoor", label: "Sales Outdoor" },
                  ]}
                  style={{ minWidth: "150px" }}
                  dropdownAlign={{ points: ["tr", "br"] }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Status
              </label>
              <Select
                defaultValue="all"
                onChange={(e) => {
                  setStatusFilter(e);
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
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
                    `/sales-indoor/access-control/${title}?page=${newPage}&limit=${newLimit}`
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

export default function UserRolesPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <UserRoles />
    </Suspense>
  );
}
