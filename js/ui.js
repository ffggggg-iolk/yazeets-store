// ============================================
// UI - RENDERIZADO Y MANEJO DE INTERFAZ
// ============================================

window.ui = {
  currentEditingItemId: null,
  currentEditingCategory: null,

  // Actualizar perfil de usuario en header
  updateUserProfile: function() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (window.auth.currentUser && window.auth.currentUserData?.username) {
      loginBtn.style.display = 'none';
      userProfile.style.display = 'flex';
      userName.textContent = window.auth.currentUserData.username;
      userRole.textContent = this.getRoleLabel(window.auth.currentUserData.role);
      userAvatar.src = window.auth.currentUser.photoURL || 'https://via.placeholder.com/40';
      
      // Mostrar controles de admin
      this.showAdminControls();
    } else {
      loginBtn.style.display = 'block';
      userProfile.style.display = 'none';
      this.hideAdminControls();
    }
  },

  // Etiqueta de rol legible
  getRoleLabel: function(role) {
    const labels = {
      'owner': '👑 Owner',
      'admin': '⚙️ Admin',
      'user': '👤 User'
    };
    return labels[role] || 'User';
  },

  // Mostrar controles de administrador
  showAdminControls: function() {
    if (!window.auth.isAdminOrOwner()) return;

    // Mostrar botones de agregar item
    document.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.style.display = 'flex';
    });

    // Mostrar panel de admin si es owner
    if (window.auth.currentUserData?.role === 'owner') {
      document.getElementById('adminPanel').style.display = 'block';
      this.renderUsersList();
    }
  },

  // Ocultar controles de administrador
  hideAdminControls: function() {
    document.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.style.display = 'none';
    });
    document.getElementById('adminPanel').style.display = 'none';
  },

  // Renderizar lista de usuarios (solo Owner)
  renderUsersList: async function() {
    if (window.auth.currentUserData?.role !== 'owner') return;

    try {
      const users = await window.auth.getAllUsers();
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = '';

      users.forEach(user => {
        if (!user.username) return; // Saltar si no tiene username

        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
          <img src="${user.photoURL || 'https://via.placeholder.com/50'}" alt="${user.username}" class="user-item-avatar">
          <div class="user-item-info">
            <div class="user-item-name">${user.username}</div>
            <div class="user-item-email">${user.email}</div>
          </div>
          <div class="user-item-actions">
            <select class="role-select" value="${user.role}" onchange="window.ui.changeUserRole('${user.id}', this.value)">
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        `;
        usersList.appendChild(userItem);
      });

      console.log('✅ Lista de usuarios renderizada');
    } catch (error) {
      console.error('❌ Error renderizando usuarios:', error);
    }
  },

  // Cambiar rol de usuario
  changeUserRole: async function(userId, newRole) {
    await window.auth.changeUserRole(userId, newRole);
  },

  // Renderizar todos los items
  renderAllItems: async function() {
    const categories = ['hairs', 'accessories', 'emotes', 'animations'];
    for (const category of categories) {
      await this.renderItemsByCategory(category);
    }
  },

  // Renderizar items por categoría
  renderItemsByCategory: async function(category) {
    try {
      const items = await window.firestore.getItemsByCategory(category);
      const container = document.getElementById(category);
      container.innerHTML = '';

      if (items.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--color-silver); padding: var(--spacing-lg);">Sin items en esta categoría</p>';
        return;
      }

      items.forEach(item => {
        const itemElement = this.createItemElement(item, category);
        container.appendChild(itemElement);
      });

      console.log(`✅ ${items.length} items renderizados en ${category}`);
    } catch (error) {
      console.error(`❌ Error renderizando ${category}:`, error);
    }
  },

  // Crear elemento de item
  createItemElement: function(item, category) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.style.cursor = window.auth.isAdminOrOwner() ? 'pointer' : 'pointer';

    const mediaElement = item.mediaType === 'video'
      ? `<video src="${item.mediaURL}" class="item-media" style="width:100%; height:280px; object-fit:cover;"></video>`
      : `<img src="${item.mediaURL}" alt="${item.name}" class="item-media">`;

    const playButton = item.mediaType === 'video'
      ? '<div class="item-video-play">▶️</div>'
      : '';

    const actionButtons = window.auth.isAdminOrOwner()
      ? `
        <div class="item-actions">
          <button class="item-action-btn" onclick="window.ui.editItem('${item.id}', '${category}')">✏️ Editar</button>
          <button class="item-action-btn item-delete-btn" onclick="window.ui.deleteItem('${item.id}', '${item.mediaURL}')">🗑️ Eliminar</button>
        </div>
      `
      : '';

    itemDiv.innerHTML = `
      ${mediaElement}
      ${playButton}
      <div class="item-content">
        <h4 class="item-name">${item.name}</h4>
        ${item.price > 0 ? `<div class="item-price">Ⓡ ${item.price}</div>` : ''}
        ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
        <div class="item-actions">
          <button class="item-action-btn" onclick="window.location.href='${item.robloxLink}'; event.stopPropagation();">🔗 Ver en Roblox</button>
          ${window.auth.isAdminOrOwner() ? `<button class="item-action-btn" onclick="window.ui.editItem('${item.id}', '${category}')">✏️</button>` : ''}
          ${window.auth.isAdminOrOwner() ? `<button class="item-action-btn item-delete-btn" onclick="window.ui.deleteItem('${item.id}', '${item.mediaURL}')">🗑️</button>` : ''}
        </div>
      </div>
    `;

    // Eventos de video expandible
    if (item.mediaType === 'video') {
      const video = itemDiv.querySelector('.item-media');
      const playBtn = itemDiv.querySelector('.item-video-play');
      
      if (playBtn) {
        playBtn.onclick = (e) => {
          e.stopPropagation();
          this.openVideoModal(item.mediaURL);
        };
      }
      
      if (video) {
        video.onclick = (e) => {
          e.stopPropagation();
          this.openVideoModal(item.mediaURL);
        };
      }
    }

    return itemDiv;
  },

  // Abrir modal para agregar/editar item
  openAddItemModal: function(category) {
    this.currentEditingCategory = category;
    this.currentEditingItemId = null;
    
    document.getElementById('modalTitle').textContent = 'Nuevo Item - ' + this.getCategoryLabel(category);
    document.getElementById('itemForm').reset();
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('itemModal').style.display = 'flex';
  },

  // Editar item
  editItem: async function(itemId, category) {
    if (!window.auth.isAdminOrOwner()) {
      alert('Solo Admin y Owner pueden editar');
      return;
    }

    try {
      const item = await db.collection('items').doc(itemId).get();
      if (!item.exists) {
        alert('Item no encontrado');
        return;
      }

      const data = item.data();
      this.currentEditingItemId = itemId;
      this.currentEditingCategory = category;

      document.getElementById('modalTitle').textContent = 'Editar Item - ' + this.getCategoryLabel(category);
      document.getElementById('itemName').value = data.name;
      document.getElementById('itemLink').value = data.robloxLink;
      document.getElementById('itemDescription').value = data.description || '';
      document.getElementById('itemPrice').value = data.price || 0;

      // Mostrar preview actual
      const previewContainer = document.getElementById('previewContainer');
      previewContainer.style.display = 'block';
      
      if (data.mediaType === 'image') {
        document.getElementById('imagePreview').src = data.mediaURL;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('videoPreview').style.display = 'none';
      } else {
        document.getElementById('videoPreview').src = data.mediaURL;
        document.getElementById('videoPreview').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
      }

      document.getElementById('itemModal').style.display = 'flex';
    } catch (error) {
      console.error('❌ Error cargando item:', error);
      alert('Error al cargar el item');
    }
  },

  // Cerrar modal de item
  closeAddItemModal: function() {
    document.getElementById('itemModal').style.display = 'none';
    document.getElementById('itemForm').reset();
    this.currentEditingItemId = null;
    this.currentEditingCategory = null;
  },

  // Manejar cambio de archivo
  handleFileChange: async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const preview = await window.storage.createPreview(file);
      const mediaType = window.storage.getMediaType(file);
      const previewContainer = document.getElementById('previewContainer');
      previewContainer.style.display = 'block';

      if (mediaType === 'image') {
        document.getElementById('imagePreview').src = preview;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('videoPreview').style.display = 'none';
      } else {
        document.getElementById('videoPreview').src = preview;
        document.getElementById('videoPreview').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
      }

      const sizeKB = (file.size / 1024).toFixed(2);
      document.getElementById('fileSizeInfo').textContent = `${file.name} (${sizeKB} KB)`;
    } catch (error) {
      console.error('❌ Error al procesar archivo:', error);
    }
  },

  // Enviar item (crear o actualizar)
  submitItem: async function(event) {
    event.preventDefault();

    try {
      const name = document.getElementById('itemName').value.trim();
      const link = document.getElementById('itemLink').value.trim();
      const description = document.getElementById('itemDescription').value.trim();
      const price = parseFloat(document.getElementById('itemPrice').value) || 0;
      const fileInput = document.getElementById('itemFile');
      const file = fileInput.files[0];

      if (!name || !link) {
        alert('Por favor completa nombre y enlace de Roblox');
        return;
      }

      // Mostrar loading
      const btn = event.target.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = '⏳ Publicando...';
      btn.disabled = true;

      let mediaURL = null;
      let mediaType = 'image';

      // Si hay archivo nuevo, subir
      if (file) {
        mediaURL = await window.storage.uploadFile(file);
        mediaType = window.storage.getMediaType(file);
      }

      // Crear o actualizar
      if (this.currentEditingItemId) {
        // Actualizar
        const updates = {
          name,
          description,
          price,
          robloxLink: link
        };
        
        if (mediaURL) {
          updates.mediaURL = mediaURL;
          updates.mediaType = mediaType;
        }

        await window.firestore.updateItem(this.currentEditingItemId, updates);
        alert('✅ Item actualizado correctamente');
      } else {
        // Crear
        if (!mediaURL) {
          alert('Por favor selecciona una imagen o video');
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        }

        await window.firestore.createItem(this.currentEditingCategory, {
          name,
          description,
          price,
          robloxLink: link,
          mediaURL,
          mediaType
        });
        alert('✅ Item publicado correctamente');
      }

      btn.textContent = originalText;
      btn.disabled = false;
      this.closeAddItemModal();
      await this.renderItemsByCategory(this.currentEditingCategory);

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + error.message);
      event.target.querySelector('button[type="submit"]').disabled = false;
    }
  },

  // Eliminar item
  deleteItem: async function(itemId, mediaURL) {
    if (!confirm('¿Estás seguro de que deseas eliminar este item?')) {
      return;
    }

    try {
      await window.firestore.deleteItem(itemId, mediaURL);
      alert('✅ Item eliminado correctamente');
      await this.renderItemsByCategory(this.currentEditingCategory || 'hairs');
    } catch (error) {
      console.error('❌ Error eliminando item:', error);
      alert('Error: ' + error.message);
    }
  },

  // Abrir modal de video expandido
  openVideoModal: function(videoURL) {
    document.getElementById('fullscreenVideo').src = videoURL;
    document.getElementById('videoModal').style.display = 'flex';
    document.getElementById('fullscreenVideo').play();
  },

  // Cerrar modal de video
  closeVideoModal: function() {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('fullscreenVideo').pause();
  },

  // Obtener etiqueta de categoría
  getCategoryLabel: function(category) {
    const labels = {
      'hairs': '👩 Pelos',
      'accessories': '💎 Accesorios',
      'emotes': '🎭 Emotes',
      'animations': '🎬 Paquetes de Animaciones'
    };
    return labels[category] || category;
  }
};

// Event listeners para cambios de archivo
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('itemFile');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => window.ui.handleFileChange(e));
  }
});
