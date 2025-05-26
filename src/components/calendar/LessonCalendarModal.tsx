import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { format, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, List, FileText, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddLessonModal from './AddLessonModal';
import EditLessonModal from './EditLessonModal';
import CalendarView from './CalendarView';
import ListView from './ListView';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';

interface LessonCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90%',
    width: '1200px',
    maxHeight: '90vh',
    padding: 0,
    border: 'none',
    borderRadius: '0.5rem',
    background: '#fff'
  }
};

const schools = {
  Pitagora: ['4ASA', '4FSA', '4C', '4A'],
  Falcone: ['4AX', '4BX']
};

export default function LessonCalendarModal({ isOpen, onClose }: LessonCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showEditLesson, setShowEditLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [totalCompletedHours, setTotalCompletedHours] = useState(0);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const q = query(
        collection(db, 'lessons'),
        where('date', '>=', monthStart),
        where('date', '<=', monthEnd)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedLessons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLessons(fetchedLessons);

      const completedHours = fetchedLessons
        .filter(lesson => lesson.completed)
        .reduce((total, lesson) => total + (lesson.hours || 0), 0);
      
      setTotalCompletedHours(Math.ceil(completedHours));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Errore nel recupero delle lezioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
    }
  }, [currentDate, isOpen]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrint = useReactToPrint({
    content: () => document.getElementById('lesson-calendar-content'),
  });

  const handlePDF = async () => {
    const element = document.getElementById('lesson-calendar-content');
    if (!element) return;
    const opt = {
      margin: 1,
      filename: `calendario-lezioni-${format(currentDate, 'MMMM-yyyy', { locale: it })}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Errore nella generazione del PDF');
    }
  };

  const handleLessonClick = (lesson: any) => {
    try {
      const date = format(lesson.date.toDate(), 'yyyy-MM-dd');
      // Include startTime and endTime in URL parameters
      const searchParams = new URLSearchParams({
        date,
        school: lesson.school,
        class: lesson.class,
        startTime: lesson.startTime,
        endTime: lesson.endTime
      }).toString();
      
      window.history.pushState({}, '', `/?${searchParams}`);
      window.dispatchEvent(new Event('popstate'));
      onClose();
    } catch (error) {
      console.error('Error navigating to lesson:', error);
      toast.error('Errore durante la navigazione');
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Calendario Lezioni"
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Calendario Lezioni
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-lg font-medium">
                  {format(currentDate, 'MMMM yyyy', { locale: it })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-md ${
                  viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={handlePDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Salva PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Stampa
              </button>
              <button
                onClick={() => setShowAddLesson(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Lezione
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto" id="lesson-calendar-content">
          {viewMode === 'calendar' ? (
            <CalendarView
              currentDate={currentDate}
              lessons={lessons}
              onEditLesson={(lesson) => {
                setSelectedLesson(lesson);
                setShowEditLesson(true);
              }}
              onLessonClick={handleLessonClick}
            />
          ) : (
            <ListView
              lessons={lessons}
              onLessonClick={handleLessonClick}
              totalCompletedHours={totalCompletedHours}
              onEditLesson={(lesson) => {
                setSelectedLesson(lesson);
                setShowEditLesson(true);
              }}
              onLessonUpdated={fetchLessons}
            />
          )}
        </div>

        <AddLessonModal
          isOpen={showAddLesson}
          onClose={() => setShowAddLesson(false)}
          onLessonAdded={() => {
            fetchLessons();
            setShowAddLesson(false);
          }}
        />

        {selectedLesson && (
          <EditLessonModal
            isOpen={showEditLesson}
            onClose={() => {
              setShowEditLesson(false);
              setSelectedLesson(null);
            }}
            lesson={selectedLesson}
            onLessonUpdated={() => {
              fetchLessons();
              setShowEditLesson(false);
              setSelectedLesson(null);
            }}
          />
        )}
      </div>
    </Modal>
  );
}