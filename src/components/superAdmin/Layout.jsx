"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumb, Button, Drawer, Layout, Menu, theme } from "antd";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  UserOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  DeliveredProcedureOutlined,
  FileProtectOutlined,
  BarChartOutlined,
  MenuOutlined,
  DashboardOutlined,
  SwapOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  LogoutOutlined,
  TeamOutlined,
  UnlockOutlined,
  StockOutlined,
} from "@ant-design/icons";
import { PiSpeedometer, PiSwap } from "react-icons/pi";
import { HiOutlineFolder, HiOutlinePrinter } from "react-icons/hi";
import { HiOutlineTruck } from "react-icons/hi2";
import Cookies from "js-cookie";

const { Header, Content, Footer, Sider } = Layout;

const prefix = "/super-admin";

const headerItems = [
  { key: `${prefix}/home`, label: "Home" },
  { key: `${prefix}/status`, label: "Status" },
  { key: `${prefix}/transaction`, label: "Transaction" },
  { key: `${prefix}/master-data`, label: "Master Data" },
  { key: `${prefix}/inventory`, label: "Inventory" },
  { key: `${prefix}/report`, label: "Report" },
  { key: `${prefix}/access-control`, label: "Access Control" },
];

const siderMenuPerPage = {
  "/transaction": [
    {
      key: "/transaction/sales-order",
      label: "Sales Order",
      icon: <FileDoneOutlined />,
    },
    {
      key: "/transaction/delivery-order",
      label: "Delivery Order",
      icon: <DeliveredProcedureOutlined />,
    },
    {
      key: "/transaction/invoice",
      label: "Invoice",
      icon: <FileProtectOutlined />,
    },
    {
      key: "/transaction/payment",
      label: "Payment",
      icon: <SolutionOutlined />,
    },
    {
      key: "/transaction/credit-memo",
      label: "Credit Memo",
      icon: <CreditCardOutlined />,
    },
  ],
  "/master-data": [
    {
      key: "/master-data/customer",
      label: "Customer",
      icon: <UserOutlined />,
    },
    { key: "/master-data/item", label: "Item", icon: <ShoppingCartOutlined /> },
    {
      key: "/master-data/agreement",
      label: "Agreement",
      icon: <ProfileOutlined />,
    },
    {
      key: "/master-data/apply-agreement",
      label: "Apply Agreement",
      icon: <ProfileOutlined />,
    },
  ],
  "/inventory": [
    {
      key: "/inventory/adjustment",
      label: "Stock Adjustment",
      icon: <DatabaseOutlined />,
    },
    {
      key: "/inventory/stock-item",
      label: "Stock Item",
      icon: <StockOutlined />,
    },
  ],
  "/status": [
    {
      key: "/status/delivery",
      label: "Delivery Status",
      icon: <DeliveredProcedureOutlined />,
    },
    {
      key: "/status/invoice",
      label: "Invoice Status",
      icon: <FileProtectOutlined />,
    },
  ],
  "/report": [
    {
      key: "/report/sales-order",
      label: "SO Report",
      icon: <BarChartOutlined />,
    },
    {
      key: "/report/sales",
      label: "Sales",
      icon: <BarChartOutlined />,
    },
    {
      key: "/report/production",
      label: "Production",
      icon: <BarChartOutlined />,
    },
  ],
  "/access-control": [
    {
      key: "/access-control/user",
      label: "User",
      icon: <TeamOutlined />,
    },
  ],
};
const menuItems = [
  {
    key: `${prefix}/home`,
    icon: <DashboardOutlined />,
    label: "Home",
    path: `${prefix}/home`,
  },
  {
    key: "sub1",
    icon: <SwapOutlined />,
    label: "Transaction",
    children: [
      {
        key: `${prefix}/transaction/sales-order`,
        label: "Sales Order",
        path: `${prefix}/transaction/sales-order`,
      },
      {
        key: `${prefix}/transaction/delivery-order`,
        label: "Delivery Order",
        path: `${prefix}/transaction/delivery-order`,
      },
      {
        key: `${prefix}/transaction/invoice`,
        label: "Invoice",
        path: `${prefix}/transaction/invoice`,
      },
      {
        key: `${prefix}/transaction/payment`,
        label: "Payment",
        path: `${prefix}/transaction/payment`,
      },
      {
        key: `${prefix}/transaction/credit-memo`,
        label: "Credit Memo",
        path: `${prefix}/transaction/credit-memo`,
      },
    ],
  },
  {
    key: "sub4",
    icon: <AppstoreOutlined />,
    label: "Master Data",
    children: [
      {
        key: `${prefix}/master-data/customer`,
        label: "Customer",
        path: `${prefix}/master-data/customer`,
      },
      {
        key: `${prefix}/master-data/item`,
        label: "Item",
        path: `${prefix}/master-data/item`,
      },
      {
        key: `${prefix}/master-data/agreement`,
        label: "Agreement",
        path: `${prefix}/master-data/agreement`,
      },
    ],
  },
  {
    key: "sub5",
    icon: <BarChartOutlined />,
    label: "Reports",
    children: [
      {
        key: `${prefix}/report/sales-order`,
        label: "SO Report",
        path: `${prefix}/report/sales-order`,
      },
      {
        key: `${prefix}/report/sales`,
        label: "Sales",
        path: `${prefix}/report/sales`,
      },
    ],
  },
  {
    key: `logout`,
    icon: <LogoutOutlined />,
    label: "Logout",
    onClick: () => {
      Cookies.remove("x_atkn", { path: "/" });
      Cookies.remove("u_ctx", { path: "/" });
      Cookies.remove("role", { path: "/" });

      window.location.href = "/auth/login";
    },
  },
];

