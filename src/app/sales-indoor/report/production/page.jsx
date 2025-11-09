"use client";
import Layout from "@/components/salesIndoor/Layout";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Modal, Pagination, Table, DatePicker } from "antd";
import { Suspense, useEffect, useState } from "react";

import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import ReportSo from "@/modules/salesApi/report/salesAndSo";
import { productReportAliases } from "@/utils/aliases";
import ExportProductionReport from "@/components/superAdmin/ExportProductionReport.jsx";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function SalesOrder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { RangePicker } = DatePicker;

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [dateRange, setDateRange] = useState(["", ""]);
  const [tableKeys, setTableKeys] = useState([]);
  const title = "production";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await ReportSo.getProduct(
          page,
          limit,
          dateRange[0],
          dateRange[1]
        );

        let resData = getResponseHandler(response, notify);

        if (resData && resData.list) {
          const resDataList = resData.list.map((item, i) => ({
            no: i + 1,
            ...item,
          }));
          setDatas(resDataList);
          setTotalItems(resData.total_items);
          setTableKeys(
            Array.isArray(resDataList) && resData.total_items > 0
              ? Object.keys(resDataList[0]).filter(
                  (item) => !["item", "so_number"].includes(item.toLowerCase())
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
  }, [page, limit, pathname, dateRange]);

  const aliases = productReportAliases;

  const columns = tableKeys
    .filter((key) => !["id"].includes(key))
    .map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
    }));

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Production Report
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-end p-2 bg-gray-2 border border-gray-4 rounded-lg">
          {/* <div className="flex gap-2">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden lg:block text-sm font-semibold leading-none">
                Date
              </label>
              <div className="flex justify-center items-start gap-2">
                <RangePicker
                  showTime={false}
                  format="YYYY-MM-DD"
                  onChange={(value, dateString) => {
                    setDateRange(dateString);
                  }}
                />
              </div>
            </div>
          </div> */}
          <ExportProductionReport />
        </div>
        {!isLoading ? (
          <>
            <div>
              <Table
                rowKey={(record) => record.no}
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
