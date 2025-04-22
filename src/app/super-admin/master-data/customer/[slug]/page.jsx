'use client'

import Layout from "@/components/superAdmin/Layout"
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Button, Input, Tabs, Modal } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ContactsOutlined, DeleteOutlined, DollarOutlined, EditOutlined, EnvironmentOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import CustomerFetch from "@/modules/salesApi/customer";
import { toast } from "react-toastify";
import useContainerHeight from "@/hooks/useContainerHeight";

function LabeledValue({data =[], height, isReadOnly = true}) {
    return (
        <div className="w-full flex flex-col gap-4 px-2 overflow-auto" style={{height: height}}>
            {data.length > 0 && data.map((item, i) => (
                        <div key={i} className="flex w-full justify-start items-start flex-col capitalize gap-0.5">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <Input readOnly={isReadOnly} value={item.value} variant="filled"/>
                    </div>
            ))}
        </div>
    )
}

export default function Detail() {
    const { slug } = useParams()
    const router = useRouter();
    const isLargeScreen = useBreakpoint("lg");
    const [data, setData] = useState({})
    const [groupData, setGroupData] = useState({})
    const [isLoading, setIsloading] = useState(false)
    const { containerRef, containerHeight } = useContainerHeight();
    const title = 'customer'
    const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsloading(true);
        const response = await CustomerFetch.getById(slug);
        const data = response?.data?.data || {};

        if (!data) {
          toast.error("Fetching data failed! Invalid response from server.");
          return;
        }
        setData(data);
        setGroupData(groupDataMaping(data))
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Login failed! Server error, please try again later.";
        toast.error(message);
      } finally {
        setIsloading(false);
      }
    };

    fetchData();
  }, []);

  const tabItems = [
    {
        key: '1',
        label: isLargeScreen ? 'General' : '',
        children: <LabeledValue height={containerHeight - 35} data={groupData['general'] || []}/>,
        icon: <UserOutlined />
    },
    {
        key: '2',
        label: isLargeScreen ? 'Contact' : '',
        children: <LabeledValue height={containerHeight - 35} data={groupData['contact'] || []}/>,
        icon: <ContactsOutlined />
    },
    {
        key: '3',
        label: isLargeScreen ? 'Address' : '',
        children: <LabeledValue height={containerHeight - 35} data={groupData['address'] || []}/>,
        icon: <EnvironmentOutlined />
    },
    {
        key: '4',
        label: isLargeScreen ? 'Financial' : '',
        children: <LabeledValue height={containerHeight - 35} data={groupData['finance'] || []}/>,
        icon: <DollarOutlined />
    }
  ]

  const groupFields = {
    general: ['entityid', 'companyname', 'status', 'category'],
    contact: ['addressee', 'phone', 'altphone', 'email'],
    finance: ['creditlimit', 'currency', 'resalenumber', 'terms', 'overduebalance'],
    address: ['addr1', 'city', 'state', 'zip', 'defaultaddress'],
  };
  
  function groupDataMaping(customer) {
    const grouped = {};
  
    Object.entries(groupFields).forEach(([group, fields]) => {
      grouped[group] = fields.map(field => ({
        label: field,
        value: customer[field] ?? '',
      }));
    });
  
    return grouped;
  }

  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.companyname}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        console.log(`Deleting ${title}: ${data.companyname} (ID: ${data.id})`);
        // call delete function here
      },
    });
  };

  const handleEdit = () => {
    router.push(`/super-admin/master-data/${title}/${data.id}/edit`);
  };

    return (
        <Layout pageTitle={'Customer Detail'}>
            <div className="w-full h-1/12 flex justify-between items-start">
                <div className="flex justify-center items-center gap-2">
                    <Button icon={<UnorderedListOutlined />} variant={'outlined'} onClick={() => {router.push(`/super-admin/master-data/${title}`);}}>{isLargeScreen ? 'List' : ''}</Button>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Button icon={<EditOutlined />} type={'primary'} onClick={handleEdit}>{isLargeScreen ? 'Edit' : ''}</Button>
                    <Button icon={<DeleteOutlined />} danger variant={'outlined'} onClick={deleteModal}>{isLargeScreen ? 'Delete' : ''}</Button>{contextHolder}
                </div>
            </div>
            <div ref={containerRef} className="w-full bg-white py-4 pr-4 shadow pb-1 h-11/12 flex justify-between rounded-xl overflow-hidden divide-gray-4">
                <Tabs
                    defaultActiveKey="1"
                    items={tabItems}
                    style={{width: '100%'}}
                    tabPosition={'left'}
                />
            </div>
        </Layout>
    )
}