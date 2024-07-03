import React, { useState } from "react"
import "./Modal.scss"

function Modal({ initialText, onSave, onClose }) {
  const [text, setText] = useState(initialText)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add/Edit Document Text</h2>
          <button className="close-button" onClick={onClose}>
            x
          </button>
        </div>
        <textarea
          className="text-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="save-button" onClick={() => onSave(text)}>
          Save
        </button>
      </div>
    </div>
  )
}

export default Modal
