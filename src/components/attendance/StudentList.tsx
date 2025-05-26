import { FileText, Check, X } from 'lucide-react';

import { doc, updateDoc, addDoc, collection, query, where, getDocs, Timestamp, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

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
  date: string;
  school: string;
  class: string;
  attendanceVerified: boolean;
  onAttendanceVerifiedChange: (verified: boolean) => void;
  onAttendanceChange: (studentId: string) => void;
  onNotesClick: (studentId: string) => void;
}

export default function StudentList({
  students,
  attendanceMap,
  notesMap,
  date,
  school,
  class: className,
  attendanceVerified,
  onAttendanceVerifiedChange,
  onAttendanceChange,
  onNotesClick,
}: StudentListProps) {
  const handleVerificationChange = async (isChecked: boolean) => {
    try {
      onAttendanceVerifiedChange(isChecked);
      
      // Get current lesson document
      const lessonQuery = query(
        collection(db, 'lessons'),
        where('date', '==', new Date(date)),
        where('school', '==', school),
        where('class', '==', className)
      );
      const lessonSnapshot = await getDocs(lessonQuery);
      if (lessonSnapshot.empty) {
        throw new Error('Lezione non trovata');
      }
      
      const lessonDoc = lessonSnapshot.docs[0];
      const lessonId = lessonDoc.id;
      
      const batch = writeBatch(db);
      const now = new Date();
      
      const verificationData = {
        attendanceVerified: isChecked,
        verifiedAt: now,
        verifiedBy: auth.currentUser?.email || null,
        timestamp: serverTimestamp()
      };

      // Update lesson document
      const lessonRef = doc(db, 'lessons', lessonId);
      batch.update(lessonRef, verificationData);
        
      // Add verification record
      const verificationRef = doc(collection(db, 'attendance'));
      batch.set(verificationRef, {
        lessonId,
        date: new Date(date),
        school: school,
        class: className,
        verified: isChecked,
        verifiedAt: now,
        verifiedBy: auth.currentUser?.email || null,
        type: 'verification',
        timestamp: serverTimestamp()
      });
        
      // Update all attendance records for this lesson
      const attendanceRef = query(
        collection(db, 'attendance'),
        where('date', '==', new Date(date)),
        where('school', '==', school),
        where('class', '==', className)
      );
      const attendanceSnapshot = await getDocs(attendanceRef);
        
      attendanceSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          verified: isChecked,
          verifiedAt: isChecked ? now : null,
          verifiedBy: auth.currentUser?.email || null,
          timestamp: serverTimestamp(),
          attendanceVerified: isChecked
        });
      });

      // Commit all changes atomically
      await batch.commit();
      
      toast.success(isChecked ? 'Presenze verificate con successo' : 'Verifica presenze rimossa');
    } catch (err) {
      console.error('Error updating attendance verification:', err);
      toast.error('Errore durante l\'aggiornamento della verifica');
      onAttendanceVerifiedChange(!isChecked);
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={attendanceVerified}
            onChange={(e) => handleVerificationChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-700">
            Presenze Verificate: <span className={attendanceVerified ? 'text-green-600' : 'text-orange-600'}>{attendanceVerified ? 'Sì' : 'No'}</span>
          </span>
        </label>
      </div>
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
    </div>
  );
}