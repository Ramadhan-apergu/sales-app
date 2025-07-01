"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { HiOutlineFilter } from "react-icons/hi";
import Layout from "@/components/salesOutdoor/Layout";
import { Input, Spin, Select, Empty, Modal, DatePicker, Button } from 'antd';
import Header from "@/components/salesOutdoor/Header";
import CardList from "@/components/salesOutdoor/salesOrder/CardList";
import FloatingButton from "@/components/salesOutdoor/salesOrder/FloatingButton";
import SalesOrderFetch from "@/modules/salesApi/salesOrder";
import Link from 'next/link';

const { Option } = Select;

export default function SalesOrder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [pagination, setPagination] = useState({ offset: 0, limit: 10 });
    const [hasMore, setHasMore] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [overviewItems, setOverviewItems] = useState([]);
    const containerRef = useRef(null);

    const isFilterActive = !!(statusFilter || startDate || endDate);

    // Fungsi untuk memformat angka ke mata uang Rupiah
    const formatRupiah = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        const numberCurrency = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);

        return numberCurrency + ",-";
    };

    const fetchOrders = useCallback(async (isInitial = false, overrideOffset, overrideLimit) => {
        if (loading || (!isInitial && !hasMore)) return;
        setLoading(true);
        setError(null);

        const actualOffset = overrideOffset ?? pagination.offset;
        const actualLimit  = overrideLimit  ?? pagination.limit;

        try {
        const start_date = startDate?.format('YYYY-MM-DD');
        const end_date = endDate?.format('YYYY-MM-DD');

        const response = await SalesOrderFetch.get(
            actualOffset,
            actualLimit,
            statusFilter,
            searchText,
            start_date,
            end_date
        );

        if (response.status_code === 200 && Array.isArray(response.data?.list)) {
            const newOrders = response.data.list;
            setOrders(prev => isInitial ? newOrders : [...prev, ...newOrders]);

            const totalCount = response.data.total_items;
            const newOffset = actualOffset + actualLimit;
            setPagination({ offset: newOffset, limit: actualLimit });
            setHasMore(newOffset < totalCount);
        } else {
            setError(response.message || 'Failed to load orders');
            setHasMore(false);
        }
        } catch (err) {
        setError(err.message || 'Error fetching orders');
        setHasMore(false);
        } finally {
        setLoading(false);
        }
    }, [pagination, searchText, loading, hasMore]);

    useEffect(() => {
        const statuses = [
        { key: 'open',   label: 'Open' },
        { key: 'closed', label: 'Closed' },
        { key: 'canceled', label: 'Canceled' },
        ];
        async function fetchOverview() {
        try {
            const results = await Promise.all(
            statuses.map(s =>
                SalesOrderFetch.get(0, 1, s.key, '')
            )
            );
            const items = results.map((res, idx) => ({
            title: statuses[idx].label,
            value: res.data?.total_items || 0,
            }));
            setOverviewItems(items);
        } catch (e) {
            console.error('Error fetching overview counts', e);
        }
        }
        fetchOverview();
    }, []);

    const handleSearchEnter = () => {
        setPagination({ offset: 0, limit: 10 });
        setOrders([]);
        setHasMore(true);
        fetchOrders(true, 0, 10);
    };

    const openFilterModal = () => {
        setShowFilterModal(true);
    };
    const closeFilterModal = () => {
        setShowFilterModal(false);
    };
    const applyFilters = () => {
        setPagination({ offset: 0, limit: 10 });
        setOrders([]);
        setHasMore(true);
        setShowFilterModal(false);
        fetchOrders(true, 0, 10);
    };

    useEffect(() => {
        setPagination({ offset: 0, limit: 10 });
        fetchOrders(true, 0, 10);
    }, [statusFilter]);

    useEffect(() => {
        const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
            fetchOrders(false);
        }
        };
        const c = containerRef.current;
        if (c) {
        c.addEventListener('scroll', handleScroll);
        return () => c.removeEventListener('scroll', handleScroll);
        }
    }, [fetchOrders, loading]);

    return (
        <Layout>
        <Modal
            title="Filter Sales Order"
            open={showFilterModal}
            onOk={applyFilters}
            onCancel={closeFilterModal}
            okText="Apply"
        >
            <div className="mb-4">
            <label>Status:</label>
            <Select
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Pilih status"
                style={{ width: '100%' }}
                allowClear
            >
                {["open","fulfilled","partially fulfilled","credit hold","closed","canceled","pending"]
                .map(s => <Option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Option>)
                }
            </Select>
            </div>

            <div className="mb-4">
            <label>Start Date:</label>
            <DatePicker
                value={startDate}
                onChange={setStartDate}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                allowClear
            />
            </div>

            <div>
            <label>End Date:</label>
            <DatePicker
                value={endDate}
                onChange={setEndDate}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                allowClear
            />
            </div>
        </Modal>

        <div
            ref={containerRef}
            className='w-full h-full overflow-y-auto overflow-x-hidden relative'
            style={{ scrollbarWidth: 'none' }}
        >
            <FixedHeaderBar bgColor="bg-blue-6" />
            <Header
            title='Sales Order'
            description='Sales order description'
            overview={{
                title: 'Total Sales Order',
                description: '',
                items: overviewItems
            }}
            />

            <div className="w-full relative">
            <div className="w-full py-4 flex justify-center items-center gap-2 sticky top-11 px-4 bg-gray-3">
                <Input
                placeholder="Search customer"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={handleSearchEnter}
                allowClear
                />
                {/* filter icon */}
                <div
                className={`h-9 aspect-square flex justify-center items-center text-xl rounded-full shadow cursor-pointer
                    ${isFilterActive ? 'bg-blue-6 text-white' : 'bg-white text-blue-6'}`}
                onClick={openFilterModal}
                >
                <HiOutlineFilter />
                </div>
            </div>

            {/* konten list */}
            {loading && orders.length === 0 ? (
                <div className="flex justify-center items-center p-8"><Spin /></div>
            ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
            ) : orders.length === 0 ? (
                <Empty className="p-8" description="No Sales Orders found" />
            ) : (
                orders.map(order => (
                <Link
                    key={order.id}
                    href={`/sales-outdoor/sales-order/${order.id}`}
                    shallow
                    scroll={false}
                >
                    <CardList
                        key={order.delivery_id}
                        data={{
                            id: order.tranid,
                            customerName: order.customer,
                            date: order.trandate,
                            status: order.status,
                            total: formatRupiah(order.total),
                            po: order.otherrefnum
                        }}
                    />
                </Link>
                ))
            )}

            {loading && orders.length > 0 && (
                <div className="flex justify-center items-center p-4"><Spin /></div>
            )}

            {!hasMore && orders.length > 0 && (
                <div className="p-4 text-center text-gray-500">Tidak ada lagi data untuk dimuat</div>
            )}

            <Link href="/sales-outdoor/sales-order/new">
                <FloatingButton />
            </Link>
            </div>
        </div>
        </Layout>
    );
}