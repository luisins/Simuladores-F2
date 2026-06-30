import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, RotateCcw, CheckCircle, HelpCircle, Activity } from "lucide-react";
import ManualUso from "./ManualUso";

interface SimuladorLeyesKirchhoffProps {
  volverAlMenu: () => void;
}

export default function SimuladorLeyesKirchhoff({ volverAlMenu }: SimuladorLeyesKirchhoffProps) {
  const [r1, setR1] = useState<number>(25);
  const [r2, setR2] = useState<number>(20);
  const [r3, setR3] = useState<number>(10);
  const [r4, setR4] = useState<number>(15);
  const [r5, setR5] = useState<number>(30);

  const [e1, setE1] = useState<number>(10);
  const [e2, setE2] = useState<number>(15);
  const [e3, setE3] = useState<number>(10);

  const [mostrarManual, setMostrarManual] = useState<boolean>(false);
  const [mostrarPasos, setMostrarPasos] = useState<boolean>(true);
  const [flowDirection, setFlowDirection] = useState<"conventional" | "electrons">("conventional");
  const [selectedResistor, setSelectedResistor] = useState<string | null>(null);

  const resetValues = () => {
    setR1(25);
    setR2(20);
    setR3(10);
    setR4(15);
    setR5(30);
    setE1(10);
    setE2(15);
    setE3(10);
    setSelectedResistor(null);
  };

  // Resolutor por Regla de Cramer (Matricial 2x2)
  // Si alguna resistencia es 0, se la trata como conductor ideal (cortocircuito).
  const R14 = r1 + r4;
  const R25 = r2 + r5;
  const R3 = r3;

  // Calculo de determinantes de Cramer
  const D = (R14 * (R3 + R25)) + (R3 * R25);
  const DI0 = ((e2 - e1) * -(R3 + R25)) - (R3 * -(e2 + e3));
  const DI1 = (-R14 * -(e2 + e3)) - ((e2 - e1) * -R25);

  // Si D = 0, el sistema es indeterminado (cabe con resistencias todas 0)
  const sistemaDeterminado = Math.abs(D) > 1e-10;
  const i0 = sistemaDeterminado ? DI0 / D : 0;
  const i1 = sistemaDeterminado ? DI1 / D : 0;
  const i2 = i0 + i1;

  // Diferencia de potencial Vb - Va
  const va = e1 - (i0 * r4);
  const vb = i2 * r5;
  const vab = vb - va;

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

  // Clases dinámicas de velocidad
  const getVelocityStyle = (iVal: number) => {
    if (Math.abs(iVal) < 0.001) return { "--flow-speed": "0s" } as React.CSSProperties;
    const duration = 0.45 / Math.abs(iVal);
    const speed = Math.max(0.18, Math.min(8, duration));
    return { "--flow-speed": `${speed.toFixed(2)}s` } as React.CSSProperties;
  };

  const getFlowClass = (iVal: number, comp: string) => {
    const isZero = Math.abs(iVal) < 0.001;
    const hl = getHighlightClass(comp);
    return `wire-flow ${flowDirection === "electrons" ? "electrons" : ""} ${isZero ? "zero-current" : ""} ${hl}`;
  };

  const getHighlightClass = (comp: string) => {
    if (selectedResistor === comp) return "highlight-active";
    return "";
  };

  const currentStatusLabel = () => {
    if (resultadosList.some(r => r.negative)) {
      return (
        <span className="text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold select-none flex items-center gap-1">
          ⚠️ El signo negativo en algunas corrientes indica que fluyen al revés del sentido supuesto originario.
        </span>
      );
    }
    return (
      <span className="text-emerald-700 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-lg text-xs font-semibold select-none flex items-center gap-1">
        ✓ Todas las corrientes fluyen en los sentidos propuestos del diseño original.
      </span>
    );
  };

  const resultadosList = [
    { label: "Corriente I₀ (Rama Izquierda)", value: i0.toFixed(4), raw: i0, negative: i0 < 0 },
    { label: "Corriente I₁ (Rama Central)", value: i1.toFixed(4), raw: i1, negative: i1 < 0 },
    { label: "Corriente I₂ (Rama Derecha)", value: i2.toFixed(4), raw: i2, negative: i2 < 0 },
  ];

  const getComponentDetails = () => {
    if (!selectedResistor) return null;

    if (selectedResistor.startsWith("e")) {
      const eNames: Record<string, string> = { e1: "Fuente E₁", e2: "Fuente E₂", e3: "Fuente E₃" };
      const eVals: Record<string, number> = { e1, e2, e3 };
      const eSetters: Record<string, React.Dispatch<React.SetStateAction<number>>> = { e1: setE1, e2: setE2, e3: setE3 };
      const name = selectedResistor;
      return {
        title: eNames[name],
        icon: "🔋",
        value: eVals[name],
        setValue: eSetters[name],
        min: -40,
        max: 40,
        unit: "V",
        params: [
          { label: "Tensión nominal (V)", value: `${eVals[name]} V` },
          { label: "Ubicación", value: name === "e2" ? "Rama Central" : name === "e1" ? "Rama Izquierda" : "Rama Derecha" }
        ]
      };
    }

    const valueMap: Record<string, number> = { r1, r2, r3, r4, r5 };
    const setterMap: Record<string, React.Dispatch<React.SetStateAction<number>>> = {
      r1: setR1,
      r2: setR2,
      r3: setR3,
      r4: setR4,
      r5: setR5
    };

    const rVal = valueMap[selectedResistor];
    const setRVal = setterMap[selectedResistor];

    let iVal = 0;
    if (selectedResistor === "r1" || selectedResistor === "r4") iVal = i0;
    if (selectedResistor === "r3") iVal = i1;
    if (selectedResistor === "r2" || selectedResistor === "r5") iVal = i2;

    const vVal = iVal * rVal;
    const pVal = iVal * iVal * rVal;

    return {
      title: `Resistencia ${selectedResistor.toUpperCase()}`,
      icon: "⚡",
      value: rVal,
      setValue: setRVal,
      min: 0,
      max: 100,
      unit: "Ω",
      params: [
        { label: "Resistencia (R)", value: `${rVal} Ω${rVal === 0 ? " — CORTOCIRCUITO" : ""}` },
        { label: "Corriente promedio (I)", value: `${Math.abs(iVal).toFixed(4)} A${iVal < 0 ? " (⚠️ invertida)" : ""}` },
        { label: "Caída de potencial (V)", value: `${Math.abs(vVal).toFixed(2)} V` },
        { label: "Calor disipado (P)", value: `${pVal.toFixed(3)} W` }
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
                Simulador: Leyes de Kirchhoff (Mallas)
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                Problema G4P9
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
              onClick={resetValues}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl cursor-pointer transition-colors text-xs border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Valores Originales (PDF)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
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

        {/* Interactive diagram workspace */}
        <section className="circuit-container-interactive">
          <div className="circuit-drawing">
            <h3 className="font-display font-bold text-slate-800 text-sm margin-0 mb-4">
              Circuito Esquemático de Doble Malla (Figura Problema 9)
            </h3>

            <div className="circuito-a-original relative">
              <svg viewBox="0 0 550 400" className="circuit-svg-original">
                {/* Wires */}
                {/* Left Branch */}
                <path d="M 60 195 V 100 H 125" className="wire-base" />
                <path d="M 215 100 H 260" className="wire-base" />
                <path d="M 260 320 H 215" className="wire-base" />
                <path d="M 125 320 H 60 V 255" className="wire-base" />

                {/* Central Branch */}
                <path d="M 260 100 V 125" className="wire-base" />
                <path d="M 260 270 V 320" className="wire-base" />

                {/* Right Branch */}
                <path d="M 260 100 H 335" className="wire-base" />
                <path d="M 425 100 H 490 V 195" className="wire-base" />
                <path d="M 490 255 V 320 H 425" className="wire-base" />
                <path d="M 335 320 H 260" className="wire-base" />

                {/* Animated flows proportional to currents */}
                {/* Left Branch (I0) */}
                <path d="M 260 320 H 215" className={getFlowClass(i0, "wire0")} style={getVelocityStyle(i0)} />
                <path d="M 125 320 H 60 V 255" className={getFlowClass(i0, "wire0")} style={getVelocityStyle(i0)} />
                <path d="M 60 195 V 100 H 125" className={getFlowClass(i0, "wire0")} style={getVelocityStyle(i0)} />
                <path d="M 215 100 H 260" className={getFlowClass(i0, "wire0")} style={getVelocityStyle(i0)} />
                {/* Indicador visual de inversión I0 */}
                {sistemaDeterminado && i0 < -0.001 && (
                  <g className="pointer-events-none select-none">
                    <rect x="25" y="137" width="70" height="16" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                    <text x="60" y="148" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">⚠️ Invertida</text>
                  </g>
                )}

                {/* Central Branch (I1) */}
                <path d="M 260 320 V 270" className={getFlowClass(i1, "wire1")} style={getVelocityStyle(i1)} />
                <path d="M 260 125 V 100" className={getFlowClass(i1, "wire1")} style={getVelocityStyle(i1)} />
                {sistemaDeterminado && i1 < -0.001 && (
                  <g className="pointer-events-none select-none">
                    <rect x="225" y="287" width="70" height="16" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                    <text x="260" y="298" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">⚠️ Invertida</text>
                  </g>
                )}

                {/* Right Branch (I2) */}
                <path d="M 260 100 H 335" className={getFlowClass(i2, "wire2")} style={getVelocityStyle(i2)} />
                <path d="M 425 100 H 490 V 195" className={getFlowClass(i2, "wire2")} style={getVelocityStyle(i2)} />
                <path d="M 490 255 V 320 H 425" className={getFlowClass(i2, "wire2")} style={getVelocityStyle(i2)} />
                <path d="M 335 320 H 260" className={getFlowClass(i2, "wire2")} style={getVelocityStyle(i2)} />
                {sistemaDeterminado && i2 < -0.001 && (
                  <g className="pointer-events-none select-none">
                    <rect x="455" y="137" width="70" height="16" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                    <text x="490" y="148" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">⚠️ Invertida</text>
                  </g>
                )}

                {/* Nodes nodes */}
                <circle cx="260" cy="100" r="5" fill="#1e293b" />
                <circle cx="260" cy="320" r="5" fill="#1e293b" />

                {/* Custom Battery E1 */}
                <g className={`interactive-resistor ${selectedResistor === "e1" ? "selected" : ""}`} onClick={() => setSelectedResistor("e1")}>
                  <rect x="25" y="195" width="70" height="60" className="resistor-bg" />
                  <rect x="35" y="205" width="50" height="40" rx="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" />
                  {/* Polarity markers */}
                  <circle cx="60" cy="195" r="7" fill={e1 >= 0 ? "#ef4444" : "#3b82f6"} className="stroke-white" strokeWidth="1" />
                  <text x="60" y="198" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e1 >= 0 ? "+" : "-"}</text>
                  <circle cx="60" cy="255" r="7" fill={e1 >= 0 ? "#3b82f6" : "#ef4444"} className="stroke-white" strokeWidth="1" />
                  <text x="60" y="258" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e1 >= 0 ? "-" : "+"}</text>

                  <text x="60" y="228" textAnchor="middle" fill="white" className="font-mono text-xs font-bold">{Math.abs(e1)}V</text>
                  <text x="60" y="242" textAnchor="middle" fill="white" className="text-[8px] font-bold">E₁</text>
                </g>

                {/* Custom Battery E2 */}
                <g className={`interactive-resistor ${selectedResistor === "e2" ? "selected" : ""}`} onClick={() => setSelectedResistor("e2")}>
                  <rect x="225" y="210" width="70" height="60" className="resistor-bg" />
                  <rect x="235" y="220" width="50" height="40" rx="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" />
                  {/* Polarity markers */}
                  <circle cx="260" cy="210" r="7" fill={e2 >= 0 ? "#ef4444" : "#3b82f6"} className="stroke-white" strokeWidth="1" />
                  <text x="260" y="213" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e2 >= 0 ? "+" : "-"}</text>
                  <circle cx="260" cy="270" r="7" fill={e2 >= 0 ? "#3b82f6" : "#ef4444"} className="stroke-white" strokeWidth="1" />
                  <text x="260" y="273" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e2 >= 0 ? "-" : "+"}</text>

                  <text x="260" y="243" textAnchor="middle" fill="white" className="font-mono text-xs font-bold">{Math.abs(e2)}V</text>
                  <text x="260" y="255" textAnchor="middle" fill="white" className="text-[8px] font-bold">E₂</text>
                </g>

                {/* Custom Battery E3 */}
                <g className={`interactive-resistor ${selectedResistor === "e3" ? "selected" : ""}`} onClick={() => setSelectedResistor("e3")}>
                  <rect x="455" y="195" width="70" height="60" className="resistor-bg" />
                  <rect x="465" y="205" width="50" height="40" rx="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" />
                  {/* Polarity markers */}
                  <circle cx="490" cy="195" r="7" fill={e3 >= 0 ? "#ef4444" : "#3b82f6"} className="stroke-white" strokeWidth="1" />
                  <text x="490" y="198" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e3 >= 0 ? "+" : "-"}</text>
                  <circle cx="490" cy="255" r="7" fill={e3 >= 0 ? "#3b82f6" : "#ef4444"} className="stroke-white" strokeWidth="1" />
                  <text x="490" y="258" textAnchor="middle" fill="white" className="text-[10px] font-black font-sans">{e3 >= 0 ? "-" : "+"}</text>

                  <text x="490" y="228" textAnchor="middle" fill="white" className="font-mono text-xs font-bold">{Math.abs(e3)}V</text>
                  <text x="490" y="242" textAnchor="middle" fill="white" className="text-[8px] font-bold">E₃</text>
                </g>

                {/* Resistors */}
                {/* R1 */}
                <g className={`interactive-resistor ${selectedResistor === "r1" ? "selected" : ""} ${getHighlightClass("r1")}`} onClick={() => setSelectedResistor("r1")}>
                  <rect x="125" y="75" width="90" height="50" className="resistor-bg" />
                  <path d={drawHorizontalResistor(170, 100, 80)} className="resistor-path" />
                  <text x="170" y="85" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₁</text>
                  <text x="170" y="120" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r1}Ω</text>
                </g>

                {/* R2 */}
                <g className={`interactive-resistor ${selectedResistor === "r2" ? "selected" : ""} ${getHighlightClass("r2")}`} onClick={() => setSelectedResistor("r2")}>
                  <rect x="335" y="75" width="90" height="50" className="resistor-bg" />
                  <path d={drawHorizontalResistor(380, 100, 80)} className="resistor-path" />
                  <text x="380" y="85" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₂</text>
                  <text x="380" y="120" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r2}Ω</text>
                </g>

                {/* R3 */}
                <g className={`interactive-resistor ${selectedResistor === "r3" ? "selected" : ""} ${getHighlightClass("r3")}`} onClick={() => setSelectedResistor("r3")}>
                  <rect x="235" y="125" width="50" height="90" className="resistor-bg" />
                  <path d={drawVerticalResistor(260, 170, 80)} className="resistor-path" />
                  <text x="230" y="175" textAnchor="end" className="text-xs font-bold" fill="#1e293b">R₃</text>
                  <text x="230" y="190" textAnchor="end" className="text-[10px] font-mono fill-slate-400">{r3}Ω</text>
                </g>

                {/* R4 */}
                <g className={`interactive-resistor ${selectedResistor === "r4" ? "selected" : ""} ${getHighlightClass("r4")}`} onClick={() => setSelectedResistor("r4")}>
                  <rect x="125" y="295" width="90" height="50" className="resistor-bg" />
                  <path d={drawHorizontalResistor(170, 320, 80)} className="resistor-path" />
                  <text x="170" y="305" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₄</text>
                  <text x="170" y="340" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r4}Ω</text>
                </g>

                {/* R5 */}
                <g className={`interactive-resistor ${selectedResistor === "r5" ? "selected" : ""} ${getHighlightClass("r5")}`} onClick={() => setSelectedResistor("r5")}>
                  <rect x="335" y="295" width="90" height="50" className="resistor-bg" />
                  <path d={drawHorizontalResistor(380, 320, 80)} className="resistor-path" />
                  <text x="380" y="305" textAnchor="middle" className="text-xs font-bold" fill="#1e293b">R₅</text>
                  <text x="380" y="340" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">{r5}Ω</text>
                </g>

                {/* Map keys */}
                <text x="100" y="90" className="terminal-label">a</text>
                <text x="100" y="340" className="terminal-label font-bold text-slate-800">b</text>
                <text x="270" y="90" className="terminal-label text-red-600 font-extrabold">A</text>
              </svg>
            </div>
          </div>

          {/* Right sidebar component info */}
          <div className="details-card-container">
            {compDetails ? (
              <div className="component-details-card">
                <h4 className="font-display font-medium text-slate-800 text-sm flex gap-2">
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
                  className="mt-auto bg-slate-900 shadow text-white font-bold py-2 rounded-xl text-xs cursor-pointer border-none hover:bg-slate-800 transition-all"
                  onClick={() => setSelectedResistor(null)}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="details-placeholder">
                <div className="details-placeholder-icon">📖</div>
                <h4 className="font-bold text-slate-800 text-sm">Inspección de Kirchhoff</h4>
                <p className="text-xs">
                  Haz clic directamente sobre cualquier <strong>resistencia o cualquiera de las 3 baterías</strong> para cambiar su potencial o ver su comportamiento físico.
                </p>
                <button
                  onClick={resetValues}
                  className="mt-4 flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restablecer Originales
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Current calculations and Cramer matrix results */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
            <h2 className="font-display font-bold text-lg text-slate-800">Resultados analíticos calculados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {resultadosList.map((r, i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 shadow-sm border-l-4 border-indigo-600 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{r.label}</span>
                <strong className={`font-display text-2xl font-black ${r.negative ? "text-amber-500" : "text-slate-800"}`}>
                  {r.value} <span className="text-xs font-bold text-slate-400 font-mono">A</span>
                </strong>
                {r.negative && (
                  <span className="text-[9px] text-amber-500 font-bold block leading-relaxed">
                    🔀 Sentido opuesto al supuesto
                  </span>
                )}
                {!sistemaDeterminado && (
                  <span className="text-[9px] text-red-500 font-bold block leading-relaxed">
                    ⚠️ Sistema indeterminado (D=0)
                  </span>
                )}
              </div>
            ))}

            <div className="bg-zinc-900 border rounded-2xl p-4 shadow-sm border-l-4 border-zinc-500 text-white flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-zinc-400 font-bold block uppercase">Potencial Vb - Va</span>
                <strong className="font-display text-2xl font-black text-white">
                  {vab.toFixed(3)} <span className="text-xs font-bold text-zinc-400 font-mono">V</span>
                </strong>
              </div>
              <span className="text-[9px] text-zinc-400 block mt-1.5 leading-snug">
                Vb - Va = l₂ · R₅ - (E₁ - (I₀ · R₄))
              </span>
            </div>
          </div>
          {currentStatusLabel()}
        </section>

        {/* Step-by-step math solver layout card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div
            onClick={() => setMostrarPasos(!mostrarPasos)}
            className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">3</span>
              <h3 className="font-display font-bold text-sm text-slate-700">Resolución Paso a Paso Matricial</h3>
            </div>
            <span className="text-indigo-600 font-bold text-xs">
              {mostrarPasos ? "✕ Ocultar Desarrollo" : "⬇ Mostrar Desarrollo"}
            </span>
          </div>

          {mostrarPasos && (
            <div className="p-5 border-t border-slate-200 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizando los teoremas fundamentales de Kirchhoff y resolviendo para las dos mallas mediante determinantes de Cramer:
              </p>

              {(e1 < 0 || e2 < 0 || e3 < 0) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 font-sans text-xs p-3 rounded-xl flex items-center gap-2">
                  <span className="text-lg">🔀</span>
                  <p><strong>Polaridad Invertida:</strong> Hay al menos una fuente con voltaje negativo. Su polaridad física está invertida respecto al esquema original. El sistema compensa algebraicamente este signo.</p>
                </div>
              )}

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-extrabold text-slate-800 text-xs mb-1.5">Malla I (Izquierda)</h4>
                  <code>-I₀·(R₁ + R₄) + I₁·R₃ = E₂ - E₁</code><br />
                  <span>-I₀·({R14}) + I₁·{R3} = ({e2}) - ({e1}) = {e2 - e1} V</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-extrabold text-slate-800 text-xs mb-1.5">Malla II (Derecha)</h4>
                  <code>-I₀·(R₂ + R₅) - I₁·(R₃ + R₂ + R₅) = -(E₂ + E₃)</code><br />
                  <span>-I₀·({R25}) - I₁·({R3 + R25}) = -({e2} + ({e3})) = {-(e2 + e3)} V</span>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                  <h4 className="font-extrabold text-indigo-900 text-xs">Determinante del Sistema (Δ)</h4>
                  <div className="bg-indigo-50 px-3 py-1.5 rounded inline-block font-bold">
                    D = (R₁₄ · (R₃ + R₂₅)) + (R₃ · R₂₅) = {D.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    DI₀ = ({e2 - e1})·(-{R3 + R25}) - ({R3})·({-(e2 + e3)}) = {DI0.toFixed(1)}<br />
                    DI₁ = (-{R14})·({-(e2 + e3)}) - ({e2 - e1})·(-{R25}) = {DI1.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Manual uso modal popup */}
      {mostrarManual && (
        <ManualUso tipo="kirchhoff" onClose={() => setMostrarManual(false)} />
      )}
    </div>
  );
}
