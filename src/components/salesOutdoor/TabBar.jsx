'use client';

import { HiHome, HiOutlineHome } from "react-icons/hi";
import { HiOutlineTruck, HiTruck, HiOutlinePrinter, HiPrinter, HiOutlineClipboardDocumentList, HiClipboardDocumentList } from "react-icons/hi2";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function TabBar() {
  const basePath = '/sales-outdoor';
  const pathname = usePathname();

  const items = [
    {
      path: '/home',
      title: 'Home',
      icon: {
        solid: HiHome,
        outline: HiOutlineHome,
      },
    },
    {
      path: '/sales-order',
      title: 'Sales Order',
      icon: {
        solid: HiClipboardDocumentList,
        outline: HiOutlineClipboardDocumentList,
      },
    },
    {
      path: '/delivery-order',
      title: 'Delivery Order',
      icon: {
        solid: HiTruck,
        outline: HiOutlineTruck,
      },
    },
    {
      path: '/invoice',
      title: 'Invoice',
      icon: {
        solid: HiPrinter,
        outline: HiOutlinePrinter,
      },
    },
  ];
  

  return (
    <div className="h-full w-full flex justify-center items-center bg-gray-12">
      {items.map((item, index) => {
          const fullPath = `${basePath}${item.path}`;
          const isActive = pathname === fullPath;
          const Icon = isActive ? item.icon.solid : item.icon.outline;

        return (
          <div key={index} className="w-1/4">
            <Link href={fullPath} passHref>
              <div
                className={clsx(
                  'flex flex-col justify-center items-center gap-0.5 text-[0.6rem] md:text-[0.8rem]',
                  isActive ? 'text-gray-1' : 'text-gray-7'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
