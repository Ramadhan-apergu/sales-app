"use client";

import useNavigateWithParams from "@/hooks/useNavigateWithParams";
import useRolePrefix from "@/hooks/useRolePrefix";
import { Space, Input, Select } from "antd";
import Search from "antd/es/input/Search";
import { useState } from "react";

export default function SearchStatus() {
  const navigate = useNavigateWithParams();
  const prefix = useRolePrefix();
  const [selectedDoc, setSelectedDoc] = useState("delivery");
  const options = [
    {
      value: "delivery",
      label: "Delivery",
    },
    {
      value: "invoice",
      label: "Invoice",
    },
  ];
  return (
    <div className="w-full">
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        <Space.Compact style={{ width: "100%" }}>
          <Select
            defaultValue={selectedDoc || undefined}
            options={options}
            value={selectedDoc}
            onChange={(value) => {
              setSelectedDoc(value);
            }}
          />
          <Search
            placeholder={selectedDoc == 'delivery' ? "Input SO Number" : "Input Doc Number"}
            onSearch={(value) => {
              if (selectedDoc == "delivery") {
                navigate(`${prefix}/status/${selectedDoc}`, {
                  so_numb: value,
                });
              } else if (selectedDoc == "invoice") {
                navigate(`${prefix}/status/${selectedDoc}`, {
                  doc_numb: value,
                });
              }
            }}
            enterButton
            allowClear
          />
        </Space.Compact>
      </Space>
    </div>
  );
}
