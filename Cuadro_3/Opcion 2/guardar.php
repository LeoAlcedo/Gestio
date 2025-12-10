<?php
header("Content-Type: application/json; charset=UTF-8");

// Leer campos enviados (usar null-coalescing para evitar warnings)
$codigo = $_POST['codigo'] ?? "";
$usuario = $_POST['usuario'] ?? "";
$area = $_POST['area'] ?? "";
$fechaInc = $_POST['fechaInc'] ?? "";
$sintomas = $_POST['sintomas'] ?? "";
$categoria = $_POST['categoria'] ?? "";
$responsable = $_POST['responsable'] ?? "";
$fechaRes = $_POST['fechaRes'] ?? "";
$actividadRes = $_POST['actividadRes'] ?? "";
$cierre = $_POST['cierre'] ?? "";

// Devolver JSON con los mismos datos (sin persistencia)
echo json_encode([
    'codigo' => $codigo,
    'usuario' => $usuario,
    'area' => $area,
    'fechaInc' => $fechaInc,
    'sintomas' => $sintomas,
    'categoria' => $categoria,
    'responsable' => $responsable,
    'fechaRes' => $fechaRes,
    'actividadRes' => $actividadRes,
    'cierre' => $cierre
], JSON_UNESCAPED_UNICODE);
