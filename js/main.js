// ============================================
// MAIN - INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando YAZEET\'S Store...');
  
  // Iniciar escuchador de autenticación
  window.auth.initAuthListener();
  
  // Manejador de tabs en admin panel
  setupAdminTabs();
  
  console.log('✅ YAZEET\'S Store lista');
});

// Configurar tabs del panel admin
function setupAdminTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover activos
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Añadir activo al clickeado
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
  const itemModal = document.getElementById('itemModal');
  const usernameModal = document.getElementById('usernameModal');
  const videoModal = document.getElementById('videoModal');

  if (event.target === itemModal) {
    window.ui.closeAddItemModal();
  }
  
  if (event.target === usernameModal) {
    event.preventDefault();
  }
  
  if (event.target === videoModal) {
    window.ui.closeVideoModal();
  }
});

// Tecla ESC para cerrar modales
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.ui.closeAddItemModal();
    window.ui.closeVideoModal();
  }
});

console.log('🎎 YAZEET\'S Store cargado correctamente');
