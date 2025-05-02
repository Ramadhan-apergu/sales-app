'use client'

import React from "react";
import { HiMiniInbox, HiOutlineIdentification, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown } from "antd";

function Icon({ title }) {
  let IconComponent = null;
  let style = '';
  switch (title) {
    case 'active':
      IconComponent = HiCheckCircle;
      style = 'text-green-7';
      break;
    case 'inactive':
      IconComponent = HiXCircle;
      style = 'text-red-7';
      break;
    default:
      IconComponent = null;
  }

  return IconComponent ? <IconComponent className={style} /> : null;
}

export default function MobileListCustomer({ data, onEdit, onDelete, contextHolder, onClick }) {
  return (
    <>
      {data && data.length > 0 ? (
        data.map((item) => {
          const status = item?.status;
          const statusClass = {
            text:
              status === 'inactive'
                ? 'text-red-7'
                : status === 'active'
                ? 'text-green-7'
                : 'text-gray-5',
          };

          const dropdownItems = [
            {
              key: 'edit',
              label: 'Edit',
              onClick: () => onEdit(item),
            },
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => onDelete(item),
            },
          ];

          return (
            <div key={item.id} className="pb-4">
              <div
                className="w-full rounded-xl bg-white px-4 py-3 flex flex-col gap-2 shadow"
              >
                <div className="flex w-full justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <HiOutlineIdentification className="text-blue-6" />
                    <p className="text-sm font-semibold">
                      {item?.entityid || '-'}
                    </p>
                  </div>
                  <Dropdown
                    menu={{
                      items: dropdownItems.map(({ key, label, onClick }) => ({
                        key,
                        label,
                        onClick,
                      })),
                    }}
                    placement="bottomRight"
                  >
                    <Button
                      style={{ border: 'none' }}
                      size="small"
                      icon={<MoreOutlined />}
                    />
                  </Dropdown>
                </div>

                <div className="h-full flex flex-col justify-between" onClick={() => onClick && onClick(item)}>
                  <div className="h-14 bg-gray-3 rounded border border-gray-5 flex justify-center px-2">
                    <div className="w-6/12 h-full flex flex-col justify-center items-start">
                      <p className="text-xs text-gray-12/70">Customer</p>
                      <p className="text-sm truncate w-full">
                        {item?.companyname || '-'}
                      </p>
                    </div>
                    <div className="w-6/12 h-full flex flex-col justify-center items-start">
                      <p className="text-xs text-gray-12/70">Phone</p>
                      <p className="text-sm truncate w-full">
                        {item?.phone || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                    {item?.status && (
                        <div className="flex items-center gap-1">
                            <Icon title={status} />
                            <p className={`capitalize text-xs ${statusClass.text}`}>
                            {status || '-'}
                            </p>
                        </div>
                    )}
                </div>
              </div>
              {contextHolder}
            </div>
          );
        })
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center text-gray-500">
          <HiMiniInbox className="text-[60px]" />
          <p>Data not found</p>
        </div>
      )}
    </>
  );
}
