// components/Kanban.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ListItem from "./ListItem";

function Kanban({ columns, onDragEnd, onItemCompleted, onItemDeleted, onItemEdited }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanbanBoard">
        {Object.entries(columns).map(([columnId, column]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div className="kanbanColumn" ref={provided.innerRef} {...provided.droppableProps}>
                <h3>{column.name}</h3>
                {column.items.map((item, index) => (
                  <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        className="kanbanItem"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ListItem
                          item={item}
                          onItemCompleted={onItemCompleted}
                          onItemDeleted={onItemDeleted}
                          onItemEdited={onItemEdited}
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
