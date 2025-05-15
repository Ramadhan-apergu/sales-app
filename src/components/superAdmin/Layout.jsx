'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, Button, Drawer, Layout, Menu, theme } from 'antd';
import { useBreakpoint } from '@/hooks/useBreakpoint';
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
  AppstoreOutlined
} from '@ant-design/icons';
import { PiSpeedometer, PiSwap } from 'react-icons/pi';
import { HiOutlineFolder, HiOutlinePrinter } from 'react-icons/hi';
import {HiOutlineTruck} from'react-icons/hi2'

const { Header, Content, Footer, Sider } = Layout;

const prefix = '/super-admin';

const headerItems = [
  { key: `${prefix}/home`, label: 'Home' },
  { key: `${prefix}/sales-order`, label: 'Sales Order' },
  { key: `${prefix}/delivery-order`, label: 'Delivery' },
  { key: `${prefix}/invoice`, label: 'Invoice' },
  { key: `${prefix}/payment`, label: 'Payment' },
  { key: `${prefix}/credit-memo`, label: 'Credit Memo' },
  { key: `${prefix}/master-data`, label: 'Master Data' },
  { key: `${prefix}/customer-deals`, label: 'Customer Deals' },
  { key: `${prefix}/adjustment-stock`, label: 'Adjustment Stock' },
  { key: `${prefix}/report`, label: 'Report' },
];

const siderMenuPerPage = {
  '/sales-order': [
    { key: '/sales-order/dashboard', label: 'SO Dashboard', icon: <FileDoneOutlined /> },
    { key: '/sales-order', label: 'SO List', icon: <UnorderedListOutlined /> },
    { key: '/sales-order/enter', label: 'SO Enter', icon: <FileAddOutlined /> },
  ],
  '/delivery-order': [
    { key: '/delivery-order/dashboard', label: 'DO Dashboard', icon: <DeliveredProcedureOutlined /> },
    { key: '/delivery-order', label: 'DO List', icon: <UnorderedListOutlined /> },
    { key: '/delivery-order/enter', label: 'DO Enter', icon: <FileAddOutlined /> },
  ],
  '/invoice': [
    { key: '/invoice/dashboard', label: 'Invoice Dashboard', icon: <FileProtectOutlined /> },
    { key: '/invoice', label: 'Invoice List', icon: <UnorderedListOutlined /> },
    { key: '/invoice/enter', label: 'Invoice Enter', icon: <FileAddOutlined /> },
  ],
  '/master-data': [
    { key: '/master-data/customer', label: 'Customer', icon: <SolutionOutlined /> },
    { key: '/master-data/item', label: 'Item', icon: <ShoppingCartOutlined /> },
    { key: '/master-data/agreement', label: 'Agreement', icon: <ProfileOutlined /> },
  ],
  '/report': [
    { key: '/report/dashboard', label: 'Report Dashboard', icon: <BarChartOutlined /> },
    { key: '/report/sales-order', label: 'SO Report', icon: <BarChartOutlined /> },
    { key: '/report/penjualan', label: 'Penjualan', icon: <BarChartOutlined /> },
  ],
};
  
  const menuItems = [
    {
      key: '/home',
      icon: <DashboardOutlined />,
      label: 'Home',
      path: `${prefix}/home`
    },
    {
      key: 'sub1',
      icon: <SwapOutlined />,
      label: 'Sales Order',
      children: [
        {
          key: '/sales-order',
          label: 'SO List',
          path: `${prefix}/sales-order`
        },
        {
          key: '/sales-order/enter',
          label: 'SO Enter',
          path: `${prefix}/sales-order/enter`
        },
      ]
    },
    {
      key: 'sub2',
      icon: <SwapOutlined />,
      label: 'Delivery Order',
      children: [
        {
          key: '/delivery-order',
          label: 'DO List',
          path: `${prefix}/delivery-order`
        },
        {
          key: '/delivery-order/enter', // FIXED typo dari "elivery-order"
          label: 'DO Enter',
          path: `${prefix}/delivery-order/enter`
        },
      ]
    },
    {
      key: 'sub3',
      icon: <FileTextOutlined />,
      label: 'Invoice',
      children: [
        {
          key: '/invoice',
          label: 'Invoice List',
          path: `${prefix}/invoice`
        },
        {
          key: '/invoice/enter',
          label: 'Invoice Enter',
          path: `${prefix}/invoice/enter`
        },
      ]
    },
    {
      key: 'sub4',
      icon: <AppstoreOutlined />,
      label: 'Master Data',
      children: [
        {
          key: '/master-data/customer',
          label: 'Customer',
          path: `${prefix}/master-data/customer`
        },
        {
          key: '/master-data/item',
          label: 'Item',
          path: `${prefix}/master-data/item`
        },
        {
          key: '/master-data/agreement',
          label: 'Agreement',
          path: `${prefix}/master-data/agreement`
        },
      ]
    },
    {
      key: 'sub5',
      icon: <BarChartOutlined />,
      label: 'Reports',
      children: [
        {
          key: '/report/sales-order',
          label: 'SO Report',
          path: `${prefix}/report/sales-order`
        },
        {
          key: '/report/penjualan',
          label: 'Penjualan',
          path: `${prefix}/report/penjualan`
        },
      ]
    },
  ];
  

