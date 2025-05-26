import Modal from 'react-modal';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  currentNote: string;
  onChange: (note: string) => void;
}

Modal.setAppElement('#root');

export default function NotesModal({
  isOpen,
  onClose,
  onSave,
  currentNote,
  onChange,
}: NotesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-96"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-lg font-medium mb-4">Note Studente</h2>
      <textarea
        value={currentNote}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 p-2 border rounded-md mb-4"
        placeholder="Inserisci una nota..."
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Annulla
        </button>
        <button
          onClick={() => onSave(currentNote)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Salva
        </button>
      </div>
    </Modal>
  );
}