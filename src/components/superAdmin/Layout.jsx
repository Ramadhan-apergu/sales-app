'use client'

import React, { useEffect, useState, useRo, Suspense } from 'react';
import { PiSidebar, PiSpeedometer, PiSwap  } from "react-icons/pi";
import { HiOutlineTruck, HiOutlineFolder, HiOutlineUser, HiArrowUturnLeft, HiOutlineInboxStack, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { HiOutlinePrinter } from "react-icons/hi";
import { Breadcrumb, Button, Drawer, Layout, Menu, theme } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
    MenuOutlined
  } from '@ant-design/icons'
import Image from 'next/image';
const { Header, Sider, Content } = Layout;

const App = ({children, pageTitle}) => {

  const basePath = '/super-admin'
  const [collapsed, setCollapsed] = useState(false);
  const [itemSelected, setItemSelected] = useState({})
  const [breadcrumbTitle, setBreadcrumbTitle] = useState([])
  const [openDrawer, setOpenDrawer] = useState(false);

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
    },
    {
        key: 'sub1',
        icon: <HiOutlineFolder />,
        label: 'Master Data',
        children: [
            {
                key: '7',
                label: 'Customer',
                path: `${basePath}/master-data/customer`
            },
            {
                key: '8',
                label: 'Item',
                path: `${basePath}/master-data/item`
            },
            {
                key: '9',
                label: 'Agreement',
                path: `${basePath}/master-data/agreement`
            },
        ]
    },
    {
        key: 'sub2',
        icon: <HiOutlineWrenchScrewdriver />,
        label: 'Administration',
        children: [
            {
                key: '10',
                label: 'Users Access',
                path: `${basePath}/administration/users-access`
            },
            {
                key: '11',
                label: 'Access All Report',
                path: `${basePath}/system-management/access-all-report`
            },
        ]
    },
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
    background:'white',
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
        title: /^[a-f0-9\-]{36}$/.test(title) ? title : title.replace(/-/g, ' ')
      }));
    
    setBreadcrumbTitle(breadcrumbTitle);
  }, [pathname]);

  const menuHandle = (e) => {
    const clickedItem = allItems.find(item => item.key === e.key);
    if (clickedItem?.path) {
      router.push(clickedItem.path);
    }
  };

  const showDrawer = () => {
    setOpenDrawer(true);
  };
  const onClose = () => {
    setOpenDrawer(false);
  };

  return (
    <Layout style={{ minHeight: '100dvh' }}>
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <Header style={{ height: '8dvh', width: '100%', background: '#fff', padding: 0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <img src={'/images/karya-group-logo.webp'} alt='karya group logo' className='h-full py-2 px-4'/>
                <div className='lg:hidden'>
                    <Button icon={<MenuOutlined />} variant='outlined' color='blue' style={{marginRight:'16px'}} onClick={showDrawer}/>
                </div>
            </Header>

            <Layout>
                <div className='hidden lg:block w-[20vw] xl:w-[15vw] h-[92dvh] bg-white'>
                    <Sider
                    width="100%"
                    style={{ height: '100%', background: '#fff', overflow:'auto', scrollbarWidth: 'thin', scrollbarGutter: 'stable'}}
                    >
                        <Menu
                            onClick={menuHandle}
                            theme="light"
                            mode="inline"
                            selectedKeys={[itemSelected.key]}
                            style={{border:'none'}}
                            items={menuItems}
                        />
                    </Sider>
                </div>

                <div className='w-[100vw] lg:w-[80vw] xl:w-[85vw] h-[92dvh] bg-gray-3'>
                    <Content            style={{
                        height: '100%',
                        width: '100%',
                        background: '#f5f5f5 ',
                        padding: '16px',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection:'column',
                        gap: '8px'
                    }}
                    >
                        <div className='w-full hidden h-[5%] lg:flex justify-start item-center'>
                            <Breadcrumb
                                style={{textTransform: 'capitalize'}}
                                items={breadcrumbTitle}
                            />
                        </div>

                        <div className='w-full lg:hidden h-[5%] flex justify-start item-center'>
                            <p className='text-xl capitalize'>{pageTitle || '-'}</p>
                        </div>

                        <div className='w-full h-[95%] overflow-auto px-2 rounded-xl' style={{scrollbarWidth:'thin'}}>
                            {children}
                        </div>
                    </Content>
                </div>
            </Layout>
            <Drawer title="Menu" onClose={onClose} open={openDrawer}>
                <Menu
                    onClick={menuHandle}
                    theme="light"
                    mode="inline"
                    selectedKeys={[itemSelected.key]}
                    style={{border:'none'}}
                    items={menuItems}
                />
            </Drawer>
        </Suspense>
    </Layout>
  );
};
export default App;