import React from 'react';
import { IncidentSeverityType } from '../../features/incidents/types';

interface SeverityToggleProps {
  value: IncidentSeverityType;
  onChange: (severity: IncidentSeverityType) => void;
  error?: string;
}

const severityOptions = [
  { value: 'LOW' as const, label: 'Low', color: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300' },
  { value: 'MEDIUM' as const, label: 'Medium', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300' },
  { value: 'HIGH' as const, label: 'High', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300' },
  { value: 'CRITICAL' as const, label: 'Critical', color: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300' },
];

export const SeverityToggle: React.FC<SeverityToggleProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {severityOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                px-3 py-2 rounded-md border text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isSelected 
                  ? `${option.color} ring-2 ring-blue-500 ring-offset-1` 
                  : `border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
                }
                ${error ? 'ring-red-300' : ''}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};