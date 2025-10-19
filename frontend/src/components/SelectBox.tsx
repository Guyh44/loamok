import React from "react";
import "../app/GenericPage.css"; // make sure this path matches where your GenericPage.css is
import Select, { type SingleValue } from "react-select";
import "../components/SelectBox.css"


type Option = {
  value: string;
  label: string;
};

interface FancySelectProps {
  id: string;
  label: string;   // 👈 added label prop
  value: string;
  options: Option[];
  onChange: (val: string) => void;
}

export default function FancySelect({ id, label, value, options, onChange }: FancySelectProps) {
  return (
    <div className="config-row">
      <label htmlFor={id} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <Select
        inputId={id} // links to label
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selected: SingleValue<Option>) => {
          onChange(selected ? selected.value : "");
        }}
        options={options}
        placeholder="-- בחר --"
        classNamePrefix="select-box"
        isClearable={false}
      />
    </div>
  );
}