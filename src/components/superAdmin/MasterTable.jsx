"use client"

import { Table } from 'antd';
import { createStyles } from 'antd-style';


// Styling untuk Antd Table
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

export default function MasterTable({columns = [], dataSource = [], heightTable}) {
  const { styles } = useStyle();
console.log(heightTable)
  return (
      <Table
        className={styles.customTable}
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        scroll={{x: 'max-content', y: heightTable || 300}}
        rowKey="id"
      />
  );
}
