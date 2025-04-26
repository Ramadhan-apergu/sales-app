"use client";

import Layout from "@/components/superAdmin/Layout";
import { DeleteOutlined, EditOutlined, FilterOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import AgreementFetch from "@/modules/salesApi/agreement";
import { Button, Dropdown, Modal, Pagination, Table, Tag } from "antd";
import { Suspense, useEffect, useState } from "react";
import HeaderControls from "@/components/superAdmin/masterData/list/HeaderControls";
import PaginationControls from "@/components/superAdmin/masterData/list/PaginationControls";
import Link from "next/link";
import { formatDateToShort } from "@/utils/formatDate";
import MobileListAgreement from "@/components/superAdmin/masterData/list/MobileListAgreement";
import useNotification from "@/hooks/useNotification";
import HeaderContent from "@/components/superAdmin/masterData/HeaderContent";
import BodyContent from "@/components/superAdmin/masterData/BodyContent";
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
  const offset = (page - 1) * limit;

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const { notify, contextHolder: notificationContextHolder  } = useNotification();

  const title = "agreement";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await AgreementFetch.get(offset, limit, statusFilter);

        const resData = getResponseHandler(response, notify)

        if (resData) {
            setDatas(resData.list)
            setTotalItems(resData.total_items)
        }

      } catch (error) {
        notify('error', 'Error', error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, statusFilter]);

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
    router.push(`/super-admin/master-data/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "Agreement Code",
      dataIndex: "agreementcode",
      key: "agreementcode",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Agreement Name",
      dataIndex: "agreementname",
      key: "agreementname",
      fixed: "left",
      render: (text, record) => (
        <Link href={`/super-admin/master-data/${title}/${record.id}`}>
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      onHeaderCell: () => ({
        style: { minWidth: 100 },
      }),
      onCell: () => ({
        style: { minWidth: 100 },
      }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "active" ? "success" : "error"}>{text}</Tag>
      ),
      onHeaderCell: () => ({
        style: { minWidth: 100 },
      }),
      onCell: () => ({
        style: { minWidth: 100 },
      }),
    },
    {
      title: "Effective Date",
      dataIndex: "effectivedate",
      key: "effectivedate",
      render: (text) => <span>{formatDateToShort(text)}</span>,
      onHeaderCell: () => ({
        style: { minWidth: 150 },
      }),
      onCell: () => ({
        style: { minWidth: 150 },
      }),
    },
    {
      title: "End Date",
      dataIndex: "enddate",
      key: "enddate",
      render: (text) => <span>{formatDateToShort(text)}</span>,
      onHeaderCell: () => ({
        style: { minWidth: 150 },
      }),
      onCell: () => ({
        style: { minWidth: 150 },
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
          >{isLargeScreen ? 'Edit' : ''}</Button>
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
        <HeaderContent justify="between">
            <div className="flex justify-start items-center">
            </div>
                <div className="flex justify-end items-center gap-2 lg:gap-4">
                    <Dropdown menu={{ items: dropdownItems, onClick: handleStatusChange, style: { textAlign: "right" } }}
                        placement="bottomRight"
                    >
                        <Button icon={<FilterOutlined />} style={{ textTransform: "capitalize" }}>
                            {isLargeScreen ? (statusFilter == "all" ? "all status" : statusFilter) : ""}
                        </Button>
                    </Dropdown>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => router.push(`/super-admin/master-data/${title}/new`)}
                    >
                        {isLargeScreen ? `Add` : ""}
                    </Button>
                </div>
        </HeaderContent>
        <BodyContent gap="0">
            {!isLoading ? (
                <>
                    <div ref={containerRef} className="w-full h-[92%]">
                        <Table
                                rowKey={(record) => record.id}
                                size="small" pagination={false}
                                columns={columns}
                                dataSource={datas}
                                scroll={{y: containerHeight - 50}}
                                bordered
                                tableLayout="auto"
                            />
                        </div>
                        <div className="w-full h-[8%] flex justify-end items-end overflow-hidden">
                        <Pagination
                            total={totalItems}
                            defaultPageSize={limit}
                            defaultCurrent={page}
                            onChange={(newPage, newLimit) => {
                                router.push(
                                `/super-admin/master-data/${title}?page=${newPage}&limit=${newLimit}`
                                )
                            }}
                            size='small'
                            align={'end'}
                        />
                    </div>
                </>
            ) : (
            <LoadingSpin/>
            )}
        </BodyContent>
        {notificationContextHolder}
    </Layout>
  );
}

export default function AgreementPage() {
    return (
      <Suspense
        fallback={
          <LoadingSpinProcessing/>
        }
      >
        <Agreement/>
      </Suspense>
    );
  }