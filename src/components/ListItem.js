import React from 'react';
import { Draggable } from '@hello-pangea/dnd'

function Completed(props) {
  return props.completed
    ? <span style={{ color: "green" }}>✔</span>
    : <span>✔</span>;
}



function ListItem({ item, index, onItemCompleted, onItemDeleted, onItemEdited }) {

  const [isEditing, setIsEditing] = React.useState(false);
  const [newText, setNewText] = React.useState(item.text);

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleSave = () => {

    if (newText.trim() === "") {
      alert("O texto não pode ser vazio.");
    } else {
      onItemEdited(item, newText);
      setIsEditing(false);
    }
  }

  const handleCancel = () => {
    setIsEditing(false);
    setNewText(item.text);
  }


  return (
    <Draggable draggableId={item.id.toString()} index={index}>
      {(provided) => (
        <li
          className={item.completed ? "completed listItem" : "listItem"}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="editItem"
              />
              <div className="buttons">
                <button className="button" onClick={handleSave}>Salvar</button>
                <button className="button" onClick={handleCancel}>Cancelar</button>
              </div>
            </>
          ) : (

            <>
              {item.text}

              <div className="buttons">
                <button className="button" onClick={handleEdit}>✏️</button>
                <button className="button" onClick={() => onItemCompleted(item)}>
                  <Completed completed={item.completed} />
                </button>
                <button className="button" onClick={() => onItemDeleted(item)}>🗑️</button>

              </div>
            </>)}
        </li>
      )}
    </Draggable>
  );
}

export default ListItem;
