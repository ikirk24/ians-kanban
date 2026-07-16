import React from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";

export default function Column ({id, index, children, title }) {

    const {isDropTarget, ref} = useSortable({
        id,
        index,
        type: 'column',
        accept: ['item', 'column'],
        collisionPriority: CollisionPriority.Low
    });

        const style = isDropTarget ? {background: '#00000030'} : undefined;
    return (
          <div key={id}  ref={ref} style={style} className="border-2 min-h-20 rounded-2xl bg-black opacity-75 w-80 shrink-0 "> 
                <h1 className="text-xl text-left pl-4  font-bold text-gray-100">{title}</h1>
                {children}
        </div>
    )
}