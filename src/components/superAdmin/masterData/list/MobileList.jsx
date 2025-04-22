import React from "react";
import CardList from "@/components/superAdmin/masterData/CardList";
import { HiMiniInbox } from "react-icons/hi2";

export default function MobileList({ data, onEdit, onDelete, contextHolder, onClick }) {
  return (
    <>
      {data && data.length > 0 ? (
        data.map((item) => (
          <div key={item.id} className="">
            <CardList
              data={item}
              moreEdit={() => onEdit(item)}
              moreDelete={() => onDelete(item)}
              handleClick={() => onClick(item)}
            />
            {contextHolder}
          </div>
        ))
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center text-gray-7">
          <HiMiniInbox className="text-[60px]" />
          <p>Data not found</p>
        </div>
      )}
    </>
  );
}