import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { doc, updateDoc } from 'firebase/firestore'; 
import { differenceInMinutes } from 'date-fns';
import { db } from '../../lib/firebase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: any;
  onLessonUpdated: () => void;
}

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1001
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90%',
    width: '500px',
    padding: 0,
    border: 'none',
    borderRadius: '0.5rem',
    background: '#fff'
  }
};

// Set modal app element once
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

export default function EditLessonModal({ isOpen, onClose, lesson, onLessonUpdated }: EditLessonModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [school, setSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [hours, setHours] = useState<number>(4);
  const [isManualHours, setIsManualHours] = useState(false);
  const [attendanceVerified, setAttendanceVerified] = useState(false);

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASA', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  useEffect(() => {
    if (lesson) {
      const lessonDate = lesson.date?.toDate();
      setDate(lessonDate ? format(lessonDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setStartTime(lesson.startTime || '08:00');
      setEndTime(lesson.endTime || '12:00');
      setSchool(lesson.school || '');
      setSelectedClass(lesson.class || '');
      setHours(lesson.hours || 4);
      setAttendanceVerified(Boolean(lesson.attendanceVerified));
    }
  }, [lesson]);

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startDate = new Date(2000, 0, 1, startHour, startMinute);
    const endDate = new Date(2000, 0, 1, endHour, endMinute);
    
    const diffMinutes = differenceInMinutes(endDate, startDate);
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  useEffect(() => {
    if (!isManualHours) {
      const calculatedHours = calculateHours(startTime, endTime);
      setHours(calculatedHours);
    }
  }, [startTime, endTime, isManualHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime || !school || !selectedClass) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      await updateDoc(doc(db, 'lessons', lesson.id), {
        date: date ? new Date(date) : new Date(),
        startTime,
        endTime,
        school,
        class: selectedClass,
        hours: Number(hours.toFixed(2)),
        attendanceVerified
      });

      toast.success('Lezione aggiornata con successo');
      onLessonUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Errore durante l\'aggiornamento della lezione');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}>
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Modifica Lezione
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              type="button"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ora Inizio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ora Fine <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ore {!isManualHours && <span className="text-xs text-gray-500">(calcolate automaticamente)</span>}
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                value={hours}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0) {
                    setHours(value);
                    setIsManualHours(true);
                  }
                }}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isManualHours ? 'border-yellow-500' : 'border-gray-300'
                }`}
                required
                min="0.01"
                step="0.01"
                title={isManualHours ? 'Valore inserito manualmente' : 'Valore calcolato automaticamente'}
              />
              <button
                type="button"
                onClick={() => {
                  setIsManualHours(!isManualHours);
                  if (!isManualHours) {
                    const calculatedHours = calculateHours(startTime, endTime);
                    setHours(calculatedHours);
                  }
                }}
                className="absolute right-2 top-2 text-xs text-blue-600 hover:text-blue-800"
              >
                {isManualHours ? 'Calcola' : 'Modifica'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isManualHours 
                ? 'Modalità manuale: inserisci il numero di ore desiderato' 
                : `Calcolato da ${startTime} a ${endTime}`}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Presenze Verificate
            </label>
            <div className="mt-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={attendanceVerified}
                  onChange={(e) => setAttendanceVerified(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  {attendanceVerified ? 'Sì' : 'No'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scuola <span className="text-red-500">*</span>
            </label>
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setSelectedClass('');
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleziona una scuola</option>
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleziona una classe</option>
              {school &&
                classes[school as keyof typeof classes].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}