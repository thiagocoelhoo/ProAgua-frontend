"use client";

import { Sequencia, useSequencias } from "@/utils/api_consumer";
import CardSequencia from "@/components/sequencias/CardSequencia";
import Filters from "@/components/sequencias/Filters";


export default function Coletas() {
    const sequencias = useSequencias();

    return (
        <>
            <h2 className="text-3xl text-[#525252]">Sequências de Coletas</h2>
            <div className="flex w-full flex-col items-center">
                <Filters />

                <div
                    id="result-list"
                    className="grid w-full grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-center gap-8"
                >
                    {/* Os resultados da pesquisa serão adicionados aqui */}
                    {sequencias.map((item: Sequencia, i) => (
                        <CardSequencia sequencia={item} />
                    ))}
                </div>

                <div id="paginator" className="pagination flex">
                    <button id="pagination-prev" className="hidden">
                        &lt; Anterior
                    </button>
                    <span id="page-info">Página 1 de 1</span>
                    <button id="pagination-next" className="hidden">
                        Próxima &gt;
                    </button>
                </div>

                <a
                    className="floating-bt max-w-fit rounded-md bg-primary-500 p-4 text-white hover:bg-primary-600"
                    href="/sequencias_coletas/criar"
                >
                    <i className="bi bi-plus-lg"></i> Adicionar sequência
                </a>
            </div>
        </>
    );
}
