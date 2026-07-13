import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateCard from "../components/CreateCard.jsx";
import DeleteCard from "../components/DeleteCard.jsx";
import NavBar from "../components/NavBar.jsx";
import { DndContext, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy,verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";

export default function BoardPage () {
   
    const navigate = useNavigate(); 

    let {boardId} = useParams();
    
    const [columnData, setColumnData] = useState([]);
    const [cardData, setCardData] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    
    useEffect(() => {

        const fetchColumn = async () => {
            
            try {
            
            setLoading(true)
            setError("")
            
            const colRes = await fetch(`http://localhost:8080/board/${boardId}/column`, {
            credentials: 'include'
            });
            
            if (!colRes.ok) throw new Error("not authorized");
            const colData = await colRes.json()
            setColumnData(colData.columns);

            const columnCards = await Promise.all(
                colData.columns.map(async (col) => {
                
                    const res = await fetch(`http://localhost:8080/board/${boardId}/column/${col.id}/card`, {
                    credentials: 'include'
                    });

                    if (!res.ok) throw new Error ("not authorized");
                    const data = await res.json();
                    const cards = data.result
                    return [col.id, cards];
                })
            );
            setCardData(Object.fromEntries(columnCards))
            } catch (err) {
                console.error(err)
                setError(err.message)
                setColumnData([])
                setCardData({})
            }finally {
                setLoading(false)
            } 
        }
        
        fetchColumn();
        
        
}, [refreshKey])

async function createColumn (e) {
        e.preventDefault();

        setError("");
        setLoading(true)
        const body = {title: title.trim()}

        try {

            if (!title.trim()) throw new Error ("Title is required")

            const res = await fetch(`http://localhost:8080/board/${boardId}/column`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            let columnData = null;

            try {
                columnData = await res.json()
            } catch {
                columnData = null;
            }

            if (!res.ok) throw new Error(columnData?.message || "Request failed")
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setTitle("");
            setRefreshKey(prevKey => prevKey + 1)
        }
    }
   
async function deleteColumn(e, columnId) {
        e.preventDefault();

        setLoading(true)

        try {


            const res = await fetch(`http://localhost:8080/board/${boardId}/column/${columnId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            let data = null;

            try {
                data = await res.json()
            } catch {
                data = null;
            }

            if (!res.ok) throw new Error(data?.message || "Request failed")
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setRefreshKey(prevKey => prevKey + 1)
        }
    }

function getRawId(id) {
  return Number(String(id).split("-")[1]);
}

function isColumn(id) {
  return String(id).startsWith("column-");
}

function isCard(id) {
  return String(id).startsWith("card-");
}

function findColumnByCardId(cardId) {
  return columnData.find((col) =>
    (cardData[col.id] ?? []).some((card) => card.id === cardId)
  );
}


async function handleDragEnd(event) {
  const { active, over } = event;

  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  try {
    // DRAGGING COLUMNS
    if (isColumn(activeId) && isColumn(overId)) {
      const activeColId = getRawId(activeId);
      const overColId = getRawId(overId);

      if (activeColId === overColId) return;

      const oldIndex = columnData.findIndex((col) => col.id === activeColId);
      const newIndex = columnData.findIndex((col) => col.id === overColId);

      const reorderedColumns = arrayMove(columnData, oldIndex, newIndex).map(
        (column, index) => ({
          ...column,
          position: index + 1,
        })
      );

      setColumnData(reorderedColumns);
      
      const responses = await Promise.all(
  reorderedColumns.map((column) =>
    fetch(`http://localhost:8080/board/${boardId}/column/${column.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: column.title,
        position: column.position,
      }),
    })
  )
);

