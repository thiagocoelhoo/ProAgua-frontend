"use client";

import { FormEvent, use, useEffect, useState } from "react";

import QRCode from "@/utils/qr_code";
import { Edificacao, ImageIn, ImageOut, Ponto, PontoIn, Reservatorio, ReservatorioIn, TIPOS_PONTOS } from "@/utils/types";
import { delPonto, useEdificacoes, usePonto, usePontos } from "@/utils/api/client_side_consumer";
import { apiUrl } from "@/utils/api/APIConsumer";
import { consumerPonto } from "@/utils/api/consumerPonto";
import { APIConsumer } from "@/utils/api/APIConsumer";
import MultipleImageInput from "@/components/MultipleImageInput";
import React from 'react';
import { ReactFlow } from '@xyflow/react';
import CardPonto, { AddCard } from "@/components/pontos/CardPontos";
 
import '@xyflow/react/dist/style.css';

import { Node } from '@xyflow/react';

const initialNodes: Node[] = [
    { id: '1', position: { x: 500, y: 0 }, data: { label: '1' }, type: 'input', draggable: true },
    { id: '2', position: { x: 300, y: 100 }, data: { label: '2' } },
    { id: '3', position: { x: 500, y: 100 }, data: { label: '3' } },
    { id: '4', position: { x: 300, y: 200 }, data: { label: '4' }, type: 'output' },
  ];
  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true }, 
    { id: 'e1-3', source: '1', target: '3', animated: true},
    { id: 'e2-4', source: '2', target: '4', animated: true},];

