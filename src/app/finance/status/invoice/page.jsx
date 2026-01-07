"use client";
import Layout from "@/components/finance/Layout";
import {
  DownloadOutlined,
  EditOutlined,
  FilterOutlined,
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
import useNavigateWithParams from "@/hooks/useNavigateWithParams";
import dayjs from "dayjs";
import Search from "antd/es/input/Search";
import DeliveryStatusFetch from "@/modules/salesApi/report/deliveryStatus";
import InvoiceStatusFetch from "@/modules/salesApi/report/invoiceStatus";
import { formatRupiah } from "@/utils/formatRupiah";

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
  const customer = searchParams.get("customer");
  const startdate = searchParams.get("startdate");
  const enddate = searchParams.get("enddate");
  const doc_numb = searchParams.get("doc_numb");
  const status = searchParams.get("status");

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [searchDoc, setSearchDoc] = useState(doc_numb);
  const [dateRange, setDateRange] = useState(["", ""]);
  const title = "delivery-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const navigate = useNavigateWithParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const page = parseInt(
          searchParams.get("page") || `${DEFAULT_PAGE}`,
          10
        );
        const limit = parseInt(
          searchParams.get("limit") || `${DEFAULT_LIMIT}`,
          10
        );
        const customer = searchParams.get("customer");
        const startdate = searchParams.get("startdate");
        const enddate = searchParams.get("enddate");
        const doc_numb = searchParams.get("doc_numb");
        const status = searchParams.get("status");

        const response = await InvoiceStatusFetch.get(
          page,
          limit,
          customer,
          startdate,
          enddate,
          doc_numb,
          status
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(
            resData.list.map((item, i) => ({
              ...item,
              key: i,
            }))
          );
          setTotalItems(resData.total_items);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [
    page,
    limit,
    pathname,
    statusFilter,
    customer,
    startdate,
    enddate,
    doc_numb,
    status,
  ]);

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

  const handleEdit = (record) => {
    router.push(`/finance/transaction/${title}/${record.id}/edit`);
  };

  const baseUrl = "/finance/status/invoice";

  const columns = [
    {
      title: "SO Date",
      dataIndex: "invoice_date",
      key: "invoice_date",
      render: (text) => <p>{formatDateToShort(text)}</p>,
    },
    {
      title: "Document Number",
      dataIndex: "doc_numb",
      key: "doc_numb",
      fixed: isLargeScreen ? "left" : "",
      //   render: (text, record) => (
      //     <Link href={`/finance/status/${title}/${record.delivery_id}`}>
      //       {text || "-"}
      //     </Link>
      //   ),
    },
    {
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={
            ["paid in full"].includes(text ? text.toLowerCase() : "-")
              ? "green"
              : ["partially paid"].includes(text ? text.toLowerCase() : "-")
              ? "orange"
              : ["duedate"].includes(text ? text.toLowerCase() : "-")
              ? "red"
              : "default"
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text) => <p>{formatRupiah(text)}</p>,
    },
    {
      title: "Amount due",
      dataIndex: "amountdue",
      key: "amountdue",
      render: (text) => <p>{formatRupiah(text)}</p>,
    },
    {
      title: "Sales Rep",
      dataIndex: "salesrep",
      key: "salesrep",
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   fixed: "right",
    //   align: "right",
    //   width: isLargeScreen ? 87 : 30,
    //   render: (_, record) => (
    //     <div className="flex justify-center items-center gap-2">
    //       <Button
    //         type={"link"}
    //         size="small"
    //         icon={<DownloadOutlined />}
    //         onClick={() => {}}
    //       >
    //         {isLargeScreen ? "Download" : ""}
    //       </Button>
    //       {contextHolder}
    //     </div>
    //   ),
    // },
  ];

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Invoice Status List
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2">
            <div className="hidden lg:flex flex-col justify-start items-start gap-1">
              <label className="text-sm font-semibold leading-none">
                No. Doc
              </label>

              <Search
                placeholder="Input Doc Number"
                onSearch={(value) => {
                  navigate(`${baseUrl}`, {
                    customer,
                    startdate,
                    enddate,
                    page,
                    limit,
                    doc_numb: value,
                    status,
                  });
                }}
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                enterButton
                allowClear
              />
            </div>
            <div className="flex gap-2">
              <div className="hidden lg:flex flex-col justify-start items-start gap-1">
                <label className="text-sm font-semibold leading-none">
                  Customer Name
                </label>
                <Select
                  showSearch
                  value={customer || undefined}
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
                    navigate(`${baseUrl}`, {
                      customer: option?.companyname,
                      startdate,
                      enddate,
                      page,
                      limit,
                      doc_numb,
                      status,
                    });
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
                    value={[
                      startdate ? dayjs(startdate) : null,
                      enddate ? dayjs(enddate) : null,
                    ]}
                    onChange={(value, dateString) => {
                      navigate(`${baseUrl}`, {
                        customer,
                        startdate: dateString[0],
                        enddate: dateString[1],
                        page,
                        limit,
                        doc_numb,
                        status,
                      });
                    }}
                    //   onOk={(val) => {
                    //   }}
                  />
                </div>
              </div>
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="hidden lg:block text-sm font-semibold leading-none">
                  Status
                </label>
                <Select
                  value={status}
                  onChange={(value, option) => {
                    navigate(`${baseUrl}`, {
                      customer,
                      startdate,
                      enddate,
                      page,
                      limit,
                      doc_numb,
                      status: value,
                    });
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "open", label: "Open" },
                    { value: "partially paid", label: "Partially Paid" },
                    { value: "paid in full", label: "Paid in Full" },
                  ]}
                  styles={{
                    popup: {
                      root: {
                        minWidth: 150,
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                  // dropdownAlign={{ points: ["tr", "br"] }}
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
          </div>
        </div>
        {!isLoading ? (
          <>
            <div>
              <Table
                rowKey="key"
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
                  //   router.push(
                  //     `/finance/transaction/${title}?page=${newPage}&limit=${newLimit}`
                  //   );
                  navigate(`${baseUrl}`, {
                    customer,
                    startdate,
                    enddate,
                    page: newPage,
                    limit: newLimit,
                    doc_numb,
                    status,
                  });
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
