// scripts.js SIN PHP
let filaEnEdicion = null;

function escapeHtml(text){
    if (text === null || text === undefined) return "";
    return String(text)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;");
}

function limpiarCampos() {
    ["codigo","usuario","area","fechaInc","sintomas","categoria","responsable","fechaRes","actividadRes","cierre"]
    .forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}

document.getElementById("btnAgregar").addEventListener("click", function () {
    
    const campos = [
        "codigo","usuario","area","fechaInc","sintomas",
        "categoria","responsable","fechaRes","actividadRes","cierre"
    ];

    const valores = campos.map(id => document.getElementById(id).value.trim());

    // Si estamos guardando cambios (modo MODIFICAR)
    if (filaEnEdicion) {
        valores.forEach((valor, i) => {
            filaEnEdicion.children[i].textContent = valor;
        });

        filaEnEdicion.classList.remove("seleccionada");
        filaEnEdicion = null;
        document.getElementById("btnAgregar").textContent = "Agregar";
        limpiarCampos();
        return;
    }

    // Crear una nueva fila
    const fila = document.createElement("tr");
    fila.classList.add("fila-contenedor");

    fila.innerHTML = valores.map(v => `<td>${escapeHtml(v)}</td>`).join("");

    // BOTÓN ELIMINAR
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn-flotante-eliminar");
    btnEliminar.innerHTML = "✖";
    btnEliminar.title = "Eliminar fila";
    btnEliminar.addEventListener("click", function(e){
        e.stopPropagation();
        if (confirm("¿Deseas eliminar esta fila?")) {
            fila.remove();
            if (fila === filaEnEdicion) {
                filaEnEdicion = null;
                document.getElementById("btnAgregar").textContent = "Agregar";
                limpiarCampos();
            }
        }
    });
    fila.appendChild(btnEliminar);

    // BOTÓN MODIFICAR
    const btnModificar = document.createElement("button");
    btnModificar.classList.add("btn-modificar-izq");
    btnModificar.textContent = "Modificar";
    btnModificar.title = "Modificar fila";
    btnModificar.addEventListener("click", function(e){
        e.stopPropagation();
        
        filaEnEdicion = fila;

        document.querySelectorAll(".fila-contenedor")
            .forEach(f => f.classList.remove("seleccionada"));

        fila.classList.add("seleccionada");

        valores.forEach((v, i) => {
            document.getElementById(campos[i]).value =
                fila.children[i].textContent;
        });

        document.getElementById("btnAgregar").textContent = "Guardar cambios";
    });
    fila.appendChild(btnModificar);

    fila.addEventListener("click", function(){
        document.querySelectorAll(".fila-contenedor")
            .forEach(f => { if (f !== fila) f.classList.remove("seleccionada"); });

        fila.classList.toggle("seleccionada");

        if (!fila.classList.contains("seleccionada") && fila === filaEnEdicion) {
            filaEnEdicion = null;
            document.getElementById("btnAgregar").textContent = "Agregar";
            limpiarCampos();
        }
    });

    document.getElementById("tablaDatos").appendChild(fila);

    limpiarCampos();
});

// Deseleccionar si se hace clic afuera
document.addEventListener("click", function(e){
    const tabla = document.getElementById("tabla");
    if (!tabla.contains(e.target)) {
        document.querySelectorAll(".fila-contenedor")
            .forEach(f => f.classList.remove("seleccionada"));
    }
});

// PDF
document.getElementById("btnPDF").addEventListener("click", async function(){
    const btn = this;
    btn.disabled = true; btn.textContent = "Generando PDF...";

    try {
        const cont = document.getElementById("tabla-contenedor");
        const canvas = await html2canvas(cont, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("l","pt","a4");
        const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
        const ratio = canvas.width / canvas.height;
        const pdfHeight = pdfWidth / ratio;

        pdf.addImage(imgData, "PNG", 20, 20, pdfWidth, pdfHeight);
        pdf.save("cuadro3_tabla.pdf");

    } catch (err) {
        console.error(err);
        alert("Error al generar PDF.");
    } finally {
        btn.disabled = false; btn.textContent = "Convertir a PDF";
    }
});
