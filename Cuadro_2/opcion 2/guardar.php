<?php
header("Content-Type: application/json");

$codigo = $_POST["codigo"] ?? "";
$incidencia = $_POST["incidencia"] ?? "";
$impacto = $_POST["impacto"] ?? "";
$urgencia = $_POST["urgencia"] ?? "";
$prioridad = $_POST["prioridad"] ?? "";

echo json_encode([
    "codigo" => $codigo,
    "incidencia" => $incidencia,
    "impacto" => $impacto,
    "urgencia" => $urgencia,
    "prioridad" => $prioridad
]);
?>
