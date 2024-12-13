'use client';

import { apiUrl } from '@/utils/api/APIConsumer';
import { toURLParams } from '@/utils/api/client_side_consumer';
import { Ponto, Sequencia } from '@/utils/types';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/widgets/datatable';
import Spinner from '@/components/widgets/spinner';

export default function Page() {
  const [sequencias, setSequencias] = useState<Sequencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<any>({ q: '', campus: 'BOTH' });
  const [checkPendentes, setCheckPendentes] = useState<boolean>(false);
  const [checkConcluidas, setCheckConcluidas] = useState<boolean>(false);

  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [abortController, setAbortController] = useState(new AbortController());

  const [filteredSequencias, setFilteredSequencias] =
    useState<Sequencia[]>(sequencias);

  useEffect(() => {
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setLoading(true);

    const fetchData = async () => {
      const _filters = { ...filters };
      if (_filters.campus === 'BOTH') {
        delete _filters.campus;
      }

      const url = `${apiUrl}/sequencias?limit=10000`;
      let query = toURLParams(_filters);

      const res = await fetch(`${url}${query}`, {
        signal: newAbortController.signal,
        cache: 'no-cache',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const response = await res.json();
      let filtered = response.items;
      filtered = filtered.filter((sequencia: Sequencia) => {
        if (checkConcluidas && checkPendentes) {
          return true;
        }
        return (
          !(checkConcluidas && !sequencia.status) &&
          !(checkPendentes && sequencia.status)
        );
      });

      setFilteredSequencias(filtered);
      setLoading(false);
    };

    fetchData();
  }, [filters, checkPendentes, checkConcluidas]);

  return (
    <>
      <h2 className="text-3xl text-[#525252]">Sequência de Coletas</h2>
      <div className="flex w-full flex-col items-center">
        {loading ? (
          <div className="flex w-full justify-center rounded border border-neutral-300 bg-neutral-50 p-4 align-middle">
            <Spinner />
            <span className="block h-full text-center align-middle text-neutral-700">
              Carregando...
            </span>
          </div>
        ) : (
          <DataTable
            isLoading={false}
            cols={[
              'Código',
              'Amostragem',
              'Ponto',
              // 'Status',
              'Status Message',
              'Última Coleta',
              'Quantidade de Coletas',
            ]}
            data={filteredSequencias.map((sequencia) => ({
              'id': sequencia.id.toString(),
              'Código': sequencia.id.toString(),
              'Amostragem': sequencia.amostragem.toString(),
              'Ponto': sequencia.ponto
                ? sequencia.ponto.localizacao +
                  ' - ' +
                  sequencia.ponto.edificacao.codigo
                : '',
              // 'Status': sequencia.status.toString(),
              'Status Message': sequencia.status_message,
              'Última Coleta': sequencia.ultima_coleta?.toString() || '',
              'Quantidade de Coletas': sequencia.quantidade_coletas.toString(),
            }))}
          />
        )}

        <Button variant={'add'}>
          <a
            href="sequencias_coletas/criar"
            className="fixed bottom-4 left-1/2 mt-4 h-fit w-[320px] -translate-x-1/2 transform px-6 py-4"
          >
            + Criar Sequência de Coleta
          </a>
        </Button>
      </div>
    </>
  );
}
