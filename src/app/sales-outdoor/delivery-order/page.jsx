"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { HiOutlineFilter } from "react-icons/hi";
import Layout from "@/components/salesOutdoor/Layout";
import { Input, Spin, Select, Empty, Modal, DatePicker } from 'antd';
import Header from "@/components/salesOutdoor/Header";
import CardList from "@/components/salesOutdoor/deliveryOrder/CardList";
import DeliveryOrderFetch from "@/modules/salesApi/deliveryOrder";
import Link from 'next/link';

const { Option } = Select;

export default function DeliveryOrder() {
    const [deliveries, setDeliveries] = useState([]);
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

    const fetchDeliveries = useCallback(async (isInitial = false, overrideOffset, overrideLimit) => {
        if (loading || (!isInitial && !hasMore)) return;
        setLoading(true);
        setError(null);

        const actualOffset = overrideOffset ?? pagination.offset;
        const actualLimit  = overrideLimit  ?? pagination.limit;

        try {
        const start_date = startDate?.format('YYYY-MM-DD');
        const end_date = endDate?.format('YYYY-MM-DD');

        const response = await DeliveryOrderFetch.get(
            actualOffset,
            actualLimit,
            statusFilter,
            searchText,
            start_date,
            end_date
        );

        if (response.status_code === 200 && Array.isArray(response.data?.list)) {
            const newDeliveries = response.data.list;
            setDeliveries(prev => isInitial ? newDeliveries : [...prev, ...newDeliveries]);

            const totalCount = response.data.total_items;
            const newOffset = actualOffset + actualLimit;
            setPagination({ offset: newOffset, limit: actualLimit });
            setHasMore(newOffset < totalCount);
        } else {
            setError(response.message || 'Failed to load deliveries');
            setHasMore(false);
        }
        } catch (err) {
        setError(err.message || 'Error fetching deliveries');
        setHasMore(false);
        } finally {
        setLoading(false);
        }
    }, [pagination, searchText, loading, hasMore]);

    useEffect(() => {
        const statuses = [
        { key: 'open',   label: 'Open' },
        { key: 'partially_paid', label: 'Partially Shipped' },
        { key: 'paid_in_full', label: 'Shipped' },
        ];
        async function fetchOverview() {
        try {
            const results = await Promise.all(
            statuses.map(s =>
                DeliveryOrderFetch.get(0, 1, s.key, '')
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
        setDeliveries([]);
        setHasMore(true);
        fetchDeliveries(true, 0, 10);
    };

    const openFilterModal = () => {
        setShowFilterModal(true);
    };
    const closeFilterModal = () => {
        setShowFilterModal(false);
    };
    const applyFilters = () => {
        setPagination({ offset: 0, limit: 10 });
        setDeliveries([]);
        setHasMore(true);
        setShowFilterModal(false);
        fetchDeliveries(true, 0, 10);
    };

    useEffect(() => {
        setPagination({ offset: 0, limit: 10 });
        fetchDeliveries(true, 0, 10);
    }, [statusFilter]);

    useEffect(() => {
        const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
            fetchDeliveries(false);
        }
        };
        const c = containerRef.current;
        if (c) {
        c.addEventListener('scroll', handleScroll);
        return () => c.removeEventListener('scroll', handleScroll);
        }
    }, [fetchDeliveries, loading]);

    return (
        <Layout>
        <Modal
            title="Filter Delivery Order"
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
                {["open", "partially shipped", "shipped"]
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
            title='Delivery Order'
            description='Delivery order description'
            overview={{
                title: 'Total Delivery Order',
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
            {loading && deliveries.length === 0 ? (
                <div className="flex justify-center items-center p-8"><Spin /></div>
            ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
            ) : deliveries.length === 0 ? (
                <Empty className="p-8" description="No Delivery Orders found" />
            ) : (
                deliveries.map(delivery => (
                <Link
                    key={delivery.delivery_id}
                    href={`/sales-outdoor/delivery-order/${delivery.delivery_id}`}
                    shallow
                    scroll={false}
                >
                    <CardList
                        key={delivery.delivery_id}
                        data={{
                            id: delivery.delivery_numb,
                            customerName: delivery.customer,
                            date: delivery.delivery_date,
                            status: delivery.delivery_status,
                        }}
                    />
                </Link>
                ))
            )}

            {loading && deliveries.length > 0 && (
                <div className="flex justify-center items-center p-4"><Spin /></div>
            )}

            {!hasMore && deliveries.length > 0 && (
                <div className="p-4 text-center text-gray-500">Tidak ada lagi data untuk dimuat</div>
            )}
            </div>
        </div>
        </Layout>
    );
}
