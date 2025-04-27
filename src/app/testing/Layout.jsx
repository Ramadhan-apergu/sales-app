'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LaptopOutlined, NotificationOutlined, UserOutlined, FileAddOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const { Header, Content, Footer, Sider } = Layout;

const prefix = '/testing';

const headerItems = [
  { key: `${prefix}/home`, label: 'Home' },
  { key: `${prefix}/customer`, label: 'Customer' },
  { key: `${prefix}/inventory`, label: 'Inventory' },
  { key: `${prefix}/delivery`, label: 'Delivery' },
  { key: `${prefix}/financial`, label: 'Financial' },
  { key: `${prefix}/report`, label: 'Report' },
];

const siderMenuPerPage = {
  '/home': [
    { key: 'home-dashboard', label: 'Dashboard', icon: <UserOutlined /> },
  ],
  '/customer': [
    { key: 'customer-enter-sales-order', label: 'Enter Sales Order', icon: <FileAddOutlined /> },
    { key: 'customer-sales-order-dashboard', label: 'Sales Order Dashboard', icon: <UnorderedListOutlined /> },
    { key: 'customer-enter-agreement', label: 'Enter Agreement', icon: <FileAddOutlined /> },
    { key: 'customer-apply-agreement', label: 'Apply Agreement', icon: <FileAddOutlined /> },
    { key: 'customer-customer', label: 'Customer', icon: <UserOutlined /> },
  ],
  '/inventory': [
    { key: 'inventory-inventory-dashboard', label: 'Inventory Dashboard', icon: <UnorderedListOutlined /> },
    { key: 'inventory-quantity-adjustment', label: 'Quantity Adjustment', icon: <FileAddOutlined /> },
    { key: 'inventory-item', label: 'Item', icon: <UnorderedListOutlined /> },
  ],
  '/delivery': [
    { key: 'delivery-fulfill-orders', label: 'Fulfill Orders', icon: <FileAddOutlined /> },
    { key: 'delivery-delivery-order-dashboard', label: 'Delivery Order Dashboard', icon: <UnorderedListOutlined /> },
  ],
  '/financial': [
    { key: 'financial-enter-customer-invoice', label: 'Enter Customer Invoice', icon: <FileAddOutlined /> },
    { key: 'financial-enter-credit-memo', label: 'Enter Credit Memo', icon: <FileAddOutlined /> },
    { key: 'financial-invoice-status', label: 'Invoice Status', icon: <UnorderedListOutlined /> },
  ],
  '/report': [
    { key: 'report-sales-order', label: 'Sales Order', icon: <UnorderedListOutlined /> },
    { key: 'report-penjualan', label: 'Penjualan', icon: <UnorderedListOutlined /> },
  ],
};

const LayoutTesting = ({ children }) => {
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const isLargeScreen = useBreakpoint('lg')

  const segments = pathname.split('/').filter(Boolean);
  const baseSegment = segments[0];
  const pageSegment = segments[1] || 'home';
  const currentBasePath = `/${baseSegment}/${pageSegment}`;

  const siderKey = `/${pageSegment}`;
  const siderItems = siderMenuPerPage[siderKey] || [];


  const breadcrumbItems = segments.map((segment, index) => {
    const url = '/' + segments.slice(0, index + 1).join('/');
    return {
      title: <Link href={url}>{segment.charAt(0).toUpperCase() + segment.slice(1)}</Link>,
    };
  });

  const handleNavSider = (key) => {
    
  }

  return (
    <Layout style={{ width: '100%', minHeight: '100dvh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isLargeScreen ? '' : '0 16px'}}>
        <div className="demo-logo h-full py-2">
          <img className="h-full filter brightness-0 invert" src="/images/karya-group-logo.webp" alt="Karya Group Logo" />
        </div>
        {isLargeScreen && (
            <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentBasePath]}
            style={{ flexShrink: 0 }}
            items={headerItems.map(item => ({
                key: item.key,
                label: <Link href={item.key}>{item.label}</Link>,
            }))}
            />
        )}
        <div></div>
      </Header>

      <div style={{ padding: isLargeScreen ? '16px 48px' : '0 16px', flex: '1' }}>
        <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />

        <Layout
          style={{ padding: isLargeScreen ? '24px 0' : '16px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
        >
            {isLargeScreen && (
                <Sider style={{ background: colorBgContainer }} width={200} >
                    <Menu
                    onClick={handleNavSider}
                    mode="inline"
                    defaultSelectedKeys={[siderItems[0]?.key]}
                    defaultOpenKeys={[siderItems[0]?.key]}
                    style={{ height: '100%' }}
                    items={siderItems}
                    />
                </Sider>
            )}

          <Content style={{ padding: isLargeScreen ? '0 24px' : '0 16px', minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </div>

      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default LayoutTesting;
