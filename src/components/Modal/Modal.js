import React, { useEffect, useRef, useState } from "react";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import "./Modal.css"; // Your CSS file for Modal styling

const Modal = ({ children, visible, onClose }) => {
  const modalRef = useRef(null);
  const childRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(visible);
  }, [visible]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (childRef.current && !childRef.current.contains(event.target)) {
        setIsAnimating(false);
        setTimeout(onClose, 125); // Delay onClose until the animation finishes
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  //Handle escape key event
  useEffect(() => {
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsAnimating(false);
      setTimeout(onClose, 125); // Delay onClose until the animation finishes
    }
  }

  // Bind the event listener
  document.addEventListener('keydown', handleKeyDown);
  return () => {
    // Unbind the event listener on clean up
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [onClose]);

  return (
    <SlAnimation name={visible ? "fade-in" : "fade-out"} duration={125} play={isAnimating}>
      <div className="modal-container visible" ref={modalRef}>
        <div className="modal-container-content" ref={childRef}>
          {children}
        </div>
      </div>
    </SlAnimation>
  );
};

export default Modal;