import React, { useState } from "react";
import { BookOpen, X, ArrowLeft, ArrowRight, Zap, Info, HelpCircle } from "lucide-react";

interface ManualUsoProps {
  tipo?: "metal" | "circuito" | "kirchhoff";
  onClose: () => void;
}

export default function ManualUso({ tipo = "metal", onClose }: ManualUsoProps) {
  const [seccionActiva, setSeccionActiva] = useState(0);

  // Secciones específicas según el tipo de simulador
  const getSecciones = () => {
    switch (tipo) {
      case "circuito":
        return [
          {
            id: 0,
            icon: "📐",
            titulo: "Introducción y Redes",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center py-6 border-b border-slate-100">
                  <span className="text-5xl block mb-3">🔌</span>
                  <h2 className="font-display font-bold text-2xl text-slate-800">
                    Guía Didáctica: Red de Resistores
                  </h2>
                  <p className="text-indigo-600 font-medium text-sm mt-1">
                    Asociación mixta de resistencias en serie y paralelo (Problema G4-8)
                  </p>
                </div>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 flex gap-4">
                  <span className="text-2xl mt-0.5">📂</span>
                  <div className="text-sm">
                    <strong className="text-indigo-900 font-bold block mb-1">
                      Problema de Referencia (Ejercicios de la Figura 5)
                    </strong>
                    <p className="text-indigo-800 leading-relaxed font-semibold">
                      Este módulo resuelve e ilustra dos configuraciones mixtas representativas:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 text-indigo-950 font-medium font-sans">
                      <li>
                        <strong>Circuito original 5a:</strong> Configuración compleja donde un grupo en serie (R₁ + R₄ + R₅) opera en paralelo absoluto con R₃, sumándose en serie principal a R₂ y R₆.
                      </li>
                      <li>
                        <strong>Circuito original 5b:</strong> Configuración clásica donde un paralelo directo (R₂ || R₃) se acopla en serie con R₁, R₄ y R₅.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-base">¿Qué aprenderás con este simulador?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      { icon: "⚡", text: "Reglas de reducción sistemática de circuitos mixtos." },
                      { icon: "🎛️", text: "Efecto inmediato en la corriente al cambiar valores locales." },
                      { icon: "🎯", text: "Mediciones analíticas de voltajes y calor por ramas." },
                      { icon: "📊", text: "Simulación de velocidad proporcional del flujo de corriente." }
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-lg flex-shrink-0">{f.icon}</span>
                        <span className="text-slate-700 text-xs leading-relaxed">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 1,
            icon: "📖",
            titulo: "Leyes y Simplificación",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Simplificación del Circuito Red de Resistores
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Para simplificar un circuito mixto, se buscan asociaciones puramente en serie o paralelo consecutivas y se reemplazan por su valor equivalente.
                </p>

                <div className="space-y-4">
                  {/* Serie */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold flex items-center justify-center text-sm">S</span>
                      <strong className="text-slate-800 text-sm">Resistores en Serie</strong>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Comparten la misma corriente. Se suman de forma lineal:</p>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3.5 font-mono text-center text-slate-800 text-lg rounded-r-lg">
                      R_equivalente = R₁ + R₂ + R₃ + ...
                    </div>
                  </div>

                  {/* Paralelo */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-mono font-bold flex items-center justify-center text-sm">P</span>
                      <strong className="text-slate-800 text-sm">Resistores en Paralelo</strong>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Comparten el mismo potencial eléctrico. Se reducen mediante la suma de sus recíprocos:</p>
                    <div className="bg-violet-50 border-l-4 border-violet-500 p-3.5 font-mono text-center text-slate-800 text-lg rounded-r-lg">
                      1 / R_equivalente = 1/R₁ + 1/R₂
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Para dos elementos: R_eq = (R₁ · R₂) / (R₁ + R₂)</p>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 2,
            icon: "🖱️",
            titulo: "Interacción y Paso a Paso",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Cómo Utilizar el Simulador Red de Resistores
                </h2>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                    <p>
                      <strong>Selecciona el circuito:</strong> Usa los botones superiores para intercambiar entre el <strong>Circuito original 5a</strong> y la alternativa <strong>b</strong>. El esquemático e interactivos se modificarán automáticamente.
                    </p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                    <p>
                      <strong>Edición de Componentes:</strong> Haz clic en cualquier resistor o la batería del esquema. Se seleccionará con un resplandor azul y se abrirán controles deslizantes dinámicos para ajustar su valor en tiempo real.
                    </p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                    <p>
                      <strong>Navegación paso a paso:</strong> Revisa el bloque inferior para ver la simplificación matemática de tu circuito. Puedes avanzar o retroceder paso a paso para estudiar el origen matemático del resultado.
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        ];

      case "kirchhoff":
        return [
          {
            id: 0,
            icon: "📐",
            titulo: "Introducción y Mallas",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center py-6 border-b border-slate-100">
                  <span className="text-5xl block mb-3">⛓️</span>
                  <h2 className="font-display font-bold text-2xl text-slate-800">
                    Guía Didáctica: Leyes de Kirchhoff (Mallas)
                  </h2>
                  <p className="text-indigo-600 font-medium text-sm mt-1">
                    Análisis matricial por Regla de Cramer en sistemas de mallas múltiples (Problema G4-9)
                  </p>
                </div>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 flex gap-4">
                  <span className="text-2xl mt-0.5">📂</span>
                  <div className="text-sm">
                    <strong className="text-indigo-900 font-bold block mb-1">
                      Problema de Referencia (Guía 4 - Ejercicio 9)
                    </strong>
                    <p className="text-indigo-800 leading-relaxed font-medium">
                      Este problema trata de un circuito de **dos mallas y tres fuentes activas de tensión** con resistencias internas y de carga. Resolverlo por series/paralelos convencionales es imposible, por lo que recurrimos a las ecuaciones de Kirchhoff:
                    </p>
                    <ul className="list-decimal pl-5 mt-2 space-y-1 text-indigo-950 font-semibold font-sans">
                      <li>Calcula la corriente en cada rama: I₀, I₁ y I₂</li>
                      <li>Determina la diferencia de potencial Vb - Va</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-base">¿Qué aprenderás con este simulador?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      { icon: "🏛️", text: "Reglas de Signos e Independencia de las Fuentes F.E.M." },
                      { icon: "💡", text: "Leyes fundamentales de corrientes de nodo y mallas." },
                      { icon: "🧠", text: "Uso de determinantes para sistemas lineales de 2x2." },
                      { icon: "🎨", text: "Comportamiento del flujo al cambiar el sentido de las baterías." }
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-lg flex-shrink-0">{f.icon}</span>
                        <span className="text-slate-700 text-xs leading-relaxed">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 1,
            icon: "🧬",
            titulo: "Leyes y Cramer",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Acerca de las Leyes de Kirchhoff y Cramer
                </h2>

                <div className="space-y-4">
                  {/* Primera Ley */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <strong className="text-slate-800 text-sm block mb-1">1. Ley de Nodos (LVK - Conservación de Carga)</strong>
                    <p className="text-xs text-slate-500">La suma de corrientes que entran a un nodo es igual a las que salen:</p>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 font-mono text-center text-slate-800 text-lg rounded-r-lg mt-1">
                      Σ I_entra = Σ I_sale
                    </div>
                  </div>

                  {/* Segunda Ley */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <strong className="text-slate-800 text-sm block mb-1">2. Ley de Mallas (LVK - Conservación de Energía)</strong>
                    <p className="text-xs text-slate-500">La suma algebraica de diferencias de potencial a lo largo de cualquier malla cerrada es cero:</p>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 font-mono text-center text-slate-800 text-lg rounded-r-lg mt-1">
                      Σ V = 0
                    </div>
                  </div>

                  {/* Cramer */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <strong className="text-slate-800 text-sm block mb-1">3. Resolución por Determinantes</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Planteamos un sistema lineal donde las incógnitas son las corrientes de malla. Luego, solucionamos mediante determinantes de Cramer:
                    </p>
                    <code className="block bg-slate-50 text-[10px] text-indigo-700 font-bold p-2.5 rounded-lg border border-slate-100 mt-2 font-mono">
                      Determinante D = (R₁₄ · (R₃ + R₂₅)) + (R₃ · R₂₅) <br />
                      I₀ = DI₀ / D | I₁ = DI₁ / D
                    </code>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 2,
            icon: "🛠️",
            titulo: "Operación y Sentidos",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Operación y Signos en Kirchhoff
                </h2>

                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Este simulador científico automatiza no solo el cálculo, sino también la detección de corrientes de signo invertido.
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <span className="font-bold text-amber-900 block mb-1">¿Qué significa una corriente negativa?</span>
                    <p className="text-amber-800">
                      En electromagnetismo, cuando asumimos un sentido arbitrario para la corriente de mallas (por ejemplo, sentido horario), si la resolución algebraica da un valor negativo como <strong>-0.12 A</strong>, significa que el flujo físico real de la corriente va en el sentido contrario al supuesto.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Cómo experimentar:</span>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Haz clic en cualquiera de las tres fuentes (E₁, E₂ o E₃) del esquema e incrementa sus valores. Mira cómo cambia la corriente.</li>
                      <li>Cambia el flujo del circuito a "Flujo de electrones" para ver las partículas de color rojo moviéndose realmente de negativo a positivo.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          }
        ];

      default:
      case "metal":
        return [
          {
            id: 0,
            icon: "📘",
            titulo: "Introducción y Contexto",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center py-6 border-b border-slate-100">
                  <span className="text-5xl block mb-3">⚡</span>
                  <h2 className="font-display font-bold text-2xl text-slate-800">
                    Guía Didáctica: Corriente en Metales
                  </h2>
                  <p className="text-indigo-600 font-medium text-sm mt-1">
                    Análisis microscópico de la conducción eléctrica (Problema G4-7)
                  </p>
                </div>

                <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 flex gap-4">
                  <span className="text-2xl mt-0.5">📄</span>
                  <div className="text-sm">
                    <strong className="text-indigo-900 font-bold block mb-1">
                      Problema de Referencia (Guía 4 - Ejercicio 7)
                    </strong>
                    <p className="text-indigo-800 leading-relaxed">
                      Un campo eléctrico de <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">2.1 kV/m</code> se aplica a un elemento de plata (<code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">ρ = 1.59 × 10⁻⁸ Ω·m</code>) de sección transversal uniforme. Se calcula:
                    </p>
                    <ul className="list-decimal pl-5 mt-2 space-y-1 text-indigo-950 font-medium animate-pulse">
                      <li>La densidad de corriente (J)</li>
                      <li>La velocidad de deriva de los electrones (v_d)</li>
                      <li>La cantidad de portadores de carga por unidad de volumen (n)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-base">¿Qué aprenderás con este simulador?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {[
                      { icon: "🔬", text: "Calcular magnitudes físicas reales e instantáneas." },
                      { icon: "🎛️", text: "Alterar el campo eléctrico y ver su efecto físico inmediato." },
                      { icon: "🎬", text: "Observar una simulación del flujo de electrones en el metal." },
                      { icon: "📊", text: "Comparar la conductividad de 5 metales industriales cruciales." }
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-lg flex-shrink-0">{f.icon}</span>
                        <span className="text-slate-700 text-xs leading-relaxed">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 1,
            icon: "📐",
            titulo: "Fórmulas y Leyes",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Marco Teórico y Ecuaciones del Problema
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  La conducción eléctrica en metales se describe mediante la densidad de corriente, el campo eléctrico, y las colisiones térmicas de los electrones libres.
                </p>

                <div className="space-y-4">
                  {/* Formula 1 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <strong className="text-slate-800 text-sm block mb-1">Densidad de Corriente (J)</strong>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 font-mono text-center text-slate-800 text-base rounded-r-lg">
                      J = E / ρ
                    </div>
                  </div>

                  {/* Formula 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <strong className="text-slate-800 text-sm block mb-1">Velocidad de Deriva (v_d)</strong>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 font-mono text-center text-slate-800 text-base rounded-r-lg">
                      v_d = J / (n · q_e)
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 2,
            icon: "⚖️",
            titulo: "Metales y Comparativa",
            contenido: (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display font-bold text-xl text-slate-800 border-b-2 border-indigo-500 pb-2">
                  Metales y Conductividad
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  No todos los metales conducen las cargas con la misma facilidad. Su resistividad (<code className="font-mono bg-slate-100 px-1 rounded">ρ</code>) depende exclusivamente de la estructura cristalina atómica. La plata es químicamente el mejor conductor existente en la Tierra, seguida muy de cerca por el cobre industrial.
                </p>
              </div>
            )
          }
        ];
    }
  };

  const secciones = getSecciones();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl block">📖</span>
            <div>
              <h1 className="font-display font-extrabold text-lg leading-none">
                Guía Práctica del Simulador
              </h1>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">
                {tipo === "metal"
                  ? "Problema 7"
                  : tipo === "circuito"
                    ? " Problema 8"
                    : " Problema 9"}
              </p>
            </div>
          </div>
          <button
            className="bg-slate-800 hover:bg-slate-705 text-white hover:text-red-400 border border-slate-700 py-1.5 px-4 rounded-xl cursor-pointer text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            onClick={onClose}
          >
            <X className="w-4 h-4" /> Cerrar
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] flex-1 overflow-hidden h-[60vh] min-h-[400px]">
          {/* Navigation Links sidebar */}
          <nav className="bg-slate-50 border-r border-slate-200 overflow-y-auto p-3 flex md:flex-col gap-1.5 flex-row overflow-x-auto select-none">
            {secciones.map((s, idx) => (
              <button
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-none cursor-pointer text-left w-full transition-all text-xs font-semibold whitespace-nowrap min-w-[120px] md:min-w-0 ${seccionActiva === idx
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-indigo-600"
                  }`}
                onClick={() => setSeccionActiva(idx)}
              >
                <span className="text-base flex-shrink-0">{s.icon}</span>
                <span className="truncate">{s.titulo}</span>
              </button>
            ))}
          </nav>

          {/* Main content display */}
          <main className="flex flex-col overflow-hidden bg-white text-slate-700 flex-1">
            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {secciones[seccionActiva]?.contenido}
            </div>

            {/* Footer Navigation Buttons - Docked permanently at bottom of main area */}
            <div className="flex justify-between items-center px-6 py-4 md:px-8 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 py-2 px-5 rounded-full cursor-pointer text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 active:scale-95"
                disabled={seccionActiva === 0}
                onClick={() => setSeccionActiva((s) => s - 1)}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>

              <span className="text-xs text-slate-400 font-bold">
                Página {seccionActiva + 1} de {secciones.length}
              </span>

              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-full cursor-pointer text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 active:scale-95"
                disabled={seccionActiva === secciones.length - 1}
                onClick={() => setSeccionActiva((s) => s + 1)}
              >
                Siguiente <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
