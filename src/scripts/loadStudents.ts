import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const students = [
  // 4BX Falcone
  { name: 'Carrino Simone', class: '4BX', school: 'Falcone' },
  { name: 'Coppola Christian', class: '4BX', school: 'Falcone' },
  { name: 'De Falco Giovanni', class: '4BX', school: 'Falcone' },
  { name: 'Di Lauro Nicola', class: '4BX', school: 'Falcone' },
  { name: 'Di Marino Antonio', class: '4BX', school: 'Falcone' },
  { name: 'Di Napoli Giuseppe', class: '4BX', school: 'Falcone' },
  { name: 'Giordano Antonino', class: '4BX', school: 'Falcone' },
  { name: 'Giuffreda Raffaele', class: '4BX', school: 'Falcone' },
  { name: 'Marchetti Luigi', class: '4BX', school: 'Falcone' },
  { name: 'Napolitano Antonio', class: '4BX', school: 'Falcone' },
  { name: 'Pagliaro Marco', class: '4BX', school: 'Falcone' },
  { name: 'Palmentieri Michele', class: '4BX', school: 'Falcone' },
  { name: 'Perna Matteo', class: '4BX', school: 'Falcone' },
  { name: 'Pirillo Emanuele', class: '4BX', school: 'Falcone' },
  { name: 'Quaranta Francesco', class: '4BX', school: 'Falcone' },
  { name: 'Simeoli Gennaro', class: '4BX', school: 'Falcone' },

  // 4FSA Pitagora
  { name: 'Aracri Fabiola', class: '4FSA', school: 'Pitagora' },
  { name: 'Aresini Manuela Raffaela', class: '4FSA', school: 'Pitagora' },
  { name: 'Bellucci Andrea', class: '4FSA', school: 'Pitagora' },
  { name: 'Benvenuto Sara', class: '4FSA', school: 'Pitagora' },
  { name: 'Botte Anita', class: '4FSA', school: 'Pitagora' },
  { name: 'Castiglia Beatrice Iris', class: '4FSA', school: 'Pitagora' },
  { name: 'Cozzolino Michele', class: '4FSA', school: 'Pitagora' },
  { name: "D'Agostino Giuliano", class: '4FSA', school: 'Pitagora' },
  { name: 'Disanto Luca', class: '4FSA', school: 'Pitagora' },
  { name: 'Del Giudice Lorenzo', class: '4FSA', school: 'Pitagora' },
  { name: 'Della Valle Siria', class: '4FSA', school: 'Pitagora' },
  { name: 'Festevole Michele', class: '4FSA', school: 'Pitagora' },
  { name: 'Garofalo Fabiana', class: '4FSA', school: 'Pitagora' },
  { name: 'Grande Giuliana Rita', class: '4FSA', school: 'Pitagora' },
  { name: 'Leandro Mattia Paolo', class: '4FSA', school: 'Pitagora' },
  { name: 'Matarese Nicholas', class: '4FSA', school: 'Pitagora' },
  { name: 'Maturo Emanuele Vittorio', class: '4FSA', school: 'Pitagora' },
  { name: 'Opera Davide', class: '4FSA', school: 'Pitagora' },
  { name: 'Palumbo Luca', class: '4FSA', school: 'Pitagora' },
  { name: 'Paparone Gianmarco', class: '4FSA', school: 'Pitagora' },
  { name: 'Rotta Matteo', class: '4FSA', school: 'Pitagora' },
  { name: 'Scamardella Emanuele', class: '4FSA', school: 'Pitagora' },
  { name: 'Schiano Di Cola Luigi', class: '4FSA', school: 'Pitagora' },
  { name: 'Schupffer Christian', class: '4FSA', school: 'Pitagora' },

  // 4ASA Pitagora
  { name: 'Cegara Alessandro', class: '4ASA', school: 'Pitagora' },
  { name: 'Citoila Rebecca', class: '4ASA', school: 'Pitagora' },
  { name: 'Di Santo Alessandro', class: '4ASA', school: 'Pitagora' },
  { name: 'Esposito Maria Giulia', class: '4ASA', school: 'Pitagora' },
  { name: 'Gaeta Giulia', class: '4ASA', school: 'Pitagora' },
  { name: 'La Motta Daniele', class: '4ASA', school: 'Pitagora' },
  { name: 'Lemma Carolina', class: '4ASA', school: 'Pitagora' },
  { name: 'Lubrano Lavadera Lavinia', class: '4ASA', school: 'Pitagora' },
  { name: 'Massa Leonardo', class: '4ASA', school: 'Pitagora' },
  { name: 'Massa Luigi', class: '4ASA', school: 'Pitagora' },
  { name: 'Mazzella Di Ciearo Daniele', class: '4ASA', school: 'Pitagora' },
  { name: 'Merone Carmen', class: '4ASA', school: 'Pitagora' },
  { name: 'Musiello Ilaria', class: '4ASA', school: 'Pitagora' },
  { name: 'Nuzzole Aldo', class: '4ASA', school: 'Pitagora' },
  { name: 'Risi Ilaria', class: '4ASA', school: 'Pitagora' },
  { name: 'Romano Sara', class: '4ASA', school: 'Pitagora' },
  { name: 'Sciamardella Jacopo', class: '4ASA', school: 'Pitagora' },
  { name: 'Scotto Di Carlo Andrea', class: '4ASA', school: 'Pitagora' },
  { name: 'Scotto Di Carlo Daniele', class: '4ASA', school: 'Pitagora' },
  { name: 'Vitiello Carmen', class: '4ASA', school: 'Pitagora' },
  { name: 'Zito Ilaria', class: '4ASA', school: 'Pitagora' },

  // 4C Pitagora
  { name: 'Avino Thomas Pio', class: '4C', school: 'Pitagora' },
  { name: 'Basile Manuel', class: '4C', school: 'Pitagora' },
  { name: 'Broscritto Francesco', class: '4C', school: 'Pitagora' },
  { name: 'Cetrangolo Cristian', class: '4C', school: 'Pitagora' },
  { name: 'Costagliola Matteo', class: '4C', school: 'Pitagora' },
  { name: 'Cotumaccio Antonio', class: '4C', school: 'Pitagora' },
  { name: "Dell'Annunziata Mattia", class: '4C', school: 'Pitagora' },
  { name: 'Di Falco Luigi', class: '4C', school: 'Pitagora' },
  { name: 'Esposito Fabio Massimiliano', class: '4C', school: 'Pitagora' },
  { name: 'Giancola Mattia', class: '4C', school: 'Pitagora' },
  { name: 'Grieco Massimo Domenico', class: '4C', school: 'Pitagora' },
  { name: 'Gritto Salvatore Pio', class: '4C', school: 'Pitagora' },
  { name: 'Quinto Christian', class: '4C', school: 'Pitagora' },
  { name: 'Schiraldi Francesco', class: '4C', school: 'Pitagora' },
  { name: 'Tortora Michele', class: '4C', school: 'Pitagora' },
  { name: 'Verola Salvatore', class: '4C', school: 'Pitagora' },
  { name: 'Volpe Christian', class: '4C', school: 'Pitagora' },
  { name: 'Volpe Gabriel', class: '4C', school: 'Pitagora' },

  // 4AX Falcone
  { name: 'Chiaro', class: '4AX', school: 'Falcone' },
  { name: 'Cianciulli', class: '4AX', school: 'Falcone' },
  { name: 'Ciniglio', class: '4AX', school: 'Falcone' },
  { name: 'Coccia', class: '4AX', school: 'Falcone' },
  { name: 'Daniele', class: '4AX', school: 'Falcone' },
  { name: 'De Falco', class: '4AX', school: 'Falcone' },
  { name: 'De Mari', class: '4AX', school: 'Falcone' },
  { name: 'De Rosa', class: '4AX', school: 'Falcone' },
  { name: 'De Vivo', class: '4AX', school: 'Falcone' },
  { name: 'Di Costanzo', class: '4AX', school: 'Falcone' },
  { name: "D'Oriano", class: '4AX', school: 'Falcone' },
  { name: 'Gallo', class: '4AX', school: 'Falcone' },
  { name: 'Licciardi', class: '4AX', school: 'Falcone' },
  { name: 'Lucignano', class: '4AX', school: 'Falcone' },
  { name: 'Oterbo', class: '4AX', school: 'Falcone' },
  { name: 'Scotti Covella', class: '4AX', school: 'Falcone' },

  // 4DSA Pitagora (dummy data as requested)
  { name: 'Alessandro Rossi', class: '4DSA', school: 'Pitagora' },
  { name: 'Marco Bianchi', class: '4DSA', school: 'Pitagora' },
  { name: 'Giuseppe Verdi', class: '4DSA', school: 'Pitagora' },
  { name: 'Francesca Romano', class: '4DSA', school: 'Pitagora' },
  { name: 'Laura Conti', class: '4DSA', school: 'Pitagora' },
  { name: 'Andrea Moretti', class: '4DSA', school: 'Pitagora' },
  { name: 'Sofia Ricci', class: '4DSA', school: 'Pitagora' },
  { name: 'Luca Ferrari', class: '4DSA', school: 'Pitagora' },
  { name: 'Elena Costa', class: '4DSA', school: 'Pitagora' },
  { name: 'Davide Marino', class: '4DSA', school: 'Pitagora' },
  { name: 'Chiara Greco', class: '4DSA', school: 'Pitagora' },
  { name: 'Matteo Bruno', class: '4DSA', school: 'Pitagora' },
  { name: 'Valentina Leone', class: '4DSA', school: 'Pitagora' },
  { name: 'Roberto Galli', class: '4DSA', school: 'Pitagora' },
  { name: 'Martina Serra', class: '4DSA', school: 'Pitagora' },
];

async function loadStudents() {
  try {
    for (const student of students) {
      await addDoc(collection(db, 'students'), student);
      console.log(`Added student: ${student.name}`);
    }
    console.log('All students have been loaded successfully!');
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

loadStudents();