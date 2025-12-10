// scripts.js (corregido: muestra el botón "Modificar" al seleccionar la fila)

let filaEnEdicion = null;
let datosCuadro2 = JSON.parse(localStorage.getItem("cuadro2")) || [];

function escapeHtml(text) {
    if (!text) return "";
    return text.replaceAll("&", "&amp;")
               .replaceAll("<", "&lt;")
               .replaceAll(">", "&gt;")
               .replaceAll('"', "&quot;");
}

function limpiarCampos() {
    document.getElementById("codigo").value = "";
    document.getElementById("incidencia").value = "";
    document.getElementById("impacto").value = "";
    document.getElementById("urgencia").value = "";
    document.getElementById("prioridad").value = "";
}

function guardarLocal() {
    localStorage.setItem("cuadro2", JSON.stringify(datosCuadro2));
}

function cargarTabla() {
    const tbody = document.getElementById("tablaDatos");
    tbody.innerHTML = "";

    datosCuadro2.forEach((item, index) => {
        let fila = document.createElement("tr");
        fila.classList.add("fila-contenedor");

        fila.innerHTML = `
            <td>${escapeHtml(item.codigo)}</td>
            <td>${escapeHtml(item.incidencia)}</td>
            <td>${escapeHtml(item.impacto)}</td>
            <td>${escapeHtml(item.urgencia)}</td>
            <td>${escapeHtml(item.prioridad)}</td>
        `;

        // Botón eliminar
        let btnEliminar = document.createElement("button");
        btnEliminar.className = "btn-flotante-eliminar";
        btnEliminar.textContent = "✖";
        btnEliminar.onclick = (e) => {
            e.stopPropagation();
            if (confirm("¿Seguro que deseas eliminar esta fila?")) {
                datosCuadro2.splice(index, 1);
                guardarLocal();
                cargarTabla();
                // cancelar edición si era la fila en edición
                if (filaEnEdicion === index) {
                    filaEnEdicion = null;
                    document.getElementById("btnAgregar").textContent = "Agregar";
                    limpiarCampos();
                }
            }
        };
        fila.appendChild(btnEliminar);

        // Botón modificar (aparece a la derecha cuando fila tiene .seleccionada)
        let btnModificar = document.createElement("button");
        btnModificar.className = "btn-modificar-izq";
        btnModificar.textContent = "Modificar";
        btnModificar.onclick = (e) => {
            e.stopPropagation();
            // marcar fila seleccionada visualmente
            document.querySelectorAll(".fila-contenedor").forEach(f => f.classList.remove("seleccionada"));
            fila.classList.add("seleccionada");

            // activar edición
            filaEnEdicion = index;

            document.getElementById("codigo").value = item.codigo;
            document.getElementById("incidencia").value = item.incidencia;
            document.getElementById("impacto").value = item.impacto;
            document.getElementById("urgencia").value = item.urgencia;
            document.getElementById("prioridad").value = item.prioridad;

            document.getElementById("btnAgregar").textContent = "Guardar cambios";
        };
        fila.appendChild(btnModificar);

        // Click en la fila: toggle selección (esto permite que el CSS muestre el botón "Modificar")
        fila.addEventListener("click", function () {
            // quitar selección de otras filas
            document.querySelectorAll(".fila-contenedor").forEach(f => {
                if (f !== fila) f.classList.remove("seleccionada");
            });
            // alternar seleccion en la fila actual
            fila.classList.toggle("seleccionada");

            // si se deseleccionó y era la fila en edición, cancelar edición
            if (!fila.classList.contains("seleccionada") && filaEnEdicion === index) {
                filaEnEdicion = null;
                document.getElementById("btnAgregar").textContent = "Agregar";
                limpiarCampos();
            }
        });

        tbody.appendChild(fila);
    });
}

cargarTabla();

// ------------------ AGREGAR O GUARDAR CAMBIOS ------------------
document.getElementById("btnAgregar").onclick = () => {

    let item = {
        codigo: document.getElementById("codigo").value.trim(),
        incidencia: document.getElementById("incidencia").value.trim(),
        impacto: document.getElementById("impacto").value.trim(),
        urgencia: document.getElementById("urgencia").value.trim(),
        prioridad: document.getElementById("prioridad").value.trim()
    };

    if (filaEnEdicion !== null) {
        // actualizar el item en la posición filaEnEdicion
        datosCuadro2[filaEnEdicion] = item;
        filaEnEdicion = null;
        document.getElementById("btnAgregar").textContent = "Agregar";
    } else {
        // agregar nuevo
        datosCuadro2.push(item);
    }

    guardarLocal();
    cargarTabla();
    limpiarCampos();
};

// ------------------ PDF ------------------
document.getElementById("btnPDF").onclick = async function () {
    const contenedor = document.getElementById("tabla-contenedor");
    const btnPDF = this;

    btnPDF.disabled = true;
    btnPDF.textContent = "Generando PDF...";

    try {
        const canvas = await html2canvas(contenedor, { scale: 2 });
        const image = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;

        // ajustar orientación si la tabla es ancha (opcional)
        const pdf = new jsPDF();
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(image, "PNG", 0, 0, width, height);
        pdf.save("cuadro2.pdf");
    } catch (err) {
        console.error("Error generando PDF:", err);
        alert("Error al generar PDF. Revisa la consola.");
    } finally {
        btnPDF.disabled = false;
        btnPDF.textContent = "Convertir a PDF";
    }
};
