import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { School } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      // Handle different Firebase auth errors
      let errorMessage = 'Accesso fallito. Controlla le tue credenziali.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Utente non registrato. Contatta l\'amministratore per ottenere l\'accesso.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Password non corretta.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Indirizzo email non valido.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Troppi tentativi di accesso. Riprova più tardi.';
      }

      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #F87171',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <School className="w-16 h-16 text-blue-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Sistema Presenze</h1>
          <p className="text-gray-600">Accedi per continuare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}