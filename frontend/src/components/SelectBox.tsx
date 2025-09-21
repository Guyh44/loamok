import React, { useState } from "react";
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
  const selectedOption = options.find((opt) => opt.value === value) || null;
  const [optionPicked, setOptionPicked] = useState<Option | null>(null);
  const customStyles = {
    control: () => ({}),
    menu: () => ({}),
    option: () => ({}),
    singleValue: () => ({}),
    input: () => ({}),
    placeholder: () => ({}),
    indicatorSeparator: () => ({}),
    dropdownIndicator: () => ({}),
    clearIndicator: () => ({}),
  };

  return (
    <div className="config-row">
      <label htmlFor={id}>{label}</label>
      <Select
        options={options}
        className="select-box-container"
        classNamePrefix="select-box"
        onChange={(option) => setOptionPicked(option)}
        placeholder="-- Select --"
        styles={customStyles}
        /*components={{
          IndicatorSeparator: () => null,
        }}*/
      />
    </div>
  );
};

export default SelectBox;