// Arma la hoja de resultado a partir de las respuestas.
// La usan la página del alumno (al enviar) y la administración (al abrir una evaluación).

(function () {
  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const txt = s => esc(s).replace(/\n/g, "<br>");
  const mes = i => (i === "" || i == null) ? "" : (i === "todavia" ? "Todavía crece" : (M5.meses[+i] || ""));
  const rolNombre = id => { const r = M5.roles.find(x => x.id === id); return r ? `${r.icono} ${r.nombre}` : ""; };
  const fechaLarga = f => {
    if (!f) return "";
    const [a, m, d] = f.split("-").map(Number);
    if (!a || !m || !d) return esc(f);
    return `${d} de ${M5.meses[m - 1].toLowerCase()} de ${a}`;
  };
  const logroTxt = { si: "Sí", medias: "A medias", no: "No" };

  function escalera(n) {
    let h = '<span class="escalera" aria-label="Escalón ' + n + ' de 4">';
    for (let i = 1; i <= 4; i++) h += `<span class="peldano${i <= n ? " lleno" : ""}"></span>`;
    return h + "</span>";
  }

  function seccionMomento(m) {
    m = m || {};
    const t = M5.temporadas.find(x => x.id === m.temporada);
    const manejos = M5.manejos
      .filter(x => m.manejos && m.manejos[x.id] && m.manejos[x.id].trim())
      .map(x => `<li><b>${esc(x.nombre)}:</b> ${esc(m.manejos[x.id])}</li>`);
    if (m.otro && m.otro.trim()) manejos.push(`<li><b>Otro:</b> ${esc(m.otro)}</li>`);
    return `
      <section class="h-sec">
        <h2>Momento del año</h2>
        <div class="h-grid">
          <div><span class="h-et">Temporada</span><span class="h-val">${t ? esc(t.nombre) : "Sin dato"}</span></div>
          <div><span class="h-et">Dejó de crecer el pasto</span><span class="h-val">${esc(mes(m.dejo_de_crecer)) || "Sin dato"}</span></div>
          <div><span class="h-et">Espera que vuelva a crecer</span><span class="h-val">${esc(mes(m.vuelve_a_crecer)) || "Sin dato"}</span></div>
        </div>
        <h3>Lo que le viene al hato en los próximos seis meses</h3>
        ${manejos.length ? `<ul class="h-lista">${manejos.join("")}</ul>` : '<p class="h-vacio">Sin dato.</p>'}
      </section>`;
  }

  function seccionPracticas(r) {
    const lista = M5.practicasPara(r.negocios);
    const filas = lista.map(p => {
      const resp = (r.practicas || {})[p.id] || {};
      const na = resp.escalon === 0;
      const n = resp.escalon || 0;
      const desc = na ? "No aplica en este rancho." : (n ? p.escalones[n - 1] : "Sin responder.");
      return `
        <div class="h-practica${na ? " na" : ""}">
          <div class="h-p-cab">
            <span class="h-p-nombre">${p.icono} ${esc(p.nombre)}</span>
            ${na ? '<span class="h-na">No aplica</span>' : (n ? escalera(n) + `<span class="h-esc">Escalón ${n} de 4</span>` : '<span class="h-na">Sin responder</span>')}
          </div>
          <p class="h-p-desc">${esc(desc)}</p>
          ${!na && resp.dato && resp.dato.trim() ? `<p class="h-p-dato"><b>Dato:</b> ${txt(resp.dato)}</p>` : ""}
          ${resp.nota && resp.nota.trim() ? `<p class="h-p-dato"><b>Nota:</b> ${txt(resp.nota)}</p>` : ""}
          ${!na ? '<div class="h-sig"><span>Siguiente escalón (se llena en el Módulo 6):</span><div class="h-linea"></div></div>' : ""}
        </div>`;
    }).join("");
    return `<section class="h-sec"><h2>Hasta dónde llegó cada práctica</h2>${filas}</section>`;
  }

  function seccionRoles(ro) {
    ro = ro || {};
    const hoy = M5.distribucion(ro.tareas);
    const num = v => (v === "" || v == null || isNaN(+v)) ? null : +v;
    const filas = M5.roles.map(x => {
      const b = num((ro.base || {})[x.id]);
      const c = num((ro.compromiso || {})[x.id]);
      const h = hoy ? hoy[x.id] : null;
      return `<tr>
        <td>${x.icono} ${x.nombre}</td>
        <td>${b == null ? "–" : b + "%"}</td>
        <td>${c == null ? "–" : c + "%"}</td>
        <td><b>${h == null ? "–" : h + "%"}</b>${h == null ? "" : `<span class="h-barra"><span style="width:${h}%"></span></span>`}</td>
      </tr>`;
    }).join("");

    const tareas = (ro.tareas || []).filter(t => t.tarea && t.tarea.trim());
    const tablaTareas = tareas.length ? `
      <details class="h-det"><summary>Ver las ${tareas.length} tareas de la semana</summary>
        <table class="h-tabla"><thead><tr><th>Tarea</th><th>Rol</th><th>Horas</th></tr></thead><tbody>
        ${tareas.map(t => `<tr><td>${esc(t.tarea)}</td><td>${esc(rolNombre(t.rol))}</td><td>${esc(t.horas)}</td></tr>`).join("")}
        </tbody></table>
      </details>` : "";

    const patrones = M5.patrones.filter(p => ro.patrones && ro.patrones[p.id] && ro.patrones[p.id].marcado)
      .map(p => `<li><b>${esc(p.nombre)}.</b> ${txt(ro.patrones[p.id].ejemplo || "")}</li>`);

    const energia = M5.energia.map(e => {
      const v = (ro.energia || {})[e.id];
      return `<li>${esc(e.pregunta)} <b>${v ? esc(rolNombre(v)) : "Sin respuesta"}</b></li>`;
    }).join("");

    const compromisos = (lista, titulo) => {
      const l = (lista || []).filter(x => x.texto && x.texto.trim());
      if (!l.length) return "";
      return `<h3>${titulo}</h3><ul class="h-lista">${l.map(x =>
        `<li>${esc(x.texto)}${x.logro ? ` <span class="h-logro ${esc(x.logro)}">${esc(logroTxt[x.logro] || "")}</span>` : ""}</li>`).join("")}</ul>`;
    };

    return `
      <section class="h-sec">
        <h2>Diagnóstico de los Tres Roles</h2>
        <table class="h-tabla h-roles">
          <thead><tr><th>Rol</th><th>Al inicio</th><th>Compromiso</th><th>Hoy</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        ${hoy ? `<p class="h-nota">Hoy: ${hoy.total} horas a la semana repartidas en los tres roles.</p>` : ""}
        ${tablaTareas}
        <h3>Patrones en los que cae hoy</h3>
        ${patrones.length ? `<ul class="h-lista">${patrones.join("")}</ul>` : '<p class="h-vacio">No marcó ninguno.</p>'}
        <h3>Mapa de energía</h3>
        <ul class="h-lista">${energia}</ul>
        ${compromisos(ro.dejo, "Lo que se comprometió a dejar de hacer")}
        ${compromisos(ro.empiezo, "Lo que se comprometió a empezar a hacer")}
        ${ro.reflexion && ro.reflexion.trim() ? `<h3>Su reflexión</h3><p>${txt(ro.reflexion)}</p>` : ""}
      </section>`;
  }

  // ---------- Versión para pegar en el libro de trabajo (Google Docs) ----------
  // Devuelve la hoja en HTML sencillo (títulos, negritas, listas y una tabla),
  // que Google Docs respeta al pegar, y en texto plano como respaldo.
  function paraLibro(r) {
    r = r || {};
    const m = r.momento || {};
    const ro = r.roles || {};
    const h = [];   // html
    const t = [];   // texto plano
    const titulo = (nivel, s) => { h.push(`<h${nivel}>${esc(s)}</h${nivel}>`); t.push("", s.toUpperCase()); };
    const parrafo = (etq, val) => {
      if (!val || !String(val).trim()) return;
      h.push(`<p>${etq ? `<b>${esc(etq)}:</b> ` : ""}${txt(val)}</p>`);
      t.push((etq ? etq + ": " : "") + String(val).trim());
    };
    const lista = items => {
      if (!items.length) return;
      h.push("<ul>" + items.map(i => `<li>${i.html}</li>`).join("") + "</ul>");
      items.forEach(i => t.push("- " + i.texto));
    };

    titulo(2, "Módulo 5 · Dónde está parado mi rancho");
    parrafo("Fecha", fechaLarga(m.fecha));
    parrafo("Rancho", [r.rancho, r.ubicacion].filter(Boolean).join(", "));

    titulo(3, "Momento del año");
    const temp = M5.temporadas.find(x => x.id === m.temporada);
    parrafo("Temporada", temp ? temp.nombre : "");
    parrafo("Dejó de crecer el pasto", mes(m.dejo_de_crecer));
    parrafo("Espero que vuelva a crecer", mes(m.vuelve_a_crecer));
    const manejos = M5.manejos.filter(x => m.manejos && m.manejos[x.id] && m.manejos[x.id].trim())
      .map(x => ({ html: `<b>${esc(x.nombre)}:</b> ${esc(m.manejos[x.id])}`, texto: `${x.nombre}: ${m.manejos[x.id].trim()}` }));
    if (m.otro && m.otro.trim()) manejos.push({ html: `<b>Otro:</b> ${esc(m.otro)}`, texto: "Otro: " + m.otro.trim() });
    if (manejos.length) { h.push("<p><b>Lo que le viene a mi hato en los próximos seis meses:</b></p>"); t.push("Lo que le viene a mi hato en los próximos seis meses:"); lista(manejos); }

    titulo(3, "Hasta dónde llegó cada práctica");
    M5.practicasPara(r.negocios).forEach(p => {
      const resp = (r.practicas || {})[p.id] || {};
      const e = resp.escalon;
      const estado = e === 0 ? "no aplica" : (e ? `escalón ${e} de 4` : "sin responder");
      h.push(`<p><b>${esc(p.nombre)}: ${estado}.</b>${e ? " " + esc(p.escalones[e - 1]) : ""}</p>`);
      t.push("", `${p.nombre}: ${estado}.${e ? " " + p.escalones[e - 1] : ""}`);
      if (e !== 0) parrafo("Dato", resp.dato);
    });

    titulo(3, "Diagnóstico de los Tres Roles");
    const hoy = M5.distribucion(ro.tareas);
    const num = v => (v === "" || v == null || isNaN(+v)) ? "" : (+v) + "%";
    h.push("<table border=\"1\" style=\"border-collapse:collapse\"><tr><th>Rol</th><th>Al inicio</th><th>Compromiso</th><th>Hoy</th></tr>" +
      M5.roles.map(x => `<tr><td>${x.nombre}</td><td>${num((ro.base || {})[x.id])}</td><td>${num((ro.compromiso || {})[x.id])}</td><td>${hoy ? hoy[x.id] + "%" : ""}</td></tr>`).join("") + "</table>");
    t.push("Rol | Al inicio | Compromiso | Hoy");
    M5.roles.forEach(x => t.push(`${x.nombre} | ${num((ro.base || {})[x.id])} | ${num((ro.compromiso || {})[x.id])} | ${hoy ? hoy[x.id] + "%" : ""}`));
    if (hoy) parrafo("Horas a la semana en los tres roles", String(hoy.total));

    const tareas = (ro.tareas || []).filter(x => x.tarea && x.tarea.trim());
    if (tareas.length) {
      h.push("<p><b>Mi semana típica:</b></p>"); t.push("Mi semana típica:");
      lista(tareas.map(x => {
        const rol = (M5.roles.find(y => y.id === x.rol) || {}).nombre || "";
        const s = `${x.tarea.trim()}${rol ? " (" + rol + ")" : ""}${x.horas ? ", " + x.horas + " h" : ""}`;
        return { html: esc(s), texto: s };
      }));
    }
    const patrones = M5.patrones.filter(p => ro.patrones && ro.patrones[p.id] && ro.patrones[p.id].marcado)
      .map(p => {
        const ej = (ro.patrones[p.id].ejemplo || "").trim();
        return { html: `<b>${esc(p.nombre)}.</b>${ej ? " " + esc(ej) : ""}`, texto: p.nombre + "." + (ej ? " " + ej : "") };
      });
    if (patrones.length) { h.push("<p><b>Patrones en los que caigo hoy:</b></p>"); t.push("Patrones en los que caigo hoy:"); lista(patrones); }
    const energia = M5.energia.filter(e => (ro.energia || {})[e.id]).map(e => {
      const rol = (M5.roles.find(y => y.id === ro.energia[e.id]) || {}).nombre || "";
      return { html: `${esc(e.pregunta)} <b>${esc(rol)}</b>`, texto: `${e.pregunta} ${rol}` };
    });
    if (energia.length) { h.push("<p><b>Mi mapa de energía:</b></p>"); t.push("Mi mapa de energía:"); lista(energia); }
    const comp = (l, etq) => {
      const v = (l || []).filter(x => x.texto && x.texto.trim());
      if (!v.length) return;
      h.push(`<p><b>${etq}</b></p>`); t.push(etq);
      lista(v.map(x => {
        const s = x.texto.trim() + (x.logro ? ` (lo logré: ${(logroTxt[x.logro] || "").toLowerCase()})` : "");
        return { html: esc(s), texto: s };
      }));
    };
    comp(ro.dejo, "Lo que me comprometí a dejar de hacer:");
    comp(ro.empiezo, "Lo que me comprometí a empezar a hacer:");
    parrafo("Lo que veo al comparar", ro.reflexion);
    if (r.comentario && r.comentario.trim()) { titulo(3, "Algo más"); parrafo("", r.comentario); }

    return { html: h.join("\n"), texto: t.join("\n").replace(/^\n+/, "") };
  }

  // Copia la hoja al portapapeles con formato. Devuelve true si se pudo.
  window.copiarParaLibro = async function (r) {
    const { html, texto } = paraLibro(r);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([texto], { type: "text/plain" }),
        })]);
        return true;
      }
    } catch (e) { /* se intenta el método viejo */ }
    try {
      const caja = document.createElement("div");
      caja.contentEditable = "true";
      caja.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      caja.innerHTML = html;
      document.body.appendChild(caja);
      const rango = document.createRange();
      rango.selectNodeContents(caja);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(rango);
      const ok = document.execCommand("copy");
      sel.removeAllRanges();
      caja.remove();
      if (ok) return true;
    } catch (e) { /* sin portapapeles */ }
    return false;
  };
  window.textoParaLibro = r => paraLibro(r).texto;

  window.armarHoja = function (r, opciones) {
    r = r || {};
    const o = opciones || {};
    const negocios = (r.negocios || []).map(id => (M5.negocios.find(n => n.id === id) || {}).nombre).filter(Boolean);
    return `
      <article class="hoja">
        <header class="h-cab">
          <img src="${o.logo || "../logo_del_saber_al_hacer.jpg"}" alt="Del Saber al Hacer" class="h-logo">
          <div>
            <p class="h-sup">Del Saber al Hacer · Módulo 5</p>
            <h1>Dónde está parado el rancho</h1>
            <p class="h-quien"><b>${esc(r.alumno)}</b>${r.rancho ? " · " + esc(r.rancho) : ""}${r.ubicacion ? " · " + esc(r.ubicacion) : ""}</p>
            <p class="h-quien">${fechaLarga((r.momento || {}).fecha)}${negocios.length ? " · " + esc(negocios.join(", ")) : ""}</p>
          </div>
        </header>
        ${seccionMomento(r.momento)}
        ${seccionPracticas(r)}
        ${seccionRoles(r.roles)}
        ${r.comentario && r.comentario.trim() ? `<section class="h-sec"><h2>Algo más que quiso decir</h2><p>${txt(r.comentario)}</p></section>` : ""}
        <footer class="h-pie">Esta hoja es el punto de partida del Módulo 6: la planificación de los siguientes seis meses.</footer>
      </article>`;
  };
})();
