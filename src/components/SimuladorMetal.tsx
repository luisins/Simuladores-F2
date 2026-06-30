import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, BookOpen, Settings, Info, Gauge, RotateCcw, Activity, ShieldAlert } from "lucide-react";
import { MaterialKey, MaterialInfo } from "../types";
import ManualUso from "./ManualUso";

interface SimuladorMetalProps {
  volverAlMenu: () => void;
}

const efectosCuerpo = [
  {
    rango: 0.001,
    rangoMin: 0.001,
    rangoMax: 0.005,
    rangoStr: "1 mA - 5 mA",
    efecto: "Se puede sentir",
    explicacion: "Umbral de percepción táctil. Se siente un sutil cosquilleo en la piel debido a la excitación nerviosa superficial. No hay daño celular ni contracción muscular.",
    badgeBg: "bg-teal-500/15 text-teal-600 border-teal-500/20",
    colorGradiente: "from-teal-500 to-emerald-600",
    colorBg: "bg-teal-50 border-teal-200 text-teal-800",
    icon: "🤝",
    peligro: "Seguro",
    consejo: "Sensación inocua similar a la estática."
  },
  {
    rango: 0.005,
    rangoMin: 0.005,
    rangoMax: 0.010,
    rangoStr: "5 mA - 10 mA",
    efecto: "Calambre doloroso",
    explicacion: "Sensación desagradable o dolor de intensidad moderada. Provoca una respuesta refleja de retirarse, pero no impide soltar voluntariamente el conductor eléctrico.",
    badgeBg: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
    colorGradiente: "from-yellow-500 to-amber-600",
    colorBg: "bg-yellow-50 border-yellow-200 text-amber-900",
    icon: "⚡",
    peligro: "Dolor Leve",
    consejo: "Reacción instantánea; se conserva el control flexor."
  },
  {
    rango: 0.010,
    rangoMin: 0.010,
    rangoMax: 0.015,
    rangoStr: "10 mA - 15 mA",
    efecto: "Contracciones involuntarias (Espasmos)",
    explicacion: "Fase primaria de agarrotamiento o tetanización. El flujo supera los estímulos neuronales biológicos que ordenan relajar las articulaciones de la mano, induciendo flexiones forzadas.",
    badgeBg: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    colorGradiente: "from-amber-500 to-orange-600",
    colorBg: "bg-amber-50 border-amber-200 text-amber-950",
    icon: "✊",
    peligro: "Moderado",
    consejo: "Difícil soltar el cable por voluntad propia."
  },
  {
    rango: 0.015,
    rangoMin: 0.015,
    rangoMax: 0.070,
    rangoStr: "15 mA - 70 mA",
    efecto: "Parálisis y pérdida del control motor",
    explicacion: "Tetanización muscular profunda que inmoviliza los flexores de manos y brazos. El sujeto es incapaz de desprenderse del cable. Se compromete severamente la respiración.",
    badgeBg: "bg-orange-500/15 text-orange-655 border-orange-500/20",
    colorGradiente: "from-orange-500 to-red-650",
    colorBg: "bg-orange-50 border-orange-200 text-orange-950",
    icon: "🛑",
    peligro: "Crítico",
    consejo: "Paro respiratorio inmediato si se prolonga."
  },
  {
    rango: 0.070,
    rangoMin: 0.070,
    rangoMax: 0.100,
    rangoStr: "≥ 70 mA",
    efecto: "Fibrilación ventricular irreversible",
    explicacion: "El paso de corriente interrumpe la sincronía sinusal del corazón. Las paredes auriculares y ventriculares tiemblan sin bombear sangre, con desenlace fatal en segundos sin reanimación inmediata.",
    badgeBg: "bg-red-500/15 text-red-650 border-red-500/20",
    colorGradiente: "from-red-600 to-rose-700",
    colorBg: "bg-red-50 border-red-200 text-red-950",
    icon: "💀",
    peligro: "Extremo",
    consejo: "Emergencia vital. Paro cardíaco absoluto."
  }
];

