"use client";

import Filters from "@/components/sequencias/Filters";
import { useEdificacoes, Edificacao } from "@/utils/api_consumer";

export default function Edificacoes() {
  const edificacoes = useEdificacoes(
    "http://localhost:8000/api/v1/edificacoes",
  );

  return (
    <>
      <Filters />
      <div className="mx-auto max-h-[70vh] w-full overflow-y-auto rounded-md border border-neutral-200 bg-white p-4 shadow-lg">
        <h2 className="w-full text-center text-2xl font-medium text-[#7a7a7a]">
          Lista edificações
        </h2>
        <ul>
          {edificacoes.map((item: Edificacao, i) => {
            return (
              <li
                key={"edif-" + i}
                className="group/item flex justify-between border-b px-4 py-6 text-neutral-700 hover:bg-blue-100 hover:font-medium"
              >
                {item.codigo} - {item.nome}
                <a
                  href="#"
                  className="hidden rounded p-2 text-blue-900 hover:bg-white group-hover/item:block"
                >
                  Detalhes
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
