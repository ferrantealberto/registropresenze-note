import { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, FileText, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ActivityFilters from './ActivityFilters';
import ActivityTable from './ActivityTable';
import { getActivities } from '../../lib/firebase-queries';
import { calculateRealHours } from '../../utils/timeCalculations';

interface ActivitySummaryProps {
  onClose: () => void;
}

export default function ActivitySummary({ onClose }: ActivitySummaryProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState({
    total: 0,
    week: 0,
    month: 0,
    real: 0
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const now = new Date();

      if (period === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else if (period === 'month') {
        const selectedDate = parse(selectedMonth, 'yyyy-MM', new Date());
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }

      const fetchedActivities = await getActivities({
        period,
        startDate,
        endDate,
        school: selectedSchool,
        class: selectedClass,
        sortDirection
      });

      setActivities(fetchedActivities);

      // Calculate total hours
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const weekHours = fetchedActivities
        .filter(act => {
          const actDate = act.date.toDate();
          return actDate >= weekStart && actDate <= weekEnd;
        })
        .reduce((sum, act) => sum + (act.hours || 0), 0);

      const monthHours = fetchedActivities
        .filter(act => {
          const actDate = act.date.toDate();
          return actDate >= monthStart && actDate <= monthEnd;
        })
        .reduce((sum, act) => sum + (act.hours || 0), 0);

      const totalAllHours = fetchedActivities.reduce((sum, act) => sum + (act.hours || 0), 0);
      const realHours = calculateRealHours(fetchedActivities);

      setTotalHours({
        total: totalAllHours,
        week: weekHours,
        month: monthHours,
        real: realHours
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Errore nel recupero delle attività');
      setActivities([]);
      setTotalHours({
        total: 0,
        week: 0,
        month: 0,
        real: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [period, selectedMonth, selectedSchool, selectedClass, sortDirection]);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const handlePDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `riepilogo-attivita-${period}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Errore nella generazione del PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Riepilogo Attività
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePDF}
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

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <ActivityFilters
              period={period}
              selectedMonth={selectedMonth}
              selectedSchool={selectedSchool}
              selectedClass={selectedClass}
              sortDirection={sortDirection}
              onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
              onMonthChange={setSelectedMonth}
              onSchoolChange={(school) => {
                setSelectedSchool(school);
                setSelectedClass('');
              }}
              onClassChange={setSelectedClass}
              onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            />

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div ref={reportRef}>
                <div className="flex justify-between items-start mb-6">
                  <img 
                    src="http://weblabfactory.it/logoregistroscuola.png" 
                    alt="Logo" 
                    style={{ width: '200px', objectFit: 'contain' }}
                    className="max-h-24"
                  />
                  <div className="text-right">
                    <h2 className="text-xl font-bold">Riepilogo Attività</h2>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">Ore di lezione: {totalHours.real.toFixed(1)}</p>
                      <p className="text-gray-600">Ore totali: {totalHours.total}</p>
                      <p className="text-gray-600">Ore questa settimana: {totalHours.week}</p>
                      <p className="text-gray-600">Ore questo mese: {totalHours.month}</p>
                    </div>
                  </div>
                </div>

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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}