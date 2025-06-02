// ==== Todo.js ====
import React, { useEffect, useState } from "react";
import "./Todo.css";
import TodoForm from "./components/TodoForm";
import Kanban from "./components/Kanban";
import Swal from "sweetalert2";
import SearchBar from "./components/SearchBar";

function Todo() {
    const [columns, setColumns] = useState({
        aguardando: { name: "Aguardando Peças", items: [] },
        liberado: { name: "Liberados para Agendamento", items: [] },
        agendado: { name: "Agendados", items: [] },
        finalizado: { name: "Finalizados", items: [] }
    });

    const [busca, setBusca] = useState('');

    useEffect(() => {
        buscarFluxos();
    }, []);

    async function buscarFluxos() {
        const res = await fetch("http://localhost:5000/api/fluxos");
        const data = await res.json();
        setColumns({
            aguardando: { name: "Aguardando Peças", items: data.filter(i => i.status === "aguardando") },
            liberado: { name: "Liberados para Agendamento", items: data.filter(i => i.status === "liberado") },
            agendado: { name: "Agendados", items: data.filter(i => i.status === "agendado") },
            finalizado: { name: "Finalizados", items: data.filter(i => i.status === "finalizado") },
        });
    }

    function onDragEnd(result) {
        const { source, destination } = result;
        if (!destination) return;

        setColumns(prevColumns => {
            const sourceCol = prevColumns[source.droppableId];
            const destCol = prevColumns[destination.droppableId];
            const sourceItems = Array.from(sourceCol.items);
            const destItems = Array.from(destCol.items);
            const [movedItem] = sourceItems.splice(source.index, 1);

            movedItem.status = destination.droppableId;

            fetch(`http://localhost:5000/api/fluxos/${movedItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movedItem)
            });

            if (source.droppableId === destination.droppableId) {
                sourceItems.splice(destination.index, 0, movedItem);
                return {
                    ...prevColumns,
                    [source.droppableId]: {
                        ...sourceCol,
                        items: sourceItems,
                    },
                };
            } else {
                destItems.splice(destination.index, 0, movedItem);
                return {
                    ...prevColumns,
                    [source.droppableId]: {
                        ...sourceCol,
                        items: sourceItems,
                    },
                    [destination.droppableId]: {
                        ...destCol,
                        items: destItems,
                    },
                };
            }
        });
    }

    async function onAddItem(dados) {
        try {
            const response = await fetch("http://localhost:5000/api/fluxos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            if (!response.ok) throw new Error("Erro ao adicionar");

            await buscarFluxos();

        } catch (err) {
            console.error(err);
            Swal.fire("Erro", "Não foi possível adicionar o item.", "error");
        }
    }

    async function onItemEdited(id, dadosAtualizados) {
        try {
            const response = await fetch(`http://localhost:5000/api/fluxos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados)
            });

            if (!response.ok) throw new Error("Erro ao editar");

            await buscarFluxos();

        } catch (error) {
            console.error("Erro ao editar item:", error);
            Swal.fire("Erro", "Não foi possível editar o item.", "error");
        }
    }

    async function onItemDeleted(item) {
        try {
            const confirm = await Swal.fire({
                title: 'Tem certeza?',
                text: 'Você quer excluir este item?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar'
            });

            if (!confirm.isConfirmed) return;

            const response = await fetch(`http://localhost:5000/api/fluxos/${item.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erro ao excluir');

            setColumns(prev => {
                const col = prev[item.status];
                const novosItems = col.items.filter(i => i.id !== item.id);
                return {
                    ...prev,
                    [item.status]: {
                        ...col,
                        items: novosItems
                    }
                };
            });

        } catch (error) {
            console.error('Erro ao excluir item:', error);
            Swal.fire('Erro!', 'Não foi possível excluir o item.', 'error');
        }
    }

    // ======= FILTRO APLICADO AO KANBAN =======
    const colunasFiltradas = {};
    for (const key in columns) {
        colunasFiltradas[key] = {
            ...columns[key],
            items: columns[key].items.filter(item =>
                item.cliente.toLowerCase().includes(busca.toLowerCase()) ||
                item.carro.toLowerCase().includes(busca.toLowerCase()) ||
                item.placa.toLowerCase().includes(busca.toLowerCase())
            )
        };
    }

    return (
        <div className="container">
            <h1 className="title">Fluxo</h1>
            <div className="subTitle">Arraste para reordenar</div>

            <SearchBar busca={busca} setBusca={setBusca} />

            <TodoForm onAddItem={onAddItem} />

            <Kanban
                columns={colunasFiltradas}
                onDragEnd={onDragEnd}
                onItemCompleted={() => { }}
                onItemDeleted={onItemDeleted}
                onItemEdited={onItemEdited}
            />
        </div>
    );
}

export default Todo;
