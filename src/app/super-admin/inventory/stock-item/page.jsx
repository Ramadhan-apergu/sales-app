"use client";
import Layout from "@/components/superAdmin/Layout";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Pagination, Table, Input } from "antd";
import { Suspense, useEffect, useState } from "react";

import useNotification from "@/hooks/useNotification";
import LoadingSpinProcessing from "@/components/superAdmin/LoadingSpinProcessing";
import LoadingSpin from "@/components/superAdmin/LoadingSpin";
import { getResponseHandler } from "@/utils/responseHandlers";
import StockAdjustmentFetch from "@/modules/salesApi/stockAdjustment";
import { DatePicker } from "antd";
import { DownloadOutlined, ExportOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { formatRupiah } from "@/utils/formatRupiah";

const { RangePicker } = DatePicker;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function StockItem() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isLargeScreen = useBreakpoint("lg");

  const page = parseInt(searchParams.get("page") || `${DEFAULT_PAGE}`, 10);
  const limit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10);

  const [datas, setDatas] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [searchItemTemp, setSearchItemTemp] = useState("");
  const [searchItemProcess, setSearchItemProcess] = useState("");
  const [searchItemProcessTemp, setSearchItemProcessTemp] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const title = "stock-item";
  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);

        const response = await StockAdjustmentFetch.getStockStatus(
          page,
          limit,
          searchItem,
          null,
          searchItemProcess,
          dateRange[0],
          dateRange[1],
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
  }, [page, limit, pathname, searchItem, searchItemProcess, dateRange]);

  const columns = [
    {
      title: "Item Name/Number",
      dataIndex: "itemid",
      key: "itemid",
      fixed: isLargeScreen ? "left" : "",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Display Name/Code",
      dataIndex: "displayname",
      key: "displayname",
      onHeaderCell: () => ({
        style: { minWidth: 180 },
      }),
      onCell: () => ({
        style: { minWidth: 180 },
      }),
    },
    {
      title: "Item Process Family",
      dataIndex: "itemprocessfamily",
      key: "itemprocessfamily",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
      render: (text) => (
        <p>
          {typeof text == "number"
            ? text.toLocaleString("en")
            : parseFloat(text).toLocaleString("en")}
        </p>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unitstype",
      key: "unitstype",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
    },
    {
      title: "Saldo Awal",
      dataIndex: "saldo_awal",
      key: "saldo_awal",
      align:'right',
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
      render: (text) => (
        <p>
          {formatRupiah(text)}
        </p>
      ),
    },
    {
      title: "In",
      dataIndex: "qty_in",
      key: "qty_in",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
      render: (text) => (
        <p>
          {typeof text == "number"
            ? text.toLocaleString("en")
            : parseFloat(text).toLocaleString("en")}
        </p>
      ),
    },
    {
      title: "Out",
      dataIndex: "qty_out",
      key: "qty_out",
      onHeaderCell: () => ({
        style: { minWidth: 200 },
      }),
      onCell: () => ({
        style: { minWidth: 200 },
      }),
      render: (text) => (
        <p>
          {typeof text == "number"
            ? text.toLocaleString("en")
            : parseFloat(text).toLocaleString("en")}
        </p>
      ),
    },
  ];
  return (
    <Layout>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Stock Item List
          </p>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 justify-between items-end lg:items-start p-2 bg-gray-2 border border-gray-4 rounded-lg">
          <div className="flex gap-2 flex-col md:flex-row">
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Item Name/Number
              </label>
              <Input
                placeholder="Search Item"
                styles={{
                  popup: {
                    root: {
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                value={searchItemTemp}
                onChange={(e) => {
                  if (e.target.value.length == 0) {
                    setSearchItem("");
                  }
                  setSearchItemTemp(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchItem(searchItemTemp);
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Item Process F
              </label>
              <Input
                placeholder="Search Item"
                styles={{
                  popup: {
                    root: {
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
                value={searchItemProcessTemp}
                onChange={(e) => {
                  if (e.target.value.length == 0) {
                    setSearchItemProcess("");
                  }
                  setSearchItemProcessTemp(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchItemProcess(searchItemProcessTemp);
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-1">
              <label className="hidden md:block text-sm font-semibold leading-none">
                Date
              </label>
              <RangePicker
                format="YYYY-MM-DD"
                onChange={(dates, dateStrings) => {
                  setDateRange(dateStrings);
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButton
              disabled={!datas.length}
              notify={notify}
              itemid={searchItem}
              displayname={""}
              itemprocessfamily={searchItemProcess}
              dateRange={dateRange}
            />
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
                    `/super-admin/inventory/${title}?page=${newPage}&limit=${newLimit}`,
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

export default function StockItemPage() {
  return (
    <Suspense fallback={<LoadingSpinProcessing />}>
      <StockItem />
    </Suspense>
  );
}

function ExportButton({
  disabled = false,
  notify = null,
  itemid = "",
  displayname = "",
  itemprocessfamily = "",
  dateRange = ["", ""],
}) {
  const [isloading, setIsloading] = useState(false);
  const [linkdownload, setLinkdownload] = useState(null);

  useEffect(() => {
    setLinkdownload(null);
  }, [itemid, displayname, itemprocessfamily, dateRange]);

  async function handleExport() {
    try {
      setIsloading(true);

      const payload = {
        itemid: itemid || "",
        displayname: displayname || "",
        itemprocessfamily: itemprocessfamily || "",
        startdate: dateRange?.[0] || "",
        enddate: dateRange?.[1] || "",
      };

      const response = await StockAdjustmentFetch.getStockStatusExport(
        payload.itemid,
        payload.displayname,
        payload.itemprocessfamily,
        payload.startdate,
        payload.enddate,
      );

      const resData = getResponseHandler(response, notify);

      if (resData) {
        setLinkdownload(resData.url);
      }
    } catch (error) {
      console.error(error);
      if (notify) {
        notify("error", "Failed", error?.message || "Failed Export");
      }
    } finally {
      setIsloading(false);
    }
  }

  return (
    <Button
      onClick={() => {
        if (linkdownload) {
          window.open(linkdownload);
        } else {
          handleExport();
        }
      }}
      type={linkdownload ? "primary" : ""}
      disabled={disabled}
      icon={linkdownload ? <DownloadOutlined /> : <ExportOutlined />}
      loading={isloading}
    >
      {linkdownload ? "Download" : "Export All"}
    </Button>
  );
}
