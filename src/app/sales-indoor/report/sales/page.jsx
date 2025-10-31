"use client";
import Layout from "@/components/salesIndoor/Layout";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Modal, Pagination, Table, Select, DatePicker, Input } from "antd";
import { Suspense, useEffect, useState } from "react";

import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import { formatDateWithSepMinus } from "@/utils/formatDate";
import CustomerFetch from "@/modules/salesApi/customer";
import ReportSo from "@/modules/salesApi/report/salesAndSo";
import { salesReportAliases } from "@/utils/aliases";
import { formatRupiah } from "@/utils/formatRupiah";
import ExportSalesReport from "@/components/superAdmin/ExportSalesReport";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

const { Search } = Input;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);
  const offset = page - 1;

  const [datas, setDatas] = useState([]);
  const [dataCustomer, setDataCustomer] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [filters, setFilters] = useState({
    searchName: "",
    dateRange: ["", ""],
    salesrep: "",
    displayname: "",
    itemprocessfamily: "",
  });
  const [tableKeys, setTableKeys] = useState([]);
  const title = "sales-order";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  function handleFilter(type, value) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await ReportSo.getSales(
          offset,
          limit,
          filters.searchName,
          filters.dateRange[0],
          filters.dateRange[1],
          filters.itemprocessfamily,
          filters.salesrep,
          filters.displayname
        );

        const resData = getResponseHandler(response, notify);

        if (resData) {
          setDatas(resData.list);
          setTotalItems(resData.total_items);
          setTableKeys(
            Array.isArray(resData.list) && resData.list.length > 0
              ? Object.keys(resData.list[0]).filter((item) => item != "id")
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
        setIsloading(true);

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
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (record) => {
    router.push(`/sales-indoor/transaction/${title}/${record.id}/edit`);
  };

  const aliases = salesReportAliases;

  const columns = [
    ...tableKeys.map((key) => {
      if (key == "trandate") {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => <p>{formatDateWithSepMinus(text)}</p>,
        };
      } else if (["harga", "jumlah", "dpp", "ppn"].includes(key)) {
        return {
          title: aliases?.[key] || key,
          dataIndex: key,
          key: key,
          render: (text) => <p>{formatRupiah(text)}</p>,
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

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Sales Report
          </p>
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
                Item Name
              </label>
              <Search
                placeholder="Search item name"
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
                    `/sales-indoor/transaction/${title}?page=${newPage}&limit=${newLimit}`
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
