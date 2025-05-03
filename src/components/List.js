import React from 'react';
import ListItem from './ListItem';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';



function List(props) {
    return (
        <DragDropContext gDropContext onDragEnd={props.onDragEnd}>
            <Droppable droppableId='droppable' type='list' direction='vertical'>
                {(provided) => (
                    <ul className="list" ref={provided.innerRef}   {...provided.droppableProps}>
                        {props.items.map((item,index) => (
                            <ListItem
                                key={item.id}
                                item={item}
                                index={index}
                                onItemCompleted={props.onItemCompleted}
                                onItemDeleted={props.onItemDeleted}
                                onItemEdited={props.onItemEdited}
                            />
                        ))}
                        {provided.placeholder}

                    </ul>
                )

                }
            </Droppable>
        </DragDropContext>
    );
}

export default List;
