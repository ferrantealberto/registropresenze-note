import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { FileText, Printer, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface PrintRegistersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

// Set modal app element once
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

export default function PrintRegistersModal({ isOpen, onClose }: PrintRegistersModalProps) {
  const [loading, setLoading] = useState(false);
  const [registers, setRegisters] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'lessons'),
        where('attendanceVerified', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const fetchedRegisters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by date, school, and class
      fetchedRegisters.sort((a, b) => {
        const dateA = a.date.toDate();
        const dateB = b.date.toDate();
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        if (a.school !== b.school) {
          return a.school.localeCompare(b.school);
        }
        return a.class.localeCompare(b.class);
      });

      setRegisters(fetchedRegisters);
    } catch (error) {
      console.error('Error fetching registers:', error);
      toast.error('Errore nel recupero dei registri');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handlePrintSingle = async (register: any) => {
    const element = document.getElementById(`register-${register.id}`);
    if (!element) return;
    
    // Configure PDF options for A4 landscape

    const opt = {
      margin: [15, 10, 15, 10], // top, right, bottom, left margins in mm
      filename: `registro-${register.school}-${register.class}-${format(register.date.toDate(), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { 
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
        compress: true
      }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Errore nella generazione del PDF');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRegisters();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Stampa Registri"
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Printer className="h-6 w-6 mr-2" />
              Registri con Presenze Verificate
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : registers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nessun registro con presenze verificate trovato
            </div>
          ) : (
            <div ref={reportRef}>
              <div className="space-y-8">
                {registers.map((register) => (
                  <div
                    key={register.id}
                    id={`register-${register.id}`}
                    className="bg-white p-6"
                    style={{ width: '297mm', height: '210mm' }}
                  >
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
                            <span>REGISTRO GIORNALIERO - data: {format(register.date.toDate(), 'dd/MM/yyyy', { locale: it })}</span>
                            <span>DALLE ORE: {register.startTime}</span>
                            <span>ALLE ORE: {register.endTime}</span>
                            <span>CLASSE: {register.class}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="text-[11px]">Titolo prog.: <strong>S.E.M.E. 4.0 - Strategie Educative per Menti in Evoluzione</strong></div>
                        <div className="text-[11px]">Co. Prog.: 2022-STE-01208 - codice attività: 56144-338961</div>
                        <div className="text-[11px]">Attività: Laboratori di apprendimento collaborativo curriculari Agricoltura 4.0</div>
                      </div>
                    </div>
                    <div className="flex h-[calc(210mm-12rem)]">
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
                            {register.students?.map((student: any, index: number) => (
                              <tr key={student.id} className="border-b border-gray-300">
                                <td className="p-1 text-center border-r border-gray-300 text-sm">{index + 1}</td>
                                <td className="p-1 border-r border-gray-300 text-sm">{student.name}</td>
                                <td className="p-1 text-sm">{student.present ? 'Presente' : 'Assente'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="w-1/3">
                        <div className="h-full flex flex-col">
                          <div className="p-3 border-b border-gray-300">
                            <div className="font-bold text-sm mb-2">Attività Svolta</div>
                            <div className="text-sm min-h-[150px]">{register.activity?.description}</div>
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
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => handlePrintSingle(register)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}