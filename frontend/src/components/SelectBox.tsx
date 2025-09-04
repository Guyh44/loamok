import React from "react";
import "../app/GenericPage.css"; // make sure this path matches where your GenericPage.css is

interface Option {
  value: string;
  label: string;
}

interface SelectBoxProps {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

const SelectBox: React.FC<SelectBoxProps> = ({ id, label, value, options, onChange }) => {
  return (
    <div className="config-row">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;
