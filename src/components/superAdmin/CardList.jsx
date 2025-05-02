'use client'

import { useEffect, useState } from "react"
import { HiOutlineIdentification } from "react-icons/hi2";
import { HiCalendarDateRange } from "react-icons/hi2";
import { HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi";
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown } from "antd";

function Icon({ title }) {
    let IconComponent = null;
    let style = ''
    switch (title) {
        case 'active':
            IconComponent = HiCheckCircle;
            style = 'text-green-7'
            break;
        case 'inactive':
            IconComponent = HiXCircle;
            style = 'text-red-7'
            break;
        default:
            IconComponent = null;
    }

    return IconComponent ? <IconComponent className={style} /> : null;
}

export default function CardList({ data, moreEdit, moreDelete, handleClick }) {
    const [statusClass, setStatusClass] = useState({
        text: 'text-gray-5',
        bg: 'bg-gray-3',
    });

    useEffect(() => {
        const status = data?.status;
        if (status === 'inactive') {
            setStatusClass({
                text: 'text-red-7',
                bg: 'bg-red-7',
            });
        } else if (status === 'active') {
            setStatusClass({
                text: 'text-green-7',
                bg: 'bg-green-7',
            });
        } else {
            setStatusClass({
                text: 'text-gray-5',
                bg: 'bg-gray-3',
            });
        }
    }, [data?.status]);

    const dropdownItems = [
        {
          key: '1',
          label: 'Edit'
        },
        {
          key: '2',
          label: 'Delete'
        },
      ];

      const handleMore = ({key}) => {
        dropdownItems.forEach(item => {
            if (item.key == key) {
                const label = item.label.toLocaleLowerCase()
                if (label == 'edit') {
                    moreEdit()
                } else {
                    moreDelete()
                }
            }
        })
      }

    return (
        <div className="pb-4">
            <div className="w-full rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow" onClick={() => {handleClick(data)}}>
                <div className="flex w-full justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <HiOutlineIdentification className="text-blue-6"/>
                        <p className="text-sm font-semibold">{data?.entityid || '-'}</p>
                    </div>
                    <Dropdown menu={{ items: dropdownItems, onClick: handleMore, style: {textAlign: 'right'} }} placement="bottomRight">
                        <Button style={{border: 'none'}} size="small" variant="link" icon={<MoreOutlined />}></Button>
                    </Dropdown>
                </div>
                <div className="h-full flex flex-col justify-between">
                    <div className="h-14 bg-gray-3 rounded border border-gray-5 flex justify-center px-2">
                        <div className="w-6/12 h-full flex flex-col justify-center items-start">
                            <p className="text-xs text-gray-12/70">Customer</p>
                            <p className="text-sm truncate w-full">{data?.companyname || '-'}</p>
                        </div>
                        <div className="w-6/12 h-full flex flex-col justify-center items-start">
                            <p className="text-xs text-gray-12/70">Phone</p>
                            <p className="text-sm truncate w-full">{data?.phone || '-'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1">
                        <Icon title={data?.status || ''}/>
                        <p className={`capitalize text-xs ${statusClass.text}`}>{data?.status || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
