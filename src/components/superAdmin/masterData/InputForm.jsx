'use client'

import { Divider, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";

export default function InputForm({
    type,
    payload = {},
    data = [],
    onChange,
    isReadOnly = false,
    isLargeScreen = true,
    aliases = {},
  }) {
    
    const [localPayload, setLocalPayload] = useState(payload)

    if (onChange) {
        useEffect(() => {
            onChange(type, localPayload)
        }, [localPayload])
    }

    return (
      <div className="w-full flex flex-col gap-2">
        <Divider
          style={{ margin: '0', textTransform: 'capitalize', borderColor: '#1677ff' }}
          orientation="left"
        >
          {type}
        </Divider>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 px-4">
          {data.map(({ key, input, options = [], isAlias = false, props = {} }) => {
            const label = isAlias ? aliases[key] || key : key;
            const value = isReadOnly ? payload[key] : localPayload[key];
            const commonStyle = {
              width: '100%',
            };
  
            let field;
            switch (input) {
              case 'number':
                field = (
                  <InputNumber
                    value={value}
                    onChange={(val) => {setLocalPayload(prev => ({ ...prev, [key]: val }));}}
                    style={commonStyle}
                    {...props}
                  />
                );
                break;
              case 'select':
                field = (
                  <Select
                    value={value}
                    onChange={(val) => {setLocalPayload(prev => ({ ...prev, [key]: val }));}}
                    options={options}
                    style={commonStyle}
                    {...props}
                  />
                );
                break;
              case 'input':
              default:
                field = (
                  <Input
                    value={value}
                    onChange={(e) => {setLocalPayload(prev => ({ ...prev, [key]: e.target.value }));}}
                    readOnly={isReadOnly}
                    style={commonStyle}
                    {...props}
                    variant={isReadOnly ? 'underlined' : 'outlined'}
                  />
                );
            }
  
            return (
              <div
                key={key}
                className={
                  `w-full flex capitalize flex-col items-start gap-0.5`
                }
              >
                <p className="text-sm font-semibold">{label}</p>
                {field}
              </div>
            );
          })}
        </div>
      </div>
    );
};