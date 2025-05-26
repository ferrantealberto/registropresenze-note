import { useState } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { FileText, Printer, X, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import ActivityTable from './ActivityTable';
import { getActivities } from '../../lib/firebase-queries';

interface ActivitySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '90%',
    width: '1024px',
    maxHeight: '90vh',
    margin: '0 auto',
    padding: 0,
    border: 'none',
    borderRadius: '0.5rem',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column'
  }
};

export default function ActivitySummaryModal({ isOpen, onClose }: ActivitySummaryModalProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASC', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const fetchedActivities = await getActivities({
        period: 'all',
        startDate: new Date(selectedDate),
        endDate: new Date(selectedMonth),
        school: selectedSchool,
        class: selectedClass,
        sortDirection: 'asc'
      });

      setActivities(fetchedActivities);
      const total = fetchedActivities.reduce((sum, act) => sum + (act.hours || 0), 0);
      setTotalHours(total);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => document.getElementById('activity-summary-report'),
  });

  const handlePDF = async () => {
    const element = document.getElementById('activity-summary-report');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `riepilogo-attivita.pdf`,
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

  const handleExportExcel = () => {
    const exportData = activities.map(activity => ({
      Data: format(activity.date.toDate(), 'dd/MM/yyyy'),
      Scuola: activity.school,
      Classe: activity.class,
      'Ora Inizio': activity.startTime,
      'Ora Fine': activity.endTime,
      'Ore Totali': activity.hours,
      Descrizione: activity.description
    }));

    exportData.sort((a, b) => {
      const dateComparison = new Date(a.Data).getTime() - new Date(b.Data).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      const hoursComparison = b['Ore Totali'] - a['Ore Totali'];
      if (hoursComparison !== 0) return hoursComparison;
      
      return a.Scuola.localeCompare(b.Scuola);
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attività");

    const colWidths = [
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    const totalRow = {
      'Data': 'TOTALE',
      'Ore Totali': totalHours
    };
    XLSX.utils.sheet_add_json(ws, [totalRow], {
      skipHeader: true,
      origin: -1
    });

    XLSX.writeFile(wb, "riepilogo-attivita.xlsx");
  };

  const resetFilters = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
    setSelectedSchool('');
    setSelectedClass('');
    setShowResults(false);
  };

  const handleModalClose = () => {
    resetFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      style={modalStyles}
      contentLabel="Riepilogo Ore"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Riepilogo Ore</h2>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showResults ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scuola
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => {
                      setSelectedSchool(e.target.value);
                      setSelectedClass('');
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Tutte le scuole</option>
                    {schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={!selectedSchool}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Tutte le classi</option>
                    {selectedSchool &&
                      classes[selectedSchool as keyof typeof classes].map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div id="activity-summary-report">
              <div className="flex justify-between items-start mb-6">
                <img 
                  src="http://weblabfactory.it/logoregistroscuola.png" 
                  alt="Logo" 
                  style={{ width: '200px', objectFit: 'contain' }}
                  className="max-h-24"
                />
                <div className="text-right">
                  <h2 className="text-xl font-bold">Riepilogo Attività</h2>
                  <p className="text-gray-600 mt-2">Ore totali: {totalHours}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <ActivityTable activities={activities} />
                  
                  <div className="mt-12">
                    <p className="mb-2">Firma del Formatore/Operatore</p>
                    <img 
                      src="http://weblabfactory.it/lamiafirmapers24.png" 
                      alt="Firma" 
                      style={{ width: '200px', objectFit: 'contain' }}
                      className="max-h-16"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            {!showResults ? (
              <>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Reset
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Cerca
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Torna ai filtri
                </button>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </button>
                <button
                  onClick={handlePDF}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Stampa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}