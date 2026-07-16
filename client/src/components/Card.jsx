import React from "react";
import {useSortable} from '@dnd-kit/react/sortable';
import DeleteCard from "./DeleteCard";

export default function Card ({id, index, onDelete, boardId, colId, title, column }) {

    const {ref, isDragging} = useSortable({
        id, 
        index,
        type: 'item', 
        accept: 'item', 
        group: column
    });

    return (
        <div key={id} ref={ref} className="flex justify-between text-gray-300 pl-2 mt-2 ml-2 mr-2 bg-gray-900 rounded-md p-1 text-lg text-left ">
                    <p className="">{title}</p>
                <DeleteCard boardId={boardId} columnId={colId} cardId={id} onDelete={onDelete}/>
        </div>
    )
}