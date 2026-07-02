// Cerrar alertas automaticamente despues de 4 segundos
document.addEventListener("DOMContentLoaded", function () {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach(function (alert) {
        setTimeout(function () {
            alert.style.opacity = "0";
            alert.style.transition = "opacity 0.5s";
            setTimeout(function () { alert.remove(); }, 500);
        }, 4000);
    });
});

// Abrir modal
function abrirModal(id) {
    document.getElementById(id).classList.add("active");
}

// Cerrar modal
function cerrarModal(id) {
    document.getElementById(id).classList.remove("active");
}