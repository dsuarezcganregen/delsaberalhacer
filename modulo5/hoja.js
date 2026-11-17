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
