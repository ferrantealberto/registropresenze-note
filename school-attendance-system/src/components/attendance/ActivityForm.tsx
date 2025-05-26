import { useState, useEffect } from 'react';
import { differenceInHours } from 'date-fns';
import toast from 'react-hot-toast';
import { Edit2, Save, X } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Activity {
  id?: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface ActivityFormProps {
  onSave: (activity: {
    description: string;
    startTime: string;
    endTime: string;
    hours: number;
  }) => void;
  currentActivity?: Activity | null;
}

export default function ActivityForm({ onSave, currentActivity }: ActivityFormProps) {
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentActivity) {
      setDescription(currentActivity.description);
      setStartTime(currentActivity.startTime);
      setEndTime(currentActivity.endTime);
    }
  }, [currentActivity]);

  const calculateHours = () => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.max(0, differenceInHours(end, start));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Inserisci una descrizione dell\'attività');
      return;
    }

    try {
      const activityData = {
        description,
        startTime,
        endTime,
        hours: calculateHours(),
      };

      if (isEditing && currentActivity?.id) {
        await updateDoc(doc(db, 'activities', currentActivity.id), activityData);
        toast.success('Attività aggiornata con successo');
      } else {
        await onSave(activityData);
        toast.success('Attività salvata con successo');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Errore durante il salvataggio dell\'attività');
    }
  };

  const handleDelete = async () => {
    if (!currentActivity?.id) return;

    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      try {
        await deleteDoc(doc(db, 'activities', currentActivity.id));
        toast.success('Attività eliminata con successo');
        resetForm();
      } catch (error) {
        toast.error('Errore durante l\'eliminazione dell\'attività');
      }
    }
  };

  const resetForm = () => {
    setDescription('');
    setStartTime('08:00');
    setEndTime('12:00');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Dettagli Attività</h4>
        {currentActivity && !isEditing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Modifica
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrizione Attività</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            rows={3}
            disabled={currentActivity && !isEditing}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ora Inizio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled={currentActivity && !isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ora Fine</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled={currentActivity && !isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ore Totali</label>
            <input
              type="text"
              value={calculateHours()}
              readOnly
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          {(!currentActivity || isEditing) && (
            <>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Aggiorna' : 'Salva'} Attività
              </button>
              {isEditing && (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annulla
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Elimina
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}