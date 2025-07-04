// components/Kanban.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ListItem from "./ListItem";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

function Kanban({ columns, onDragEnd, onItemDeleted, onItemEdited, onEditColumn, 
  onDeleteColumn, onItemConcluded, onReorderColumn }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanbanBoard">
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div className="kanbanColumn" ref={provided.innerRef} {...provided.droppableProps}>
                <div className="column-header">
                   <div className="column-order-actions">
                    <button onClick={() => onReorderColumn(columnId, 'up')} title="Mover para cima">
                      <FaArrowUp />
                    </button>
                    <button onClick={() => onReorderColumn(columnId, 'down')} title="Mover para baixo">
                      <FaArrowDown />
                    </button>
                  </div>
                  <h3>{column.name} ({column.items.length})</h3>
                  <div className="column-actions">
                    <button onClick={() => onEditColumn(columnId, column.name)} title="Editar nome da coluna">
                      <FaEdit />
                    </button>
                    <button onClick={() => onDeleteColumn(columnId)} title="Apagar coluna">
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                {column.items.map((item, index) => (
                  <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ListItem
                          item={item}
                          onItemDeleted={onItemDeleted}
                          onItemEdited={onItemEdited}
                          onItemConcluded={onItemConcluded}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

export default Kanban;
