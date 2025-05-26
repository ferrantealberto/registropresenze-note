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
      <div ref={ref} className="bg-white" style={{ width: '297mm', height: '210mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="border-b border-gray-300 p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <img 
                src="http://weblabfactory.it/logoregistroscuola.png" 
                alt="Logo" 
                className="w-32 h-auto"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-4 text-sm font-semibold">
                <span>REGISTRO GIORNALIERO - data: {format(new Date(date), 'dd/MM/yyyy', { locale: it })}</span>
                <span>DALLE ORE: {activity?.startTime}</span>
                <span>ALLE ORE: {activity?.endTime}</span>
                <span>CLASSE: {className}</span>
              </div>
            </div>
          </div>

          {/* Project Title */}
          <div className="mt-2 border-t border-gray-200 pt-2">
            <div className="text-[11px]">Titolo prog.: <strong>S.E.M.E. 4.0 - Strategie Educative per Menti in Evoluzione</strong></div>
            <div className="text-[11px]">Co. Prog.: 2022-STE-01208 - codice attività: 56144-338961</div>
            <div className="text-[11px]">Attività: Laboratori di apprendimento collaborativo curriculari Agricoltura 4.0</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(210mm-12rem)]">
          {/* Left Side - Student List */}
          <div className="flex-grow border-r border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="w-8 p-1 text-center border-r border-gray-300 text-sm">#</th>
                  <th className="p-1 text-left border-r border-gray-300 text-sm">Studente</th>
                  <th className="p-1 text-left text-sm">Presenza</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="border-b border-gray-300">
                    <td className="p-1 text-center border-r border-gray-300 text-sm">{index + 1}</td>
                    <td className="p-1 border-r border-gray-300 text-sm">{student.name}</td>
                    <td className="p-1 text-sm">{attendanceMap[student.id] ? 'Presente' : 'Assente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Side - Activity and Signature */}
          <div className="w-1/3">
            <div className="h-full flex flex-col">
              <div className="p-3 border-b border-gray-300">
                <div className="font-bold text-sm mb-2">Attività Svolta</div>
                <div className="text-sm min-h-[150px]">{activity?.description}</div>
              </div>
              <div className="mt-auto p-3 border-t border-gray-300">
                <div className="font-bold text-sm mb-2">FIRMA EDUCATORE/OPERATORE</div>
                <img 
                  src="http://weblabfactory.it/lamiafirmapers24.png" 
                  alt="Firma" 
                  className="w-32 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AttendanceReport.displayName = 'AttendanceReport';

export default AttendanceReport;