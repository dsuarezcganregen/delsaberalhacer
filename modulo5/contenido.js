// Contenido del Módulo 5. Todo lo que el alumno lee sale de aquí,
// para que un cambio de texto se haga en un solo lugar.

window.M5 = {};

M5.meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

M5.negocios = [
  { id: "cria", nombre: "Cría (vacas con becerro)" },
  { id: "leche", nombre: "Leche o doble propósito" },
  { id: "ceba", nombre: "Desarrollo, levante o engorda" },
];

M5.temporadas = [
  { id: "crecimiento", nombre: "Crecimiento", ayuda: "El pasto está creciendo." },
  { id: "transicion", nombre: "Transición", ayuda: "El pasto está frenando o apenas está arrancando." },
  { id: "no_crecimiento", nombre: "No crecimiento", ayuda: "El pasto no crece: seca o invierno." },
];

M5.manejos = [
  { id: "partos", nombre: "Partos" },
  { id: "monta", nombre: "Entrada de toros" },
  { id: "salida_toros", nombre: "Salida de toros" },
  { id: "palpacion", nombre: "Palpación" },
  { id: "destete", nombre: "Destete" },
  { id: "ventas", nombre: "Ventas de ganado" },
  { id: "compras", nombre: "Compras de ganado" },
];

// Las prácticas del programa. "aplicaA" decide si se muestra según el negocio:
// null = todos; lista = solo si el alumno marcó alguno de esos negocios.
M5.practicas = [
  {
    id: "pastoreo",
    nombre: "Pastoreo no selectivo",
    icono: "🐄",
    escalones: [
      "Pastoreo continuo, o rotación sin control de densidad.",
      "Laboratorio de aprendizaje en curso.",
      "Laboratorio terminado (ya conozco mi umbral de manejo) y estoy escalando a más lotes.",
      "Todo el hato, con el agua y el cerco para sostenerlo.",
    ],
    dato: "¿Cuántas cabezas están en pastoreo controlado, de cuántas que tienes en total? ¿Con qué densidad trabajas?",
    aplicaA: null,
  },
  {
    id: "planilla",
    nombre: "Planilla de pastoreo",
    icono: "📋",
    escalones: [
      "Sin registro de potreros ni de lotes.",
      "Planilla configurada: potreros con hectáreas y lotes en UA.",
      "Anotando a diario: movimientos, lluvia y cómo quedó cada potrero.",
      "La leo: saco los días animal de cada pastoreo y cierro el mes.",
    ],
    dato: "¿Desde cuándo anotas sin huecos?",
    aplicaA: null,
  },
  {
    id: "activacion",
    nombre: "Activación ruminal",
    icono: "🌾",
    escalones: [
      "Suplemento sin criterio, o no sé si lo necesito.",
      "La base está puesta (sal y minerales por separado, agua de sobra, espacio de comedero para todos) y el producto ya entró con dosis de prueba.",
      "Ajusto la dosis según la bosta.",
      "Ya encontré la dosis mínima, y el suplemento se mueve con la calidad del forraje.",
    ],
    dato: "¿Cuáles fueron tus últimas calificaciones de bosta y qué dosis das hoy?",
    aplicaA: null,
  },
  {
    id: "ecosincronia_cria",
    nombre: "Ecosincronía (cría y leche)",
    icono: "📅",
    escalones: [
      "Toro todo el año.",
      "Ventana calculada y palpación hecha, todavía sin aplicar.",
      "Estrategias definidas y en ejecución (por ejemplo, la fecha de salida del toro fija con la entrada recorriéndose año con año, o el destete según la condición corporal).",
      "Hato acomodado: la temporada de servicio está fija y los partos caen en la temporada correcta.",
    ],
    dato: "¿En qué fechas entraron y salieron los toros la última temporada? ¿En qué meses están cayendo los partos?",
    aplicaA: ["cria", "leche"],
  },
  {
    id: "ecosincronia_ceba",
    nombre: "Ecosincronía (desarrollo y ceba)",
    icono: "📅",
    escalones: [
      "Carga fija todo el año.",
      "Temporadas clasificadas (buenas, regulares y malas) con el Analizador y el historial.",
      "Plan de cargas flotantes definido y en ejecución: compra y venta escalonada.",
      "La carga sube y baja con la curva de forraje, año con año.",
    ],
    dato: "¿En qué meses compras y en cuáles vendes? ¿Cuántas cabezas tienes hoy, frente a la carga más alta del año?",
    aplicaA: ["ceba"],
  },
  {
    id: "descarte",
    nombre: "Descarte de improductivos",
    icono: "✂️",
    escalones: [
      "Sin identificar.",
      "Identificados, pero siguen en el hato.",
      "Ya salieron los evidentes.",
      "El descarte es parte del manejo de cada año.",
    ],
    dato: "¿Cuántos animales identificaste y cuántos ya salieron?",
    aplicaA: null,
  },
  {
    id: "sna",
    nombre: "Selección Natural Acelerada",
    icono: "🧬",
    escalones: [
      "No he hecho la evaluación de fertilidad práctica del hato en campo.",
      "Evaluación hecha: tengo identificados a los élite y a los problemáticos, y ya tomé la decisión (selección interna, genética de fuera o liquidar y recomprar).",
      "La decisión está en marcha: los élite están apartados como reemplazo y, según el camino, ya salieron los que no cumplen, entró genética de fuera o empezó la recompra.",
      "La ventana de servicio trabaja como filtro: cada año salen las vacas que no se preñan dentro de ella y los reemplazos salen de los élite.",
    ],
    dato: "¿Cuántos animales élite tienes apartados y qué camino elegiste?",
    aplicaA: null,
  },
  {
    id: "registro",
    nombre: "Evidencias y registro diario",
    icono: "📸",
    escalones: [
      "No se registra nada: lo que se sabe está en la cabeza del vaquero o en la mía.",
      "Se registra a ratos: hay datos sueltos (alguna foto, alguna calificación), sin rutina.",
      "Registro con rutina: alguien tiene asignado qué anotar y cada cuándo (movimientos, bosta, llenado, lluvia, fotos de punto fijo), aunque se escapen días.",
      "El registro llega solo y se usa: el equipo lo manda sin que se lo pidan y con eso decido.",
    ],
    dato: "¿Qué se registró la última semana, quién lo hizo y cuántas fotos de punto fijo tienes con fecha?",
    aplicaA: null,
  },
];

