import { BASE_URL } from "@/utils/config";
import { Ponto, TIPOS_PONTOS } from "@/utils/types";


export default function CardPonto(props: { ponto: Ponto, publicCard: boolean }) {
  const { ponto, publicCard = false } = props;
  const edificacao = ponto.edificacao;
  const tipo = ponto.tipo <= 1 ? "pontos" : "reservatorios";
  return (
    ponto && (
      <div className="relative flex aspect-square w-[260px] flex-col items-center justify-between rounded-md border border-neutral-300 bg-white px-2 py-4 text-center">
        <h3>{edificacao?.codigo}</h3>
        <h2 className="text-center text-xl">{TIPOS_PONTOS[ponto.tipo]}</h2>
        <p className="text-sm">{ponto.localizacao}</p>

        <a
          href={publicCard ? `${BASE_URL}/${tipo}/${ponto.id}` : `${tipo}/${ponto.id}`}
          className="filled-button rounded-md bg-primary-500 p-3 text-xs font-semibold text-white hover:bg-primary-700 transition-colors duration-75"
        >
          <i className="bi bi-eye-fill"></i>
          Detalhes
        </a>
      </div>
    )
  );
}


export function AddCard({ cod_edificacao, tipo }: { cod_edificacao?: string, tipo?: string}) {
  let url_tipo = tipo === 'reservatorio' ? '/admin/reservatorios/criar' : '/admin/pontos/criar';
  return (
    <a href={`${url_tipo}${cod_edificacao ? `/${cod_edificacao}` : ''}`}>
      <div
        className="relative px-2 py-4 flex aspect-square w-[260px] flex-col items-center justify-center rounded-md border border-bule-300 bg-blue-200 hover:bg-slate-100 text-blue-700 hover:text-blue-500 text-center cursor-pointer transition-colors duration-100"
      >
        <h2> {tipo === 'reservatorio' ? "Reservatório" : "Ponto Inicial"}</h2>
        <h2 className="text-center text-3xl select-none"> +</h2>
      </div>
    </a>
  );
}
