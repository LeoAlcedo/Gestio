// scripts.js — CRUD local (LocalStorage) para Cuadro1
const STORAGE_KEY = "cuadro1_datos_v1";
let filaEnEdicionId = null; // id del registro en edición

// Campos relevantes (solo 5)
const campos = ["codigo","usuario","area","fecha","sintomas"];

// UTIL: escapar texto para insertar en DOM
function escapeHtml(text){
    if (text === null || text === undefined) return "";
    return String(text)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;");
}

// UTIL: limpiar inputs
function limpiarCampos() {
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    filaEnEdicionId = null;
    document.getElementById("btnAgregar").textContent = "Agregar";
}

// Cargar array desde localStorage
function cargarDatos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error parseando localStorage:", e);
        return [];
    }
}

// Guardar array a localStorage
function guardarDatos(array) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
}

// Renderizar tabla desde storage
function renderTabla() {
    const cuerpo = document.getElementById("tablaDatos");
    cuerpo.innerHTML = "";
    const datos = cargarDatos();

    datos.forEach(item => {
        const fila = document.createElement("tr");
        fila.classList.add("fila-contenedor");
        fila.dataset.id = item.id;

        fila.innerHTML = `
            <td>${escapeHtml(item.codigo)}</td>
            <td>${escapeHtml(item.usuario)}</td>
            <td>${escapeHtml(item.area)}</td>
            <td>${escapeHtml(item.fecha)}</td>
            <td>${escapeHtml(item.sintomas)}</td>
        `;

        // botón eliminar flotante
        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn-flotante-eliminar");
        btnEliminar.innerHTML = "✖";
        btnEliminar.title = "Eliminar fila";
        btnEliminar.addEventListener("click", function(e){
            e.stopPropagation();
            if (confirm("¿Seguro que deseas eliminar esta fila?")) {
                eliminarRegistro(item.id);
            }
        });
        fila.appendChild(btnEliminar);

        // botón modificar flotante (aparece cuando fila seleccionada)
        const btnModificar = document.createElement("button");
        btnModificar.classList.add("btn-modificar-izq");
        btnModificar.textContent = "Modificar";
        btnModificar.title = "Modificar fila";
        btnModificar.addEventListener("click", function(e){
            e.stopPropagation();
            iniciarEdicion(item.id);
        });
        fila.appendChild(btnModificar);

        // click en fila -> toggle seleccionado
        fila.addEventListener("click", function(){
            document.querySelectorAll(".fila-contenedor").forEach(f => {
                if (f !== fila) f.classList.remove("seleccionada");
            });
            fila.classList.toggle("seleccionada");
            // si se deselecciona y estaba en edición, cancelar edición visual
            if (!fila.classList.contains("seleccionada") && filaEnEdicionId === item.id) {
                filaEnEdicionId = null;
                document.getElementById("btnAgregar").textContent = "Agregar";
                limpiarCampos();
            }
        });

        cuerpo.appendChild(fila);
    });
}

// Añadir nuevo registro (en storage)
function agregarRegistro(obj) {
    const datos = cargarDatos();
    datos.push(obj);
    guardarDatos(datos);
    renderTabla();
}

// Actualizar registro por id
function actualizarRegistro(id, nuevos) {
    const datos = cargarDatos();
    const idx = datos.findIndex(r => r.id === id);
    if (idx === -1) return false;
    datos[idx] = Object.assign({}, datos[idx], nuevos);
    guardarDatos(datos);
    renderTabla();
    return true;
}

// Eliminar registro
function eliminarRegistro(id) {
    const datos = cargarDatos().filter(r => r.id !== id);
    guardarDatos(datos);
    // si estabas editando esa fila, cancelar edición
    if (filaEnEdicionId === id) {
        filaEnEdicionId = null;
        limpiarCampos();
    }
    renderTabla();
}

// Iniciar edición: llenar campos con valores del registro
function iniciarEdicion(id) {
    const datos = cargarDatos();
    const item = datos.find(r => r.id === id);
    if (!item) return;
    filaEnEdicionId = id;
    // llenar inputs
    campos.forEach((c, i) => {
        const el = document.getElementById(c);
        if (el) el.value = item[c] || "";
    });
    document.getElementById("btnAgregar").textContent = "Guardar cambios";
    // marcar visualmente la fila
    document.querySelectorAll(".fila-contenedor").forEach(f => {
        if (f.dataset.id === String(id)) f.classList.add("seleccionada");
        else f.classList.remove("seleccionada");
    });
}

// Generador de ID simple
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

