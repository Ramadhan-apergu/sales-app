"use client";

import Layout from "@/components/superAdmin/Layout";
import { DeleteOutlined, EditOutlined, LoadingOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import useContainerHeight from "@/hooks/useContainerHeight";
import AgreementFetch from "@/modules/salesApi/agreement";
import { Button, Modal, Table, Tag } from "antd";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderControls from "@/components/superAdmin/masterData/list/HeaderControls";
import MobileList from "@/components/superAdmin/masterData/list/MobileList";
import PaginationControls from "@/components/superAdmin/masterData/list/PaginationControls";
import Link from "next/link";
import { formatDateToShort } from "@/utils/formatDate";

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

  const title = "agreement";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);
        const response = await AgreementFetch.get(offset, limit);
        const data = response?.data?.data;

        if (!data?.list) {
          toast.error("Fetching data failed! Invalid response from server.");
          return;
        }

        setDatas(data.list);
        setTotalItems(data.total_items || 0);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Login failed! Server error, please try again later.";
        toast.error(message);
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, statusFilter]);

  const deleteModal = (record) => {
    modal.confirm({
      title: `Delete ${title} "${record.agreementname}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        console.log(`Deleting ${title}: ${record.agreementname} (ID: ${record.id})`);
        // call delete function here
      },
    });
  };

  const handleEdit = (record) => {
    router.push(`/super-admin/master-data/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "Agreement Code",
      dataIndex: "agreementcode",
      key: "agreementcode",
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
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "active" ? "success" : "error"}>{text}</Tag>
      ),
    },
    {
      title: "Effective Date",
      dataIndex: "effectivedate",
      key: "effectivedate",
      render: (text) => <span>{formatDateToShort(text)}</span>,
    },
    {
      title: "End Date",
      dataIndex: "enddate",
      key: "enddate",
      render: (text) => <span>{formatDateToShort(text)}</span>,
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
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => deleteModal(record)}
          />
          {contextHolder}
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle={title}>
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <LoadingOutlined style={{ fontSize: "44px" }} />
        </div>
      ) : (
        <>
          <div className="w-full h-1/12 flex justify-between items-start gap-2">
            <HeaderControls
              isLargeScreen={isLargeScreen}
              statusFilter={statusFilter}
              onStatusChange={handleStatusChange}
              onAdd={() => router.push(`/super-admin/master-data/${title}/new`)}
              dropdownItems={dropdownItems}
            />
          </div>

          <div
            ref={containerRef}
            className="lg:p-4 justify-between lg:bg-white w-full h-11/12 lg:rounded-xl flex flex-col gap-2 overflow-auto"
          >
            {isLargeScreen ? (
              <Table
                rowKey={(record) => record.id}
                size="small"
                pagination={false}
                columns={columns}
                dataSource={datas}
                scroll={{ y: containerHeight - 115 }}
                bordered
              />
            ) : (
              <div
                className="w-full pr-2 h-[95%] overflow-x-auto flex flex-col"
                style={{ scrollbarWidth: "thin" }}
              >
                <MobileList
                  data={datas}
                  onEdit={handleEdit}
                  onDelete={deleteModal}
                  contextHolder={contextHolder}
                />
              </div>
            )}

            <div className="w-full h-[5%] flex justify-end items-center">
              <PaginationControls
                totalItems={totalItems}
                page={page}
                limit={limit}
                isLargeScreen={isLargeScreen}
                onChange={(page, pageSize) => {
                  router.push(
                    `/super-admin/master-data/${title}?page=${page}&limit=${pageSize}`
                  );
                }}
              />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default function AgreementPage() {
    return (
      <Suspense
        fallback={
          <div className="w-full h-full flex justify-center items-center">
            <LoadingOutlined style={{ fontSize: "44px" }} />
          </div>
        }
      >
        <Agreement />
      </Suspense>
    );
  }