"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { HiOutlineFilter } from "react-icons/hi";
import Layout from "@/components/salesOutdoor/Layout";
import { Input, Spin, Select, Empty, Modal, DatePicker } from 'antd';
import Header from "@/components/salesOutdoor/Header";
import CardList from "@/components/salesOutdoor/invoice/CardList";
import InvoiceFetch from "@/modules/salesApi/invoice";
import Link from 'next/link';

const { Option } = Select;

export default function Invoice() {
    const [invoices, setInvoices] = useState([]);
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

    const fetchInvoices = useCallback(async (isInitial = false, overrideOffset, overrideLimit) => {
        if (loading || (!isInitial && !hasMore)) return;
        setLoading(true);
        setError(null);

        const actualOffset = overrideOffset ?? pagination.offset;
        const actualLimit  = overrideLimit  ?? pagination.limit;

        try {
        const start_date = startDate?.format('YYYY-MM-DD');
        const end_date = endDate?.format('YYYY-MM-DD');

        const response = await InvoiceFetch.get(
            actualOffset,
            actualLimit,
            statusFilter,
            searchText,
            start_date,
            end_date
        );

        if (response.status_code === 200 && Array.isArray(response.data?.list)) {
            const newInvoices = response.data.list;
            setInvoices(prev => isInitial ? newInvoices : [...prev, ...newInvoices]);

            const totalCount = response.data.total_items;
            const newOffset = actualOffset + actualLimit;
            setPagination({ offset: newOffset, limit: actualLimit });
            setHasMore(newOffset < totalCount);

            const items = [];
            items.push({title: 'Open', value: response.data.total_open});
            items.push({title: 'Paid in Full', value: response.data.total_paidfull});
            items.push({title: 'Partially Paid', value: response.data.total_partiallypaid});

            setOverviewItems(items);
        } else {
            setError(response.message || 'Failed to load invoices');
            setHasMore(false);
        }
        } catch (err) {
        setError(err.message || 'Error fetching invoices');
        setHasMore(false);
        } finally {
        setLoading(false);
        }
    }, [pagination, searchText, loading, hasMore]);

    const handleSearchEnter = () => {
        setPagination({ offset: 0, limit: 10 });
        setInvoices([]);
        setHasMore(true);
        fetchInvoices(true, 0, 10);
    };

    const openFilterModal = () => {
        setShowFilterModal(true);
    };
    const closeFilterModal = () => {
        setShowFilterModal(false);
    };
    const applyFilters = () => {
        setPagination({ offset: 0, limit: 10 });
        setInvoices([]);
        setHasMore(true);
        setShowFilterModal(false);
        fetchInvoices(true, 0, 10);
    };

    useEffect(() => {
        setPagination({ offset: 0, limit: 10 });
        fetchInvoices(true, 0, 10);
    }, [statusFilter]);

    useEffect(() => {
        const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
            fetchInvoices(false);
        }
        };
        const c = containerRef.current;
        if (c) {
        c.addEventListener('scroll', handleScroll);
        return () => c.removeEventListener('scroll', handleScroll);
        }
    }, [fetchInvoices, loading]);

    return (
        <Layout>
        <Modal
            title="Filter Sales Invoice"
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
                options={[
                    { value: 'open',          label: 'Open' },
                    { value: 'partiallypaid', label: 'Partially Paid' },
                    { value: 'paidfull',      label: 'Paid In Full' },
                ]}
            >
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
            title='Invoice'
            description='Invoice description'
            overview={{
                title: 'Total Invoice',
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
            {loading && invoices.length === 0 ? (
                <div className="flex justify-center items-center p-8"><Spin /></div>
            ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
            ) : invoices.length === 0 ? (
                <Empty className="p-8" description="No Invoice found" />
            ) : (
                invoices.map(invoice => (
                <Link
                    key={invoice.id}
                    href={`/sales-outdoor/invoice/${invoice.id}`}
                    shallow
                    scroll={false}
                >
                    <CardList
                        key={invoice.id}
                        data={{
                            id: invoice.tranid,
                            customerName: invoice.customer,
                            date: invoice.trandate,
                            status: invoice.status
                        }}
                    />
                </Link>
                ))
            )}

            {loading && invoices.length > 0 && (
                <div className="flex justify-center items-center p-4"><Spin /></div>
            )}

            {!hasMore && invoices.length > 0 && (
                <div className="p-4 text-center text-gray-500">Tidak ada lagi data untuk dimuat</div>
            )}
            
            </div>
        </div>
        </Layout>
    );
}
