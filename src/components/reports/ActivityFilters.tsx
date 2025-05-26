import { format } from 'date-fns';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ActivityFiltersProps {
  period: 'week' | 'month' | 'all';
  selectedMonth: string;
  selectedSchool: string;
  selectedClass: string;
  sortDirection: 'asc' | 'desc';
  onPeriodChange: (period: 'week' | 'month' | 'all') => void;
  onMonthChange: (month: string) => void;
  onSchoolChange: (school: string) => void;
  onClassChange: (className: string) => void;
  onSortDirectionChange: () => void;
}

const schools = ['Pitagora', 'Falcone'];
const classes = {
  Pitagora: ['4ASA', '4FSA', '4C', '4A'],
  Falcone: ['4AX', '4BX']
};

export default function ActivityFilters({
  period,
  selectedMonth,
  selectedSchool,
  selectedClass,
  sortDirection,
  onPeriodChange,
  onMonthChange,
  onSchoolChange,
  onClassChange,
  onSortDirectionChange
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <button
        onClick={() => onPeriodChange('week')}
        className={`px-4 py-2 rounded-md ${
          period === 'week'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Settimana
      </button>
      <button
        onClick={() => onPeriodChange('month')}
        className={`px-4 py-2 rounded-md ${
          period === 'month'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Mese
      </button>
      <button
        onClick={() => onPeriodChange('all')}
        className={`px-4 py-2 rounded-md ${
          period === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tutte
      </button>

      {period === 'month' && (
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <select
        value={selectedSchool}
        onChange={(e) => onSchoolChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tutte le scuole</option>
        {schools.map((school) => (
          <option key={school} value={school}>
            {school}
          </option>
        ))}
      </select>

      <select
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
        disabled={!selectedSchool}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tutte le classi</option>
        {selectedSchool &&
          classes[selectedSchool as keyof typeof classes].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
      </select>

      <button
        onClick={onSortDirectionChange}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        <span className="ml-2">Data</span>
      </button>
    </div>
  );
}