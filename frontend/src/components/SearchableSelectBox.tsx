import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectBoxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

const SearchableSelectBox: React.FC<SearchableSelectBoxProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Type to search..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update filtered options when search term or options change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Get display value for selected option
  const getDisplayValue = () => {
    if (!value) return '';
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : value;
  };

  // Handle input click
  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle input blur (with delay to allow option click)
  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSearchTerm('');
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionSelect(filteredOptions[0].value);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="select-container" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="form-input"
          value={isOpen ? searchTerm : getDisplayValue()}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={handleInputClick}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={isOpen ? placeholder : getDisplayValue() || placeholder}
          autoComplete="off"
          style={{
            cursor: 'pointer',
            backgroundColor: isOpen ? '#fff' : 'inherit'
          }}
        />
        
        {/* Dropdown arrow */}
        <div 
          className="select-arrow"
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '12px',
            color: '#666'
          }}
        >
          {isOpen ? '▲' : '▼'}
        </div>

        {/* Options dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="select-options"
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="select-option"
                  onMouseDown={() => handleOptionSelect(option.value)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: option.value === value ? '#f0f9ff' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 
                      option.value === value ? '#f0f9ff' : 'transparent';
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '10px 12px',
                  color: '#666',
                  fontStyle: 'italic'
                }}
              >
                No options found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelectBox;