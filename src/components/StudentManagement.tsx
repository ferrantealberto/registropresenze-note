import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Trash2, Plus, ArrowLeft, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
}

export default function StudentManagement() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const navigate = useNavigate();

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASA', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  useEffect(() => {
    if (selectedSchool && selectedClass) {
      fetchStudents();
    }
  }, [selectedSchool, selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'students'),
        where('school', '==', selectedSchool),
        where('class', '==', selectedClass)
      );
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      setStudents(studentsList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Errore nel recupero degli studenti');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedSchool || !selectedClass) {
      toast.error('Inserisci tutti i campi richiesti');
      return;
    }

    try {
      await addDoc(collection(db, 'students'), {
        name: newStudentName.trim(),
        school: selectedSchool,
        class: selectedClass
      });
      setNewStudentName('');
      toast.success('Studente aggiunto con successo');
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Errore durante l\'aggiunta dello studente');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo studente?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'students', studentId));
      toast.success('Studente eliminato con successo');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Errore durante l\'eliminazione dello studente');
    }
  };

  const handleEditStart = (student: Student) => {
    setEditingStudent(student.id);
    setEditedName(student.name);
  };

  const handleEditCancel = () => {
    setEditingStudent(null);
    setEditedName('');
  };

  const handleEditSave = async (studentId: string) => {
    if (!editedName.trim()) {
      toast.error('Il nome non può essere vuoto');
      return;
    }

    try {
      await updateDoc(doc(db, 'students', studentId), {
        name: editedName.trim()
      });
      toast.success('Nome studente aggiornato con successo');
      setEditingStudent(null);
      setEditedName('');
      fetchStudents();
    } catch (error) {
      console.error('Error updating student name:', error);
      toast.error('Errore durante l\'aggiornamento del nome');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestione Studenti
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scuola
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedClass('');
                    setStudents([]);
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleziona una scuola</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Classe
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setStudents([]);
                  }}
                  disabled={!selectedSchool}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleziona una classe</option>
                  {selectedSchool &&
                    classes[selectedSchool as keyof typeof classes].map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                </select>
              </div>

              {selectedSchool && selectedClass && (
                <form onSubmit={handleAddStudent} className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700">
                      Nuovo Studente
                    </label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Nome e Cognome"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </button>
                </form>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : selectedSchool && selectedClass ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Studenti di {selectedClass} - {selectedSchool}
                </h3>
                {students.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <li
                        key={student.id}
                        className="py-4 flex items-center justify-between"
                        title="Clicca sull'icona della matita per modificare il nome"
                      >
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          {editingStudent === student.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="px-2 py-1 border rounded-md text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditSave(student.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Salva"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="text-gray-600 hover:text-gray-700"
                                title="Annulla"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {student.name}
                              </span>
                              <button
                                onClick={() => handleEditStart(student)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Modifica nome"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingStudent !== student.id && (
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina studente"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nessuno studente trovato in questa classe
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Seleziona una scuola e una classe per visualizzare gli studenti
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}