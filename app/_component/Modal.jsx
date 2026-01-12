'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Overlay from './Overlay';

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState('');

  return (
    <ModalContext.Provider value={{ openName, setOpenName }}>{children}</ModalContext.Provider>
  );
}

function Window({ children, name }) {
  const { openName, setOpenName } = useContext(ModalContext);
  const ref = useRef();

  useEffect(() => {
    if (name !== openName) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenName('');
      }
    }

    // Use capture phase to catch clicks on the overlay first
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [setOpenName, name, openName]);

  if (name !== openName) return null;

  let enhancedChildren = children;
  if (React.isValidElement(children)) {
    enhancedChildren = React.cloneElement(children, {
      onClose: () => setOpenName(''),
    });
  }

  return createPortal(
    <Overlay view={name}>
      <div ref={ref} className="modal-window">
        {enhancedChildren}
      </div>
    </Overlay>,
    document.body
  );
}

function Open({ children, name }) {
  const { setOpenName } = useContext(ModalContext);

  if (!React.isValidElement(children)) {
    return children;
  }

  return React.cloneElement(children, {
    onClick: () => setOpenName(name),
  });
}

// Compound component pattern for cleaner usage
export { Modal, Open, Window };

