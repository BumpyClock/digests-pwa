import React, { useEffect, useRef } from "react";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import "./Modal.css"; // Your CSS file for Modal styling

/**
 * @component
 * @param {object} props - The component props.
 * @param {JSX.Element} props.children - The content to be displayed inside the modal.
 * @param {boolean} props.visible - Whether the modal is visible or not.
 * @param {function} props.onRequestClose - The function to be called when the modal is requested to be closed.
 * @param {React.RefObject} props.modalRef - A ref to the modal container element.
 * @returns {JSX.Element} The ModalDialog component.
 * @description A modal dialog component that can be used to display content in an overlay.
 */
const ModalDialog = ({ children, visible, onRequestClose, modalRef }) => {
  const childRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (childRef.current && !childRef.current.contains(event.target)) {
        onRequestClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onRequestClose]);

  return (
    <SlAnimation name={visible ? "fade-in" : "fade-out"} duration={125} play={visible}>
      <div
        className={`modal-container ${visible ? 'visible' : ''}`}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-content"
        tabIndex="-1"
        ref={modalRef}
      >
        <div className="modal-container-content" ref={childRef} id="modal-content">
          {children}
        </div>
      </div>
    </SlAnimation>
  );
};

export default ModalDialog;