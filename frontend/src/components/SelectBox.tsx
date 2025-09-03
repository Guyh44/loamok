import React from "react";
import "../app/GenericPage.css"; // make sure this path matches where your GenericPage.css is
import Select from "react-select";

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
  // find the selected option object (react-select expects full object, not just value)
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="config-row">
      <label htmlFor={id}>{label}</label>
      <Select
        inputId={id} // accessibility link for label
        value={selectedOption}
        options={options}
        onChange={(selected) => onChange(selected ? (selected as Option).value : "")}
        placeholder="-- Select --"
      />
    </div>
  );
};

export default SelectBox;
