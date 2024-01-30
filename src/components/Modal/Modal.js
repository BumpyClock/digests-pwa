// Modal.js
import React, { useEffect, useRef } from "react";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import "./Modal.css"; // Your CSS file for Modal styling

const Modal = ({ children, visible, onClose }) => {
  const modalRef = useRef(null);
  const childRef = useRef(null);

  useEffect(
    () => {
      function handleClickOutside(event) {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    },
    [onClose]
  );

  return (
    <SlAnimation name="fade-in" duration={500} play={children !== null}>
      <div className="modal-container visible" ref={modalRef}>
        <div className="modal-container-content" ref={childRef}>
          {" "}{children}
        </div>
      </div>
    </SlAnimation>
  );
};

export default Modal;
