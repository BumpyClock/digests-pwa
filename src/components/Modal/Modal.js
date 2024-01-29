import React, { useEffect, useRef, useCallback } from "react";
import "./Modal.css"; // Your CSS file for Modal styling

const Modal = ({ children, onClose }) => {
  const modalRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

    // Event listener for click outside
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      // Re-enable background scrolling
      document.body.style.overflow = "";
    };
  }, [handleClickOutside]);

  return (
    <div className="modal-container" ref={modalRef}>
      {children}
    </div>
  );
};

export default Modal;