// Evento del botón Agregar / Guardar cambios
document.getElementById("btnAgregar").addEventListener("click", function () {
    // leer valores (solo 5 campos)
    const valores = {};
    campos.forEach(id => {
        const el = document.getElementById(id);
        valores[id] = el ? el.value.trim() : "";
    });

    // validación básica (opcional)
    if (!valores.codigo && !valores.usuario && !valores.sintomas) {
        // si está todo vacío probablemente sea error de usuario
        if (!confirm("Los campos parecen vacíos. ¿Deseas continuar agregando un registro vacío?")) return;
    }

    if (filaEnEdicionId) {
        // actualizar
        actualizarRegistro(filaEnEdicionId, Object.assign({}, valores));
        filaEnEdicionId = null;
        limpiarCampos();
        document.getElementById("btnAgregar").textContent = "Agregar";
        return;
    }

    // crear nuevo registro y guardarlo
    const nuevo = {
        id: generarId(),
        codigo: valores.codigo,
        usuario: valores.usuario,
        area: valores.area,
        fecha: valores.fecha,
        sintomas: valores.sintomas
    };
    agregarRegistro(nuevo);
    limpiarCampos();
});

// Click fuera de la tabla -> quitar selección
document.addEventListener("click", function(e){
    const tabla = document.getElementById("tabla");
    if (!tabla.contains(e.target) && !e.target.classList.contains("btn-modificar-izq") && !e.target.classList.contains("btn-flotante-eliminar")) {
        document.querySelectorAll(".fila-contenedor").forEach(f => f.classList.remove("seleccionada"));
    }
});

// Inicializar: renderizar tabla con datos guardados
renderTabla();



//.....................................................

// icon-blocks (puedes personalizar para navegar a otras páginas)
document.getElementById("btnCuadro1").addEventListener("click", () => {
    window.location.href = 'cuadro1.html'; // Puedes hacer que el C1 recargue o apunte a sí mismo
});

//document.getElementById("btnCuadro2").onclick = () => {
  //window.location.href = "../Cuadro_2/princip.html";
//};


document.getElementById("btnCuadro3").addEventListener("click", () => {
    window.location.href = 'cuadro3.html'; // Asumiendo que Cuadro 3 es un archivo llamado cuadro3.html
});

//.....................................................





// PDF: convierto el contenedor a PDF (usa html2canvas + jsPDF)
document.getElementById("btnPDF").addEventListener("click", async function(){
    const btn = this;
    btn.disabled = true; btn.textContent = "Generando PDF...";
    try {
        const cont = document.getElementById("tabla-contenedor");
        const canvas = await html2canvas(cont, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        // usar orientación landscape si la tabla es ancha
        const pdf = new jsPDF("l","pt","a4");
        const margin = 20;
        const pdfWidth = pdf.internal.pageSize.getWidth() - margin*2;
        const ratio = canvas.width / canvas.height;
        const pdfHeight = pdfWidth / ratio;

        if (pdfHeight <= pdf.internal.pageSize.getHeight() - margin*2) {
            pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
        } else {
            // dividir en páginas
            let remainingHeight = canvas.height;
            const pageCanvas = document.createElement("canvas");
            const pageCtx = pageCanvas.getContext("2d");
            pageCanvas.width = canvas.width;
            const pageHeightPx = Math.floor(canvas.width * ((pdf.internal.pageSize.getHeight()-margin*2) / pdfWidth));
            let position = 0;
            let pageIndex = 0;
            while (remainingHeight > 0) {
                const sliceH = Math.min(pageHeightPx, remainingHeight);
                pageCanvas.height = sliceH;
                pageCtx.clearRect(0,0,pageCanvas.width,pageCanvas.height);
                pageCtx.drawImage(canvas, 0, position, canvas.width, sliceH, 0, 0, pageCanvas.width, pageCanvas.height);
                const pageImg = pageCanvas.toDataURL("image/png");
                if (pageIndex === 0) {
                    pdf.addImage(pageImg, "PNG", margin, margin, pdfWidth, (sliceH * pdfWidth) / pageCanvas.width);
                } else {
                    pdf.addPage();
                    pdf.addImage(pageImg, "PNG", margin, margin, pdfWidth, (sliceH * pdfWidth) / pageCanvas.width);
                }
                remainingHeight -= sliceH;
                position += sliceH;
                pageIndex++;
            }
        }
        pdf.save("cuadro1_tabla.pdf");
    } catch (err) {
        console.error(err);
        alert("Error al generar el PDF. Revisa la consola.");
    } finally {
        btn.disabled = false; btn.textContent = "Convertir a PDF";
    }
});
