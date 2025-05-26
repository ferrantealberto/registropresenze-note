import { FileText, Check, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
}

interface StudentListProps {
  students: Student[];
  attendanceMap: Record<string, boolean>;
  notesMap: Record<string, string>;
  onAttendanceChange: (studentId: string) => void;
  onNotesClick: (studentId: string) => void;
}

export default function StudentList({
  students,
  attendanceMap,
  notesMap,
  onAttendanceChange,
  onNotesClick,
}: StudentListProps) {
  return (
    <ul className="divide-y divide-gray-200">
      {students.map((student) => (
        <li key={student.id} className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium text-gray-900">
                {student.name}
              </p>
              <button
                onClick={() => onNotesClick(student.id)}
                className={`p-1 rounded-full ${
                  notesMap[student.id] ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FileText className="h-4 w-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onAttendanceChange(student.id)}
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  attendanceMap[student.id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {attendanceMap[student.id] ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Presente
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Assente
                  </>
                )}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}