// src/Concluidos.js
import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { FaUndo } from 'react-icons/fa'; // Ícone para reativar
import './Concluidos.css';

function Concluidos() {
    const [carros, setCarros] = useState([]);
    const [colunas, setColunas] = useState({}); // Para guardar as colunas do Kanban
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Busca os carros concluídos e as colunas do Kanban em paralelo
            const [carrosRes, colunasRes] = await Promise.all([
                fetch("http://localhost:5000/api/fluxos/concluidos"),
                fetch("http://localhost:5000/api/colunas")
            ]);

            const carrosData = await carrosRes.json();
            const colunasData = await colunasRes.json();

            // Transforma o array de colunas em um objeto para fácil acesso
            const colunasObj = colunasData.reduce((obj, item) => {
                obj[item.id] = { name: item.nome };
                return obj;
            }, {});

            setCarros(carrosData);
            setColunas(colunasObj);

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReativar = async (carro) => {
    // 1. Crie um objeto simples para as opções do SweetAlert
    const opcoesDeColuna = Object.entries(colunas).reduce((acc, [id, data]) => {
        acc[id] = data.name; // Transforma { aguardando: {name: '...'} } em { aguardando: '...' }
        return acc;
    }, {});

    const { value: novoStatus } = await Swal.fire({
        title: 'Reativar Veículo',
        text: `Para qual coluna o carro "${carro.carro}" deve retornar?`,
        input: 'select',
        inputOptions: opcoesDeColuna, // 2. Use o novo objeto formatado aqui
        inputPlaceholder: 'Selecione um status',
        showCancelButton: true,
        confirmButtonText: 'Reativar',
        inputValidator: (value) => {
            if (!value) {
                return 'Você precisa selecionar uma coluna!';
            }
        }
    });

    if (novoStatus) { // O 'novoStatus' agora será o ID correto (ex: "aguardando")
        try {
            const response = await fetch(`http://localhost:5000/api/fluxos/${carro.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });

            if (!response.ok) throw new Error('Erro ao reativar no servidor');

            Swal.fire('Reativado!', 'O veículo voltou para o quadro Kanban.', 'success');
            fetchData(); // Recarrega a lista de concluídos
        } catch (error) {
            Swal.fire('Erro!', 'Não foi possível reativar o veículo.', 'error');
        }
    }
};

    if (loading) {
        return <p>Carregando veículos concluídos...</p>;
    }

    return (
        <div className="concluidos-container">
            <h1>Veículos Concluídos</h1>
            <table className="concluidos-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Carro</th>
                        <th>Placa</th>
                        <th>Data de Entrega</th>
                        <th>Ações</th> {/* Nova coluna */}
                    </tr>
                </thead>
                <tbody>
                    {carros.map(carro => (
                        <tr key={carro.id}>
                            <td>{carro.cliente}</td>
                            <td>{carro.carro}</td>
                            <td>{carro.placa}</td>
                            <td>{carro.data_entrega}</td>
                            <td>
                                <button
                                    className="action-button reactivate-button"
                                    title="Reativar Veículo"
                                    onClick={() => handleReativar(carro)}
                                >
                                    <FaUndo />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Concluidos;