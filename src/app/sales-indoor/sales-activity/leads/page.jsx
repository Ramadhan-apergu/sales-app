"use client";
import Layout from "@/components/superAdmin/Layout";
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
import InvoiceFetch from "@/modules/salesApi/invoice";
import { formatRupiah, formatRupiahAccounting } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import LeadsFetch from "@/modules/salesApi/crm/leads";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function Lead() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [statusList, setStatusList] = useState([{ value: "", label: "All" }]);
  const [modal, contextHolder] = Modal.useModal();
  const title = "leads";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await LeadsFetch.get(page, limit, statusFilter);

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
  }, [page, limit, pathname, statusFilter]);

  useEffect(() => {
    fetchFilterList();
  }, []);

  const fetchFilterList = async () => {
    try {
      setIsloading(true);

      const response = await LeadsFetch.getStages();

      const resData = getResponseHandler(response, notify);

      if (resData) {
        setStatusList((prev) => [
          ...prev,
          ...resData.map((data) => ({
            value: data.id,
            label: data.name || "",
          })),
        ]);
      }
    } catch (error) {
      notify("error", "Error", error?.message || "Internal Server error");
    } finally {
      setIsloading(false);
    }
  };

  const handleEdit = (record) => {
    router.push(`/sales-indoor/sales-activity/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "Lead ID",
      dataIndex: "leadid",
      key: "leadid",
      align: "center",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/sales-indoor/sales-activity/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Leads Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      fixed: "left",
    },
    {
      title: "Company Name",
      dataIndex: "companyname",
      key: "companyname",
      align: "center",
    },
    {
      title: "Owner",
      dataIndex: "ownername",
      key: "ownername",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text, record) => (
        <Tag
          color={
            ["qualified"].includes(record.status.toLowerCase())
              ? "green"
              : ["engaged", "prospecting", "Negotiating"].includes(
                  record.status.toLowerCase()
                )
              ? "orange"
              : ["closed"].includes(record.status.toLowerCase())
              ? "red"
              : "default"
          }
        >
          {text || "-"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      align: "center",
      width: isLargeScreen ? 87 : 30,
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          <Button
            disabled={record?.status == "closed"}
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
            Lead List
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              router.push(`/sales-indoor/sales-activity/${title}/enter`)
            }
          >
            {isLargeScreen ? `Enter` : ""}
          </Button>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2"></div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Status
              </label>
              <Select
                defaultValue={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e);
                }}
                options={statusList}
                styles={{
                  popup: {
                    root: {
                      minWidth: 150,
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
                    `/sales-indoor/sales-activity/${title}?page=${newPage}&limit=${newLimit}`
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

export default function LeadPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <Lead />
    </Suspense>
  );
}
