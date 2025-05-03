import React, { useEffect } from "react"
import "./Todo.css"
import List from "./components/List"
import TodoForm from "./components/TodoForm"
import Swal from "sweetalert2"


const SAVED_ITEMS = "savedItems"


function Todo() {
    const [items, setItems] = React.useState([])



    useEffect(() => {
        let savedItems = JSON.parse(localStorage.getItem(SAVED_ITEMS))

        if (savedItems) {
            setItems(savedItems)
        }
    }, [])

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(SAVED_ITEMS));
        if (items.length === 0 && saved) return; // evita sobrescrever na primeira vez
        localStorage.setItem(SAVED_ITEMS, JSON.stringify(items));
    }, [items]);


    function createItem(text) {
        return {
            id: Date.now() + Math.random(), // Gera um ID único
            text,
            completed: false
        };
    }


    function onAddItem(text) {

        let it = createItem(text)
        setItems([...items, it])
    }

    function onItemDeleted(item) {
        Swal.fire({
            title: "Deseja deletar este item?",
            text: "Você não poderá reverter isso!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            customClass: {
                popup: 'custom-popup',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Swal.fire({
                //     title: "Deletado!",
                //     text: "Seu item foi deletado com sucesso.",
                //     icon: "success"
                // });
                const newItems = items.filter(it => it.id !== item.id)
                setItems(newItems)
            }
        });

        // if (confirm){
        //     const newItems = items.filter(it => it.id !== item.id)
        //     setItems(newItems)
        // }else{
        //     return
        // }

    }

    function onItemCompleted(item) {
        const newItems = items.map(it => {
            if (it.id === item.id) {
                it.completed = !it.completed
            }
            return it
        })
        setItems(newItems)
    }

    function onItemEdited(item, newText) {
        const updatedItems = items.map(it => {
            if (it.id === item.id) {
                return { ...it, text: newText };
            }
            return it;
        });
        setItems(updatedItems);
    }




    function reorderList(items, startIndex, endIndex) {
        const result = Array.from(items);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }

        const reordenedItems = reorderList(items, result.source.index, result.destination.index);



        setItems(reordenedItems)

    }



    return (
        <div className="container">
            <h1 className="title">Tarefas</h1>
            <div className="subTitle">Arraste para reordenar</div>

            <TodoForm onAddItem={onAddItem} 
            
            ></TodoForm>

            <List
                onItemCompleted={onItemCompleted}
                onItemDeleted={onItemDeleted}
                onItemEdited={onItemEdited}

                items={items}
                onDragEnd={onDragEnd}></List>

        </div>
    )

}



export default Todo