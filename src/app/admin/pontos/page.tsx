'use client';

import { Edificacao, Ponto } from '@/utils/types';
import { consumerPonto } from '@/utils/api/consumerPonto';
import { consumerEdficacao } from '@/utils/api/consumerEdficacao';

import { useEffect, useState } from 'react';
import { CardEdificacao } from './components/CardEdificacao';

interface Groups {
  [x: string]: { edificacao: Edificacao; pontos: Ponto[] };
}

interface FiltroPontos {
  [key: string]: boolean;
}

interface TiposPontos {
  [key: string]: number;
}

interface Filters {
  q: string;
  campus: string;
  filtroPontos: FiltroPontos;
}

function groupBy(arr: Ponto[], key: (el: Ponto) => any) {
  var groups = Object();

  arr.forEach((element) => {
    let groupName = key(element);
    let group = groups[groupName] || {
      edificacao: element.edificacao,
      pontos: [],
    };

    group.pontos.push(element);
    groups[groupName] = group;
  });

  return groups;
}

function FilterPontos(props: {
  filtersState: any;
  setFilters: (d: any) => void;
}) {
  const { filtersState: filters, setFilters } = props;

  function toggleFilter(name: string) {
    setFilters({
      ...filters,
      filtroPontos: {
        ...filters.filtroPontos,
        [name]: !filters.filtroPontos[name],
      },
    });
  }

  return (
    <div className="flex gap-8">
      {Object.entries(filters.filtroPontos).map(([key, value]) => {
        return (
          <label htmlFor={key} key={key} className="cursor-pointer select-none">
            <input
              type="checkbox"
              className="mr-1 cursor-pointer"
              name={key}
              id={key}
              checked={Boolean(value)}
              onChange={() => toggleFilter(key)}
            />
            {key}
          </label>
        );
      })}
    </div>
  );
}

export default function Pontos() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [edificacoes, setEdificacoes] = useState<Edificacao[]>([]);

  const [filters, setFilters] = useState<Filters>({
    q: '',
    campus: '',
    filtroPontos: {
      Bebedouro: true,
      Torneira: true,
      RPS: true,
      RPI: true,
      RDS: true,
      RDI: true,
      CAERN: true,
    },
  });

  const tiposPontos: TiposPontos = {
    Bebedouro: 0,
    Torneira: 1,
    RPS: 2,
    RPI: 3,
    RDS: 4,
    RDI: 5,
    CAERN: 6,
  };

  // Agrupa pontos de acordo com a edificação
  const groups: Groups = groupBy(
    pontos,
    (ponto: Ponto) => ponto.edificacao.codigo,
  );

  // Adiciona novos grupos vazios para edificações que não possuem pontos
  for (let edificacao of edificacoes) {
    if (!groups[edificacao.codigo]) {
      groups[edificacao.codigo] = { edificacao: edificacao, pontos: [] };
    }
  }

  useEffect(() => {
    // Acessar todas as edificações pela API
    consumerEdficacao.list().then((data) => setEdificacoes(data));

    // Cria lista com ids referentes aos tipos de pontos filtrados
    const filtrosIds = Object.entries(filters.filtroPontos)
      .filter(([key, value]) => value == true)
      .map(([key, value]) => tiposPontos[key]);

    // Acessar todos os pontos da API de acordo com os filtros
    consumerPonto
      .list('no-cache', { tipo: filtrosIds })
      .then((data) => setPontos(data));
  }, [filters]);

  return (
    <>
      <h2 className="text-3xl text-[#525252]">
        Edificações e Pontos de Coleta
      </h2>

      <div className="flex w-full flex-col items-center">
        <div className="mb-4 flex w-full flex-col gap-4">
          <div className="space-between relative flex gap-2">
            <input
              id="search-bar"
              className="w-full rounded-md border bg-white px-5 py-3 text-[#525252]"
              type="text"
              name="search-query"
              placeholder="Digite o termo de pesquisa"
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />

            <select
              name="campus"
              className="w-36 rounded-md border bg-white px-3 py-2 text-[#525252]"
              onChange={(e) =>
                setFilters({ ...filters, campus: e.target.value })
              }
            >
              <option value="" disabled selected hidden>
                Campus
              </option>
              <option value="">Leste/Oeste</option>
              <option value="LE">Leste</option>
              <option value="OE">Oeste</option>
            </select>
          </div>

          <div className="mb-4 flex w-full justify-between gap-3 self-end">
            <FilterPontos filtersState={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className="flex w-full flex-col">
          <a
            href="/admin/edificacoes/criar"
            className="mb-4 w-fit rounded-lg border border-gray-300 bg-gray-50 p-2 px-4 text-center font-semibold text-green-500 transition-all duration-75 hover:border-green-600 hover:bg-green-500 hover:text-white"
          >
            + Adicionar edificação
          </a>
          {Object.values(groups).map((group, i) => {
            return (
              <CardEdificacao
                group={group}
                key={'edificacao-' + i}
                collapsed={false}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
