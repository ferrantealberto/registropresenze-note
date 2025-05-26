import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lista dei file e cartelle da includere nell'esportazione
const filesToInclude = [
  'src',
  'public',
  'index.html',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'postcss.config.js',
  'tailwind.config.js',
  'README.md'
];

// Funzione per copiare ricorsivamente una directory
async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    await Promise.all(entries.map(async (entry) => {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }));
  } catch (error) {
    console.error(`Error copying directory ${src}:`, error);
  }
}

async function exportApp() {
  const exportDir = 'school-attendance-system';

  try {
    // Crea la cartella di esportazione
    await fs.mkdir(exportDir, { recursive: true });

    // Copia tutti i file necessari
    await Promise.all(filesToInclude.map(async (file) => {
      const srcPath = join(__dirname, file);
      const destPath = join(exportDir, file);
      
      try {
        const stats = await fs.stat(srcPath);
        if (stats.isDirectory()) {
          await copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Error processing ${file}:`, error);
        }
      }
    }));

    // Crea il file README con le istruzioni
    const readmeContent = `# Sistema di Gestione Presenze Scuola

## Installazione

1. Clona o scarica questa repository
2. Installa le dipendenze:
   \`\`\`bash
   npm install
   \`\`\`

## Configurazione Firebase

1. Crea un nuovo progetto su Firebase Console
2. Copia le credenziali del tuo progetto
3. Aggiorna il file \`src/lib/firebase.ts\` con le tue credenziali

## Avvio dell'applicazione

Per avviare l'applicazione in modalità sviluppo:
\`\`\`bash
npm run dev
\`\`\`

Per buildare l'applicazione per la produzione:
\`\`\`bash
npm run build
\`\`\`

## Deployment

1. Esegui il build dell'applicazione
2. Carica la cartella \`dist\` sul tuo server web
3. Configura il server per gestire il routing client-side

## Funzionalità

- Gestione presenze studenti
- Registro attività
- Generazione report
- Esportazione PDF
- Gestione multi-classe e multi-scuola

## Licenza

MIT
`;

    await fs.writeFile(join(exportDir, 'README.md'), readmeContent);
    console.log('Esportazione completata nella cartella:', exportDir);
  } catch (error) {
    console.error('Errore durante l\'esportazione:', error);
  }
}

exportApp();