'use client'

import React from "react";
import { Button, Dropdown } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import Search from "antd/es/input/Search";

export default function HeaderControls({ isLargeScreen, statusFilter, dropdownItems, onStatusChange, onAdd }) {

  return (
    <>
      <div className="flex justify-start items-center">
        <Search placeholder="input search text" allowClear />
      </div>
      <div className="flex justify-end items-center gap-2 lg:gap-4">
        <Dropdown
          menu={{ items: dropdownItems, onClick: onStatusChange, style: { textAlign: "right" } }}
          placement="bottomRight"
        >
          <Button icon={<FilterOutlined />} style={{ textTransform: "capitalize" }}>
            {isLargeScreen ? (statusFilter == "all" ? "all status" : statusFilter) : ""}
          </Button>
        </Dropdown>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          {isLargeScreen ? `Add` : ""}
        </Button>
      </div>
    </>
  );
}
