import React from "react";

function Note({ note, onDelete }) {
    const formatedDate = new Date(note.created).toLocaleDateString("en-US")

    return (
        <div
            className="note-container">
            <p className="note-title">{note.title} </p>
            <p className="note-content">{note.content}</p>
            <p className="note-date">{ }</p>
            <button className="delete-button" onClick={
                () => onDelete(note.id)
            }>
                Delete
            </button>
        </div>
    )
}

export default Note;
