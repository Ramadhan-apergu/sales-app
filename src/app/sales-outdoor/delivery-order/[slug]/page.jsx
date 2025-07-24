'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import FullfillmentFetch from '@/modules/salesApi/itemFullfillment';
import ItemFetch from '@/modules/salesApi/item';
import { Button, Table, Spin, Empty, Divider, Tooltip } from 'antd';
import { formatDateToShort } from '@/utils/formatDate';
import { deliveryOrderAliases } from "@/utils/aliases";

function TableCustom({ data, keys, aliases, onDelete }) {
  const columns = [
    ...keys.map((key) => ({
      title: aliases?.[key] || key,
      dataIndex: key,
      key: key,
      align: "right", // semua kolom di-align ke kanan
    })),
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      bordered
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}

export default function DeliveryOrderDetail() {
  const params = useParams();
  const [delivery, setDelivery] = useState(null);
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const keyTableItem = [
    "itemid",
    "displayname",
    "location",
    "memo",
    "quantity1",
    "quantity2",
    "quantityremaining",
  ];

  const itemColumns = keyTableItem.map((key) => {
    const isDisplayName = key === 'displayname';
    
    const column = {
      title: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()),
      dataIndex: key,
      key,
      align: [
        'quantity1',
        'quantity2',
        'quantityremaining'
      ].includes(key) ? 'right' : 'left',
      onHeaderCell: () => ({
        className: 'text-sm text-center', 
        style: { textAlign: 'center' } 
      }),
      onCell: () => ({
        className: 'text-xs'
      }),
      render: (text) => {
        if (isDisplayName) {
          return (
            <Tooltip title={text}>
              <div className="truncate" style={{ 
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {text}
              </div>
            </Tooltip>
          );
        }
        return text;
      }
    };

    if (isDisplayName) {
      column.ellipsis = {
        showTitle: false
      };
    }

    return column;
  });

  useEffect(() => {
    const fetchDelivery = async () => {
      if (!params.slug) return;

      setLoading(true);
      try {
        const response = await FullfillmentFetch.getById(params.slug);
        if (response.status_code === 200) {
          const resData = response.data;
          setDelivery(resData);

          const dataFulfillmentWithItem = await Promise.all(
            resData.fulfillment_items.map(async (doItem) => {
              const item = await ItemFetch.getById(doItem.item);
              return {
                ...doItem,
                ...doItem,
                itemprocessfamily: item?.data?.itemprocessfamily || "",
                displayname: item.data?.displayname || "",
                quantity1: doItem.quantity,
                unit1: doItem.units,
                unit2: doItem.units2,
                itemid: item?.data?.itemid || ""
              };
            })
          );

          delete dataFulfillmentWithItem.quantity;
          delete dataFulfillmentWithItem.units;
          delete dataFulfillmentWithItem.units2;

          console.log("dataFulfillmentWithItem", dataFulfillmentWithItem);
          
          setDeliveryItems(dataFulfillmentWithItem);

        } else {
          setError(response.message || 'Gagal memuat detail delivery order');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [params.slug]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        <FixedHeaderBar bgColor="bg-blue-6" />

        <div className="w-full relative p-4">
          <div className="max-w-3xl mx-auto">
            {loading && !delivery && (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <div className="text-red-600">{error}</div>
              </div>
            )}

            {delivery && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <Button onClick={handleBack} className="mb-2">← Kembali</Button>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Delivery Order Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{delivery.tranid} / {delivery.customer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        delivery.shipstatus === 'Shipped' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.shipstatus}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Divider
                        style={{
                        marginBottom: "8px",
                        textTransform: "capitalize",
                        borderColor: "#1677ff",
                        }}
                        orientation="left"
                    >
                        Primary
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">No. Do:</span>
                        <span className="text-right">{delivery.tranid}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">No. SO:</span>
                        <span className="text-right">{delivery.createdfrom}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Customer Name:</span>
                        <span className="text-right">{delivery.customer}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-right">{formatDateToShort(delivery.trandate)}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-right">{delivery.shipstatus}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Divider
                        style={{
                        marginBottom: "8px",
                        textTransform: "capitalize",
                        borderColor: "#1677ff",
                        }}
                        orientation="left"
                    >
                        Shipping
                    </Divider>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Shipping Address:</span>
                        <span className="text-right">{delivery.shippingaddress}</span>
                      </div>
                      <div className="flex justify-between border rounded-lg p-2 border-gray-300">
                        <span className="text-gray-500">Notes:</span>
                        <span className="text-right">{delivery.notes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Divider
                    style={{
                      marginBottom: "8px",
                      textTransform: "capitalize",
                      borderColor: "#1677ff",
                    }}
                    orientation="left"
                  >
                    Item
                  </Divider>
                  <div className="overflow-x-auto">
                    <TableCustom
                      data={deliveryItems}
                      keys={keyTableItem}
                      aliases={deliveryOrderAliases.item}
                    />
                  </div>
                </div>
              </div>
            )}

            {!loading && !delivery && (
              <div className="p-4">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <Empty description="Data delivery order tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
