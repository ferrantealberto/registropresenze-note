import { format } from 'date-fns';

interface Activity {
  id: string;
  date: { toDate: () => Date };
  school: string;
  class: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface ActivityTableProps {
  activities: Activity[];
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Data
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Scuola
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Classe
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Attività
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Orario
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ore
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {activities.map((activity) => (
          <tr key={activity.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              {format(activity.date.toDate(), 'dd/MM/yyyy')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {activity.school}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {activity.class}
            </td>
            <td className="px-6 py-4">
              {activity.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {activity.startTime} - {activity.endTime}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {activity.hours}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}