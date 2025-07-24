'use client';

import ProfilBar from "@/components/salesOutdoor/dashboard/ProfileBar";
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import Layout from "@/components/salesOutdoor/Layout";
import ProfilFetch from "@/modules/salesApi/getProfile";
import SalesOutdoorDashboardFetch from "@/modules/salesApi/salesOutdoorDashboard";
import { useEffect, useState } from 'react';
import { DatePicker, Button, Tooltip as Tooltipantd } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { formatRupiah, formatCurrencyViralIndo } from "@/utils/formatRupiah";
import { getResponseHandler } from "@/utils/responseHandlers";
import useNotification from "@/hooks/useNotification";

export default function Dashboard() {
    const [profile, setProfile] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [yearData, setYearData] = useState(null);
    const [grafikData, setGrafikData] = useState(null);

    const currentYear = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState(currentYear);

    const { notify, contextHolder: notificationContextHolder } = useNotification();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profileData = await ProfilFetch.get();
                setProfile(profileData);
                console.log('Profile data:', profileData);
            } catch (e) {
                console.error('Error fetching profile', e);
            }
        }
        fetchProfile();
    }, []);

    useEffect(() => {
        async function fetchDataDashboard() {
            try {
                setIsLoading(true);
                const response = await SalesOutdoorDashboardFetch.get(filterYear);
                const resData = getResponseHandler(response, notify);
                if (resData) {
                    setDashboardData(resData);
                    mappingData(resData);
                }
            } catch (error) {
                notify("error", "Error", error?.message || "Internal Server error");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDataDashboard();
    }, [filterYear]);

    function mappingData(data) {
        setYearData({
            kg_avg: data.total_so_avg_kg,
            amount_avg: data.total_so_avg_amount,
        });

        setGrafikData({
            kg: data.monthly_penjualan_kg,
            amount: data.monthly_penjualan_amount,
        });
    }

    return (
        <Layout>
            <FixedHeaderBar/>
            <div className="flex flex-col gap-4 bg-gray-3 pb-4">
                <ProfilBar data={{
                    name: profile.data?.name || '',
                    role: profile.data?.role_name || '',
                    url: profile.data?.url || '',
                }} />
                <div className="w-full flex flex-col gap-4 px-4">
                    <section className="w-full flex flex-col bg-white rounded-xl p-6 shadow-md gap-6">
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

                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="w-full h-40 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                                <div>
                                    <p className="text-sm font-medium text-blue-6">Sales Order Average</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-8">
                                        {yearData &&
                                        yearData.kg_avg !== undefined &&
                                        yearData.kg_avg !== null
                                            ? yearData.kg_avg
                                            : "-"}
                                    </p>
                                    <p className="text-sm text-blue-5">Kg</p>
                                </div>
                            </div>

                            <div className="w-full h-40 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
                                <div>
                                    <p className="text-sm font-medium text-green-6">Penjualan Average</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-8">
                                        {yearData &&
                                        yearData.amount_avg !== undefined &&
                                        yearData.amount_avg !== null
                                            ? formatRupiah(yearData.amount_avg)
                                            : "-"}
                                    </p>
                                    <p className="text-sm text-green-5">Amount</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="w-full flex flex-col bg-white rounded-xl p-6 shadow-md gap-6">
                        <div className="w-full flex justify-between items-center">
                            <div>
                                <p className="lg:text-xl font-semibold text-gray-800">
                                    Grafik Penjualan Bulanan
                                </p>
                                <p className="text-sm text-gray-500">{filterYear}</p>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-1 gap-6">
                            <div className="w-full h-80 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-2">
                                <div>
                                    <p className="text-sm font-medium text-blue-6">Sales Order (Kg)</p>
                                </div>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={
                                            grafikData &&
                                            grafikData.kg !== undefined &&
                                            grafikData.kg !== null
                                                ? grafikData.kg
                                                : []
                                        }
                                        margin={{ top: 20, right: 10, left: 20, bottom: 5 }}
                                        barCategoryGap="20%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="trandate" tickFormatter={(value) => dayjs(value, "MM-YYYY").format("MMM")} tick={{ fontSize: 12 }}/>
                                        <YAxis tickFormatter={(value) => value} width={16} tick={{ fontSize: 12 }}/>
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

                            <div className="w-full h-80 bg-gradient-to-tr from-green-1 to-white border border-green-2 rounded-xl shadow-sm flex flex-col justify-between p-2">
                                <div>
                                    <p className="text-sm font-medium text-green-6">Penjualan (Amount)</p>
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
                                        margin={{ top: 20, right: 10, left: 20, bottom: 5 }}
                                        barCategoryGap="20%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="trandate" tickFormatter={(value) => dayjs(value, "MM-YYYY").format("MMM")} tick={{ fontSize: 12 }}/>
                                        <YAxis tickFormatter={(value) => formatCurrencyViralIndo(value)} width={16} tick={{ fontSize: 12 }}/>
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
            </div>
            {notificationContextHolder}
        </Layout>
    );
}
