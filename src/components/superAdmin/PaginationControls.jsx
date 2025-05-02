import React from "react";
import { Pagination } from "antd";

export default function PaginationControls({ totalItems, limit, page, isLargeScreen, onPageChange }) {
  return (
      <Pagination
        total={totalItems}
        defaultPageSize={limit}
        defaultCurrent={page}
        onChange={onPageChange}
        size={isLargeScreen ? "default" : "small"}
      />
  );
}
