import React, { useState, useEffect } from "react";
import SimuladorMetal from "./components/SimuladorMetal";
import SimuladorCircuitos from "./components/SimuladorCircuitos";
import SimuladorLeyesKirchhoff from "./components/SimuladorLeyesKirchhoff";
import { Zap, Cpu, Layers, BookOpen, ExternalLink, HelpCircle, Activity } from "lucide-react";

type SimulatorType = "metal" | "circuito" | "kirchhoff" | null;

let hasIncremented = false;

export default function App() {
  const [simuladorActivo, setSimuladorActivo] = useState<SimulatorType>(null);
  const [visitas, setVisitas] = useState<number>(1);

  useEffect(() => {
    const totalVisits = localStorage.getItem("fisica_ii_lab_visitas");
    let currentVisits = totalVisits ? parseInt(totalVisits, 10) : 0;

    if (!hasIncremented) {
      currentVisits += 1;
      localStorage.setItem("fisica_ii_lab_visitas", currentVisits.toString());
      hasIncremented = true;
    }

    setVisitas(currentVisits || 1);
  }, []);

  const volverAlMenu = () => {
    setSimuladorActivo(null);
  };

  // Renderizar simuladores individuales según el menú activo
  if (simuladorActivo === "metal") {
    return <SimuladorMetal volverAlMenu={volverAlMenu} />;
  }

  if (simuladorActivo === "circuito") {
    return <SimuladorCircuitos volverAlMenu={volverAlMenu} />;
  }

  if (simuladorActivo === "kirchhoff") {
    return <SimuladorLeyesKirchhoff volverAlMenu={volverAlMenu} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Background ambient blurs */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center space-y-12 md:space-y-16 relative z-10">

        {/* Core display heading */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            {/* <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 px-4 py-1.5 rounded-full text-indigo-400 font-display font-bold text-xs tracking-wider uppercase shadow-inner">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Laboratorios Interactivos de Física II
            </div> */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 rounded-full text-emerald-400 font-display font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-inner select-none transition-all hover:bg-emerald-500/15">
              <span>👁️ Visitas Totales:</span>
              <span className="font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">{visitas}</span>
            </div>
          </div>

          <h1 className="font-display font-black text-4xl m-0 sm:text-5xl leading-tight tracking-tight text-white drop-shadow-sm">
            Física II: Unidad Temática 4 Electrodinámica
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Plataforma virtual para el aprendizaje intuitivo de tres problemas complejos de mallas, resistencias y comportamiento atómico de conductores de manera visual.
          </p>
        </section>

        {/* Triple choice grid cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* Card 1: Metal conduction sim */}
          <div
            onClick={() => setSimuladorActivo("metal")}
            className="group relative bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-lg text-white leading-tight tracking-tight">
                  Corriente en Metales
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  <strong>Problema 7:</strong> Determina la densidad de corriente ($J$) y la velocidad de deriva ($v_d$) de electrones libres en conductores aplicando campos eléctricos.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 font-medium">
                <li className="flex items-center gap-2">✓ Configuración de 5 metales</li>
                <li className="flex items-center gap-2">✓ Simulación de velocidad de deriva</li>
                <li className="flex items-center gap-2">✓ Notación científica interactiva</li>
              </ul>
            </div>
            <button
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors font-display"
              onClick={() => setSimuladorActivo("metal")}
            >
              Iniciar Experimento →
            </button>
          </div>

          {/* Card 2: Simple Resonator Sim */}
          <div
            onClick={() => setSimuladorActivo("circuito")}
            className="group relative bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center text-violet-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-lg text-white leading-tight tracking-tight">
                  Red de Resistores
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  <strong>Problema 8:</strong> Resuelve asociaciones complejas de resistencias en serie y paralelo para diagramas de la Figura 5, aplicando la Ley de Ohm.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 font-medium">
                <li className="flex items-center gap-2">✓ Diagramas Interactivos a y b</li>
                <li className="flex items-center gap-2">✓ Edición dinámica de resistencias</li>
                <li className="flex items-center gap-2">✓ Animación de velocidad de corriente</li>
              </ul>
            </div>
            <button
              className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors font-display"
              onClick={() => setSimuladorActivo("circuito")}
            >
              Iniciar Experimento →
            </button>
          </div>

          {/* Card 3: Kirchhoff sim */}
          <div
            onClick={() => setSimuladorActivo("kirchhoff")}
            className="group relative bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-lg text-white leading-tight tracking-tight">
                  Leyes de Kirchhoff (Mallas)
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  <strong>Problema 9:</strong> Resuelve circuitos de mallas de dos mallas y tres fuentes de tensión mediante el Teorema de Kirchhoff y determinantes matriciales.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 font-medium">
                <li className="flex items-center gap-2">✓ Determinantes de Cramer en vivo</li>
                <li className="flex items-center gap-2">✓ Balanceo de voltajes en mallas</li>
                <li className="flex items-center gap-2">✓ Visualizador de potencial Vb - Va</li>
              </ul>
            </div>
            <button
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors font-display"
              onClick={() => setSimuladorActivo("kirchhoff")}
            >
              Iniciar Experimento →
            </button>
          </div>

        </section>

        {/* Global info card */}
        {/* <section className="bg-slate-950/50 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <BookOpen className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          <p className="text-slate-400 hover:text-slate-300 transition-colors text-xs leading-relaxed">
            🎓 <strong>Nota para docentes y alumnos:</strong> Cada módulo incluye controles enriquecidos, soporte de cambio de flujo entre corriente tradicional y electrónica física real, y verificación matemática paso a paso interactiva adaptada al programa de Ingeniería Física II.
          </p>
        </section> */}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-[10px] tracking-wider font-semibold bg-slate-950 uppercase">
        U.T.N. FRRe. Física II • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
