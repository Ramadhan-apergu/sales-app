'use client';

import React, {useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import Layout from '@/components/superAdmin/Layout';
import {
    CloseOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import useNotification from '@/hooks/useNotification';
import { useParams, useRouter } from 'next/navigation';
import CustomerFetch from '@/modules/salesApi/customer';
import HeaderContent from '@/components/superAdmin/masterData/HeaderContent';
import BodyContent from '@/components/superAdmin/masterData/BodyContent';
import { itemAliases } from '@/utils/aliases';
import LoadingSpin from '@/components/superAdmin/LoadingSpin';
import InputForm from '@/components/superAdmin/masterData/InputForm';
import { deleteResponseHandler, getByIdResponseHandler, updateResponseHandler } from '@/utils/responseHandlers';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDateToShort } from '@/utils/formatDate';
import EmptyCustom from '@/components/superAdmin/masterData/EmptyCustom';
import ItemFetch from '@/modules/salesApi/item';

export default function Edit() {
  const { notify, contextHolder: contextNotify } = useNotification();
  const router = useRouter();

  const isLargeScreen = useBreakpoint('lg')
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [modal, contextHolder] = Modal.useModal()

  useEffect(() => {
    async function fetchData() {
        try {
            setIsLoading(true)
            const response = await ItemFetch.getById(slug)
            const resData = getByIdResponseHandler(response, notify)

            setData(resData)
            
            if (resData) {
                mapingGroup(resData)
            }

        } catch (error) {
            const message =
            error?.message ||
            "Login failed! Server error, please try again later.";
          notify('error', 'Error', message);
        } finally {
            setIsLoading(false)
        }
    }
    fetchData()
  }, [])

  const title = 'item'

  const fieldGroups = {
    general:  [
        "itemid",
        "displayname",
        "itemprocessfamily",
        "unitstype",
      ],
    pricing: [
      "price","discount"
    ],
  }
  
  const deleteModal = () => {
    modal.confirm({
      title: `Delete ${title} "${data.displayname}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: () => {
        handleDelete(data.id)
      },
    });
  };

    const handleDelete = async (id) => {
      try {
          const response = await CustomerFetch.delete(id)

          const resData = deleteResponseHandler(response, notify)
  
          if (resData) {
            router.push(`/super-admin/master-data/${title}`);
          }
  
      } catch (error) {
          notify('error', 'Error', error?.message || "Internal Server error");
      }
    }

  const [general, setGeneral] = useState(
    Object.fromEntries(fieldGroups.general.map(key => [key, '']))
  )
  const [pricing, setPricing] = useState(
    Object.fromEntries(fieldGroups.pricing.map(key => [key, '']))
  )

  function mapingGroup(data) {
    const pick = (keys) => 
      keys.reduce((obj, k) => {
        if (k == 'createddate') {
            obj[k] = data[k] != null ? formatDateToShort(data[k]) : ''
        } else {
            obj[k] = data[k] != null ? data[k] : ''
        }
        return obj
      }, {})

    setGeneral(pick(fieldGroups.general))
    setPricing(pick(fieldGroups.pricing))
  }

  const items = [
    {
      key: '1',
      label: 'Delete',
      danger: true
    },
  ];

  const unitstypeOptions = [
    { label: 'KG', value: 'kg' },
    { label: 'Bal', value: 'bal' },
]

const itemprocessfamilyOptions = [
    { label: 'Assoy Cetak', value: 'Assoy Cetak' },
    { label: 'K-Item', value: 'K-Item' },
    { label: 'Emboss', value: 'Emboss' },
    { label: 'C-Item', value: 'C-Item' },
    { label: 'B-Item', value: 'B-Item' },
    { label: 'HD 35B', value: 'HD 35B' },
    { label: 'PP', value: 'PP' },
    { label: 'HDP', value: 'HDP' },
    { label: 'Assoy PE', value: 'Assoy PE' },
    { label: 'PE Gulungan', value: 'PE Gulungan' },
]

const handleChangePayload = (type, payload) => {
    switch (type) {
    case 'general':
      setGeneral(payload);
      break;
    default:
      setPricing(payload);
      break;
  }
}

      const handleSubmit = async () => {
        setIsLoadingSubmit(true);
        try {
          const payloadToInsert = {
            ...general,
            ...pricing,
          };

            const {itemid, displayname, itemprocessfamily, price, unitstype} = payloadToInsert
            if (!itemid) {
                notify('error', 'Failed', `${itemAliases['itemid']} is required`);
                return;
              }
              
              if (!displayname) {
                notify('error', 'Failed', `${itemAliases['displayname']} is required`);
                return;
              }
            
              if (!itemprocessfamily) {
                notify('error', 'Failed', `${itemAliases['itemprocessfamily']} is required`);
                return;
              }
            
              if (!price) {
                notify('error', 'Failed', `price is required`);
                return;
              }
            
              if (!unitstype) {
                notify('error', 'Failed', `${itemAliases['unitstype']}`);
                return;
              }
    
          const response = await ItemFetch.update(data.id, payloadToInsert);
    
          const resData = updateResponseHandler(response, notify);

          if (resData) {
            router.push(`/super-admin/master-data/${title}/${resData}`)
          }

        } catch (error) {
          notify('error', 'Error', error.message || 'Internal server error');
        } finally {
          setIsLoadingSubmit(false);
        }
      };

  return (
        <Layout pageTitle={`Edit ${title}`}>
                <HeaderContent justify='between'>
                    <div></div>
                        {data && (
                            <div className="flex justify-center items-center gap-2">
                                <Button icon={<CloseOutlined />} variant={'outlined'} onClick={() => {router.back()}}>{isLargeScreen ? 'Cancel' : ''}</Button>{contextHolder}
                                <Button icon={<SaveOutlined />} type={'primary'} onClick={handleSubmit}>{isLargeScreen ? 'Save' : ''}</Button>
                            </div>
                        )}
                </HeaderContent>
                <BodyContent gap='12'>
                    {!isLoading ? (
                        <>
                            {data ? (
                                <div className='w-full h-full flex flex-col gap-8'>
                                    <div className='w-full flex flex-col px-4'>
                                        <p className='text-2xl font-semibold capitalize'>Edit {title}</p>
                                        <div className='w-full flex lg:text-lg'>
                                            <p className='w-full'>
                                                {data.displayname + ' / ' + data.itemid}
                                            </p>
                                        </div>
                                    </div>
                                    <InputForm
                                        type="general"
                                        payload={general}
                                        data={[
                                            { key: 'itemid', input: 'input', isAlias: true },
                                            { key: 'displayname', input: 'input', isAlias: true },
                                            { key: 'itemprocessfamily', input: 'select', options: itemprocessfamilyOptions, isAlias: true },
                                            { key: 'unitstype', input: 'select', options:unitstypeOptions, isAlias: true },
                                        ]}
                                        aliases={itemAliases}
                                        onChange={handleChangePayload}
                                    />
                                    <InputForm
                                        isReadOnly={true}
                                        type="pricing"
                                        payload={pricing}
                                        data={[
                                            { key: 'price', input: 'number', isAlias: false },
                                            { key: 'discount', input: 'number', isAlias: false },
                                        ]}
                                        aliases={itemAliases}
                                        onChange={handleChangePayload}
                                    />
                                </div>
                            ) : (
                                <EmptyCustom/>
                            )}
                        </>
                    ) : (
                        <LoadingSpin/>
                    )}
                </BodyContent>
        {contextNotify}
    </Layout>
  );
}
