import { useState } from 'react';
import Modal from 'react-modal';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { differenceInHours } from 'date-fns';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonAdded: () => void;
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

export default function AddLessonModal({ isOpen, onClose, onLessonAdded }: AddLessonModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [school, setSchool] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [attendanceVerified, setAttendanceVerified] = useState(false);

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASA', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  const calculateHours = () => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const start = new Date(2000, 0, 1, startHour, startMinute);
    const end = new Date(2000, 0, 1, endHour, endMinute);
    
    const hours = Math.max(0, differenceInHours(end, start));
    return Number(hours.toFixed(2));
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime || !school) {
      toast.error('Compila i campi obbligatori (data, orari e scuola)');
      return;
    }

    try {
      const hours = calculateHours();
      const classesToSave = selectedClasses.length > 0 ? selectedClasses : [''];

      for (const className of classesToSave) {
        await addDoc(collection(db, 'lessons'), {
          date: new Date(date),
          startTime,
          endTime,
          school,
          attendanceVerified,
          class: className,
          hours,
          completed: false
        });
      }

      toast.success('Lezione aggiunta con successo');
      onLessonAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast.error('Errore durante l\'aggiunta della lezione');
    }
  };

  const handleClose = () => {
    setDate('');
    setStartTime('08:00');
    setEndTime('12:00');
    setSchool('');
    setSelectedClasses([]);
    setAttendanceVerified(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyles}
      contentLabel="Aggiungi Lezione"
    >
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Aggiungi Lezione
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full"
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
              Ore calcolate
            </label>
            <input
              type="number"
              value={calculateHours()}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scuola <span className="text-red-500">*</span>
            </label>
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setSelectedClasses([]);
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

          {school && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classi
              </label>
              <div className="space-y-2">
                {classes[school as keyof typeof classes].map((cls) => (
                  <label key={cls} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls)}
                      onChange={() => handleClassToggle(cls)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cls}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={attendanceVerified}
                onChange={() => setAttendanceVerified(!attendanceVerified)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Verifica Presenze</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
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