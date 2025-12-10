<?php
// guardar.php (reparado)
// mostrar errores (solo para desarrollo; quítalo en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Forzar JSON response
header("Content-Type: application/json; charset=UTF-8");

try {
    // Verifica que la petición sea POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Método no permitido. Use POST."]);
        exit;
    }

    // Tomar campos con null-coalescing
    $codigo      = isset($_POST['codigo']) ? trim($_POST['codigo']) : "";
    $usuario     = isset($_POST['usuario']) ? trim($_POST['usuario']) : "";
    $area        = isset($_POST['area']) ? trim($_POST['area']) : "";
    $fechaInc    = isset($_POST['fechaInc']) ? trim($_POST['fechaInc']) : "";
    $sintomas    = isset($_POST['sintomas']) ? trim($_POST['sintomas']) : "";
    $categoria   = isset($_POST['categoria']) ? trim($_POST['categoria']) : "";
    $responsable = isset($_POST['responsable']) ? trim($_POST['responsable']) : "";
    $fechaRes    = isset($_POST['fechaRes']) ? trim($_POST['fechaRes']) : "";
    $actividadRes= isset($_POST['actividadRes']) ? trim($_POST['actividadRes']) : "";
    $cierre      = isset($_POST['cierre']) ? trim($_POST['cierre']) : "";

    // (Aquí podrías validar datos. Ejemplo simple:)
    // if ($codigo === "") throw new Exception("El campo 'codigo' es obligatorio.");

    // Si tu idea es guardar en BD, aquí iría la inserción. 
    // Ahora devolvemos los mismos datos como confirmación (mock).
    $response = [
        "status" => "ok",
        "message" => "Datos recibidos correctamente",
        "data" => [
            "codigo" => $codigo,
            "usuario" => $usuario,
            "area" => $area,
            "fechaInc" => $fechaInc,
            "sintomas" => $sintomas,
            "categoria" => $categoria,
            "responsable" => $responsable,
            "fechaRes" => $fechaRes,
            "actividadRes" => $actividadRes,
            "cierre" => $cierre
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $ex->getMessage()]);
}
