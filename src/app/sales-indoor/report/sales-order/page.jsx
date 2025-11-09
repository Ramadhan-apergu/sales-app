"use client";
import Layout from "@/components/salesIndoor/Layout";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
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

import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import { formatDateToShort, formatDateWithSepMinus } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import ReportSo from "@/modules/salesApi/report/salesAndSo";
import { soReportAliases } from "@/utils/aliases";
import { formatRupiah } from "@/utils/formatRupiah";
import { ExportOutlined } from "@ant-design/icons";
import { exportJSONToExcel } from "@/utils/export";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const { Search } = Input;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`);

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [tableKeys, setTableKeys] = useState([]);
  const title = "sales-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  const [filters, setFilters] = useState({
    searchName: "",
    statusFilter: [],
    dateRange: ["", ""],
    salesrep: "",
    displayname: "",
    itemprocessfamily: "",
  });

  function handleFilter(type, value) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  const fieldOrder = [
    "no",
    "so_numb",
    "trandate",
    "customerid",
    "nama_customer",
    "sales",
    "nama_barang",
    "qty_so",
    "qty_kirim",
    "qty_sisa",
    "tgl_kirim",
    "harga_satuan",
    "diskon_satuan",
    "jumlah",
    "dpp",
    "ppn",
    "created_by",
    "status_so",
    "kode_barang",
    "satuan",
    "itemprocessfamily",
    "kode_customer",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);
        const response = await ReportSo.getSo(
          page,
          limit || "",
          filters.searchName,
          filters.dateRange[0],
          filters.dateRange[1],
          filters.statusFilter.length == 0
            ? ""
            : filters.statusFilter.join(","),
          filters.itemprocessfamily,
          filters.salesrep,
          filters.displayname
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          let data =
            resData?.list?.map((item, i) => ({ no: i + 1, ...item })) || [];

          data = data.map((item) => {
            const ordered = {};

            // masukkan sesuai urutan di fieldOrder
            fieldOrder.forEach((key) => {
              if (key in item) {
                ordered[key] = item[key];
              } else {
                ordered[key] = null;
              }
            });

            // tambahkan field lain yang tidak ada di fieldOrder, taruh di bawah
            Object.keys(item).forEach((key) => {
              if (!fieldOrder.includes(key)) {
                ordered[key] = item[key];
              }
            });

            return ordered;
          });

          setDatas(data);
          setTotalItems(resData.total_items);
          setTableKeys(
            Array.isArray(data) && data.length > 0
              ? Object.keys(data[0]).filter(
                  (item) => item.toLowerCase() != "id"
                )
              : []
          );
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, [page, limit, pathname, filters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CustomerFetch.get(0, 10000, null);

        const resData = getResponseHandler(response, notify);

        if (resData) {
          const mapingCustomerOption = resData.list.map((data) => {
            return {
              ...data,
              value: data.customerid,
              label: data.customerid,
            };
          });
          setDataCustomer(mapingCustomerOption);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      }
    };

    fetchData();
  }, []);

  const handleEdit = (record) => {
    router.push(`/sales-indoor/report/${title}/${record.id}/edit`);
  };

  const aliases = soReportAliases;

  const columns = [
    ...tableKeys.map((key) => {
      if (key == "trandate") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => <p>{formatDateWithSepMinus(text)}</p>,
        };
      } else if (
        ["harga_satuan", "diskon_satuan", "jumlah", "dpp", "ppn"].includes(key)
      ) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => <p>{formatRupiah(text)}</p>,
        };
      } else if (["tgl_kirim"].includes(key)) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => (
            <>
              {text ? (
                <div className="flex flex-col">
                  {text
                    .split(",")
                    .map((tgl) => formatDateWithSepMinus(tgl))
                    .join(",")}
                </div>
              ) : (
                <>{text}</>
              )}
            </>
          ),
        };
      } else {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
        };
      }
    }),
  ];

  async function handleExport() {
    exportJSONToExcel(datas, soReportAliases, "so-report.xlsx");
  }

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Sales Order Report
          </p>
          <Button
            onClick={handleExport}
            disabled={!datas || datas.length == 0}
            icon={<ExportOutlined />}
          >
            Export
          </Button>
        </div>
        <div className="w-full p-3 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="w-full flex flex-wrap gap-2">
            {/* Customer ID */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Customer ID
              </label>
              <Select
                showSearch
                placeholder="Select customer"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={dataCustomer}
                onChange={(value) => handleFilter("searchName", value)}
                allowClear
                style={{ width: "100%" }}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Date
              </label>
              <RangePicker
                format="YYYY-MM-DD"
                onChange={(_, dateString) =>
                  handleFilter("dateRange", dateString)
                }
                style={{ width: "100%" }}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>
              <Select
                mode="multiple"
                maxTagCount={1}
                allowClear
                placeholder="Select status"
                value={filters.statusFilter}
                onChange={(val) => handleFilter("statusFilter", val)}
                style={{ width: "100%" }}
                options={[
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
              />
            </div>

            {/* Sales Rep */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Sales Rep
              </label>
              <Search
                placeholder="Search sales rep"
                onSearch={(value) => handleFilter("salesrep", value)}
                onChange={(e) => {
                  if (!e.target.value && filters.salesrep)
                    handleFilter("salesrep", "");
                }}
                allowClear
                style={{ width: "100%" }}
              />
            </div>

            {/* Item Family */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Item Family
              </label>
              <Search
                placeholder="Search item family"
                onSearch={(value) => handleFilter("itemprocessfamily", value)}
                onChange={(e) => {
                  if (!e.target.value && filters.itemprocessfamily)
                    handleFilter("itemprocessfamily", "");
                }}
                allowClear
                style={{ width: "100%" }}
              />
            </div>

            {/* Item Name */}
            <div className="flex flex-col w-full sm:w-[200px] md:w-[220px]">
              <label className="text-sm font-semibold text-gray-700">
                Display Name
              </label>
              <Search
                placeholder="Search Display Name"
                onSearch={(value) => handleFilter("displayname", value)}
                onChange={(e) => {
                  if (!e.target.value && filters.displayname)
                    handleFilter("displayname", "");
                }}
                allowClear
                style={{ width: "100%" }}
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
                    `/sales-indoor/report/${title}?page=${newPage}&limit=${newLimit}`
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
