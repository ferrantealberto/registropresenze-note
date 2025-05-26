import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { calculateLessonHours } from '../../utils/timeCalculations';
import { Download, StickyNote, Edit2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import DayNoteModal from './DayNoteModal';
import { useState, useEffect } from 'react';

interface CalendarViewProps {
  currentDate: Date;
  lessons: any[];
  onEditLesson: (lesson: any) => void;
  onLessonClick: (lesson: any) => void;
}

export default function CalendarView({ currentDate, lessons, onEditLesson, onLessonClick }: CalendarViewProps) {
  const [notes, setNotes] = useState<Record<string, { id: string; content: string }>>({});
  const calendarStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getLessonsForDay = (date: Date) => {
    return lessons.filter(lesson => {
      const lessonDate = lesson.date.toDate();
      return format(lessonDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const fetchNotes = async () => {
    try {
      const startDate = format(calendarStart, 'yyyy-MM-dd');
      const endDate = format(calendarEnd, 'yyyy-MM-dd');
      
      const q = query(
        collection(db, 'dailyNotes'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const snapshot = await getDocs(q);
      const notesData: Record<string, { id: string; content: string }> = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        notesData[data.date] = {
          id: doc.id,
          content: data.content
        };
      });
      
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Errore nel recupero delle note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentDate]);

  const handleAddNote = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (content: string) => {
    if (!selectedDate) return;
    
    try {
      if (notes[selectedDate]) {
        // Update existing note
        await deleteDoc(doc(db, 'dailyNotes', notes[selectedDate].id));
      }
      
      // Add new note
      await addDoc(collection(db, 'dailyNotes'), {
        date: selectedDate,
        content,
        timestamp: new Date()
      });
      
      await fetchNotes();
      toast.success('Nota salvata con successo');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Errore nel salvataggio della nota');
    }
    
    setIsNoteModalOpen(false);
    setSelectedDate(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa nota?')) return;
    
    try {
      await deleteDoc(doc(db, 'dailyNotes', noteId));
      await fetchNotes();
      toast.success('Nota eliminata con successo');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Errore nell\'eliminazione della nota');
    }
  };

  const handleExportDatabase = async () => {
    try {
      // Fetch all collections
      const collections = ['students', 'activities', 'attendance'];
      const data: { [key: string]: any[] } = {};

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        data[collectionName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // Sort students by school and class
      data.students.sort((a, b) => {
        if (a.school === b.school) {
          return a.class.localeCompare(b.class);
        }
        return a.school.localeCompare(b.school);
      });

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();

      // Add each collection as a separate sheet
      for (const [collectionName, items] of Object.entries(data)) {
        const ws = XLSX.utils.json_to_sheet(items);
        XLSX.utils.book_append_sheet(wb, ws, collectionName);
      }

      // Save the file
      XLSX.writeFile(wb, 'database-export.xlsx');
      toast.success('Database esportato con successo');
    } catch (error) {
      console.error('Error exporting database:', error);
      toast.error('Errore durante l\'esportazione del database');
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExportDatabase}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Esporta Database
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`min-h-[120px] bg-white p-2 ${
              !isSameMonth(day, currentDate) 
                ? 'bg-gray-50 text-gray-400'
                : 'text-gray-900'} 
              ${notes[format(day, 'yyyy-MM-dd')] ? 'border-2 border-red-400' : 'border border-gray-200'}`}
          >
            <div
              className="flex justify-between items-start"
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                  isToday(day)
                    ? 'bg-blue-600 text-white rounded-full'
                    : ''
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex space-x-1">
                {notes[format(day, 'yyyy-MM-dd')] && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedDate(format(day, 'yyyy-MM-dd'));
                        setIsNoteModalOpen(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Modifica nota"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(notes[format(day, 'yyyy-MM-dd')].id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Elimina nota"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleAddNote(day)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Aggiungi nota"
                >
                  <StickyNote className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {getLessonsForDay(day).map((lesson) => (
                <div
                  key={lesson.id}
                  className={`px-2 py-1 text-xs rounded cursor-pointer ${
                    lesson.date.toDate() > new Date() ? 'bg-blue-100 text-blue-800'
                      : lesson.attendanceVerified ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                  onClick={() => onEditLesson(lesson)}
                >
                  <div>{lesson.startTime} - {lesson.endTime} ({Math.ceil(calculateLessonHours(lesson.startTime, lesson.endTime))} ore)</div>
                  <div className="text-xs opacity-75">{lesson.school} {lesson.class}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded ${
                      lesson.attendanceVerified 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {lesson.attendanceVerified ? 'Verificato' : 'Non Verificato'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick(lesson);
                    }}
                    className="w-full text-center bg-blue-200 hover:bg-blue-300 rounded px-2 py-0.5"
                  >
                    Presenze
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <DayNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedDate(null);
        }}
        onSave={handleSaveNote}
        initialContent={selectedDate ? notes[selectedDate]?.content || '' : ''}
        date={selectedDate ? new Date(selectedDate) : new Date()}
      />
    </div>
  );
}