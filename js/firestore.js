// ============================================
// FIRESTORE - OPERACIONES CON ITEMS
// ============================================

window.firestore = {
  // Crear nuevo item
  createItem: async function(category, itemData) {
    if (!window.auth.isAdminOrOwner()) {
      alert('Solo Admin y Owner pueden publicar');
      return null;
    }

    try {
      const itemRef = await db.collection('items').add({
        category: category,
        name: itemData.name,
        description: itemData.description || '',
        price: itemData.price || 0,
        robloxLink: itemData.robloxLink,
        mediaURL: itemData.mediaURL,
        mediaType: itemData.mediaType, // 'image' o 'video'
        createdBy: window.auth.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Item creado:', itemRef.id);
      return itemRef.id;
      
    } catch (error) {
      console.error('❌ Error creando item:', error);
      throw error;
    }
  },

  // Obtener items por categoría
  getItemsByCategory: async function(category) {
    try {
      const snapshot = await db.collection('items')
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error(`❌ Error obteniendo items de ${category}:`, error);
      return [];
    }
  },

  // Obtener todos los items
  getAllItems: async function() {
    try {
      const snapshot = await db.collection('items')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo items:', error);
      return [];
    }
  },

  // Actualizar item
  updateItem: async function(itemId, updates) {
    try {
      await db.collection('items').doc(itemId).update({
        ...updates,
        updatedAt: new Date()
      });

      console.log('✅ Item actualizado:', itemId);
      
    } catch (error) {
      console.error('❌ Error actualizando item:', error);
      throw error;
    }
  },

  // Eliminar item
  deleteItem: async function(itemId, mediaURL) {
    if (!window.auth.isAdminOrOwner()) {
      alert('Solo Admin y Owner pueden eliminar items');
      return;
    }

    try {
      // Eliminar archivo de Storage si existe
      if (mediaURL) {
        try {
          const fileRef = firebase.storage().refFromURL(mediaURL);
          await fileRef.delete();
          console.log('✅ Archivo eliminado de Storage');
        } catch (err) {
          console.warn('⚠ No se pudo eliminar archivo:', err);
        }
      }

      // Eliminar documento de Firestore
      await db.collection('items').doc(itemId).delete();
      console.log('✅ Item eliminado:', itemId);
      
    } catch (error) {
      console.error('❌ Error eliminando item:', error);
      throw error;
    }
  },

  // Escuchar cambios en items (en tiempo real)
  watchItems: function(category, callback) {
    return db.collection('items')
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(items);
      }, error => {
        console.error('❌ Error escuchando items:', error);
      });
  }
};