const LayoutTesting = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const isLargeScreen = useBreakpoint("lg");
  const [openDrawer, setOpenDrawer] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const baseSegment = segments[0];
  const pageSegment = segments[1] || "home";
  const currentBasePath = `/${baseSegment}/${pageSegment}`;

  const siderKey = `/${pageSegment}`;
  const siderItems = siderMenuPerPage[siderKey] || [];

  const removePrefixPath = `/${pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .join("/")}`;
  const selectedSider = () => {
    const exactMatch = siderItems.find((item) => item.key === removePrefixPath);

    if (exactMatch) {
      return exactMatch.key;
    }

    const partialMatch = siderItems.find((item) =>
      removePrefixPath.includes(item.key)
    );

    return partialMatch ? partialMatch.key : "";
  };

  const breadcrumbItems = segments.map((segment, index) => {
    const url = "/" + segments.slice(0, index + 1).join("/");
    return {
      title: (
        <Link href={url}>
          {segment.charAt(0).toUpperCase() + segment.slice(1)}
        </Link>
      ),
    };
  });

  const handleNavSider = ({ key }) => {
    const routeNext = [prefix, key].join("/");

    if (pathname !== routeNext) {
      router.push(routeNext);
    }
  };

  const showDrawer = () => {
    setOpenDrawer(true);
  };
  const onClose = () => {
    setOpenDrawer(false);
  };

  const menuHandle = (e) => {
    const clickedItem = allItems.find((item) => item.key === e.key);
    if (clickedItem?.path) {
      router.push(clickedItem.path);
    }
  };

  const flattenItems = (items) =>
    items.flatMap((item) =>
      item.children ? [item, ...flattenItems(item.children)] : [item]
    );

  const allItems = flattenItems(menuItems);

  function logout() {
    Cookies.remove("x_atkn", { path: "/" });
    Cookies.remove("u_ctx", { path: "/" });
    Cookies.remove("role", { path: "/" });

    window.location.href = "/auth/login";
  }

  return (
    <Layout style={{ width: "100%", minHeight: "100dvh" }}>
      <Header
        style={{ padding: 0, gap: "2rem" }}
        className="flex items-center justify-between"
      >
        <div className="h-full ml-4 lg:ml-12 py-2">
          <img
            className="h-full filter brightness-0 invert"
            src="/images/karya-group-logo.webp"
            alt="Karya Group Logo"
          />
        </div>

        <div className="hidden w-[700px] lg:block">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentBasePath]}
            items={headerItems.map((item) => ({
              key: item.key,
              label: <Link href={item.key}>{item.label}</Link>,
            }))}
          />
        </div>

        <div id="ham-menu" className="lg:hidden mr-4 lg:mr-12">
          <div className="">
            <Button
              icon={<MenuOutlined />}
              variant="outlined"
              color="blue"
              style={{ marginRight: "16px" }}
              onClick={showDrawer}
            />
          </div>
        </div>
        <div className="hidden lg:block mr-4 lg:mr-12">
          <Button
            color="danger"
            variant="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            size="large"
          ></Button>
        </div>
      </Header>

      <div className="flex-1 px-4 lg:px-12 pb-4 pt-4 lg:pt-0 lg:pb-12">
        <div className="hidden lg:block">
          <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
        </div>
        {pageSegment !== "home" ? (
          <Layout
            className="py-4 lg:py-6"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Sider
              width={200}
              className={`layout-sider ${
                isLargeScreen ? "block-sider" : "hidden-sider"
              }`}
              style={{background: colorBgContainer}}
            >
              <Menu
                onClick={handleNavSider}
                mode="inline"
                selectedKeys={[selectedSider()]}
                defaultOpenKeys={[
                  selectedSider().split("/").slice(0, 2).join("/"),
                ]}
                style={{ height: "100%" }}
                items={siderItems}
              />
            </Sider>

            <Content className="px-4 lg:px-6 bg-none">{children}</Content>
          </Layout>
        ) : (
          <Layout>
            <Content>{children}</Content>
          </Layout>
        )}
      </div>

      <Drawer title="Menu" onClose={onClose} open={openDrawer}>
        <Menu
          onClick={menuHandle}
          theme="light"
          mode="inline"
          selectedKeys={[]}
          style={{ border: "none" }}
          items={menuItems}
        />
      </Drawer>
      <style jsx global>{`
        .block-sider {
          display: block;
        }
        .hidden-sider {
          display: none;
        }

        @media print {
          #ham-menu {
            display: none !important;
          }

          .layout-sider {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default LayoutTesting;
