import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { calculateLessonHours } from '../utils/timeCalculations';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { BookOpen, Clock, Calendar, FileIcon, Printer } from 'lucide-react';
import Header from './common/Header';
import ActivitySummaryModal from './reports/ActivitySummaryModal';
import RealHoursSummaryModal from './reports/RealHoursSummaryModal';
import LessonCalendarModal from './calendar/LessonCalendarModal';
import StudentList from './attendance/StudentList';
import ActivityForm from './attendance/ActivityForm';
import NotesModal from './attendance/NotesModal';
import AttendanceReport from './reports/AttendanceReport';

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
}

interface Activity {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
  date: Date;
  school: string;
  class: string;
}

export default function Dashboard() {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [currentNote, setCurrentNote] = useState('');
  const [attendanceVerified, setAttendanceVerified] = useState<boolean>(false);
  const [showActivitySummary, setShowActivitySummary] = useState(false);
  const [showRealHoursSummary, setShowRealHoursSummary] = useState(false);
  const [showLessonCalendar, setShowLessonCalendar] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [defaultStartTime, setDefaultStartTime] = useState<string | undefined>();
  const [defaultEndTime, setDefaultEndTime] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters
  const reportRef = useRef<HTMLDivElement>(null);

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASA', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    const schoolParam = params.get('school');
    const classParam = params.get('class');
    const startTimeParam = params.get('startTime');
    const endTimeParam = params.get('endTime');

    if (dateParam && schoolParam && classParam) {
      setAttendanceDate(dateParam);
      setSelectedSchool(schoolParam);
      setSelectedClass(classParam);
      
      // Set default times from URL parameters
      setDefaultStartTime(startTimeParam || undefined);
      setDefaultEndTime(endTimeParam || undefined);
      
      // Create initial activity with times from URL
      if (startTimeParam && endTimeParam) {
        try {
          const hours = calculateLessonHours(startTimeParam, endTimeParam);
          setCurrentActivity({
            description: '',
            startTime: startTimeParam,
            endTime: endTimeParam,
            hours,
            date: new Date(dateParam),
            school: schoolParam,
            class: classParam,
            id: ''
          });
        } catch (err) {
          setError('Error calculating lesson hours');
          console.error(err);
        }
      }
      
      setShowLessonCalendar(false); // Close calendar if open
    }
  }, [window.location.search]); // Re-run when URL changes

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSchool || !selectedClass) return;
      
      setLoading(true);
      setAttendanceVerified(false); // Reset verification status when changing date/class/school
      try {
        const q = query(
          collection(db, 'students'),
          where('school', '==', selectedSchool),
          where('class', '==', selectedClass)
        );

        // Fetch lesson to get verification status
        const lessonQuery = query(
          collection(db, 'lessons'),
          where('date', '==', new Date(attendanceDate)),
          where('school', '==', selectedSchool),
          where('class', '==', selectedClass)
        );
        const lessonSnapshot = await getDocs(lessonQuery);
        if (!lessonSnapshot.empty) {
          const lessonDoc = lessonSnapshot.docs[0];
          setAttendanceVerified(lessonDoc.data().attendanceVerified || false);
        }
        const querySnapshot = await getDocs(q);
        const studentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Student));
        setStudents(studentsList);
        
        const defaultAttendance: Record<string, boolean> = {};
        studentsList.forEach(student => {
          defaultAttendance[student.id] = true;
        });
        setAttendanceMap(defaultAttendance);

        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '==', new Date(attendanceDate))
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const newAttendanceMap: Record<string, boolean> = { ...defaultAttendance };
        const newNotesMap: Record<string, string> = {};
        
        attendanceSnapshot.docs.forEach(doc => {
          const data = doc.data();
          newAttendanceMap[data.studentId] = data.present;
          if (data.notes) {
            newNotesMap[data.studentId] = data.notes;
          }
        });
        
        setAttendanceMap(newAttendanceMap);
        setNotesMap(newNotesMap);

        // Fetch current activity
        const activityQuery = query(
          collection(db, 'activities'),
          where('date', '==', new Date(attendanceDate)),
          where('school', '==', selectedSchool),
          where('class', '==', selectedClass)
        );
        const activitySnapshot = await getDocs(activityQuery);
        if (!activitySnapshot.empty) {
          const activityDoc = activitySnapshot.docs[0];
          setCurrentActivity({
            id: activityDoc.id,
            ...activityDoc.data()
          } as Activity);
        } else {
          setCurrentActivity(null);
        }
      } catch (error) {
        console.error('Errore nel recupero degli studenti:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSchool && selectedClass) {
      fetchStudents();
      setAttendanceVerified(false); // Reset verification status when changing date/class
    }
  }, [selectedSchool, selectedClass, attendanceDate]);

  const handleAttendance = async (studentId: string) => {
    const newPresent = !attendanceMap[studentId];
    try {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        attendanceVerified,
        date: new Date(attendanceDate),
        present: newPresent,
        notes: notesMap[studentId] || '',
        timestamp: Timestamp.now()
      });

      setAttendanceMap(prev => ({
        ...prev,
        [studentId]: newPresent
      }));
    } catch (error) {
      console.error('Errore nel salvataggio della presenza:', error);
    }
  };

  const handleNotesClick = (studentId: string) => {
    setCurrentStudentId(studentId);
    setCurrentNote(notesMap[studentId] || '');
    setIsModalOpen(true);
  };

  const handleNoteSave = async (note: string) => {
    try {
      setNotesMap(prev => ({
        ...prev,
        [currentStudentId]: note
      }));
      
      await addDoc(collection(db, 'attendance'), {
        studentId: currentStudentId,
        date: new Date(attendanceDate),
        present: attendanceMap[currentStudentId],
        notes: note,
        timestamp: Timestamp.now()
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleActivitySave = async (activity: {
    description: string;
    startTime: string;
    endTime: string;
    hours: number;
  }) => {
    try {
      const activityData = {
        ...activity,
        date: new Date(attendanceDate),
        school: selectedSchool,
        class: selectedClass
      };

      const docRef = await addDoc(collection(db, 'activities'), activityData);
      setCurrentActivity({ id: docRef.id, ...activityData } as Activity);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handlePDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `registro-${selectedSchool}-${selectedClass}-${attendanceDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setSelectedClass('');
              }}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona Scuola</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={!selectedSchool}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona Classe</option>
              {selectedSchool &&
                classes[selectedSchool as keyof typeof classes].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />

            <button
              onClick={() => setShowActivitySummary(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Riepilogo Ore
            </button>

            <button
              onClick={() => setShowRealHoursSummary(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Riepilogo ore in classe
            </button>

            <button
              onClick={() => setShowLessonCalendar(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendario Lezioni
            </button>
          </div>

          {selectedSchool && selectedClass && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Registro Presenze
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {selectedSchool} - {selectedClass} - {format(new Date(attendanceDate), 'dd MMMM yyyy', { locale: it })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePDF}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FileIcon className="h-4 w-4 mr-2" />
                    Salva PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Stampa
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <StudentList
                    students={students}
                    attendanceMap={attendanceMap}
                    notesMap={notesMap}
                    date={attendanceDate}
                    school={selectedSchool}
                    class={selectedClass}
                    attendanceVerified={attendanceVerified}
                    onAttendanceVerifiedChange={setAttendanceVerified}
                    onAttendanceChange={handleAttendance}
                    onNotesClick={handleNotesClick}
                  />
                  
                  <ActivityForm 
                    onSave={handleActivitySave}
                    currentActivity={currentActivity}
                    defaultStartTime={defaultStartTime}
                    defaultEndTime={defaultEndTime}
                  />

                  <div className="hidden">
                    <AttendanceReport
                      ref={reportRef}
                      students={students}
                      attendanceMap={attendanceMap}
                      notesMap={notesMap}
                      school={selectedSchool}
                      className={selectedClass}
                      date={attendanceDate}
                      activity={currentActivity}
                    />
                  </div>
                </>
              )}
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <NotesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNoteSave}
        currentNote={currentNote}
        onChange={setCurrentNote}
      />

      <ActivitySummaryModal
        isOpen={showActivitySummary}
        onClose={() => setShowActivitySummary(false)}
      />

      <RealHoursSummaryModal
        isOpen={showRealHoursSummary}
        onClose={() => setShowRealHoursSummary(false)}
      />

      <LessonCalendarModal
        isOpen={showLessonCalendar}
        onClose={() => setShowLessonCalendar(false)}
      />
    </div>
  );
}