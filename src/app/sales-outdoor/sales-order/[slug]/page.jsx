// app/sales-outdoor/sales-order/[slug]/page.js
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/salesOutdoor/Layout';
import FixedHeaderBar from '@/components/salesOutdoor/FixedHeaderBar';
import SalesOrderFetch from '@/modules/salesApi/salesOrder';
import { Button, Table, Spin, Empty } from 'antd';

export default function SalesOrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch detail order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.slug) return;
      
      setLoading(true);
      try {
        const response = await SalesOrderFetch.getById(params.slug);
        
        if (response.status_code === 200) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Gagal memuat detail order');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.slug]);

  // Fungsi untuk tombol kembali
  const handleBack = () => {
    window.history.back();
  };

  // Kolom tabel item
  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'displayname',
      key: 'displayname',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: 'Satuan',
      dataIndex: 'units',
      key: 'units',
      align: 'center',
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      align: 'right',
      render: (text) => `${Number(text).toLocaleString()}`
    },
    {
      title: 'Total',
      dataIndex: 'totalamount',
      key: 'totalamount',
      align: 'right',
      render: (text) => `${Number(text).toLocaleString()}`
    }
  ];

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
        <FixedHeaderBar bgColor="bg-blue-6" />

        <div className="w-full relative p-4 mt-10">
          <div className="max-w-3xl mx-auto">
            {loading && !order && (
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

            {order && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <Button onClick={handleBack} className="mb-2">← Kembali</Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-700 mb-2 text-center text-2xl">Sales Order Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{order.id} / {order.customer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Fulfilled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Customer</h3>
                    <span>{order.customer}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Primary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Entity:</span>
                        <span>{order.entity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trandate:</span>
                        <span>{new Date(order.trandate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sales Rep:</span>
                        <span>{order.salesrep}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Otherrefnum:</span>
                        <span>{order.otherrefnum}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Shipping</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping Option:</span>
                        <span>{order.shippingoption}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping Address:</span>
                        <span>{order.shippingaddress}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Billing</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Term:</span>
                        <span>{order.term}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Option:</span>
                        <span>{order.paymentoption}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Daftar Item</h3>
                    <div className="overflow-x-auto">
                        <Table
                        columns={itemColumns}
                        dataSource={order.sales_order_items}
                        pagination={false}
                        rowKey="id"
                        bordered
                        size="small"
                        scroll={{ x: 'max-content' }}
                        className="text-xs md:text-sm"
                        />
                    </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-medium">{Number(order.subtotalbruto).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Discount Item:</span>
                        <span className="font-medium">{Number(order.discounttotal).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal (After Discount):</span>
                        <span className="font-medium">{Number(order.subtotal).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Tax Total:</span>
                        <span className="font-medium">{Number(order.taxtotal).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t mt-2">
                        <span className="text-gray-500 font-medium">Total:</span>
                        <span className="font-bold text-lg">{Number(order.total).toLocaleString()}</span>
                    </div>
                </div>
              </div>
            )}

            {!loading && !order && (
              <div className="p-4">
                <Button onClick={handleBack} className="mb-4">← Kembali</Button>
                <Empty description="Data order tidak ditemukan" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}