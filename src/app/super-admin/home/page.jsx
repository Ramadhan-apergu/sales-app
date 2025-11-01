"use client";
import Layout from "@/components/superAdmin/Layout";
import SearchStatus from "@/components/superAdmin/SearchStatus";
import useNotification from "@/hooks/useNotification";
import DashboardFetch from "@/modules/salesApi/dashboard";
import { formatDateStartDay } from "@/utils/formatDate";
import { formatRupiah, formatRupiahAccounting } from "@/utils/formatRupiah";
import { getResponseHandler } from "@/utils/responseHandlers";
import { Button, DatePicker, Tooltip as Tooltipantd } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReloadOutlined } from "@ant-design/icons";

export default function Page() {
  const { RangePicker } = DatePicker;

  const [isLoadning, setIsLoading] = useState(false);
  const [datas, setDatas] = useState(null);
  const [yearData, setYearData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [grafikData, setGrafikData] = useState(null);

  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);

  const today = new Date();
  const startCurrentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endCurrentDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [filterMonth, setFilterMonth] = useState([
    startCurrentDate,
    endCurrentDate,
  ]);

  const [filterYearGrafik, setFilterYearGrafik] = useState(currentYear);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  useEffect(() => {
    async function fetchDataDashboard() {
      try {
        setIsLoading(true);
        const response = await DashboardFetch.get(
          filterYear,
          dayjs(filterMonth[0]).format("YYYY-MM-DD"),
          dayjs(filterMonth[1]).format("YYYY-MM-DD"),
          filterYearGrafik
        );
        const resData = getResponseHandler(response, notify);
        if (resData) {
          setDatas(resData);
          mappingData(resData);
        }
      } catch (error) {
        notify("error", "Error", error?.message || "Internal Server error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataDashboard();
  }, [filterYear, filterMonth, filterYearGrafik]);

  function mappingData(data) {
    setYearData({
      kg: data.total_so_tahunan_kg,
      amount: data.total_so_tahunan_amount,
      kg_avg: data.total_so_avg_kg,
      amount_avg: data.total_so_avg_amount,
    });

    setMonthData({
      kg: data.total_so_bulanan_kg,
      amount: data.total_so_bulanan_amount,
    });

    setGrafikData({
      kg: data.monthly_penjualan_kg.map((data) => ({
        ...data,
        trandate: getMonth(data.trandate),
      })),
      amount: data.monthly_penjualan_amount.map((data) => ({
        ...data,
        trandate: getMonth(data.trandate),
      })),
    });
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function getMonth(trandate) {
    return monthNames[parseInt(trandate.split("-")[0]) - 1];
  }

  function formatIndonesia(num) {
    if (num === null || num === undefined || num === "") return "";

    return num
      .toString()
      .replace(".", ",") // ubah titik jadi koma untuk desimal
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex flex-col lg:flex-row justify-between items-end pt-6 px-6">
            <p className="w-full lg:w-auto text-2xl font-bold text-blue-6">
              Dashboard
            </p>
            {/* <div className="w-full lg:w-1/2">
              <SearchStatus />
            </div> */}
          </div>
          <section className="w-full flex flex-col bg-white rounded-xl p-6 shadow-md gap-6">
            {/* Header */}
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="lg:text-xl font-semibold text-gray-800">
                  Total 1 Tahun
                </p>
                <p className="text-sm text-gray-500">{filterYear}</p>
              </div>
              <div className="flex gap-2">
                <DatePicker
                  picker="year"
                  className="w-32"
                  value={dayjs().year(filterYear)}
                  onChange={(yearVal, yearValStr) => {
                    setFilterYear(yearValStr);
                  }}
                  allowClear={false}
                />
                <Tooltipantd mouseEnterDelay={0.5} title={"Reset"}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setFilterYear(currentYear);
                    }}
                  />
                </Tooltipantd>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="w-full h-40 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-blue-6">Sales Order</p>
                </div>
                <div>
                  <Tooltipantd
                    title={
                      yearData &&
                      yearData.kg !== undefined &&
                      yearData.kg !== null
                        ? formatIndonesia(yearData.kg)
                        : "-"
                    }
                  >
                    <p
                      className="text-3xl font-bold text-blue-8 truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {yearData &&
                      yearData.kg !== undefined &&
                      yearData.kg !== null
                        ? formatIndonesia(yearData.kg)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-blue-5">Quantity</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="w-full h-40 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-blue-6">
                    Sales Order Average
                  </p>
                </div>
                <div>
                  <Tooltipantd
                    title={
                      yearData &&
                      yearData.kg_avg !== undefined &&
                      yearData.kg_avg !== null
                        ? formatIndonesia(yearData.kg_avg)
                        : "-"
                    }
                  >
                    <p
                      className="text-3xl font-bold text-blue-8 truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {yearData &&
                      yearData.kg_avg !== undefined &&
                      yearData.kg_avg !== null
                        ? formatIndonesia(yearData.kg_avg)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-blue-5">Quantity</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="w-full h-40 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-green-6">Penjualan</p>
                </div>
                <div>
                  <Tooltipantd
                    title={
                      yearData &&
                      yearData.amount !== undefined &&
                      yearData.amount !== null
                        ? formatRupiah(yearData.amount)
                        : "-"
                    }
                  >
                    <p
                      className="text-3xl font-bold text-green-8 truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {yearData &&
                      yearData.amount !== undefined &&
                      yearData.amount !== null
                        ? formatRupiah(yearData.amount)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-green-5">Amount</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="w-full h-40 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-green-6">
                    Penjualan Average
                  </p>
                </div>
                <div>
                  <Tooltipantd
                    title={
                      yearData &&
                      yearData.amount_avg !== undefined &&
                      yearData.amount_avg !== null
                        ? formatRupiah(yearData.amount_avg)
                        : "-"
                    }
                  >
                    <p
                      className="text-3xl font-bold text-green-8 truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {yearData &&
                      yearData.amount_avg !== undefined &&
                      yearData.amount_avg !== null
                        ? formatRupiah(yearData.amount_avg)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-green-5">Amount</p>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full flex flex-col bg-white rounded-xl p-6 shadow-md gap-6">
            {/* Header */}
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="lg:text-xl font-semibold text-gray-800">
                  Total 1 Bulan
                </p>
                <p className="text-sm text-gray-500">
                  {formatDateStartDay(filterMonth[0]) +
                    " - " +
                    formatDateStartDay(filterMonth[1])}
                </p>
              </div>
              <div className="flex gap-2">
                <RangePicker
                  format={"DD-MM-YYYY"}
                  className="max-w-full"
                  value={[dayjs(filterMonth[0]), dayjs(filterMonth[1])]}
                  onChange={(dates) => {
                    setFilterMonth(dates);
                  }}
                  allowClear={false}
                />
                <Tooltipantd mouseEnterDelay={0.5} title={"Reset"}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setFilterMonth([startCurrentDate, endCurrentDate]);
                    }}
                  />
                </Tooltipantd>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="w-full h-40 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-blue-6">Sales Order</p>
                </div>
                <div>
                  <Tooltipantd title={formatIndonesia(monthData?.kg)}>
                    <p className="text-3xl font-bold text-blue-8 truncate max-w-full">
                      {monthData?.kg !== undefined && monthData?.kg !== null
                        ? formatIndonesia(monthData.kg)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-blue-5">Quantity</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="w-full h-40 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-green-6">Penjualan</p>
                </div>
                <div>
                  <Tooltipantd title={formatRupiah(monthData?.amount)}>
                    <p className="text-3xl font-bold text-green-8 truncate max-w-full">
                      {monthData?.amount !== undefined &&
                      monthData?.amount !== null
                        ? formatRupiah(monthData.amount)
                        : "-"}
                    </p>
                  </Tooltipantd>
                  <p className="text-sm text-green-5">Amount</p>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full flex flex-col bg-white rounded-xl p-6 shadow-md gap-6">
            {/* Header */}
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="lg:text-xl font-semibold text-gray-800">
                  Grafik 1 Tahun
                </p>
                <p className="text-sm text-gray-500">{filterYearGrafik}</p>
              </div>
              <div className="flex gap-2">
                <DatePicker
                  picker="year"
                  className="w-32"
                  value={dayjs().year(filterYearGrafik)}
                  onChange={(yearVal, yearValStr) => {
                    setFilterYearGrafik(yearValStr);
                  }}
                  allowClear={false}
                />
                <Tooltipantd mouseEnterDelay={0.5} title={"Reset"}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setFilterYearGrafik(currentYear);
                    }}
                  />
                </Tooltipantd>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="w-full h-80 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-blue-6">Sales Order</p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      grafikData &&
                      grafikData.kg !== undefined &&
                      grafikData.kg !== null
                        ? grafikData.kg
                        : []
                    }
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap="20%" // jarak antar bar
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trandate" />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1_000_000) return `${value / 1_000_000}M`;
                        if (value >= 1_000) return `${value / 1_000}K`;
                        return value;
                      }}
                      scale={"sqrt"}
                      type="number"
                      domain={["dataMin", "dataMax"]}
                    />
                    <Tooltip itemStyle={{ textTransform: "capitalize" }} />
                    <Bar
                      dataKey="qty"
                      fill="#1677ff"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Card 2 */}
              <div className="w-full h-80 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-green-6">Penjualan</p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      grafikData &&
                      grafikData.amount !== undefined &&
                      grafikData.amount !== null
                        ? grafikData.amount
                        : []
                    }
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap="20%" // jarak antar bar
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trandate" />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1_000_000) return `${value / 1_000_000}M`;
                        if (value >= 1_000) return `${value / 1_000}K`;
                        return value;
                      }}
                      scale={"sqrt"}
                      type="number"
                      domain={["dataMin", "dataMax"]}
                    />
                    <Tooltip itemStyle={{ textTransform: "capitalize" }} />
                    <Bar
                      dataKey="amount"
                      fill="#52c41a"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
        {/* <div className="w-full min-h-96 md:col-span-4 lg:col-span-3 col-span-12 flex flex-col gap-4">
          <div className="w-full h-96 bg-white rounded-lg"></div>
          <div className="w-full h-96 bg-white rounded-lg"></div>
        </div> */}
      </div>
      {notificationContextHolder}
    </Layout>
  );
}
