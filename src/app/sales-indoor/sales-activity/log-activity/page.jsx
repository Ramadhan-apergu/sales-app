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
  List,
  Divider,
  Typography,
  Input,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateTimeToShort, formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import InvoiceFetch from "@/modules/salesApi/invoice";
import { formatRupiah, formatRupiahAccounting } from "@/utils/formatRupiah";
import TargetFetch from "@/modules/salesApi/crm/target";
import LeadActivityFetch from "@/modules/salesApi/crm/leadActivity";
import LogActivityFetch from "@/modules/salesApi/crm/logActivity";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const { Text } = Typography;
const { Search } = Input;

function Activity() {
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
  const [leadName, setLeadName] = useState("");
  const [logType, setLogType] = useState("");
  const [modal, contextHolder] = Modal.useModal();
  const title = "lead-activity";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await LogActivityFetch.get(
          page,
          limit,
          leadName,
          logType
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
  }, [page, limit, pathname, leadName, logType]);

  const handleEdit = (record) => {
    router.push(`/sales-indoor/sales-activity/${title}/${record.id}/edit`);
  };

  const columns = [
    {
      title: "Company Name",
      dataIndex: "companyname",
      key: "companyname",
      align: "center",
      fixed: isLargeScreen ? "left" : "",
      render: (text, record) => (
        <Link href={`/sales-indoor/sales-activity/${title}/${record.id}`}>
          {text || "-"}
        </Link>
      ),
    },
    {
      title: "Date",
      dataIndex: "activitydate",
      key: "activitydate",
      align: "center",
      render: (text, record) =>
        formatDateTimeToShort(record?.activitydate || ""),
    },
    {
      title: "Channel Name",
      dataIndex: "channelnamestr",
      key: "channelnamestr",
      align: "center",
      render: (text, record) => <p className="capitalize">{text}</p>,
    },
    {
      title: "Channel Ref",
      dataIndex: "channelreff",
      key: "channelreff",
      align: "center",
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
            Activity List
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2"></div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Log Type
              </label>
              <Select
                defaultValue=""
                onChange={(e) => {
                  setLogType(e);
                }}
                options={[
                  { value: "", label: "All" },
                  { value: "target", label: "Target" },
                  { value: "lead", label: "Lead" },
                  { value: "lead activity", label: "Lead Activity" },
                ]}
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
            <div className="w-full">
              <List
                itemLayout="vertical"
                dataSource={datas}
                renderItem={(item) => (
                  <List.Item key={item.id} className="border-b border-gray-200">
                    <List.Item.Meta
                      title={
                        <div className="flex justify-between items-center">
                          <Text strong>{item.activityname}</Text>
                          <Text type="secondary">
                            {new Date(item.activitydate).toLocaleString()}
                          </Text>
                        </div>
                      }
                      description={
                        <div
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: item.activitylog.replace(
                              /\\u003cbr\\u003e/g,
                              "<br/>"
                            ),
                          }}
                        />
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Type: {item.activitytype}</span>
                      <span>Sales: {item.sales}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div className="flex justify-end">
              <Pagination
                total={totalItems}
                defaultPageSize={limit}
                defaultCurrent={page}
                size="small"
                onChange={(newPage, newLimit) => {
                  router.push(
                    `/sales-indoor/sales-activity/${title}?page=${newPage}&limit=${newLimit}`
                  );
                }}
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

export default function ActivityPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <Activity />
    </Suspense>
  );
}
