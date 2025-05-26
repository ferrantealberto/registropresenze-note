# Sistema di Gestione Presenze Scuola

## Installazione

1. Clona o scarica questa repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```

## Configurazione Firebase

1. Crea un nuovo progetto su Firebase Console
2. Copia le credenziali del tuo progetto
3. Aggiorna il file `src/lib/firebase.ts` con le tue credenziali

## Avvio dell'applicazione

Per avviare l'applicazione in modalità sviluppo:
```bash
npm run dev
```

Per buildare l'applicazione per la produzione:
```bash
npm run build
```

## Deployment

1. Esegui il build dell'applicazione
2. Carica la cartella `dist` sul tuo server web
3. Configura il server per gestire il routing client-side

## Funzionalità

- Gestione presenze studenti
- Registro attività
- Generazione report
- Esportazione PDF
- Gestione multi-classe e multi-scuola

## Licenza

MIT
