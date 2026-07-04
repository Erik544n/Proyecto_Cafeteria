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
    document.body.style.overflow = "hidden";
}

// Cerrar modal
function cerrarModal(id) {
    var overlay = document.getElementById(id);
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

// Cerrar modal al hacer click fuera del contenido
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-overlay") && e.target.classList.contains("active")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Cerrar modal con tecla Escape
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        var modals = document.querySelectorAll(".modal-overlay.active");
        modals.forEach(function (modal) {
            modal.classList.remove("active");
        });
        document.body.style.overflow = "";
    }
});

// Toast notification function
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    // Icon based on type
    const icon = type === 'success' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    // Remove toast after animation ends
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Handle Export Form Submit
async function handleExportSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('btn-submit-export');
    const cancelBtn = document.getElementById('btn-cancel-export');
    const closeBtn = document.getElementById('btn-close-export');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    // Get current URL params for filters
    const urlParams = new URLSearchParams(window.location.search);
    
    const payload = {
        fechaInicio: urlParams.get('fecha_inicio') || '',
        fechaFin: urlParams.get('fecha_fin') || '',
        categoriaId: urlParams.get('categoria') || '',
        metodoPago: urlParams.get('metodo_pago') || '',
        formato: form.formato.value, // "pdf" | "excel"
        incluirProductos: form.incluirProductos.checked,
        incluirNotas: form.incluirNotas.checked,
        incluirImpuestos: form.incluirImpuestos.checked,
        incluirGraficas: form.incluirGraficas.checked
    };

    // UI Loading state
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    closeBtn.disabled = true;
    btnText.style.opacity = '0';
    btnSpinner.style.display = 'flex';

    try {
        // Enviar petición al backend de Flask que hace proxy a la API
        const response = await fetch('/exportar_reporte', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Error en la generacion del archivo');
        }

        // Descargar Blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Determinar extensión
        const ext = payload.formato === 'excel' ? 'xlsx' : 'pdf';
        a.download = `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.${ext}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Success
        cerrarModal('modal-opciones-exportacion');
        showToast('Reporte exportado correctamente.', 'success');

    } catch (error) {
        console.error('Export error:', error);
        showToast('La exportacion fallo. Intente nuevamente.', 'error');
    } finally {
        // Reset UI
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
        closeBtn.disabled = false;
        btnText.style.opacity = '1';
        btnSpinner.style.display = 'none';
    }
}