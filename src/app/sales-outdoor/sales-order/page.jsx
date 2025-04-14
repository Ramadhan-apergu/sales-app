import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { HiOutlineFilter } from "react-icons/hi";
import Layout from "@/components/salesOutdoor/Layout";
import { Input } from 'antd';
import Header from "@/components/salesOutdoor/Header";
import CardList from "@/components/salesOutdoor/salesOrder/CardList";
import FloatingButton from "@/components/salesOutdoor/salesOrder/FloatingButton";


export default function SalesOrder() {

    return (
        <Layout>
            <div className='w-full h-full overflow-y-auto overflow-x-hidden relative'>
                <FixedHeaderBar bgColor="bg-blue-6"/>
                <Header
                title={'Sales Order'}
                description={'Sales Order Description'}
                overview={{title: 'Total Sale Order', description: 'Period 1 Jan 2024 - 30 dec 2024', items: [{title: 'total', value: 123}, {title: 'pending', value: 234}, {title: 'approved', value: 345}]}}/>
                <div className="w-full relative">
                    <div className="w-full py-4 flex justify-center items-center gap-1 sticky top-11 px-4 bg-gray-3">
                        <div className="w-full flex justify-center items-center h-9 rounded-full bg-white p-0.5 shadow">
                            <Input placeholder="Search" variant="borderless"/>
                        </div>
                        <div className="h-9 aspect-square flex justify-center items-center text-xl bg-white rounded-full text-blue-6 shadow">
                            <HiOutlineFilter/>
                        </div>
                    </div>
                    <CardList data={{id: 'SO-12345', customerName: 'Ramadhan', date: '30 September 2024', status: 'pending', total: 250000.45}}/>
                    <CardList data={{id: 'SO-12346', customerName: 'Kafa', date: '18 September 2024', status: 'approved', total: 100000.03}}/>
                    <CardList data={{id: 'SO-12347', customerName: 'Rizky', date: '11 September 2024', status: 'rejected', total: 50000.11}}/>
                    <CardList data={{id: 'SO-12345', customerName: 'Ramadhan', date: '30 September 2024', status: 'pending', total: 250000.45}}/>
                    <CardList data={{id: 'SO-12346', customerName: 'Kafa', date: '18 September 2024', status: 'approved', total: 100000.03}}/>
                    <CardList data={{id: 'SO-12347', customerName: 'Rizky', date: '11 September 2024', status: 'rejected', total: 50000.11}}/>

                    <FloatingButton />
                </div>
            </div>
        </Layout>
    )
}