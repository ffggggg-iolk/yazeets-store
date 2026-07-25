// ============================================
// FIREBASE STORAGE - SUBIDA DE ARCHIVOS
// ============================================

window.storage = {
  // Subir archivo a Firebase Storage
  uploadFile: async function(file, path = 'items') {
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    // Validar tamaño (máx 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('Archivo demasiado grande (máximo 50MB)');
    }

    // Validar tipo
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];

    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido');
    }

    try {
      // Crear nombre único
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}_${randomString}_${file.name}`;
      const filepath = `${path}/${filename}`;

      // Crear referencia
      const fileRef = firebase.storage().ref(filepath);

      // Crear metadata
      const metadata = {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      };

      // Subir archivo
      const uploadTask = fileRef.put(file, metadata);

      // Monitorear progreso (opcional)
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Progreso de subida:', progress.toFixed(2) + '%');
        },
        (error) => {
          console.error('❌ Error durante la subida:', error);
          throw error;
        }
      );

      // Esperar a que termine
      await uploadTask;
      console.log('✅ Archivo subido:', filename);

      // Obtener URL de descarga
      const downloadURL = await fileRef.getDownloadURL();
      return downloadURL;

    } catch (error) {
      console.error('❌ Error en uploadFile:', error);
      throw error;
    }
  },

  // Obtener tipo de media
  getMediaType: function(file) {
    return file.type.startsWith('image/') ? 'image' : 'video';
  },

  // Crear preview
  createPreview: function(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  },

  // Eliminar archivo
  deleteFile: async function(downloadURL) {
    try {
      const fileRef = firebase.storage().refFromURL(downloadURL);
      await fileRef.delete();
      console.log('✅ Archivo eliminado de Storage');
    } catch (error) {
      console.error('❌ Error eliminando archivo:', error);
      throw error;
    }
  }
};