export default function SimuladorMetal({ volverAlMenu }: SimuladorMetalProps) {
  const [campoE, setCampoE] = useState<number>(2100);
  const [material, setMaterial] = useState<MaterialKey>("plata");
  const [animOffset, setAnimOffset] = useState<number>(0);
  const [modoComparacion, setModoComparacion] = useState<boolean>(false);
  const [mostrarManual, setMostrarManual] = useState<boolean>(false);
  const [corrienteFisiologica, setCorrienteFisiologica] = useState<number>(0.001);
  const animRef = useRef<number | null>(null);

  // Constantes físicas reales
  const AVOGADRO = 6.023e23;
  const CARGA_ELECTRON = 1.6e-19;

  // Materiales
  const materiales: Record<MaterialKey, MaterialInfo> = {
    plata: {
      nombre: "Plata",
      simbolo: "Ag",
      resistividad: 1.59e-8,
      densidad: 10500,
      pesoMolecular: 0.10787,
      colorPrimario: "#C0C0C0",
      colorGrad1: "#e2e8f0",
      colorGrad2: "#94a3b8",
      conductividad: "Excelente ⭐",
      emoji: "🥈",
      dato: "El mejor conductor eléctrico conocido",
      uso: "Electrónica de alta precisión, soldaduras especiales, naves espaciales",
      curiosidad: "La plata posee la resistividad eléctrica más baja de todos los elementos metálicos conocidos por el hombre."
    },
    cobre: {
      nombre: "Cobre",
      simbolo: "Cu",
      resistividad: 1.68e-8,
      densidad: 8960,
      pesoMolecular: 0.06355,
      colorPrimario: "#B87333",
      colorGrad1: "#ffedd5",
      colorGrad2: "#ea580c",
      conductividad: "Excelente",
      emoji: "🥉",
      dato: "El conductor más estandarizado y utilizado del mundo",
      uso: "Instalaciones eléctricas residenciales, motores y bobinas",
      curiosidad: "Aproximadamente el 95% de la infraestructura de transporte eléctrico del planeta está hecha de cobre."
    },
    oro: {
      nombre: "Oro",
      simbolo: "Au",
      resistividad: 2.44e-8,
      densidad: 19300,
      pesoMolecular: 0.19697,
      colorPrimario: "#FFD700",
      colorGrad1: "#fef9c3",
      colorGrad2: "#ca8a04",
      conductividad: "Muy buena",
      emoji: "👑",
      dato: "Inmune a la corrosión, excelente para contactos confiables",
      uso: "Microchips, tarjetas de memoria, conectores de audio premium",
      curiosidad: "Se utiliza oro en los contactos de audio y computación debido a que no se oxida nunca con el aire."
    },
    aluminio: {
      nombre: "Aluminio",
      simbolo: "Al",
      resistividad: 2.82e-8,
      densidad: 2700,
      pesoMolecular: 0.02698,
      colorPrimario: "#A9A9A9",
      colorGrad1: "#f1f5f9",
      colorGrad2: "#64748b",
      conductividad: "Buena",
      emoji: "✈️",
      dato: "Altamente liviano, ideal para tendido aéreo",
      uso: "Líneas de transmisión de alta tensión, fuselajes",
      curiosidad: "El aluminio tiene un tercio de la densidad del cobre, lo que lo hace perfecto para lianas aéreas de distribución."
    },
    hierro: {
      nombre: "Hierro",
      simbolo: "Fe",
      resistividad: 1.0e-7,
      densidad: 7870,
      pesoMolecular: 0.05585,
      colorPrimario: "#704214",
      colorGrad1: "#ffedd5",
      colorGrad2: "#854d0e",
      conductividad: "Moderada",
      emoji: "⚙️",
      dato: "Resistencia moderada, excelente para electroimanes",
      uso: "Núcleos de transformadores, bobinados rústicos",
      curiosidad: "Aunque su conducción es menor, el núcleo magnético de la Tierra genera campos por el roce de este material líquido."
    }
  };

  const mat = materiales[material];

  // Cálculos dinámicos
  const densidadCorriente = campoE / mat.resistividad;
  const n = AVOGADRO * (mat.densidad / mat.pesoMolecular);
  const velocidad = densidadCorriente / (n * CARGA_ELECTRON);

  // Animación suave y altamente visible de los electrones
  useEffect(() => {
    // Si el campo eléctrico es 0, los electrones se detienen (no hay corriente de deriva)
    if (campoE === 0) {
      setAnimOffset(0);
      return;
    }

    // Escalamos la velocidad de deriva física real para que la simulación visual
    // sea sumamente clara, fluida, y responda directamente a los cambios del campoE:
    const normalizedSpeed = Math.max(0.1, Math.min(3.5, velocidad * 0.10));
    let active = true;

    const tick = () => {
      if (!active) return;
      setAnimOffset(prev => (prev + normalizedSpeed) % 100);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [velocidad, campoE]);

  // Formato de notación científica más elegante
  const formatScientific = (num: number, decimals = 2) => {
    if (num >= 1e28) return `${(num / 1e28).toFixed(decimals)} × 10²⁸`;
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)} × 10¹²`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)} × 10⁹`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)} × 10⁶`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)} × 10³`;
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Clasificación de la velocidad de deriva con analogías
  const getVelocidadCategoria = () => {
    if (velocidad > 5000) return { label: "🚀 Hipersónica", color: "text-red-500", bg: "bg-red-50 border-red-200", kmh: (velocidad * 3.6).toFixed(0) };
    if (velocidad > 343) return { label: "⚡ Supersónica", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", kmh: (velocidad * 3.6).toFixed(0) };
    if (velocidad > 250) return { label: "✈️ Velocidad de Avión Comercial", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", kmh: (velocidad * 3.6).toFixed(0) };
    if (velocidad > 100) return { label: "🏎️ Velocidad de Fórmula 1", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", kmh: (velocidad * 3.6).toFixed(0) };
    if (velocidad > 10) return { label: "🚗 Velocidad de Conducción en Ciudad", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", kmh: (velocidad * 3.6).toFixed(0) };
    return { label: "🐢 Velocidad Baja de Arrastre", color: "text-slate-500", bg: "bg-slate-50 border-slate-200", kmh: (velocidad * 3.6).toFixed(2) };
  };

  const velCategory = getVelocidadCategoria();

  // Posiciones de electrones animados en el cable (fluyen de derecha a izquierda hacia el ánodo positivo)
  // Los electrones van de derecha (cátodo -) hacia izquierda (ánodo +)
  // animOffset sube de 0→100, lo convertimos en posición left que baja de 100→0
  const posicionesElectrones = [0, 15, 30, 45, 60, 75, 90].map(base => {
    const pct = (100 - ((animOffset + base) % 100)) % 100;
    return { left: `${pct}%`, transform: 'translateX(-50%)' };
  });

  // Obtener velocidad para comparación
  const getVelocidadMaterial = (m: MaterialInfo) => {
    const J = campoE / m.resistividad;
    const nMat = AVOGADRO * (m.densidad / m.pesoMolecular);
    return J / (nMat * CARGA_ELECTRON);
  };

  const maxVelocidadActual = Math.max(...Object.values(materiales).map(m => getVelocidadMaterial(m)));

  const analogias = [
    { label: "Electrones en este experimento", emoji: "⚛️", velocidadMs: velocidad, dynamic: true },
    { label: "Velocidad del sonido (en el aire)", emoji: "🔊", velocidadMs: 343 },
    { label: "Avión jet de pasajeros", emoji: "✈️", velocidadMs: 250 },
    { label: "Velocidad tope de un F1", emoji: "🏎️", velocidadMs: 100 },
    { label: "Sprint de un Guepardo", emoji: "🐆", velocidadMs: 29 },
    { label: "Persona trotando", emoji: "🏃", velocidadMs: 5 }
  ];

  const maxEscala = Math.max(velocidad, 343) * 1.15;

  // Helpers biophysic simulation
  const getEfectoForCurrent = (val: number) => {
    if (val >= 0.070) return 4; // Fibrilación ventricular irreversible (Hito 5)
    if (val >= 0.015) return 3; // Parálisis y pérdida del control motor (Hito 4)
    if (val >= 0.010) return 2; // Contracciones involuntarias / Espasmos (Hito 3)
    if (val >= 0.005) return 1; // Calambre doloroso (Hito 2)
    if (val >= 0.001) return 0; // Se puede sentir (Hito 1)
    return -1;                  // Sin efectos perceptibles (< 1 mA)
  };

  const activeEfectoIndex = getEfectoForCurrent(corrienteFisiologica);


  return (
    <>
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
                  Simulador de Corriente en Metales
                </h1>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">
                  Problema G4P7
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarManual(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10 transition-colors text-xs border border-indigo-500"
            >
              <BookOpen className="w-4 h-4" /> Guía Práctica de Uso
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

          {/* Step 1: SELECT CONDUCDOR */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
              <h2 className="font-display font-bold text-lg text-slate-800">Seleccionar el material conductor</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(Object.keys(materiales) as MaterialKey[]).map((key) => {
                const m = materiales[key];
                const isSelected = material === key;
                return (
                  <button
                    key={key}
                    className={`group relative overflow-hidden transition-all duration-300 p-4 border rounded-2xl text-left cursor-pointer flex flex-col justify-between h-40 ${isSelected
                      ? "border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-600/5 translate-y-[-2px]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    onClick={() => setMaterial(key)}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-3xl" role="img" aria-label={m.nombre}>{m.emoji}</span>
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-full text-white" style={{ background: m.colorGrad2 }}>
                        {m.simbolo}
                      </span>
                    </div>

                    <div style={{ marginTop: 'auto', textAlign: 'left' }}>
                      <div className="font-display font-extrabold text-sm text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {m.nombre}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1">
                        {m.conductividad.replace("⭐", "")} conductividad
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info Panel material seleccionado */}
            <div className="flex flex-col lg:flex-row gap-5 bg-slate-50 border-l-4 border-indigo-600 rounded-r-2xl p-5 shadow-inner">
              <span className="text-4xl leading-none flex-shrink-0 align-middle select-none">{mat.emoji}</span>
              <div className="flex-1 space-y-1">
                <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  Conductor seleccionado: {mat.nombre} <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">{mat.simbolo}</span>
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  🎯 <strong>Aplicación:</strong> {mat.uso}
                </p>
                <p className="text-indigo-600 text-xs leading-relaxed italic">
                  💡 <strong>Hecho curioso:</strong> {mat.curiosidad}
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2 justify-end">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-sm">
                  ρ = {mat.resistividad.toExponential(2)} Ω·m
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-sm">
                  δ = {mat.densidad.toLocaleString()} kg/m³
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-sm">
                  M = {mat.pesoMolecular.toFixed(5)} kg/mol
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: AJUSTAR CAMPO ELECTRICO */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
              <h2 className="font-display font-bold text-lg text-slate-800">Ajustar campo eléctrico inducido (e)</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8 items-center">
              <div className="space-y-4">
                <div className="text-center py-2">
                  <span className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                    {campoE.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 ml-1.5 font-mono">V/m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={campoE}
                  onChange={(e) => setCampoE(Number(e.target.value))}
                  className="slider"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 ${campoE / 100}%, #e2e8f0 ${campoE / 100}%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                  <span>⚡ Sin carga (0 V/m)</span>
                  <span>📌 Original PDF (2100 V/m)</span>
                  <span>🔥 Inducción máxima (10000 V/m)</span>
                </div>
              </div>

              {/* Presets ruster */}
              <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Preconfiguraciones útiles:</span>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {[
                    { label: "Batería AA", val: 150 },
                    { label: "Muestra PDF (Ag)", val: 2100 },
                    { label: "Alta Tensión", val: 6800 }
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setCampoE(p.val)}
                      className={`py-2 px-3 border rounded-xl text-left cursor-pointer transition-all ${campoE === p.val
                        ? "bg-slate-900 border-slate-900 text-white font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-semibold bg-white"
                        }`}
                    >
                      <div className="text-[10px] truncate">{p.label}</div>
                      <div className="text-xs font-mono mt-0.5">{p.val} V/m</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: INTERACTIVE VISUALIZACION TUBE */}
          <section className="bg-slate-950 rounded-2xl p-6 shadow-md border border-slate-900 overflow-hidden text-white space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">3</span>
              <h2 className="font-display font-bold text-lg text-slate-200">Simulación del flujo de electrones</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 py-4 w-full">
              {/* Mobile Labels (Above tube) */}
              <div className="flex justify-between w-full md:hidden px-1">
                <div className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm">+ Ánodo</div>
                <div className="text-red-400 font-bold text-[10px] bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg shadow-sm">- Cátodo</div>
              </div>

              {/* Desktop Label Left */}
              <div className="hidden md:block bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-bold text-xs py-2 px-4 rounded-xl min-w-[100px] text-center shadow-md">
                + <br /> Ánodo (+)
              </div>

              {/* Simulated Conductor Tube */}
              <div
                className="w-full md:flex-1 h-12 md:h-14 rounded-full relative overflow-hidden shadow-inner border border-white/5"
                style={{
                  background: `linear-gradient(180deg, ${mat.colorGrad1}55 0%, ${mat.colorGrad2}66 60%, ${mat.colorGrad1}44 100%)`,
                  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
                }}
              >
                {/* Estáticos Iones de la Red Cristalina */}
                {[15, 30, 45, 60, 75, 90].map((pos) => (
                  <div
                    key={pos}
                    className="absolute top-1/2 -translate-y-1/2 text-white/20 select-none pointer-events-none font-bold text-xl"
                    style={{ left: `${pos}%` }}
                  >
                    ⊕
                  </div>
                ))}

                {/* Electrones Libres en Movimiento */}
                {posicionesElectrones.map((ep, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 w-6 h-6 bg-sky-400 border border-sky-300 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(56,189,248,0.8)] select-none text-center cursor-help hover:scale-110"
                    style={{
                      left: ep.left,
                      transform: `translateX(-50%) translateY(-50%)`,
                    }}
                    title={`Velocidad de deriva: ${velocidad.toFixed(2)} m/s`}
                  >
                    e⁻
                  </div>
                ))}
              </div>

              {/* Desktop Label Right */}
              <div className="hidden md:block bg-red-500/10 border border-red-500 text-red-400 font-bold text-xs py-2 px-4 rounded-xl min-w-[100px] text-center shadow-md">
                - <br /> Cátodo (-)
              </div>
            </div>

            {/* Direction indicator vectors */}
            <div className="flex flex-col items-center gap-1 opacity-80 pt-2 border-t border-slate-900">
              <span className="text-[10px] text-slate-500 font-bold">LÍNEAS DE CAMPO ELÉCTRICO (E)</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((x) => (
                  <span key={x} className="arrow-sym">→</span>
                ))}
              </div>
              <span className="text-[9px] text-red-400/80 font-semibold tracking-wide">
                SENTIDO REAL DE LOS ELECTRONES : HACIA EL ANODO (+)
              </span>
            </div>

            {/* live velocity speed alert */}
            <div className={`velocity-badge-live border ${velCategory.bg}`}>
              <span className={`font-bold font-display text-sm ${velCategory.color}`}>{velCategory.label}</span>
              <span className="text-slate-400 text-xs">
                | Velocidad de deriva real calculada: <strong className="text-white">{velocidad.toLocaleString(undefined, { maximumFractionDigits: 1 })} m/s</strong> (o {Number(velCategory.kmh).toLocaleString()} km/h)
              </span>
            </div>
          </section>

          {/* Step 4: CALCULATED ANALYTICAL RESULTS */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">4</span>
              <h2 className="font-display font-bold text-lg text-slate-800">Resultados del análisis matemático</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* J - Densidad de corriente */}
              <div className="bg-white border-t-4 border-indigo-600 rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-full flex items-center justify-center">a</span>
                    <span className="text-sm font-display font-medium text-slate-500">Densidad de Corriente</span>
                    <span className="font-display font-extrabold text-lg text-indigo-600 italic">J</span>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-indigo-600 px-3 py-2 text-[10px] font-mono text-slate-800 rounded-r-lg">
                    J = E / ρ = {campoE} / {mat.resistividad.toExponential(2)}
                  </div>
                  <div className="text-center py-2">
                    <span className="font-display font-black text-2xl text-slate-800">{formatScientific(densidadCorriente)}</span>
                    <span className="text-xs font-bold text-slate-400 font-mono ml-1">A/m²</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  La densidad de corriente representa la magnitud de cargas elementales que atraviesan cada metro cuadrado por segundo.
                </p>
              </div>

              {/* v_d - Velocidad de deriva */}
              <div className="bg-white border-t-4 border-violet-600 rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 bg-violet-50 text-violet-600 font-bold text-xs rounded-full flex items-center justify-center">b</span>
                    <span className="text-sm font-display font-medium text-slate-500">Velocidad de Deriva</span>
                    <span className="font-display font-extrabold text-lg text-violet-600 italic">v_d</span>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-violet-600 px-3 py-2 text-[10px] font-mono text-slate-800 rounded-r-lg">
                    v_d = J / (n · q_e)
                  </div>
                  <div className="text-center py-2">
                    <span className="font-display font-black text-2xl text-violet-600">{velocidad.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-400 font-mono ml-1">m/s</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Velocidad promedio a la que los electrones libres avanzan ordenadamente empujados por el campo inducido.
                </p>
              </div>

              {/* n - Densidad de portadores */}
              <div className="bg-white border-t-4 border-emerald-600 rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full flex items-center justify-center">c</span>
                    <span className="text-sm font-display font-medium text-slate-500">Electrones de Conducción</span>
                    <span className="font-display font-extrabold text-lg text-emerald-600 italic">n</span>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-emerald-600 px-3 py-2 text-[10px] font-mono text-slate-800 rounded-r-lg">
                    n = N_A · (δ / M)
                  </div>
                  <div className="text-center py-2">
                    <span className="font-display font-black text-2xl text-emerald-600">{formatScientific(n)}</span>
                    <span className="text-xs font-bold text-slate-400 font-mono ml-1">e⁻/m³</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  Densidad volumétrica de electrones libres en el conductor. Se determina de forma exclusiva por propiedades del metal.
                </p>
              </div>
            </div>
          </section>

          {/* Step 5: COMPARATIVE TAB */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div
              onClick={() => setModoComparacion(!modoComparacion)}
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">5</span>
                <h3 className="font-display font-bold text-base text-slate-700">Pestaña Comparativa de Metales</h3>
              </div>
              <span className="text-indigo-600 font-bold text-xs">
                {modoComparacion ? "✕ Ocultar" : "⬇ Mostrar Tabla Completa"}
              </span>
            </div>

            {modoComparacion && (
              <div className="p-5 border-t border-slate-200 space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left text-slate-700 min-w-[500px]">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-900 font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Material de Prueba</th>
                        <th className="py-3 px-4">Resistividad ρ (Ω·m)</th>
                        <th className="py-3 px-4">Vel. Deriva v_d (m/s)</th>
                        <th className="py-3 px-4">Relación a Escala</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.keys(materiales) as MaterialKey[]).map((key) => {
                        const m = materiales[key];
                        const velMat = getVelocidadMaterial(m);
                        const barPct = (velMat / maxVelocidadActual) * 100;
                        return (
                          <tr
                            key={key}
                            onClick={() => setMaterial(key)}
                            className={`border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer ${material === key ? "bg-indigo-50/40 font-semibold" : ""
                              }`}
                          >
                            <td className="py-3.5 px-4 flex items-center gap-2 text-slate-800">
                              <span>{m.emoji}</span> {m.nombre}
                            </td>
                            <td className="py-3.5 px-4 font-mono">{m.resistividad.toExponential(2)}</td>
                            <td className={`py-3.5 px-4 font-mono font-bold ${material === key ? "text-indigo-600" : ""}`}>
                              {velMat.toFixed(1)} m/s
                            </td>
                            <td className="py-3.5 px-4 pr-6">
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${barPct}%`,
                                    background: material === key
                                      ? `linear-gradient(90deg, ${m.colorGrad1}, ${m.colorGrad2})`
                                      : '#cbd5e1'
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  💡 Los materiales con resistividad más baja (ej. la Plata y el Cobre) consiguen velocidades de deriva mucho más altas con una misma magnitud de campo eléctrico.
                </p>
              </div>
            )}
          </section>
          {/* Step 6: BIOPHYSICAL HAZARD STUDY */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">6</span>
                <div className="space-y-0.5">
                  <h2 className="font-display font-bold text-lg text-slate-800">El Cuerpo como Conductor</h2>
                  {/* <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Seguridad Eléctrica y Efectos Fisiológicos</p> */}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1 text-red-700 text-[10px] font-extrabold max-w-max">
                <ShieldAlert className="w-3.5 h-3.5" /> APRENDIZAJE CRÍTICO
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed max-w-4xl">
              A nivel microscópico, los electrones se desplazan por redes cristalinas. En el cuerpo humano, la corriente no es electrónica pura, sino <strong>iónica</strong> (flujo de sales como Na⁺, K⁺ y Cl⁻ disueltas en líquido intracelular). El cuerpo posee resistencia eléctrica y, al circular una diferencia de potencial, se convierte en un conductor metálico simulado. {/* <strong>Usa el slider interactivo para ajustar el nivel de amperaje y analizar los efectos en el organismo:</strong> */}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Left side: Selector of card thresholds */}
              <div className="lg:col-span-5 space-y-2.5">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Hitos de corriente en amperios (A):</span>
                {efectosCuerpo.map((ef, index) => {
                  const isSelected = activeEfectoIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setCorrienteFisiologica(ef.rango)}
                      className={`w-full text-left p-3 border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${isSelected
                        ? "border-red-600 bg-red-50/40 shadow-sm translate-x-1"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/70 hover:bg-slate-100/50"
                        }`}
                    >
                      <span className="text-2xl flex-shrink-0 select-none">{ef.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-black text-slate-700">{ef.rangoStr}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? "bg-red-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}>
                            {ef.peligro}
                          </span>
                        </div>
                        <div className={`text-xs font-bold font-display truncate mt-0.5 ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                          {ef.efecto}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right side: Interactive oscilloscope / monitor & advice */}
              <div className="lg:col-span-7 space-y-4">
              </div>

            </div>
          </section>
        </main>

        {/* Manual uso modal popup */}
        {mostrarManual && (
          <ManualUso onClose={() => setMostrarManual(false)} />
        )}
      </div>
    </>
  );
}