responses.forEach((res) => {
  if (!res.ok) {
    throw new Error("Failed updating column");
  }
});

      return;
    }

    // DRAGGING CARDS
    if (isCard(activeId)) {
      const activeCardId = getRawId(activeId);
      const overRawId = getRawId(overId);

      const fromColumn = findColumnByCardId(activeCardId);

      const toColumn = isCard(overId)
        ? findColumnByCardId(overRawId)
        : columnData.find((col) => col.id === overRawId);

      if (!fromColumn || !toColumn) return;

      const fromColumnId = fromColumn.id;
      const toColumnId = toColumn.id;

      const activeCard = cardData[fromColumnId].find(
        (card) => card.id === activeCardId
      );

      let updatedCards = [];

      // SAME COLUMN CARD REORDER
      if (fromColumnId === toColumnId) {
        const cards = cardData[fromColumnId] ?? [];

        const oldIndex = cards.findIndex((card) => card.id === activeCardId);
        const newIndex = cards.findIndex((card) => card.id === overRawId);

        const newCards = arrayMove(cards, oldIndex, newIndex).map(
          (card, index) => ({
            ...card,
            column_id: fromColumnId,
            position: index + 1,
          })
        );

        updatedCards = newCards;

        setCardData((prev) => ({
          ...prev,
          [fromColumnId]: newCards,
        }));
      }

      // DIFFERENT COLUMN CARD MOVE
      if (fromColumnId !== toColumnId) {
        const fromCards = cardData[fromColumnId] ?? [];
        const toCards = cardData[toColumnId] ?? [];

        const overIndex = isCard(overId)
          ? toCards.findIndex((card) => card.id === overRawId)
          : toCards.length;

        const insertAt = overIndex >= 0 ? overIndex : toCards.length;

        const newFromCards = fromCards
          .filter((card) => card.id !== activeCardId)
          .map((card, index) => ({
            ...card,
            column_id: fromColumnId,
            position: index + 1,
          }));

        const movedCard = {
          ...activeCard,
          column_id: toColumnId,
        };

        const newToCards = [
          ...toCards.slice(0, insertAt),
          movedCard,
          ...toCards.slice(insertAt),
        ].map((card, index) => ({
          ...card,
          column_id: toColumnId,
          position: index + 1,
        }));

        updatedCards = [...newFromCards, ...newToCards];

        setCardData((prev) => ({
          ...prev,
          [fromColumnId]: newFromCards,
          [toColumnId]: newToCards,
        }));
      }

      await Promise.all(
        updatedCards.map((card) =>
          fetch(
            `http://localhost:8080/board/${boardId}/column/${card.column_id}/card/${card.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                title: card.title,
                position: card.position,
                column_id: card.column_id
              }),
            }
          )
        )
      );
    }
  } catch (err) {
    setError(err.message || "Failed to save drag changes");
    setRefreshKey((prev) => prev + 1);
  }
}



    const sortedColumns = [...columnData].sort((a,b) => a.position - b.position)
    // const sortedCards = [...cardData].sort((a,b) => a.position - b.position);
    return (
        <> 
        <NavBar/>
        {error && <h1>{error}</h1>}
        {loading && <h1>Loading...</h1>}

        <div className="w-full overflow-x-auto overflow-y-hidden ml-10">
            <div className="flex flex-row items-start pt-16 gap-16 min-w-max">
            
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext 
            items = {sortedColumns.map((col) => `column-${col.id}`)}
            strategy={horizontalListSortingStrategy}
            >
        {sortedColumns.map((col) => (
            <SortableColumn 
            key={col.id} 
            col={col} 
            boardId={boardId}
            cardData ={cardData}
            setRefreshKey={setRefreshKey} 
            />
        ))}
        

        </SortableContext>
        </DndContext>

        <form 
        action="submit" 
        onSubmit={createColumn} 
        className="border-2 rounded-2xl bg-gray-500 opacity-75 w-1/6"
        >
             
            <input 
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button type="submit"
            disabled ={loading}> {loading ? "Loading..." : "Create Column"}</button>

        </form>
        </div>
            </div>

        
        </>
    )
}

function SortableColumn({ col, boardId, cardData, setRefreshKey }) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: `column-${col.id}`,
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${col.id}`,
  });

  function setRefs(node) {
    setSortableRef(node);
    setDroppableRef(node);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className="border-2 rounded-2xl bg-black opacity-75 w-1/6 cursor-grab"
    >
      <h1
        {...attributes}
        {...listeners}
        className="text-xl text-left pl-4 font-bold text-gray-100"
      >
        {col.title}
      </h1>

      <SortableContext
        items={(cardData[col.id] ?? []).map((card) => `card-${card.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {(cardData[col.id] ?? []).map((card) => (
          <SortableCard
            key={card.id}
            card={card}
            col={col}
            boardId={boardId}
            setRefreshKey={setRefreshKey}
          />
        ))}
      </SortableContext>

      <CreateCard
        boardId={boardId}
        columnId={col.id}
        onCreated={() => setRefreshKey((prevKey) => prevKey + 1)}
      />
    </div>
  );
}



function SortableCard({ card, col, boardId, setRefreshKey }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `card-${card.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between text-gray-300 pl-2 mt-2 ml-2 mr-2 bg-gray-900 rounded-md p-1 text-lg text-left"
    >
      <p>{card.title}</p>

      <DeleteCard
        boardId={boardId}
        columnId={col.id}
        cardId={card.id}
        onDelete={() => setRefreshKey((prevKey) => prevKey + 1)}
      />
    </div>
  );
}