const LayoutTesting = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const isLargeScreen = useBreakpoint('lg');
const [openDrawer, setOpenDrawer] = useState(false);

  const segments = pathname.split('/').filter(Boolean);
  const baseSegment = segments[0];
  const pageSegment = segments[1] || 'home';
  const currentBasePath = `/${baseSegment}/${pageSegment}`;

  const siderKey = `/${pageSegment}`;
  const siderItems = siderMenuPerPage[siderKey] || [];

  const removePrefixPath = `/${pathname.split('/').filter(Boolean).slice(1).join('/')}`;
  const selectedSider = () => {
    const exactMatch = siderItems.find((item) => item.key === removePrefixPath);
  
    if (exactMatch) {
      return exactMatch.key;
    }
  
    const partialMatch = siderItems.find((item) => removePrefixPath.includes(item.key));
  
    return partialMatch ? partialMatch.key : '';
  };

  const breadcrumbItems = segments.map((segment, index) => {
    const url = '/' + segments.slice(0, index + 1).join('/');
    return {
      title: <Link href={url}>{segment.charAt(0).toUpperCase() + segment.slice(1)}</Link>,
    };
  });

  const handleNavSider = ({ key }) => {
    const routeNext = [prefix, key].join('/');

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
    const clickedItem = allItems.find(item => item.key === e.key);
    if (clickedItem?.path) {
      router.push(clickedItem.path);
    }
  };

  const flattenItems = (items) =>
    items.flatMap(item => item.children ? [item, ...flattenItems(item.children)] : [item]);

  const allItems = flattenItems(menuItems);

  return (
    <Layout style={{ width: '100%', minHeight: '100dvh' }}>
      <Header style={{padding: 0}} className="flex items-center justify-between">
        <div className="h-full ml-4 lg:ml-12 py-2">
          <img className="h-full filter brightness-0 invert" src="/images/karya-group-logo.webp" alt="Karya Group Logo" />
        </div>
        <div className="hidden w-1/2 lg:block">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentBasePath]}
            items={headerItems.map(item => ({
              key: item.key,
              label: <Link href={item.key}>{item.label}</Link>,
            }))}
          />
        </div>
        <div className='mr-4 lg:mr-12'>
            <div className='lg:hidden'>
                <Button icon={<MenuOutlined />} variant='outlined' color='blue' style={{marginRight:'16px'}} onClick={showDrawer}/>
            </div>
        </div>
      </Header>

      <div className="flex-1 px-4 lg:px-12 pb-4 pt-4 lg:pt-0 lg:pb-12">
        <div className='hidden lg:block'>
            <Breadcrumb style={{margin: '16px 0'}} items={breadcrumbItems} />
        </div>
        
        <Layout className="py-4 lg:py-6" style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {pageSegment !== 'home' && (
            <Sider
              width={200}
              style={{
                background: colorBgContainer,
                display: isLargeScreen ? 'block' : 'none',
              }}
            >
              <Menu
                onClick={handleNavSider}
                mode="inline"
                selectedKeys={[selectedSider()]}
                defaultOpenKeys={[selectedSider().split('/').slice(0, 2).join('/')]}
                style={{ height: '100%' }}
                items={siderItems}
              />
            </Sider>
          )}

          <Content className="px-4 lg:px-6">
            {children}
          </Content>
        </Layout>
      </div>
      <Drawer title="Menu" onClose={onClose} open={openDrawer}>
        <Menu
            onClick={menuHandle}
            theme="light"
            mode="inline"
            selectedKeys={[]}
            style={{border:'none'}}
            items={menuItems}
        />
      </Drawer>
    </Layout>
  );
};

export default LayoutTesting;
