import React from 'react';
import Tooltip from './Tooltip';

interface InputGroupProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, tooltip, children, className = '', optional = false }) => {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center">
        {label}
        {optional && <span className="ml-1 text-gray-600 font-normal text-[10px]">(Optional)</span>}
        {tooltip && <Tooltip content={tooltip} />}
      </label>
      {children}
    </div>
  );
};

export default InputGroup;