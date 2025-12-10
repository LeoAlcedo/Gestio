// scripts.js (mejorado para depuración)
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
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
}

document.getElementById("btnAgregar").addEventListener("click", function () {
    const codigo = document.getElementById("codigo").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const area = document.getElementById("area").value.trim();
    const fechaInc = document.getElementById("fechaInc").value.trim();
    const sintomas = document.getElementById("sintomas").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const responsable = document.getElementById("responsable").value.trim();
    const fechaRes = document.getElementById("fechaRes").value.trim();
    const actividadRes = document.getElementById("actividadRes").value.trim();
    const cierre = document.getElementById("cierre").value.trim();

    // Edición local (no hace POST)
    if (filaEnEdicion) {
        filaEnEdicion.children[0].textContent = codigo;
        filaEnEdicion.children[1].textContent = usuario;
        filaEnEdicion.children[2].textContent = area;
        filaEnEdicion.children[3].textContent = fechaInc;
        filaEnEdicion.children[4].textContent = sintomas;
        filaEnEdicion.children[5].textContent = categoria;
        filaEnEdicion.children[6].textContent = responsable;
        filaEnEdicion.children[7].textContent = fechaRes;
        filaEnEdicion.children[8].textContent = actividadRes;
        filaEnEdicion.children[9].textContent = cierre;

        filaEnEdicion.classList.remove("seleccionada");
        filaEnEdicion = null;
        document.getElementById("btnAgregar").textContent = "Agregar";
        limpiarCampos();
        return;
    }

    // Prepara FormData
    const datos = new FormData();
    datos.append("codigo", codigo);
    datos.append("usuario", usuario);
    datos.append("area", area);
    datos.append("fechaInc", fechaInc);
    datos.append("sintomas", sintomas);
    datos.append("categoria", categoria);
    datos.append("responsable", responsable);
    datos.append("fechaRes", fechaRes);
    datos.append("actividadRes", actividadRes);
    datos.append("cierre", cierre);

    // Llamada fetch
    fetch("guardar.php", { method: "POST", body: datos })
    .then(async res => {
        // Verificar status HTTP
        if (!res.ok) {
            const text = await res.text();
            console.error("Respuesta NO OK:", res.status, text);
            throw new Error("Respuesta del servidor: " + res.status);
        }
        // Intentar parsear JSON
        try {
            return await res.json();
        } catch (err) {
            console.error("No se pudo parsear JSON:", err);
            const txt = await res.text();
            console.error("Body:", txt);
            throw new Error("Respuesta inválida (no JSON). Revisa consola.");
        }
    })
    .then(data => {
        // data debe tener status === "ok"
        console.log("Respuesta JSON:", data);
        if (!data || data.status === "error") {
            const msg = (data && data.message) ? data.message : "Error al guardar los datos (server).";
            throw new Error(msg);
        }

        // insertar fila con data.data (si usas el formato del guardar.php)
        const d = data.data || data;
        const fila = document.createElement("tr");
        fila.classList.add("fila-contenedor");

        fila.innerHTML = `
            <td>${escapeHtml(d.codigo)}</td>
            <td>${escapeHtml(d.usuario)}</td>
            <td>${escapeHtml(d.area)}</td>
            <td>${escapeHtml(d.fechaInc)}</td>
            <td>${escapeHtml(d.sintomas)}</td>
            <td>${escapeHtml(d.categoria)}</td>
            <td>${escapeHtml(d.responsable)}</td>
            <td>${escapeHtml(d.fechaRes)}</td>
            <td>${escapeHtml(d.actividadRes)}</td>
            <td>${escapeHtml(d.cierre)}</td>
        `;

        // botón eliminar flotante
        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn-flotante-eliminar");
        btnEliminar.innerHTML = "✖";
        btnEliminar.title = "Eliminar fila";
        btnEliminar.addEventListener("click", function(e){
            e.stopPropagation();
            if (confirm("¿Seguro que deseas eliminar esta fila?")) {
                fila.remove();
                if (fila === filaEnEdicion) {
                    filaEnEdicion = null;
                    document.getElementById("btnAgregar").textContent = "Agregar";
                    limpiarCampos();
                }
            }
        });
        fila.appendChild(btnEliminar);

        // botón modificar
        const btnModificar = document.createElement("button");
        btnModificar.classList.add("btn-modificar-izq");
        btnModificar.textContent = "Modificar";
        btnModificar.title = "Modificar fila";
        btnModificar.addEventListener("click", function(e){
            e.stopPropagation();
            filaEnEdicion = fila;
            document.querySelectorAll(".fila-contenedor").forEach(f => f.classList.remove("seleccionada"));
            fila.classList.add("seleccionada");

            document.getElementById("codigo").value = fila.children[0].textContent;
            document.getElementById("usuario").value = fila.children[1].textContent;
            document.getElementById("area").value = fila.children[2].textContent;
            document.getElementById("fechaInc").value = fila.children[3].textContent;
            document.getElementById("sintomas").value = fila.children[4].textContent;
            document.getElementById("categoria").value = fila.children[5].textContent;
            document.getElementById("responsable").value = fila.children[6].textContent;
            document.getElementById("fechaRes").value = fila.children[7].textContent;
            document.getElementById("actividadRes").value = fila.children[8].textContent;
            document.getElementById("cierre").value = fila.children[9].textContent;

            document.getElementById("btnAgregar").textContent = "Guardar cambios";
        });
        fila.appendChild(btnModificar);

        // click en fila togglear seleccion
        fila.addEventListener("click", function(){
            document.querySelectorAll(".fila-contenedor").forEach(f => { if (f !== fila) f.classList.remove("seleccionada"); });
            fila.classList.toggle("seleccionada");
            if (!fila.classList.contains("seleccionada") && fila === filaEnEdicion) {
                filaEnEdicion = null;
                document.getElementById("btnAgregar").textContent = "Agregar";
                limpiarCampos();
            }
        });

        document.getElementById("tablaDatos").appendChild(fila);
        limpiarCampos();
    })
    .catch(err => {
        console.error("Error en fetch/response:", err);
        alert("Error al guardar los datos (revisa consola). Mensaje: " + err.message);
    });
});
