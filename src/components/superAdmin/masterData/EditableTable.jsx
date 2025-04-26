import React, { useEffect, useState, useRef, useContext } from "react";
import { Button, Form, Input, Popconfirm, Table } from "antd";

const EditableContext = React.createContext(null);

export default function EditableTable({ data, onChange, isReadOnly = false }) {
  const [localData, setLocalData] = useState(data || []);
  const [form] = Form.useForm();

  useEffect(() => {
    onChange?.(localData);
  }, [localData, onChange]);

  const handleDelete = (key) => {
    const newData = localData.filter((item) => item.key !== key && item.id !== key);
    setLocalData(newData);
  };

  const handleAdd = () => {
    const newRow = {};
    if (localData[0]) {
      Object.keys(localData[0]).forEach((key) => {
        newRow[key] = "";
      });
    }
    newRow.id = Date.now().toString(); // generate ID unik
    setLocalData([...localData, newRow]);
  };

  const handleSave = (row) => {
    const newData = [...localData];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setLocalData(newData);
  };

  const generateColumns = (dataSample) => {
    if (!dataSample) return [];
    const keys = Object.keys(dataSample);

    const columns = keys.map((key) => ({
      title: key,
      dataIndex: key,
      editable: !isReadOnly,
    }));

    if (!isReadOnly) {
      columns.push({
        title: "Action",
        dataIndex: "action",
        render: (_, record) =>
          localData.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      });
    }

    return columns;
  };

  const EditableRow = ({ index, ...props }) => {
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);

    useEffect(() => {
      if (editing) {
        inputRef.current?.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      if (isReadOnly) return; // Prevent toggle kalau readonly
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log("Save failed:", errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[{ required: false }]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} disabled={isReadOnly} />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{ paddingInlineEnd: 24, cursor: isReadOnly ? "default" : "pointer" }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const columns = generateColumns(localData[0] || {}).map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div className="w-full h-full">
      {!isReadOnly && (
        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
          Add Row
        </Button>
      )}
      <Table
        components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={localData}
        columns={columns}
        rowKey="id"
        pagination={false}
        tableLayout="auto"
        scroll={{ x: "max-content" }}
        size="small"
      />
    </div>
  );
}
