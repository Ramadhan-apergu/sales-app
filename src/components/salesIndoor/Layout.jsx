'use client'

import React, { useEffect, useState, useRo } from 'react';
import { PiSidebar, PiSpeedometer, PiSwap  } from "react-icons/pi";
import { HiOutlineTruck, HiArrowUturnLeft, HiOutlineInboxStack } from "react-icons/hi2";
import { HiOutlinePrinter } from "react-icons/hi";
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
const { Header, Sider, Content } = Layout;

const App = ({children}) => {

  const basePath = '/sales-indoor'
  const [collapsed, setCollapsed] = useState(false);
  const [itemSelected, setItemSelected] = useState({})
  const [breadcrumbTitle, setBreadcrumbTitle] = useState([])
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '1',
      icon: <PiSpeedometer />,
      label: 'Dashboard',
      path: `${basePath}/dashboard`
    },
    {
      key: '2',
      icon: <PiSwap />,
      label: 'Sales Order',
      path: `${basePath}/sales-order`
    },
    {
      key: '3',
      icon: <HiOutlineTruck />,
      label: 'Delivery Order',
      path: `${basePath}/delivery-order`
    },
    {
        key: '4',
        icon: <HiOutlinePrinter />,
        label: 'Invoice',
        path: `${basePath}/invoice`
    },
    {
        key: '5',
        icon: <HiArrowUturnLeft />,
        label: 'Retur',
        path: `${basePath}/retur`
    },
    {
        key: '6',
        icon: <HiOutlineInboxStack />,
        label: 'Inventory',
        path: `${basePath}/inventory`
    }
  ]

  const router = useRouter();

  const flattenItems = (items) =>
    items.flatMap(item => item.children ? [item, ...flattenItems(item.children)] : [item]);

  const allItems = flattenItems(menuItems);

  const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    background:'white'
  };

  useEffect(() => {
    const flattenItems = (items) => {
      return items.flatMap(item => 
        item.children ? [item, ...flattenItems(item.children)] : [item]
      );
    };
  
    const allItems = flattenItems(menuItems);
    const matchedItem = allItems.find(item => pathname.startsWith(item.path));
  
    setItemSelected(matchedItem || {});

    const splitPathname = pathname.split('/');
    const breadcrumbTitle = splitPathname
      .slice(2)
      .map(title => ({
        title: title.replace(/-/g, ' ')
      }));
    
    setBreadcrumbTitle(breadcrumbTitle);
  }, [pathname]);

  const menuHandle = (e) => {
    const clickedItem = allItems.find(item => item.key === e.key);
    if (clickedItem?.path) {
      router.push(clickedItem.path);
    }
  };

  return (
    <Layout style={{minHeight: '100dvh'}}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
        <div className="h-16 mx-1 py-3 flex justify-center items-center sticky top-0 z-50 bg-white">
            <img src="/images/karya-group-logo.webp" className={`h-full ${collapsed && 'hidden'}`} alt="karya group" />
            <img src="/images/karya-group-icon.webp" className={`h-full ${!collapsed && 'hidden'}`} alt="karya group" />
        </div>
        <Menu
        onClick={menuHandle}
          theme="light"
          mode="inline"
          selectedKeys={[itemSelected.key]}
          style={{border:'none'}}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, height:'64px', display:'flex', justifyContent:'between', alignItems:'center',  }}>
          <button 
        onClick={() => setCollapsed(!collapsed)}
          className='h-full aspect-square hover:bg-gray-3 cursor-pointer duration-300 flex justify-center items-center text-lg'>
            <PiSidebar />
          </button>
        </Header>
        <Content style={{ margin: '0 16px', display:'flex', flexDirection:'column'}}>
            <Breadcrumb
            style={{ margin: '16px 0', textTransform: 'capitalize' }}
            items={breadcrumbTitle}
            />
            <div
            style={{
                margin: '24px 16px',
                padding: 24,
                flex: 1,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
            }}
            >
            {children}
            </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;