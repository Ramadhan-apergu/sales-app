"use client";
import LayoutAdmin from "@/components/salesIndoor/Layout";
import useNotification from "@/hooks/useNotification";
import DashboardCrmFetch from "@/modules/salesApi/crm/dashboardCrm";
import LeadsFetch from "@/modules/salesApi/crm/leads";
import UserManageFetch from "@/modules/salesApi/userManagement";
import { getResponseHandler } from "@/utils/responseHandlers";
import { Select, Tooltip as Tooltipantd, Typography, DatePicker } from "antd";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function Page() {
  const [ownerList, setOwnerList] = useState([{ label: "All", value: "" }]);
  const [stageList, setStageList] = useState([{ label: "All", value: "" }]);

  async function fetchDataOwner() {
    try {
      const response = await UserManageFetch.getSales();
      const resData = getResponseHandler(response);
      if (resData) {
        const ownerRes =
          resData?.list?.map((owner) => ({
            value: owner.id,
            label: owner.name,
          })) ?? [];
        setOwnerList((prev) => [...prev, ...ownerRes]);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data");
    }
  }

  async function fetchDataStage() {
    try {
      const response = await LeadsFetch.getStages();
      const resData = getResponseHandler(response);
      if (resData) {
        const stageRes =
          resData?.map((owner) => ({
            value: owner.id,
            label: owner.name,
          })) ?? [];
        setStageList((prev) => [...prev, ...stageRes]);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data");
    }
  }

  useEffect(() => {
    fetchDataOwner();
    fetchDataStage();
  }, []);

  return (
    <LayoutAdmin>
      <DashboardLead ownerList={ownerList} stageList={stageList} />
      <FunnelReport ownerList={ownerList} />
    </LayoutAdmin>
  );
}

function DashboardLead({ ownerList = [], stageList = [] }) {
  const [ownserSelect, setOwnerSelect] = useState("");
  const [stageSelect, setStageSelect] = useState("");
  const [dates, setDates] = useState([]);

  const [dataSource, setDataSource] = useState({
    list_activity: {
      total_call: 0,
      total_email: 0,
      total_phone: 0,
      total_visit: 0,
    },
    total_convert: 0,
    total_lead: 0,
    total_not_convert: 0,
    total_target: 0,
  });

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  async function fetchData(owner, startdate, enddate, stage) {
    try {
      const response = await DashboardCrmFetch.getLead(
        null,
        null,
        startdate,
        enddate,
        stage,
        owner
      );
      const resData = getResponseHandler(response);
      if (resData) {
        setDataSource(resData);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data");
    }
  }
  useEffect(() => {
    fetchData(ownserSelect, dates?.[0] || "", dates?.[1] || "", stageSelect);
  }, [ownserSelect, stageSelect, dates]);

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <p className="text-xl lg:text-2xl font-semibold text-blue-6">
            Dashboard Activity
          </p>
        </div>
        <div className="w-full flex justify-end gap-2">
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium">Stage</p>
            <Select
              size="small"
              value={stageSelect}
              options={stageList}
              style={{ minWidth: 120 }}
              dropdownAlign={{ points: ["tr", "br"] }}
              styles={{ popup: { root: { minWidth: 120 } } }}
              onChange={(value) => {
                setStageSelect(value);
              }}
            />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium">Owner</p>
            <Select
              size="small"
              value={ownserSelect}
              options={ownerList}
              style={{ minWidth: 200 }}
              dropdownAlign={{ points: ["tr", "br"] }}
              styles={{ popup: { root: { minWidth: 200 } } }}
              onChange={(value) => {
                setOwnerSelect(value);
              }}
            />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium">Dates</p>
            <RangePicker
              size="small"
              value={dates}
              onChange={(dates) => setDates(dates)}
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-6">
          <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="w-full h-30 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">Total Visit</p>
              </div>
              <div>
                <Tooltipantd
                  title={dataSource?.list_activity?.total_visit || 0}
                >
                  <p
                    className="text-3xl font-bold text-blue-8 truncate"
                    style={{ maxWidth: "100%" }}
                  >
                    {dataSource?.list_activity?.total_visit || 0}
                  </p>
                </Tooltipantd>
              </div>
            </div>

            <div className="w-full h-30 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">Total Call</p>
              </div>
              <div>
                <Tooltipantd title={dataSource?.list_activity?.total_call || 0}>
                  <p
                    className="text-3xl font-bold text-blue-8 truncate"
                    style={{ maxWidth: "100%" }}
                  >
                    {dataSource?.list_activity?.total_call || 0}
                  </p>
                </Tooltipantd>
              </div>
            </div>

            <div className="w-full h-30 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">Total Phone</p>
              </div>
              <div>
                <Tooltipantd
                  title={dataSource?.list_activity?.total_phone || 0}
                >
                  <p
                    className="text-3xl font-bold text-blue-8 truncate"
                    style={{ maxWidth: "100%" }}
                  >
                    {dataSource?.list_activity?.total_phone || 0}
                  </p>
                </Tooltipantd>
              </div>
            </div>

            <div className="w-full h-30 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">Total Email</p>
              </div>
              <div>
                <Tooltipantd
                  title={dataSource?.list_activity?.total_email || 0}
                >
                  <p
                    className="text-3xl font-bold text-blue-8 truncate"
                    style={{ maxWidth: "100%" }}
                  >
                    {dataSource?.list_activity?.total_email || 0}
                  </p>
                </Tooltipantd>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-6">
            <div className="w-1/2 h-80 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">
                  Target VS Actual Leads
                </p>
              </div>
              <ResponsiveContainer width="100%" height={"100%"}>
                <BarChart
                  data={[
                    {
                      total_lead: dataSource?.total_lead || 0,
                      total_target: dataSource?.total_target || 0,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${value / 1000}K` : value
                    }
                    name="Number of Leads"
                  />
                  <Tooltip />
                  <Bar
                    dataKey="total_target"
                    fill="#52c41a"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name="Total Target"
                  />
                  <Bar
                    dataKey="total_lead"
                    fill="#1677ff"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name="Total Lead"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 h-80 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-medium text-blue-6">
                  Lead to Customer Conversion
                </p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Total Convert",
                        value: dataSource?.total_convert || 0,
                        fill: "#1677ff",
                      },
                      {
                        name: "Total Not Convert",
                        value: dataSource?.total_not_convert || 0,
                        fill: "#52c41a",
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // efek donut
                    outerRadius={100}
                    paddingAngle={2}
                    label
                  />
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      // ambil warna dari entry.payload.fill
                      return (
                        <span
                          style={{
                            color: entry.payload.fill,
                          }}
                        >
                          {value}
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {notificationContextHolder}
    </>
  );
}

function FunnelReport({ ownerList = [] }) {
  const [ownserSelect, setOwnerSelect] = useState("");
  const [dates, setDates] = useState([]);

  const [dataSource, setDataSource] = useState([
    { id: 1, name: "New Leads", total: 0, percent: 0 },
    { id: 2, name: "Engaged", total: 0, percent: 0 },
    { id: 3, name: "Prospecting", total: 0, percent: 0 },
    { id: 4, name: "Negotiating", total: 0, percent: 0 },
    { id: 5, name: "Qualified", total: 0, percent: 0 },
  ]);

  const { notify, contextHolder: notificationContextHolder } =
    useNotification();

  async function fetchData(startdate, enddate, owner) {
    try {
      const response = await DashboardCrmFetch.getFunnel(
        "",
        "",
        startdate,
        enddate,
        owner
      );
      const resData = getResponseHandler(response);
      if (resData) {
        setDataSource(resData);
      }
    } catch (error) {
      console.log(error);
      notify("error", "Error", "Failed get data");
    }
  }

  useEffect(() => {
    fetchData(dates?.[0] || "", dates?.[1] || "", ownserSelect);
  }, [dates, ownserSelect]);

  return (
    <div
      className="mt-6 bg-gradient-to-tr from-blue-1 to-white border border-blue-2 rounded-xl shadow-sm flex flex-col justify-between p-5"
      style={{ width: "100%", height: 400 }}
    >
      <div className="">
        <p className="text-sm font-medium text-blue-6">Funnel Report</p>
      </div>
      <div className="w-full flex justify-end gap-2 mb-4">
        <div className="flex flex-col items-start">
          <p className="text-xs font-medium">Owner</p>
          <Select
            size="small"
            value={ownserSelect}
            options={ownerList}
            style={{ minWidth: 200 }}
            dropdownAlign={{ points: ["tr", "br"] }}
            styles={{ popup: { root: { minWidth: 200 } } }}
            onChange={(value) => {
              setOwnerSelect(value);
            }}
          />
        </div>
        <div className="flex flex-col items-start">
          <p className="text-xs font-medium">Dates</p>
          <RangePicker
            size="small"
            value={dates}
            onChange={(dates) => setDates(dates)}
          />
        </div>
      </div>
      <ResponsiveContainer>
        <BarChart
          layout="vertical" // horizontal bars → buat efek funnel
          data={dataSource}
          margin={{ right: 50 }}
          barCategoryGap="20%"
        >
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={150} // lebar label funnel
          />
          <Tooltip
            formatter={(value) => [`${value}`, "Total"]}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Bar dataKey="total" fill="#1677ff" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="percent"
              position="right"
              formatter={(val) => `${val}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {notificationContextHolder}
    </div>
  );
}