export default function VisualizarPonto({ params }: { params: { id_ponto: string } }) {
    const edificacoes = useEdificacoes();
    const pontos = usePontos();
    const ponto = usePonto(parseInt(params.id_ponto));

    const [currentAmontante, setCurrentAmontante] = useState<string>(ponto?.amontante?.id?.toString() || '');
    const [currentEdificacao, setCurrentEdificacao] = useState<string>(ponto?.edificacao.codigo || '');
    const [currentTipo, setCurrentTipo] = useState<string>(ponto?.tipo.toString() || '-1');
    const pontosAmontantes = pontos.filter(p => p.tipo > Number(currentTipo));

    const [existingImages, setExistingImages] = useState<ImageOut[]>([])
    const [images, setImages] = useState<ImageIn[]>([])
    const [editable, setEditable] = useState<boolean>(false);

    async function removeExistingImage(url: string) {
        const image = existingImages.find((e) => apiUrl + e.src === url);

        if (!image) {
            throw "Não foi possível excluir a imagem";
        }

        // Send request to delete image
        const consumer = new APIConsumer(`${apiUrl}/api/v1/pontos/${ponto?.id}/imagem/`);
        const response = await consumer.delete(String(image?.id));

        if (!response.ok) {
            throw "Não foi possível excluir a imagem";
        }

        // Remove image from array
        setExistingImages(existingImages.filter(image => apiUrl + image.src != url));
    }

    // TODO: Testar a função de atualizar ponto
    async function submitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const data: PontoIn = {
            codigo_edificacao: String(formData.get("edificacao")),
            tipo: Number(formData.get("tipo")),
            localizacao: String(formData.get("localizacao")),
            tombo: null,
            quantidade: Number(formData.get("quantidade")),
            capacidade: Number(formData.get("capacidade")),
            material: String(formData.get("material")),
            fonte_informacao: String(formData.get("fonte_informacao")),
            observacao: String(formData.get("observacao")),
            amontante: formData.get("amontante") ? Number(formData.get("amontante")) : null,
            // imagem: String(formData.get("imagem")),
        }
        const response = await consumerPonto.put(params.id_ponto, data)

        if (images.length > 0) {
            await Promise.all(images.map(uploadImage));
        }

        if (response.ok) {
            alert("Reservatório atualizado com sucesso!");
            window.location.href = "/admin/pontos";
        }
        else {
            throw "Erro ao atualizar reservatório!";
        }

    }

    async function uploadImage(image: ImageIn) {
        let formData = new FormData();
        formData.append("description", image.description);
        formData.append("file", image.file);

        const consumer = new APIConsumer(`${apiUrl}/api/v1/pontos/${ponto?.id}/imagem`);
        const response = await consumer.post(formData, new Headers());

        if (!response.ok) {
            throw `Erro ao adicionar imagem ${image.file.name}`;
        }
    }

    async function deletePonto() {
        const response = await delPonto(parseInt(params.id_ponto));
        if (response?.ok) {
            window.location.href = "/admin/pontos";
        }
    }

    useEffect(() => {
        if (currentTipo == "-1") {
            setCurrentTipo(ponto?.tipo.toString() || '-1');
        }
    }, [ponto]);

    useEffect(() => {
    }, [currentTipo]);

    useEffect(() => {
        if (ponto?.imagens) {
            setExistingImages(ponto.imagens);
        }
    }, [ponto]);

    return (
        <>
            <h2 className="text-4xl text-neutral-700 font-bold mb-8">
                {editable ? "Editar" : "Visualizar"} Reservatório
            </h2>

            <div style={{ width: '100vh', height: '100vh' }}>
                <ReactFlow nodes={initialNodes} edges={initialEdges} />
            </div>

            <form onSubmit={(e) => submitForm(e)} onReset={() => setEditable(false)} method="POST"
                className="w-full flex flex-col gap-4"
            >

                <label htmlFor="id">Id:</label>
                <input
                    type="text"
                    id="id"
                    name="id"
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    defaultValue={params.id_ponto}
                    disabled
                />

                {
                    edificacoes.length > 0 && (
                        <>
                            <label htmlFor="">Edificação:</label>

                            <div className="flex">
                                <select
                                    id="edificacao"
                                    name="edificacao"
                                    className="w-full rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                                    onChange={e => setCurrentEdificacao(e.target.value)}
                                    defaultValue={ponto?.edificacao.codigo}
                                    disabled={!editable}
                                >
                                    {edificacoes.map((edificacao: Edificacao) => {
                                        return <option value={edificacao.codigo} key={edificacao.codigo} >{edificacao.codigo} - {edificacao.nome}</option>
                                    })}
                                </select >

                                <a className="flex justify-center" href={currentEdificacao ? "/admin/edificacoes/" + currentEdificacao : "#"} target={currentEdificacao ? "_blank" : "_self"}>
                                    <svg className={currentEdificacao ? `w-6 mx-4 fill-primary-600` : `w-6 mx-4 fill-neutral-500`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512">
                                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.
                        2 3.3 20.3z" />
                                    </svg>
                                </a>

                            </div>

                        </>
                    )
                }

                { ponto && (
                    <>
                        <label htmlFor="tipo">
                            Tipo:
                        </label>

                        <select
                            id="tipo"
                            name="tipo"
                            className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                            defaultValue={ponto?.tipo}
                            onChange={e => setCurrentTipo(e.target.value)}
                            disabled={!editable}
                        >
                            <option value="2">Reservatório Predial Superior</option>
                            <option value="3">Reservatório Predial Inferior</option>
                            <option value="4">Reservatório de Distribuição Superior</option>
                            <option value="5">Reservatório de Distribuição Inferior</option>
                            <option value="6">CAERN</option>
                        </select>

                        <label htmlFor="quantidade">Quantidade de Reservatórios:</label>
                        <select
                            id="quantidade"
                            name="quantidade"
                            defaultValue={ponto?.quantidade ?? ''}
                            className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                            disabled={!editable}
                        >
                            <option value="1">1 Reservatório</option>
                            <option value="2">2 Reservatórios Interligados</option>
                            <option value="3">3 Reservatórios Interligados</option>
                        </select>

                    </>
                )}



                <label htmlFor="localizacao">Localização:</label>
                <input
                    type="text"
                    id="localizacao"
                    name="localizacao"
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    defaultValue={ponto?.localizacao ?? ''}
                    disabled={!editable}
                />

                <label htmlFor="capacidade">Capacidade (L):</label>
                <input
                    type="number"
                    id="capacidade"
                    name="capacidade"
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    placeholder="1000"
                    defaultValue={ponto?.capacidade ?? ''}
                    disabled={!editable}
                />

                <label htmlFor="material">Material:</label>
                <input
                    type="text"
                    id="material"
                    name="material"
                    placeholder="Polietileno, Alvenaria, Fibra de Vidro, etc."
                    defaultValue={ponto?.material ?? ''}
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    disabled={!editable}
                />

                <label htmlFor="fonte_informacao">Fonte de Informação:</label>
                <input
                    type="text"
                    id="fonte_informacao"
                    name="fonte_informacao"
                    placeholder="Encanador da UFERSA"
                    defaultValue={ponto?.fonte_informacao ?? ''}
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    disabled={!editable}
                />

                <label htmlFor="observacao">Observação:</label>
                <textarea
                    id="observacao"
                    name="observacao"
                    placeholder="Informações adicionais..."
                    defaultValue={ponto?.observacao ?? ''}
                    className="rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                    disabled={!editable}
                />

                {
                    pontos.length > 0 && (
                        <>
                            <label htmlFor="amontante">Ponto a montante (Abastece):</label>
                            <div className="flex">

                                <select
                                    id="amontante"
                                    name="amontante"
                                    className="w-full rounded-md border border-neutral-200 px-6 py-4 disabled:bg-neutral-200 disabled:text-neutral-500"
                                    defaultValue={pontos.length > 0 ? ponto?.amontante?.id : undefined}
                                    disabled={!editable}
                                    onChange={e => { setCurrentAmontante(e.target.value); }}
                                >
                                    <option value="">-</option>
                                    {pontosAmontantes.map((ponto: Ponto) => {
                                        return (
                                            <option className="" value={ponto.id} key={ponto.id}>
                                                {TIPOS_PONTOS[ponto.tipo]}
                                                {ponto.localizacao && ponto.localizacao.trim() != "-" && ponto.localizacao.trim() != "nan" && ponto.localizacao.trim() != "" ? "- " + ponto.localizacao : ""}
                                            </option>
                                        );
                                    })}
                                </select>

                                <a className="flex justify-center" href={currentAmontante ? "/admin/pontos/" + currentAmontante : "#"} target={currentAmontante ? "_blank" : "_self"}>
                                    <svg className={currentAmontante ? `w-6 mx-4 fill-primary-600` : `w-6 mx-4 fill-neutral-500`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512">
                                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                                    </svg>
                                </a>

                            </div>
                        </>)
                }

                <label htmlFor="foto">Imagem:</label>
                <MultipleImageInput
                    images={images}
                    setImages={setImages}
                    existingImages={existingImages}
                    removeExistingImage={removeExistingImage}
                    disabled={!editable}
                />

                <label>QR code:</label>
                <QRCode data={process.env.NEXT_PUBLIC_BASE_URL + "/pontos/" + params.id_ponto} width={150} />

                <input
                    id="editar"
                    type="submit"
                    className={`rounded-lg border ${editable ? 'bg-green-500 hover:bg-green-600' : 'bg-primary-500 hover:bg-primary-600'} px-6 py-4 text-center font-semibold text-white`}
                    onClick={event => {
                        if (!editable) {
                            event.preventDefault();
                            setEditable(true);
                        }
                    }}
                    value={editable ? "Salvar" : "Habilitar edição"}
                />

                <button
                    type="button"
                    className={`rounded-lg border bg-red-500 px-6 py-4 text-center font-semibold text-white hover:bg-red-600 disabled:bg-gray-400 disabled:text-gray-300 ${editable ? '' : 'hidden'}`}
                    disabled={!editable}
                    onClick={deletePonto}
                >
                    Excluir
                </button>

                {editable && (
                    <>
                        <input
                            type="reset"
                            className={`rounded-lg border bg-gray-500 px-6 py-4 text-center font-semibold text-white hover:bg-gray-600`}
                            value="Cancelar"
                        >
                        </input>
                    </>
                )}
            </form >
        </>
    );
}
