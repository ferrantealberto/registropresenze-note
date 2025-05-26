import { forwardRef } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
}

interface AttendanceReportProps {
  students: Student[];
  attendanceMap: Record<string, boolean>;
  notesMap: Record<string, string>;
  school: string;
  className: string;
  date: string;
  activity: {
    description: string;
    startTime: string;
    endTime: string;
    hours: number;
  } | null;
}

const AttendanceReport = forwardRef<HTMLDivElement, AttendanceReportProps>(
  ({ students, attendanceMap, notesMap, school, className, date, activity }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white">
        {/* Header with Logo */}
        <div className="flex justify-between items-start mb-6">
          <img 
            src="http://weblabfactory.it/logoregistroscuola.png" 
            alt="Logo" 
            style={{ width: '200px', objectFit: 'contain' }}
            className="max-h-24"
          />
          <div className="text-right">
            <h2 className="text-xl font-bold">{school}</h2>
            <p className="text-gray-600">Classe {className}</p>
            <p className="text-gray-600">
              {format(new Date(date), 'dd MMMM yyyy', { locale: it })}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full border-collapse border border-gray-300 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Studente</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Presenza</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {attendanceMap[student.id] ? 'Presente' : 'Assente'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {notesMap[student.id] || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Activity Details and Signature in a flex container */}
        <div className="flex justify-between items-start">
          {/* Activity Details */}
          <div className="flex-1">
            {activity && (
              <>
                <h3 className="text-lg font-semibold mb-2">Attività Svolta</h3>
                <p className="mb-2">{activity.description}</p>
                <p>
                  Orario: {activity.startTime} - {activity.endTime} ({activity.hours} ore)
                </p>
              </>
            )}
          </div>

          {/* Signature */}
          <div className="ml-8 text-right">
            <p className="mb-2">Firma del Formatore/Operatore</p>
            <img 
              src="http://weblabfactory.it/lamiafirmapers24.png" 
              alt="Firma" 
              style={{ width: '200px', objectFit: 'contain' }}
              className="max-h-16 ml-auto"
            />
          </div>
        </div>
      </div>
    );
  }
);

AttendanceReport.displayName = 'AttendanceReport';

export default AttendanceReport;