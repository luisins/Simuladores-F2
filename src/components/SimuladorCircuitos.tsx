import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, RotateCcw, CheckCircle, HelpCircle, Activity } from "lucide-react";
import { CircuitType, ResistorStats } from "../types";
import ManualUso from "./ManualUso";

interface SimuladorCircuitosProps {
  volverAlMenu: () => void;
}

export default function SimuladorCircuitos({ volverAlMenu }: SimuladorCircuitosProps) {
  // Parámetros de simulación
  const [voltaje, setVoltaje] = useState<number>(9);
  const [r1, setR1] = useState<number>(10);
  const [r2, setR2] = useState<number>(10);
  const [r3, setR3] = useState<number>(10);
  const [r4, setR4] = useState<number>(10);
  const [r5, setR5] = useState<number>(10);
  const [r6, setR6] = useState<number>(10);
  const [llaveB, setLlaveB] = useState<boolean>(false);

  const [circuitoActivo, setCircuitoActivo] = useState<CircuitType>("a");
  const [mostrarExplicacion, setMostrarExplicacion] = useState<boolean>(true);
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [flowDirection, setFlowDirection] = useState<"conventional" | "electrons">("conventional");
  const [selectedResistor, setSelectedResistor] = useState<string | null>(null);
  const [mostrarManual, setMostrarManual] = useState<boolean>(false);

  const restablecerValores = () => {
    setVoltaje(30);
    setR1(25);
    setR2(20);
    setR3(10);
    setR4(15);
    setR5(30);
    setR6(10);
    setLlaveB(false);
    setSelectedResistor(null);
  };

  // Cálculos para circuito (a)
  const calcularCircuitoA = (): ResistorStats => {
    const r145 = r1 + r4 + r5;
    let r3145 = 0;
    let i3 = 0;
    let i145 = 0;

    if (r3 === 0 && r145 === 0) {
      r3145 = 0;
    } else if (r3 === 0) {
      r3145 = 0;
    } else if (r145 === 0) {
      r3145 = 0;
    } else {
      r3145 = 1 / (1 / r3 + 1 / r145);
    }

    const req = r2 + r3145 + r6;
    const iTotal = req > 0 ? voltaje / req : 0;
    const v3145 = iTotal * r3145;

    if (r3 === 0 && r145 === 0) {
      // Reparto equitativo si ambas fuesen 0 (teórico límite)
      i3 = iTotal / 2;
      i145 = iTotal / 2;
    } else if (r3 === 0) {
      // R3 es un cortocircuito absoluto: toda la corriente se desvía por R3. La rama derecha R145 se anula (0 A)
      i3 = iTotal;
      i145 = 0;
    } else if (r145 === 0) {
      i3 = 0;
      i145 = iTotal;
    } else {
      i3 = v3145 / r3;
      i145 = v3145 / r145;
    }

    return {
      req,
      iTotal,
      iR1: i145,
      iR2: iTotal,
      iR3: i3,
      iR4: i145,
      iR5: i145,
      iR6: iTotal,
      rGroupParallel: r3145,
      vGroupParallel: v3145,
      rGroupSeries: r145,
      verificacion: Math.abs(iTotal - (i3 + i145)) < 1e-4
    };
  };

  // Cálculos para circuito (b)
  const calcularCircuitoB = (): ResistorStats => {
    if (llaveB) {
      const req = r1;
      const iTotal = req > 0 ? voltaje / req : 0;
      return {
        req,
        iTotal,
        iR1: iTotal,
        iR2: 0,
        iR3: 0,
        iR4: 0,
        iR5: 0,
        iR6: 0,
        rGroupParallel: 0,
        vGroupParallel: 0,
        verificacion: true
      };
    }

    let r23 = 0;
    let i2 = 0;
    let i3 = 0;

    if (r2 === 0 && r3 === 0) {
      r23 = 0;
    } else if (r2 === 0) {
      r23 = 0;
    } else if (r3 === 0) {
      r23 = 0;
    } else {
      r23 = 1 / (1 / r2 + 1 / r3);
    }

    const req = r1 + r23 + r4 + r5;
    const iTotal = req > 0 ? voltaje / req : 0;
    const v23 = iTotal * r23;

    if (r2 === 0 && r3 === 0) {
      i2 = iTotal / 2;
      i3 = iTotal / 2;
    } else if (r2 === 0) {
      i2 = iTotal;
      i3 = 0;
    } else if (r3 === 0) {
      i2 = 0;
      i3 = iTotal;
    } else {
      i2 = v23 / r2;
      i3 = v23 / r3;
    }

    return {
      req,
      iTotal,
      iR1: iTotal,
      iR2: i2,
      iR3: i3,
      iR4: iTotal,
      iR5: iTotal,
      iR6: 0, // No está en B
      rGroupParallel: r23,
      vGroupParallel: v23,
      verificacion: Math.abs(iTotal - (i2 + i3)) < 1e-4
    };
  };

  const resultados: ResistorStats = circuitoActivo === "a" ? calcularCircuitoA() : calcularCircuitoB();

  // Pasos del tutorial interactivo
  // ─── Cortocircuito en circuito A: R3 = 0 ───────────────────────────────────
  const cortocircuitoA = r3 === 0;
  const pasosA = cortocircuitoA
    ? [
        { text: "⚠️ CORTOCIRCUITO en R₃: su resistencia es 0 Ω. Esto convierte a R₃ en un conductor ideal que une directamente los dos nodos del grupo paralelo.", formula: `R₃ = 0 Ω → cortocircuito` },
        { text: "Al haber cortocircuito en R₃, el voltaje entre los nodos del paralelo cae a 0 V. Por lo tanto, la rama R₁-R₄-R₅ no recibe tensión: I(R₁) = I(R₄) = I(R₅) = 0 A.", formula: `V_nodos = 0 V  →  I₁₄₅ = 0 A` },
        { text: "La resistencia equivalente del paralelo se reduce a 0 Ω (R₃ en cortocircuito domina). El circuito simplificado queda: R₂ + 0 + R₆.", formula: `R_eq = R₂ + 0 + R₆ = ${r2} + 0 + ${r6} = ${resultados.req.toFixed(2)} Ω` },
        { text: "Calculamos la corriente total que sale de la batería con la resistencia equivalente simplificada.", formula: `I_total = V / R_eq = ${voltaje}V / ${resultados.req.toFixed(2)}Ω = ${resultados.iTotal.toFixed(3)} A` },
        { text: "Toda esa corriente pasa íntegramente por R₃ (el cortocircuito). R₁, R₄ y R₅ no participan en el circuito activo.", formula: `I₃ = I_total = ${resultados.iTotal.toFixed(3)} A   |   I₁ = I₄ = I₅ = 0 A` },
        { text: "R₂ y R₆ llevan la corriente total (están en serie con la fuente).", formula: `I(R₂) = I(R₆) = ${resultados.iTotal.toFixed(3)} A` }
      ]
    : [
        { text: "R₁, R₄ y R₅ están conectadas en serie, por ellas viaja la misma corriente.", formula: `R₁₄₅ = R₁ + R₄ + R₅ = ${r1} + ${r4} + ${r5} = ${resultados.rGroupSeries} Ω` },
        { text: "R₃ está en paralelo con el equivalente R₁₄₅ (tienen los mismos nodos).", formula: `R₃₁₄₅ = (R₃ · R₁₄₅) / (R₃ + R₁₄₅) = (${r3} · ${resultados.rGroupSeries}) / (${r3} + ${resultados.rGroupSeries}) = ${resultados.rGroupParallel?.toFixed(2)} Ω` },
        { text: "El conjunto paralelo está en serie con R₂ y R₆.", formula: `R_eq = R₂ + R₃₁₄₅ + R₆ = ${r2} + ${resultados.rGroupParallel?.toFixed(2)} + ${r6} = ${resultados.req.toFixed(2)} Ω` },
        { text: "Calculamos la corriente principal del circuito por la Ley de Ohm.", formula: `I₁ = V / R_eq = ${voltaje}V / ${resultados.req.toFixed(2)}Ω = ${resultados.iTotal.toFixed(3)} A` },
        { text: "Voltaje en bornes de la rama paralela central.", formula: `V₃₁₄₅ = I₁ · R₃₁₄₅ = ${resultados.iTotal.toFixed(3)}A · ${resultados.rGroupParallel?.toFixed(2)}Ω = ${resultados.vGroupParallel?.toFixed(2)} V` },
        { text: "Corriente por R₃ (rama central).", formula: `I₃ = V₃₁₄₅ / R₃ = ${resultados.vGroupParallel?.toFixed(2)}V / ${r3}Ω = ${resultados.iR3.toFixed(3)} A` },
        { text: "Corriente por R₁, R₄ y R₅ (rama derecha).", formula: `I₂ = V₃₁₄₅ / R₁₄₅ = ${resultados.vGroupParallel?.toFixed(2)}V / ${resultados.rGroupSeries}Ω = ${resultados.iR1.toFixed(3)} A` }
      ];

  // ─── Cortocircuito en circuito B: R2=0 o R3=0 ──────────────────────────────
  const cortocircuitoB_R2 = r2 === 0;
  const cortocircuitoB_R3 = r3 === 0;
  const cortocircuitoB = cortocircuitoB_R2 || cortocircuitoB_R3;
  const rCortaB = cortocircuitoB_R2 ? "R₂" : "R₃";
  const rAbiertaB = cortocircuitoB_R2 ? "R₃" : "R₂";
  const iRCortaB = cortocircuitoB_R2 ? resultados.iR2 : resultados.iR3;
  const pasosB = llaveB
    ? [
        { text: `⚠️ LLAVE CERRADA: La llave conecta el nodo antes de R₂/R₃ directamente con el retorno. Esto provoca un cortocircuito que puentea R₂, R₃, R₄ y R₅.`, formula: `Llave cerrada → cortocircuito` },
        { text: `La corriente elige el camino de menor resistencia (0 Ω de la llave), por lo que no fluye corriente por el resto de los componentes.`, formula: `I(R₂) = I(R₃) = I(R₄) = I(R₅) = 0 A` },
        { text: `La resistencia equivalente del circuito se reduce únicamente a R₁.`, formula: `R_eq = R₁ = ${r1} Ω` },
        { text: `Calculamos la nueva corriente principal suministrada por la batería.`, formula: `I_total = V / R_eq = ${voltaje}V / ${r1}Ω = ${resultados.iTotal.toFixed(3)} A` }
      ]
    : cortocircuitoB
    ? [
        { text: `⚠️ CORTOCIRCUITO en ${rCortaB}: su resistencia es 0 Ω. Actúa como conductor perfecto entre los nodos del paralelo.`, formula: `${rCortaB} = 0 Ω → cortocircuito` },
        { text: `El voltaje en los nodos del paralelo cae a 0 V, por lo que ${rAbiertaB} no recibe tensión y su corriente es 0 A.`, formula: `V_nodos = 0 V  →  I(${rAbiertaB}) = 0 A` },
        { text: `La resistencia equivalente del paralelo es 0 Ω. El circuito simplificado es: R₁ + 0 + R₄ + R₅.`, formula: `R_eq = R₁ + 0 + R₄ + R₅ = ${r1} + 0 + ${r4} + ${r5} = ${resultados.req.toFixed(2)} Ω` },
        { text: "Calculamos la corriente total que suministra la batería.", formula: `I_total = V / R_eq = ${voltaje}V / ${resultados.req.toFixed(2)}Ω = ${resultados.iTotal.toFixed(3)} A` },
        { text: `Toda la corriente fluye por ${rCortaB} (cortocircuito). R₁, R₄ y R₅ conducen I_total en serie.`, formula: `I(${rCortaB}) = I_total = ${iRCortaB.toFixed(3)} A   |   I(${rAbiertaB}) = 0 A` }
      ]
    : [
        { text: "R₂ y R₃ están en paralelo entre sí. Se reducen a un valor equivalente.", formula: `R₂₃ = (R₂ · R₃) / (R₂ + R₃) = (${r2} · ${r3}) / (${r2} + ${r3}) = ${resultados.rGroupParallel?.toFixed(2)} Ω` },
        { text: "El circuito equivalente queda con R₁, R₂₃, R₄ y R₅ conectadas en serie.", formula: `R_eq = R₁ + R₂₃ + R₄ + R₅` },
        { text: `Simplificamos la suma para hallar la resistencia equivalente total.`, formula: `R_eq = ${r1}Ω + ${resultados.rGroupParallel?.toFixed(2)}Ω + ${r4}Ω + ${r5}Ω = ${resultados.req.toFixed(2)} Ω` },
        { text: `Calculamos la corriente principal suministrada por la batería.`, formula: `I_total = V / R_eq = ${voltaje}V / ${resultados.req.toFixed(2)}Ω = ${resultados.iTotal.toFixed(3)} A` },
        { text: "Caído de tensión en la asociación paralela central.", formula: `V₂₃ = I_total · R₂₃ = ${resultados.iTotal.toFixed(3)}A · ${resultados.rGroupParallel?.toFixed(2)}Ω = ${resultados.vGroupParallel?.toFixed(2)} V` },
        { text: "Corriente por R₂.", formula: `I₂ = V₂₃ / R₂ = ${resultados.vGroupParallel?.toFixed(2)}V / ${r2}Ω = ${resultados.iR2.toFixed(3)} A` },
        { text: "Corriente por R₃.", formula: `I₃ = V₂₃ / R₃ = ${resultados.vGroupParallel?.toFixed(2)}V / ${r3}Ω = ${resultados.iR3.toFixed(3)} A` }
      ];

  const pasosActuales = circuitoActivo === "a" ? pasosA : pasosB;

  // Resetear el paso si el total de pasos cambió (p.ej. al activar un cortocircuito)
  useEffect(() => {
    if (pasoActual >= pasosActuales.length) {
      setPasoActual(0);
    }
  }, [pasosActuales.length]);

  const avanzarPaso = () => {
    if (pasoActual < pasosActuales.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const retrocederPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  // Renderizadores de resistencias SVG personalizados
  const drawHorizontalResistor = (x: number, y: number, length = 80) => {
    const zigW = 40;
    const sideW = (length - zigW) / 2;
    const startX = x - length / 2;
    return `M ${startX} ${y} h ${sideW} l 4 -8 l 8 16 l 8 -16 l 8 16 l 8 -16 l 4 8 h ${sideW}`;
  };

  const drawVerticalResistor = (x: number, y: number, height = 80) => {
    const zigH = 40;
    const sideH = (height - zigH) / 2;
    const startY = y - height / 2;
    return `M ${x} ${startY} v ${sideH} l -8 4 l 16 8 l -16 8 l 16 8 l -16 8 l 8 4 v ${sideH}`;
  };

  // Clases dinámicas de flujo de animación
  const getVelocityStyle = (iVal: number) => {
    if (Math.abs(iVal) < 0.001) return { "--flow-speed": "0s" } as React.CSSProperties;
    const duration = 0.4 / Math.abs(iVal);
    const speed = Math.max(0.15, Math.min(8, duration));
    return { "--flow-speed": `${speed.toFixed(2)}s` } as React.CSSProperties;
  };

  const getFlowClass = (iVal: number, comp: string) => {
    const isZero = Math.abs(iVal) < 0.001;
    const hl = getHighlightClass(comp);
    return `wire-flow ${flowDirection === "electrons" ? "electrons" : ""} ${isZero ? "zero-current" : ""} ${hl}`;
  };

  const getHighlightClass = (comp: string) => {
    if (circuitoActivo === "a") {
      if (pasoActual === 0 || pasoActual === 1) {
        if (["r1", "r4", "r5", "wire145"].includes(comp)) return "highlight-series";
      }
      if (pasoActual === 2 || pasoActual === 3) {
        if (["r3", "wire3"].includes(comp)) return "highlight-parallel";
        if (["r1", "r4", "r5", "wire145"].includes(comp)) return "highlight-series";
      }
      if (pasoActual === 4 || pasoActual === 5) {
        if (["r2", "r3", "r6", "wire2", "wire6", "wire3", "wire145"].includes(comp)) return "highlight-active";
      }
      if (pasoActual >= 6) {
        if (["r1", "r2", "r3", "r4", "r5", "r6", "wire-battery", "wire2", "wire3", "wire145", "wire6"].includes(comp)) return "highlight-active";
      }
    } else {
      if (pasoActual === 0 || pasoActual === 1) {
        if (["r2", "r3", "wire23"].includes(comp)) return "highlight-parallel";
      }
      if (pasoActual === 2 || pasoActual === 3) {
        if (["r1", "r4", "r5", "wire1", "wire4", "wire5"].includes(comp)) return "highlight-series";
        if (["r2", "r3", "wire23"].includes(comp)) return "highlight-parallel";
      }
      if (pasoActual >= 4) {
        if (["r1", "r2", "r3", "r4", "r5", "wire1", "wire4", "wire5", "wire23", "wire-battery"].includes(comp)) return "highlight-active";
      }
    }
    return "";
  };

  const getComponentDetails = () => {
    if (!selectedResistor) return null;

    if (selectedResistor === "battery") {
      return {
        title: "Batería de Corriente Continua",
        icon: "🔋",
        value: voltaje,
        setValue: setVoltaje,
        min: 1,
        max: 60,
        unit: "V",
        params: [
          { label: "Voltaje total (V)", value: `${voltaje} V` },
          { label: "Corriente total (I₁)", value: `${resultados.iTotal.toFixed(3)} A` },
          { label: "Energía total entregada", value: `${(voltaje * resultados.iTotal).toFixed(2)} Watts` }
        ]
      };
    }

    const valueMap: Record<string, number> = { r1, r2, r3, r4, r5, r6 };
    const setterMap: Record<string, React.Dispatch<React.SetStateAction<number>>> = {
      r1: setR1,
      r2: setR2,
      r3: setR3,
      r4: setR4,
      r5: setR5,
      r6: setR6
    };

    const rVal = valueMap[selectedResistor];
    const setRVal = setterMap[selectedResistor];

    let iVal = 0;
    if (circuitoActivo === "a") {
      if (selectedResistor === "r1") iVal = resultados.iR1;
      if (selectedResistor === "r2") iVal = resultados.iR2;
      if (selectedResistor === "r3") iVal = resultados.iR3;
      if (selectedResistor === "r4") iVal = resultados.iR4;
      if (selectedResistor === "r5") iVal = resultados.iR5;
      if (selectedResistor === "r6") iVal = resultados.iR6;
    } else {
      if (selectedResistor === "r1") iVal = resultados.iR1;
      if (selectedResistor === "r2") iVal = resultados.iR2;
      if (selectedResistor === "r3") iVal = resultados.iR3;
      if (selectedResistor === "r4") iVal = resultados.iR4;
      if (selectedResistor === "r5") iVal = resultados.iR5;
    }

    return {
      title: `Resistencia ${selectedResistor.toUpperCase()}`,
      value: rVal,
      setValue: setRVal,
      min: 0,
      max: 100,
      unit: "Ω",
      params: [
        { label: "Resistencia (R)", value: `${rVal} Ω` },
        { label: "Corriente individual (I)", value: `${iVal.toFixed(3)} A` },
        { label: "Caída de potencial (V)", value: `${(iVal * rVal).toFixed(2)} V` },
        { label: "Calor disipado (P)", value: `${(iVal * iVal * rVal).toFixed(2)} W (Efecto joule)` }
      ]
    };
  };

  const compDetails = getComponentDetails();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar / Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={volverAlMenu}
              className="group flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl transition-all cursor-pointer font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Menú
            </button>
            <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
            <div>
              <h1 className="font-display font-extrabold text-lg leading-tight tracking-tight">
                Simulador de Circuitos Interactivos
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                Problema G4P8
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMostrarManual(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10 transition-colors text-xs border border-indigo-500"
            >
              <BookOpen className="w-4 h-4" /> Guía Práctica de Uso
            </button>
            <button
              onClick={restablecerValores}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl cursor-pointer transition-colors text-xs border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Valores Originales (PDF)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Selector de circuito */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
            <h2 className="font-display font-bold text-base text-slate-800">Elegir el circuito de la Figura 5:</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => { setCircuitoActivo("a"); setPasoActual(0); setSelectedResistor(null); }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${circuitoActivo === "a"
                  ? "border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-600/5"
                  : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <div>
                <span className="text-2xl mb-1 block">🔷</span>
                <span className="font-display font-bold text-slate-800 text-sm block">Circuito Combinado Mixto (a)</span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Consiste en {r1 ? "6" : "varias"} resistencias agrupadas donde R₁, R₄ y R₅ están en serie y todo el grupo queda en paralelo absoluto con r₃.
                </p>
              </div>
            </button>

            <button
              onClick={() => { setCircuitoActivo("b"); setPasoActual(0); setSelectedResistor(null); }}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${circuitoActivo === "b"
                  ? "border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-600/5"
                  : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <div>
                <span className="text-2xl mb-1 block">🔹</span>
                <span className="font-display font-bold text-slate-800 text-sm block">Circuito Mixto Simple (b)</span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Compuesto por 5 resistencias. R₂ y R₃ están en paralelo entre sí, todo conectado en serie sólida al circuito principal.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Toggle electron mode */}
        <div className="switch-container">
          <span className={`switch-label ${flowDirection === "conventional" ? "text-indigo-600" : ""}`}>
            ⚡ Corriente Convencional (+ a -)
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={flowDirection === "electrons"}
              onChange={(e) => setFlowDirection(e.target.checked ? "electrons" : "conventional")}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`switch-label ${flowDirection === "electrons" ? "text-red-500" : ""}`}>
            ⚛️ Flujo de Electrones (- a +)
          </span>
        </div>

        {/* Circuit interactive area split */}
        <section className="circuit-container-interactive">
          <div className="circuit-drawing">
            <h3 className="font-display font-bold text-slate-800 text-sm margin-0 mb-4">
              Circuito Figura 5{circuitoActivo === "a" ? "a" : "b"} - Esquemático Interactivo
            </h3>

            {circuitoActivo === "a" ? (
              <div className="circuito-a-original">
                <svg viewBox="0 0 550 400" className="circuit-svg-original">
                  <path d="M 55 210 V 100 H 140" className="wire-base" />
                  <path d="M 220 100 H 260" className="wire-base" />
                  <path d="M 260 100 V 320" className="wire-base" />
                  <path d="M 260 100 H 420 V 320 H 260" className="wire-base" />
                  <path d="M 260 320 H 55 V 250" className="wire-base" />

                  {/* Flow overlays */}
                  <path d="M 55 210 V 100 H 140" className={getFlowClass(resultados.iTotal, "wire-battery")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 140 100 H 220" className={getFlowClass(resultados.iTotal, "r2")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 220 100 H 260" className={getFlowClass(resultados.iTotal, "wire2")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 260 100 V 320" className={getFlowClass(resultados.iR3, "wire3")} style={getVelocityStyle(resultados.iR3)} />
                  <path d="M 260 100 H 420 V 320 H 260" className={getFlowClass(resultados.iR1, "wire145")} style={getVelocityStyle(resultados.iR1)} />
                  <path d="M 260 320 H 55 V 250" className={getFlowClass(resultados.iTotal, "wire6")} style={getVelocityStyle(resultados.iTotal)} />

                  <circle cx="260" cy="100" r="5" fill="#1e293b" />
                  <circle cx="260" cy="320" r="5" fill="#1e293b" />

                  {/* Battery */}
                  <g className={`interactive-resistor ${selectedResistor === "battery" ? "selected" : ""} ${getHighlightClass("battery")}`} onClick={() => setSelectedResistor("battery")}>
                    <rect x="22" y="195" width="66" height="70" className="resistor-bg" />
                    <rect x="30" y="210" width="50" height="40" rx="6" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />
                    {/* Polarity indicators */}
                    <circle cx="55" cy="195" r="8" fill="#ef4444" className="stroke-white" strokeWidth="1" />
                    <text x="55" y="198" textAnchor="middle" fill="white" className="text-xs font-black font-sans">+</text>
                    <circle cx="55" cy="265" r="8" fill="#3b82f6" className="stroke-white" strokeWidth="1" />
                    <text x="55" y="268" textAnchor="middle" fill="white" className="text-xs font-black font-sans">-</text>

                    <text x="55" y="234" textAnchor="middle" fill="white" className="font-mono text-xs font-bold">{voltaje}V</text>
                    <text x="55" y="260" textAnchor="middle" fill="#1e293b" className="text-[10px] font-bold">Batería</text>
                  </g>

                  {/* resistors */}
                  <g className={`interactive-resistor ${selectedResistor === "r2" ? "selected" : ""} ${getHighlightClass("r2")}`} onClick={() => setSelectedResistor("r2")}>
                    <rect x="135" y="75" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(180, 100, 80)} className="resistor-path" />
                    <text x="180" y="85" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₂</text>
                    <text x="180" y="120" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r2}Ω</text>
                  </g>

                  <g className={`interactive-resistor ${selectedResistor === "r1" ? "selected" : ""} ${getHighlightClass("r1")}`} onClick={() => setSelectedResistor("r1")}>
                    <rect x="295" y="75" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(340, 100, 80)} className="resistor-path" />
                    <text x="340" y="85" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₁</text>
                    <text x="340" y="120" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r1}Ω</text>
                  </g>

                  <g className={`interactive-resistor ${selectedResistor === "r3" ? "selected" : ""} ${getHighlightClass("r3")}`} onClick={() => setSelectedResistor("r3")}>
                    <rect x="235" y="165" width="50" height="90" className="resistor-bg" />
                    <path d={drawVerticalResistor(260, 210, 80)} className="resistor-path" />
                    <text x="230" y="215" textAnchor="end" className="text-xs font-bold" fill="#1e293b">R₃</text>
                    <text x="230" y="232" textAnchor="end" className="text-[10px] font-mono fill-slate-400" >{r3}Ω</text>
                  </g>

                  <g className={`interactive-resistor ${selectedResistor === "r4" ? "selected" : ""} ${getHighlightClass("r4")}`} onClick={() => setSelectedResistor("r4")}>
                    <rect x="395" y="165" width="50" height="90" className="resistor-bg" />
                    <path d={drawVerticalResistor(420, 210, 80)} className="resistor-path" />
                    <text x="445" y="215" textAnchor="start" className="text-xs font-bold" fill="#1e293b">R₄</text>
                    <text x="445" y="232" textAnchor="start" className="text-[10px] font-mono fill-slate-400" >{r4}Ω</text>
                  </g>

                  <g className={`interactive-resistor ${selectedResistor === "r5" ? "selected" : ""} ${getHighlightClass("r5")}`} onClick={() => setSelectedResistor("r5")}>
                    <rect x="295" y="295" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(340, 320, 80)} className="resistor-path" />
                    <text x="340" y="305" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₅</text>
                    <text x="340" y="340" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r5}Ω</text>
                  </g>

                  <g className={`interactive-resistor ${selectedResistor === "r6" ? "selected" : ""} ${getHighlightClass("r6")}`} onClick={() => setSelectedResistor("r6")}>
                    <rect x="135" y="295" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(180, 320, 80)} className="resistor-path" />
                    <text x="180" y="305" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₆</text>
                    <text x="180" y="340" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r6}Ω</text>
                  </g>

                  <text x="100" y="90" className="terminal-label">a</text>
                  <text x="100" y="340" className="terminal-label">b</text>
                </svg>
              </div>
            ) : (
              <div className="circuito-b-original">
                <svg viewBox="0 0 550 400" className="circuit-svg-original">
                  <path d="M 55 210 V 100 H 140" className="wire-base" />
                  <path d="M 220 100 H 260" className="wire-base" />
                  <path d="M 260 100 H 420" className="wire-base" />
                  <path d="M 260 100 V 210 H 420 V 100" className="wire-base" />
                  <path d="M 420 100 H 500 V 320 H 260" className="wire-base" />
                  <path d="M 260 320 H 55 V 250" className="wire-base" />

                  {/* Flow indicators */}
                  <path d="M 55 210 V 100 H 140" className={getFlowClass(resultados.iTotal, "wire-battery")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 140 100 H 220" className={getFlowClass(resultados.iTotal, "r1")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 220 100 H 260" className={getFlowClass(resultados.iTotal, "wire1")} style={getVelocityStyle(resultados.iTotal)} />
                  <path d="M 260 100 H 420" className={getFlowClass(resultados.iR2, "wire2")} style={getVelocityStyle(resultados.iR2)} />
                  <path d="M 260 100 V 210 H 420 V 100" className={getFlowClass(resultados.iR3, "wire23")} style={getVelocityStyle(resultados.iR3)} />
                  <path d="M 420 100 H 500 V 320 H 260" className={getFlowClass(resultados.iR4, "wire4")} style={getVelocityStyle(resultados.iR4)} />
                  <path d="M 260 320 H 55 V 250" className={getFlowClass(resultados.iTotal, "wire-return")} style={getVelocityStyle(resultados.iTotal)} />
                  {llaveB && <path d="M 260 210 V 320" className={getFlowClass(resultados.iTotal, "wire-switch")} style={getVelocityStyle(resultados.iTotal)} />}

                  <circle cx="260" cy="100" r="5" fill="#2c3e50" />
                  <circle cx="420" cy="100" r="5" fill="#2c3e50" />

                  {/* Switch LLAVE B */}
                  <g className="cursor-pointer" onClick={() => setLlaveB(!llaveB)}>
                    <circle cx="260" cy="210" r="4" fill="#1e293b" />
                    <circle cx="260" cy="320" r="4" fill="#1e293b" />
                    {llaveB ? (
                      <line x1="260" y1="210" x2="260" y2="320" stroke="#3b82f6" strokeWidth="3" />
                    ) : (
                      <line x1="260" y1="210" x2="230" y2="280" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    )}
                    <text x="235" y="260" className="text-[10px] font-bold" fill={llaveB ? "#3b82f6" : "#ef4444"}>Llave</text>
                  </g>

                  {/* Component: Battery */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'battery' ? 'selected' : ''} ${getHighlightClass('battery')}`}
                    onClick={() => setSelectedResistor('battery')}
                  >
                    <rect x="22" y="195" width="66" height="70" className="resistor-bg" />
                    <rect x="30" y="210" width="50" height="40" rx="6" fill="url(#batteryGradB)" stroke="#2c3e50" strokeWidth="2" />
                    {/* Polarity indicators */}
                    <circle cx="55" cy="195" r="8" fill="#ef4444" className="stroke-white" strokeWidth="1" />
                    <text x="55" y="198" textAnchor="middle" fill="white" className="text-xs font-black font-sans">+</text>
                    <circle cx="55" cy="265" r="8" fill="#3b82f6" className="stroke-white" strokeWidth="1" />
                    <text x="55" y="268" textAnchor="middle" fill="white" className="text-xs font-black font-sans">-</text>

                    <text x="55" y="234" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{voltaje}V</text>
                    <text x="55" y="260" textAnchor="middle" fill="#2c3e50" fontSize="10" fontWeight="bold">Batería</text>
                  </g>

                  {/* R1 */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'r1' ? 'selected' : ''} ${getHighlightClass('r1')}`}
                    onClick={() => setSelectedResistor('r1')}
                  >
                    <rect x="135" y="75" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(180, 100, 80)} className="resistor-path" />
                    <text x="180" y="85" textAnchor="middle" fill="#2c3e50" fontSize="12" fontWeight="bold">R₁</text>
                    <text x="180" y="120" textAnchor="middle" fill="#7f8c8d" fontSize="11" fontWeight="bold">{r1}Ω</text>
                  </g>

                  {/* R2 */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'r2' ? 'selected' : ''} ${getHighlightClass('r2')} ${llaveB ? 'opacity-30' : ''}`}
                    onClick={() => setSelectedResistor('r2')}
                  >
                    <rect x="295" y="75" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(340, 100, 80)} className="resistor-path" />
                    <text x="340" y="85" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₂</text>
                    <text x="340" y="120" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r2}Ω</text>
                  </g>

                  {/* R3 */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'r3' ? 'selected' : ''} ${getHighlightClass('r3')} ${llaveB ? 'opacity-30' : ''}`}
                    onClick={() => setSelectedResistor('r3')}
                  >
                    <rect x="295" y="185" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(340, 210, 80)} className="resistor-path" />
                    <text x="340" y="195" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₃</text>
                    <text x="340" y="230" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r3}Ω</text>
                  </g>

                  {/* R4 */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'r4' ? 'selected' : ''} ${getHighlightClass('r4')} ${llaveB ? 'opacity-30' : ''}`}
                    onClick={() => setSelectedResistor('r4')}
                  >
                    <rect x="475" y="165" width="50" height="90" className="resistor-bg" />
                    <path d={drawVerticalResistor(500, 210, 80)} className="resistor-path" />
                    <text x="525" y="215" textAnchor="start" className="text-xs font-bold" fill="#1e293b">R₄</text>
                    <text x="525" y="232" textAnchor="start" className="text-[10px] font-mono fill-slate-400" >{r4}Ω</text>
                  </g>

                  {/* R5 */}
                  <g
                    className={`interactive-resistor ${selectedResistor === 'r5' ? 'selected' : ''} ${getHighlightClass('r5')} ${llaveB ? 'opacity-30' : ''}`}
                    onClick={() => setSelectedResistor('r5')}
                  >
                    <rect x="295" y="295" width="90" height="50" className="resistor-bg" />
                    <path d={drawHorizontalResistor(340, 320, 80)} className="resistor-path" />
                    <text x="340" y="305" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₅</text>
                    <text x="340" y="340" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r5}Ω</text>
                  </g>

                  <text x="100" y="90" className="terminal-label">a</text>
                  <text x="100" y="340" className="terminal-label">b</text>
                </svg>
              </div>
            )}
          </div>

          {/* Details sidebar card */}
          <div className="details-card-container">
            {compDetails ? (
              <div className="component-details-card">
                <h4 className="font-display font-bold text-slate-800 text-sm flex gap-2">
                  <span>{compDetails.icon}</span>
                  <span>{compDetails.title}</span>
                </h4>

                <div className="slider-card-interactive">
                  <label className="text-xs font-semibold text-slate-600">
                    Ajustar valor ({compDetails.unit}):
                  </label>
                  <input
                    type="range"
                    min={compDetails.min}
                    max={compDetails.max}
                    value={compDetails.value}
                    onChange={(e) => compDetails.setValue(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="details-grid mt-4">
                  {compDetails.params.map((p, i) => (
                    <div className="details-item" key={i}>
                      <span>{p.label}</span>
                      <span>{p.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-6 bg-slate-950 text-white rounded-xl py-2 font-bold text-xs cursor-pointer hover:bg-slate-900 border-none transition-all"
                  onClick={() => setSelectedResistor(null)}
                >
                  Cerrar panel
                </button>
              </div>
            ) : (
              <div className="details-placeholder leading-relaxed">
                <div className="details-placeholder-icon">💡</div>
                <h4 className="font-bold text-slate-800 text-sm">Información interactiva</h4>
                <p className="text-xs">
                  Haz clic directamente sobre cualquier <strong>resistencia o batería</strong> del diagrama para inspeccionar su voltaje, flujo y potencia, o ajustar su valor.
                </p>
                <button
                  onClick={restablecerValores}
                  className="mt-4 flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Valores Originales
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Analytical numerical results card deck */}
        <section className="space-y-4">
          {voltaje < 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 font-sans text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="text-lg">🔀</span>
              <p><strong>Polaridad Invertida:</strong> Has ajustado un voltaje negativo. El sentido de la corriente ahora es el opuesto al inicial.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-5 shadow-sm border-l-4 border-indigo-600 flex items-center gap-5">
            <span className="text-3xl text-indigo-600 font-mono">Ω</span>
            <div>
              <span className="text-xs text-slate-400 font-bold block">RESISTENCIA EQUIVALENTE</span>
              <strong className="text-2xl font-display font-black text-slate-800">
                {resultados.req.toFixed(2)} <span className="text-xs text-slate-400 font-medium">Ω</span>
              </strong>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm border-l-4 border-violet-600 flex items-center gap-5">
            <span className="text-3xl text-violet-600 font-mono">I</span>
            <div>
              <span className="text-xs text-slate-400 font-bold block">CORRIENTE TOTAL (I₁)</span>
              <strong className="text-2xl font-display font-black text-slate-800">
                {resultados.iTotal.toFixed(3)} <span className="text-xs text-slate-400 font-medium">A</span>
              </strong>
            </div>
          </div>
          </div>
        </section>

        {/* Step-by-step resolution tutorial step card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div
            onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
            className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
              <h3 className="font-display font-bold text-sm text-slate-700">Resolución Paso a Paso</h3>
            </div>
            <span className="text-indigo-600 font-bold text-xs">
              {mostrarExplicacion ? "✕ Ocultar" : "⬇ Mostrar Paso a Paso"}
            </span>
          </div>

          {mostrarExplicacion && (
            <div className="p-5 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <button
                  onClick={retrocederPaso}
                  disabled={pasoActual === 0}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ◀ Anterior
                </button>
                <span className="text-slate-400">Paso {pasoActual + 1} de {pasosActuales.length}</span>
                <button
                  onClick={avanzarPaso}
                  disabled={pasoActual === pasosActuales.length - 1}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente ▶
                </button>
              </div>

              <div className="step-card bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-xl flex gap-4">
                <span className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {pasoActual + 1}
                </span>
                <div className="space-y-3">
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {pasosActuales[pasoActual].text}
                  </p>
                  <div className="inline-block bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-mono text-[11px] text-slate-800 shadow-sm">
                    {pasosActuales[pasoActual].formula}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Kirchhoff's current law verifier bar */}
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-display font-extrabold text-sm tracking-tight text-emerald-950">
              Verificación de Leyes de Kirchhoff (Nodos)
            </h4>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            La corriente que fluye hacia el nodo divisor de ramas se reparte perfectamente y se vuelve a juntar al salir:
          </p>
          <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 font-mono text-xs text-emerald-900 shadow-inner">
            {circuitoActivo === "a" ? (
              cortocircuitoA ? (
                <span>⚠️ Cortocircuito en R₃ → I₃ = I_total = {resultados.iR3.toFixed(3)} A | I(R₁₄₅) = 0 A → {resultados.iTotal.toFixed(3)} A = {resultados.iR3.toFixed(3)} A + 0.000 A ✓</span>
              ) : (
                <span>I₁ (R₂) = I₃ (R₃) + I₂ (R₁₄₅) ➔ {resultados.iTotal.toFixed(3)} A = {resultados.iR3.toFixed(3)} A + {resultados.iR1.toFixed(3)} A</span>
              )
            ) : (
              llaveB ? (
                <span>⚠️ Llave cerrada (Cortocircuito) → I(Llave) = I_total = {resultados.iTotal.toFixed(3)} A | I(R₂, R₃, R₄, R₅) = 0 A ✓</span>
              ) : cortocircuitoB ? (
                <span>⚠️ Cortocircuito en {rCortaB} → I({rCortaB}) = I_total = {iRCortaB.toFixed(3)} A | I({rAbiertaB}) = 0 A → {resultados.iTotal.toFixed(3)} A = {iRCortaB.toFixed(3)} A + 0.000 A ✓</span>
              ) : (
                <span>I_total = I_rama₂ (R₂) + I_rama₃ (R₃) ➔ {resultados.iTotal.toFixed(3)} A = {resultados.iR2.toFixed(3)} A + {resultados.iR3.toFixed(3)} A</span>
              )
            )}
          </div>
        </section>
      </main>

      {/* Manual uso modal popup */}
      {mostrarManual && (
        <ManualUso tipo="circuito" onClose={() => setMostrarManual(false)} />
      )}
    </div>
  );
}
