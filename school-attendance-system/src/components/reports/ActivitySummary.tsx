import { useState, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, FileText, Printer } from 'lucide-react';

interface ActivitySummaryProps {
  onClose: () => void;
}

export default function ActivitySummary({ onClose }: ActivitySummaryProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async (periodType: 'week' | 'month' | 'all') => {
    setLoading(true);
    try {
      let startDate, endDate;
      const now = new Date();

      if (periodType === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else if (periodType === 'month') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      let q;
      if (periodType === 'all') {
        q = query(collection(db, 'activities'));
      } else {
        q = query(
          collection(db, 'activities'),
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedActivities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setActivities(fetchedActivities);
      const total = fetchedActivities.reduce((sum, act) => sum + (act.hours || 0), 0);
      setTotalHours(total);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  useState(() => {
    fetchActivities('week');
  }, []);

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
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => {
                  setPeriod('week');
                  fetchActivities('week');
                }}
                className={`px-4 py-2 rounded-md ${
                  period === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Settimana
              </button>
              <button
                onClick={() => {
                  setPeriod('month');
                  fetchActivities('month');
                }}
                className={`px-4 py-2 rounded-md ${
                  period === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mese
              </button>
              <button
                onClick={() => {
                  setPeriod('all');
                  fetchActivities('all');
                }}
                className={`px-4 py-2 rounded-md ${
                  period === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tutte
              </button>
            </div>

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
                    <p className="text-gray-600">Ore totali: {totalHours}</p>
                  </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scuola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attività
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ore
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(activity.date.toDate(), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.school}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.class}
                        </td>
                        <td className="px-6 py-4">
                          {activity.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.startTime} - {activity.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.hours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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