import React, { useState, useEffect } from 'react';

const CustomModal = ({ isOpen, onClose, title, message, isPrompt, defaultValue, resolve }) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    setInputValue(defaultValue); // Reset input value when defaultValue changes
  }, [defaultValue]);

  if (!isOpen) return null;

  const handleOk = () => {
    if (resolve) {
      resolve(isPrompt ? inputValue : true);
    }
    onClose();
  };

  const handleCancel = () => {
    if (resolve) {
      resolve(false);
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isPrompt) { // Only close on overlay click for alerts (not prompts)
      handleCancel();
    }
  };

  return (
    <div className={`custom-modal fixed inset-0 flex items-center justify-center z-50 ${isOpen ? 'show' : ''}`} onClick={handleOverlayClick}>
      <div className="custom-modal-content w-full max-w-sm">
        <h3 id="modal-title" className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
        <p id="modal-message" className="text-gray-700 mb-6">{message}</p>
        {isPrompt && (
          <input
            type="text"
            id="modal-input"
            className="p-3 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 search-input"
            placeholder="Enter amount"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        )}
        <div className="flex justify-end space-x-3">
          {isPrompt && (
            <button id="modal-cancel-button" className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors btn-secondary" onClick={handleCancel}>Cancel</button>
          )}
          <button id="modal-ok-button" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors btn-primary" onClick={handleOk}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;