M5.roles = [
  { id: "T", nombre: "Técnico", icono: "🛠️", ayuda: "Lo que se ejecuta o se supervisa en campo: revisar bebederos y cercos, vacunar, mover ganado, cargar insumos, reparar equipo." },
  { id: "G", nombre: "Gerente", icono: "👔", ayuda: "Lo que organiza y mantiene la máquina funcionando: juntas con el personal, registros, compras, pagos, resolver problemas del día." },
  { id: "E", nombre: "Empresario", icono: "🧭", ayuda: "Lo que decide hacia dónde va el negocio: rumbo a 3, 5 y 10 años, si el sistema productivo sigue siendo el correcto, inversiones grandes, relaciones con asesores y compradores." },
];

M5.patrones = [
  { id: "bombero", nombre: "El Bombero Técnico", texto: "Vivo apagando incendios. Mi semana se va en urgencias del día." },
  { id: "gerente", nombre: "El Gerente que no crece", texto: "El rancho funciona, pero nadie está decidiendo hacia dónde va a 3 años." },
  { id: "noaterriza", nombre: "El Empresario que no aterriza", texto: "Llego con ideas y planes, pero ni el personal ni la operación los pueden ejecutar." },
  { id: "disfrazado", nombre: "El error disfrazado de buena decisión", texto: "Tomé una decisión que parecía empresarial, pero al final solo me conseguí más trabajo." },
];

M5.energia = [
  { id: "energiza", pregunta: "¿Cuál de los tres roles te energiza más?" },
  { id: "drena", pregunta: "¿Cuál te drena más?" },
  { id: "natural", pregunta: "¿Cuál te resulta más natural ejercer?" },
  { id: "inseguro", pregunta: "¿En cuál te sientes más incompetente o inseguro?" },
];

// Qué prácticas le tocan a un alumno según los negocios que marcó.
M5.practicasPara = function (negocios) {
  const n = negocios || [];
  return M5.practicas.filter(p => {
    if (!p.aplicaA) return true;
    if (!n.length) return p.id === "ecosincronia_cria"; // sin negocio marcado, se muestra la de cría
    return p.aplicaA.some(x => n.includes(x));
  });
};

// Distribución de horas por rol (en %), a partir de la tabla de tareas.
M5.distribucion = function (tareas) {
  const h = { T: 0, G: 0, E: 0 };
  (tareas || []).forEach(t => {
    const v = parseFloat(String(t.horas || "").replace(",", "."));
    if (t.rol && h[t.rol] !== undefined && v > 0) h[t.rol] += v;
  });
  const total = h.T + h.G + h.E;
  if (!total) return null;
  return {
    horas: h, total,
    T: Math.round(h.T * 100 / total),
    G: Math.round(h.G * 100 / total),
    E: Math.round(h.E * 100 / total),
  };
};
