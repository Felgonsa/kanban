// ==== Todo.js ====
import React, { useEffect, useState, useCallback } from "react";
import "./Todo.css";
import TodoForm from "./components/TodoForm";
import Kanban from "./components/Kanban";
import Swal from "sweetalert2";
import SearchBar from "./components/SearchBar";

const API_BASE_URL = "http://192.168.15.115:5000/api"; // Defina a URL base da API

function Todo() {
    const [columns, setColumns] = useState({});
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);


    const fetchData = useCallback(async () => {
        try {
            console.log("Buscando dados...");
            const [colunasRes, fluxosRes] = await Promise.all([
                fetch(`${API_BASE_URL}/colunas`),
                fetch(`${API_BASE_URL}/fluxos`)
            ]);

            if (!colunasRes.ok) throw new Error('Falha ao buscar colunas');

            const colunasData = await colunasRes.json();
            const fluxosData = await fluxosRes.json();

            const stateInicial = {};
            colunasData.forEach(coluna => {
                stateInicial[coluna.id] = {
                    name: coluna.nome,
                    items: fluxosData.filter(item => item.status === coluna.id)
                };
            });

            setColumns(stateInicial);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            Swal.fire("Erro de Rede", "Não foi possível carregar os dados do quadro.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. O useEffect agora apenas chama a função fetchData
    useEffect(() => {
        fetchData();
    }, [fetchData]);


    async function buscarFluxos() {
        const res = await fetch(`${API_BASE_URL}/fluxos`);
        const data = await res.json();
        setColumns(prevColumns => {
            const newState = { ...prevColumns };
            Object.keys(newState).forEach(colId => {
                newState[colId].items = data.filter(i => i.status === colId);
            });
            return newState;
        });
    }

    const onDragEnd = async (result) => {
        const { source, destination } = result;

        // 1. Sai da função se o usuário soltar fora de uma coluna válida
        if (!destination) {
            return;
        }
     
        const movedItem = colunasFiltradas[source.droppableId].items[source.index];

        // Se o item foi movido para a mesma coluna (apenas reordenado)
        if (source.droppableId === destination.droppableId) {
          return;
        }

        // Se o item foi movido para uma coluna DIFERENTE
        try {
            // 3. Atualiza o status do item CORRETO que foi identificado
            const updatedItem = {
                ...movedItem,
                status: destination.droppableId,
            };

            // 4. Envia a atualização para a API
            const response = await fetch(`${API_BASE_URL}/fluxos/${updatedItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o status no servidor');
            }

            // 5. Após a API confirmar a mudança, recarrega todos os dados do zero.
            // Esta é a forma mais segura de garantir que a tela reflita o estado real do banco de dados.
            fetchData();

        } catch (error) {
            console.error("Erro ao mover o item:", error);
            Swal.fire('Erro!', 'Não foi possível mover o item.', 'error');
            // Se der erro, recarregue os dados para reverter visualmente a mudança
            fetchData();
        }
    };

    async function onAddItem(dados) {
        try {
            const response = await fetch(`${API_BASE_URL}/fluxos`, {
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
            const response = await fetch(`${API_BASE_URL}/fluxos/${id}`, {
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

            const response = await fetch(`${API_BASE_URL}/fluxos/${item.id}`, {
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

    async function handleAddColumn() {
        const { value: nome } = await Swal.fire({
            title: 'Nova Coluna',
            input: 'text',
            inputLabel: 'Nome da nova coluna',
            inputPlaceholder: 'Ex: Em Pintura',
            showCancelButton: true,
            confirmButtonText: 'Criar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa digitar um nome!';
                }
            }
        });

        if (nome) {
            try {
                const response = await fetch(`${API_BASE_URL}/colunas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome })
                });
                if (!response.ok) throw new Error("Erro ao criar coluna");
                fetchData(); // Recarrega todos os dados
            } catch (err) {
                Swal.fire("Erro", "Não foi possível criar a coluna.", "error");
            }
        }
    }

    async function handleEditColumn(columnId, currentName) {
        const { value: nome } = await Swal.fire({
            title: 'Editar Nome da Coluna',
            input: 'text',
            inputValue: currentName,
            showCancelButton: true,
        });

        if (nome && nome !== currentName) {
            await fetch(`${API_BASE_URL}/colunas/${columnId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome })
            });

            fetchData()
        }
    }

    async function handleDeleteColumn(columnId) {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso! Apagar uma coluna só é permitido se ela estiver vazia.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, apagar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/colunas/${columnId}`, {
                    method: 'DELETE'
                });
                const message = await response.text();
                if (!response.ok) throw new Error(message);
                Swal.fire('Apagada!', message, 'success');
                fetchData();
            } catch (error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    async function handleReorderColumn(columnId, direction) {
    try {
        const response = await fetch(`${API_BASE_URL}/colunas/reorder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ columnId, direction }),
        });

        if (!response.ok) {
            throw new Error('Falha ao reordenar no servidor.');
        }

        // Recarrega todos os dados para exibir a nova ordem
        fetchData();

    } catch (error) {
        console.error("Erro ao reordenar coluna:", error);
        Swal.fire('Erro!', 'Não foi possível reordenar a coluna.', 'error');
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

    async function handleConcludeItem(item) {
        try {
            const hoje = new Date().toISOString().split('T')[0]; // Pega a data de hoje no formato YYYY-MM-DD

            await fetch(`${API_BASE_URL}/fluxos/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                // Atualiza o status e a data de entrega
                body: JSON.stringify({ ...item, status: 'concluido', data_entrega: hoje })
            });

            Swal.fire('Concluído!', 'O veículo foi movido para a lista de concluídos.', 'success');
            fetchData(); // Recarrega o quadro, fazendo o item desaparecer
        } catch (error) {
            Swal.fire('Erro!', 'Não foi possível concluir o veículo.', 'error');
        }
    }

    return (
        <div className="container">
            <h1 className="title">Fluxo</h1>
            <div className="subTitle">Arraste para reordenar</div>

            <SearchBar busca={busca} setBusca={setBusca} />

            <TodoForm onAddItem={onAddItem} columns={columns} />

            <button onClick={handleAddColumn} className="add-column-btn">Adicionar Coluna</button>

            <Kanban
                columns={colunasFiltradas}
                onDragEnd={onDragEnd}
                onItemCompleted={() => { }}
                onItemDeleted={onItemDeleted}
                onItemEdited={onItemEdited}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onItemConcluded={handleConcludeItem}
                onReorderColumn={handleReorderColumn}
            />
        </div>
    );
}

export default Todo;
