"use client";

import Layout from "@/components/accounting/Layout";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import AgreementFetch from "@/modules/salesApi/agreement";
import { Button, Modal, Pagination, Table } from "antd";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import FilterCustomer from "@/components/filter/FilterCustomer";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function Agreement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();
  const [searchCust, setSearchCust] = useState("");

  const title = "apply-agreement";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await AgreementFetch.getAgreementApply(
          page,
          limit,
          searchCust,
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
  }, [page, limit, pathname, searchCust]);

  const handleEdit = (record) => {
    router.push(
      `/accounting/master-data/${title}/${
        encodeURIComponent(record.customercode) || ""
      }/edit`,
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
          href={`/accounting/master-data/${title}/${
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
            onClick={() => router.push(`/accounting/master-data/${title}/new`)}
          >
            {isLargeScreen ? `New` : ""}
          </Button>
        </div>
        <div className="w-full flex justify-between items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2"></div>
          <div className="flex gap-2">
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
                    `/accounting/master-data/${title}?page=${newPage}&limit=${newLimit}`,
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
