import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        {children}
        <button
          onClick={onClose}
          className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
