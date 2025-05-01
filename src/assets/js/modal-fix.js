/**
 * Script para solucionar problemas con las modales de Bootstrap
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ajustar la opacidad del backdrop de las modales
  document.addEventListener('show.bs.modal', function() {
    setTimeout(function() {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.style.opacity = '0.5';
      });
    }, 10);
  });

  // Asegurar que los botones de cierre sean clickeables
  document.addEventListener('shown.bs.modal', function() {
    const closeButtons = document.querySelectorAll('.modal .btn-close, .modal .btn[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
      button.style.zIndex = '1070';
      button.style.position = 'relative';
    });
  });
});