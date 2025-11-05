"use client";
import Layout from "@/components/superAdmin/Layout";
import {
  ArrowRightOutlined,
  CheckOutlined,
  DeliveredProcedureOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  RightOutlined,
  UnorderedListOutlined,
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
  Checkbox,
} from "antd";
import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import {
  createResponseHandler,
  getResponseHandler,
  updateResponseHandler,
} from "@/utils/responseHandlers";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import { formatDateToShort } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import FullfillmentFetch from "@/modules/salesApi/itemFullfillment";
import PaymentFetch from "@/modules/salesApi/payment";
import { formatRupiahAccounting } from "@/utils/formatRupiah";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function Payment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [statusFilterFrom, setStatusFilterFrom] = useState("Undeposited");
  const [statusFilterTo, setStatusFilterTo] = useState("Deposited");
  const [modal, contextHolder] = Modal.useModal();
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const title = "payment";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();
  const [isRefetch, setIsRefetch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await PaymentFetch.get(0, 10000, statusFilterFrom);

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
  }, [isRefetch, statusFilterFrom]);

  const handleEdit = (record) => {
    router.push(`/super-admin/transaction/${title}/${record.id}/edit`);
  };

  const [idsSelected, setIdsSelected] = useState([]);

  const handleSelect = (id, checked) => {
    setIdsSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = datas.map((item) => item.id);
      setIdsSelected(allIds);
    } else {
      setIdsSelected([]);
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={idsSelected.length === datas.length && datas.length > 0}
          indeterminate={
            idsSelected.length > 0 && idsSelected.length < datas.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      dataIndex: "checkbox",
      key: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={idsSelected.includes(record.id)}
          onChange={(e) => handleSelect(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "trandate",
      key: "trandate",
      render: (text) => <p>{formatDateToShort(text)}</p>,
    },
    {
      title: "No",
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
      title: "Customer",
      dataIndex: "companyname",
      key: "companyname",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentoption",
      key: "paymentoption",
      render: (text) => <p className="capitalize">{text}</p>,
    },
    {
      title: "Total Payment",
      dataIndex: "payment",
      key: "payment",
      render: (text) => <p>{formatRupiahAccounting(text) || ""}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={
            ["payment received", "deposited"].includes(
              record.status.toLowerCase()
            )
              ? "green"
              : ["undeposited"].includes(record.status.toLowerCase())
              ? "orange"
              : [""].includes(record.status.toLowerCase())
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
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const openConfirmModal = () => {
    try {
      if (idsSelected.length === 0) {
        throw new Error("Please select at least one item first.");
      }
      modal.confirm({
        title: `Are you sure you want to update statuses in bulk?`,
        content: "This action cannot be undone.",
        okText: "Yes",
        cancelText: "Cancel",
        onOk: () => {
          updateHandleStatus();
        },
      });
    } catch (error) {
      notify("error", "Failed", error.message);
    }
  };

  const updateHandleStatus = async () => {
    setIsLoadingSubmit(true);
    try {
      const payload = {
        status: statusFilterTo,
        id: idsSelected,
      };

      const response = await PaymentFetch.bulkUpdateStatus(payload);

      const resData = updateResponseHandler(response, notify);
      console.log(resData)
    } catch (error) {
      notify("error", "Error", error.message || "Internal server error");
    } finally {
      setIsLoadingSubmit(false);
      setIsRefetch(!isRefetch);
      setIdsSelected([]);
    }
  };

  return (
    <>
      <Layout>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <p className="text-xl lg:text-2xl font-semibold text-blue-6">
              Payment Bulk Status
            </p>
            <Button
              icon={<UnorderedListOutlined />}
              type="link"
              onClick={() => {
                router.push(`/super-admin/transaction/${title}`);
              }}
            >
              {isLargeScreen ? "List" : ""}
            </Button>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col lg:flex-row justify-between items-start">
              <div className="w-full lg:w-1/2 flex gap-1"></div>
              <div className="w-full lg:w-1/2 flex justify-end items-center gap-2">
                <Button
                  type={"primary"}
                  icon={<CheckOutlined />}
                  onClick={() => {
                    openConfirmModal();
                  }}
                  disabled={datas.length == 0 || !datas}
                >
                  {isLargeScreen ? "Submit" : ""}
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col lg:flex-row gap-2 lg:gap-4 item-start">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Status From
              </label>
              <Select
                value={statusFilterFrom}
                onChange={(e) => {
                  setStatusFilterFrom(e);
                  setStatusFilterTo(
                    e == "Undeposited" ? "Deposited" : "Undeposited"
                  );
                }}
                options={[
                  { value: "Undeposited", label: "Undeposited" },
                ]}
                style={{ minWidth: "200px", whiteSpace: "nowrap" }}
                // dropdownStyle={{ minWidth: "100px", whiteSpace: "nowrap" }}
                dropdownAlign={{ points: ["tr", "br"] }}
              />
            </div>
            <div className="flex gap-4 items-end">
              <ArrowRightOutlined className="py-2" />
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="hidden lg:block text-sm font-semibold leading-none">
                  Status To
                </label>
                <Select
                  value={statusFilterTo}
                  onChange={(e) => {
                    setStatusFilterTo(e);
                    setStatusFilterFrom(
                      e == "Undeposited" ? "Deposited" : "Undeposited"
                    );
                  }}
                  options={[
                    { value: "Deposited", label: "Deposited" },
                  ]}
                  style={{ minWidth: "200px", whiteSpace: "nowrap" }}
                  // dropdownStyle={{ minWidth: "100px", whiteSpace: "nowrap" }}
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
        {isLoadingSubmit && <LoadingSpinProcessing />}
      </Layout>
      {contextHolder}
    </>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <Payment />
    </Suspense>
  );
}
