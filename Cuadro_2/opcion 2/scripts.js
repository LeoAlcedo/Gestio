let filaEnEdicion = null;

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

// ------------------ AGREGAR / GUARDAR CAMBIOS ------------------
document.getElementById("btnAgregar").addEventListener("click", function () {

    let codigo = document.getElementById("codigo").value.trim();
    let incidencia = document.getElementById("incidencia").value.trim();
    let impacto = document.getElementById("impacto").value.trim();
    let urgencia = document.getElementById("urgencia").value.trim();
    let prioridad = document.getElementById("prioridad").value.trim();

    // Si está editando → actualizar
    if (filaEnEdicion) {

        filaEnEdicion.children[0].textContent = codigo;
        filaEnEdicion.children[1].textContent = incidencia;
        filaEnEdicion.children[2].textContent = impacto;
        filaEnEdicion.children[3].textContent = urgencia;
        filaEnEdicion.children[4].textContent = prioridad;

        filaEnEdicion.classList.remove("seleccionada");
        filaEnEdicion = null;

        document.getElementById("btnAgregar").textContent = "Agregar";
        limpiarCampos();
        return;
    }

    // Enviar datos a PHP
    let datos = new FormData();
    datos.append("codigo", codigo);
    datos.append("incidencia", incidencia);
    datos.append("impacto", impacto);
    datos.append("urgencia", urgencia);
    datos.append("prioridad", prioridad);

    fetch("guardar.php", { method: "POST", body: datos })
    .then(res => res.json())
    .then(data => {

        let fila = document.createElement("tr");
        fila.classList.add("fila-contenedor");

        fila.innerHTML = `
            <td>${escapeHtml(data.codigo)}</td>
            <td>${escapeHtml(data.incidencia)}</td>
            <td>${escapeHtml(data.impacto)}</td>
            <td>${escapeHtml(data.urgencia)}</td>
            <td>${escapeHtml(data.prioridad)}</td>
        `;

        // Botón eliminar
        let botonEliminar = document.createElement("button");
        botonEliminar.classList.add("btn-flotante-eliminar");
        botonEliminar.innerHTML = "✖";
        botonEliminar.title = "Eliminar fila";

        botonEliminar.onclick = function(e){
            e.stopPropagation();
            fila.remove();

            if (fila === filaEnEdicion) {
                filaEnEdicion = null;
                document.getElementById("btnAgregar").textContent = "Agregar";
                limpiarCampos();
            }
        };
        fila.appendChild(botonEliminar);

        // Botón modificar
        let botonModificar = document.createElement("button");
        botonModificar.classList.add("btn-modificar-izq");
        botonModificar.innerHTML = "Modificar";
        botonModificar.title = "Modificar fila";

        botonModificar.onclick = function(e){
            e.stopPropagation();
            filaEnEdicion = fila;
            fila.classList.add("seleccionada");

            document.getElementById("codigo").value = fila.children[0].textContent;
            document.getElementById("incidencia").value = fila.children[1].textContent;
            document.getElementById("impacto").value = fila.children[2].textContent;
            document.getElementById("urgencia").value = fila.children[3].textContent;
            document.getElementById("prioridad").value = fila.children[4].textContent;

            document.getElementById("btnAgregar").textContent = "Guardar cambios";
        };

        fila.appendChild(botonModificar);

        fila.addEventListener("click", function(e){
            document.querySelectorAll(".fila-contenedor")
                .forEach(f => { if (f !== fila) f.classList.remove("seleccionada") });
            fila.classList.toggle("seleccionada");
        });

        document.getElementById("tablaDatos").appendChild(fila);
        limpiarCampos();
    });
});

// ------------------ PDF ------------------
document.addEventListener("DOMContentLoaded", function(){

    const btnPDF = document.getElementById("btnPDF");

    btnPDF.addEventListener("click", async function(){

        const contenedor = document.getElementById("tabla-contenedor");

        btnPDF.disabled = true;
        btnPDF.textContent = "Generando PDF...";

        try {
            const canvas = await html2canvas(contenedor, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save("cuadro2.pdf");

        } finally {
            btnPDF.disabled = false;
            btnPDF.textContent = "Convertir a PDF";
        }
    });
});
