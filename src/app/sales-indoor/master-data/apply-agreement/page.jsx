"use client";

import Layout from "@/components/salesIndoor/Layout";
import { EditOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import AgreementFetch from "@/modules/salesApi/agreement";
import { Button, Dropdown, Modal, Pagination, Table, Tag } from "antd";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { formatDateToShort } from "@/utils/formatDate";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function Agreement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { containerRef, containerHeight } = useContainerHeight();

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const title = "apply-agreement";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await AgreementFetch.getAgreementApply(page, limit);

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
  }, [page, limit, pathname]);

  const dropdownItems = [
    { key: "1", label: "All Status" },
    { key: "2", label: "Active" },
    { key: "3", label: "Inactive" },
  ];

  const handleStatusChange = ({ key }) => {
    const selected = dropdownItems.find((item) => item.key === key);
    if (selected) {
      const label = selected.label.toLowerCase();
      if (label !== statusFilter.toLowerCase()) {
        setStatusFilter(label === "all status" ? "all" : label);
      }
    }
  };

  const handleEdit = (record) => {
    router.push(
      `/sales-indoor/master-data/${title}/${
        encodeURIComponent(record.customercode) || ""
      }/edit`
    );
  };

  const columns = [
    {
      title: "Customer Code",
      dataIndex: "customercode",
      key: "customercode",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      fixed: "left",
      render: (text, record) => (
        <Link
          href={`/sales-indoor/master-data/${title}/${
            encodeURIComponent(record.customercode) || ""
          }`}
        >
          {text}
        </Link>
      ),
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "right",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {isLargeScreen ? "Edit" : ""}
          </Button>
          {contextHolder}
        </div>
      ),
      onHeaderCell: () => ({
        style: { minWidth: 80 },
      }),
      onCell: () => ({
        style: { minWidth: 80 },
      }),
    },
  ];

  return (
    <Layout pageTitle={title}>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Apply Agreement List
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(`/sales-indoor/master-data/${title}/new`)}
          >
            {isLargeScreen ? `New` : ""}
          </Button>
        </div>
        {/* <div className='w-full flex justify-between items-start p-2 bg-gray-2 border border-gray-4 rounded-lg'>
                        <div className='flex gap-2'>
                        </div>
                        <div className='flex gap-2'>
                            <div className='flex flex-col justify-start items-start gap-1'>
                                <label className='hidden lg:block text-sm font-semibold leading-none'>Status</label>
                                <Dropdown
                                    menu={{ items: dropdownItems, onClick: handleStatusChange, style: { textAlign: "right" } }}
                                    placement="bottomRight"
                                >
                                    <Button icon={<FilterOutlined />} style={{ textTransform: "capitalize" }}>
                                        {isLargeScreen ? (statusFilter == "all" ? "all status" : statusFilter) : ""}
                                    </Button>
                                </Dropdown>
                            </div>  
                        </div>
                    </div> */}
        {!isLoading ? (
          <>
            <div>
              <Table
                rowKey={(record) => record.customercode}
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
                    `/sales-indoor/master-data/${title}?page=${newPage}&limit=${newLimit}`
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

export default function AgreementPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <Agreement />
    </Suspense>
  );
}
