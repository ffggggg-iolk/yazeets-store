// ============================================
// AUTENTICACIÓN Y GESTIÓN DE USUARIOS
// ============================================

window.auth = {
  currentUser: null,
  currentUserData: null,

  // Iniciar sesión con Google
  login: async function() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await firebase.auth().signInWithPopup(provider);
      console.log('✅ Usuario autenticado:', result.user.email);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      alert('Error al iniciar sesión: ' + error.message);
    }
  },

  // Cerrar sesión
  logout: async function() {
    try {
      await firebase.auth().signOut();
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  },

  // Crear o obtener usuario en Firestore
  ensureUserExists: async function(firebaseUser) {
    const userRef = db.collection('users').doc(firebaseUser.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Primer usuario = Owner
      const allUsers = await db.collection('users').get();
      const isFirstUser = allUsers.empty;
      
      await userRef.set({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: null,
        photoURL: firebaseUser.photoURL || '',
        role: isFirstUser ? 'owner' : 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Usuario creado con rol: ${isFirstUser ? 'owner' : 'user'}`);
      return true; // Es primer login
    }
    return false; // No es primer login
  },

  // Enviar username
  submitUsername: async function(event) {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    
    if (!username) {
      alert('Por favor ingresa un username');
      return;
    }

    try {
      // Verificar que sea único
      const existing = await db.collection('users')
        .where('username', '==', username)
        .get();
      
      if (!existing.empty) {
        alert('Este username ya está en uso');
        return;
      }

      // Actualizar usuario con username
      await db.collection('users').doc(this.currentUser.uid).update({
        username: username,
        updatedAt: new Date()
      });

      console.log('✅ Username actualizado:', username);
      
      // Cerrar modal y actualizar UI
      document.getElementById('usernameModal').style.display = 'none';
      window.ui.updateUserProfile();
      window.ui.renderAllItems();
      
    } catch (error) {
      console.error('❌ Error actualizando username:', error);
      alert('Error: ' + error.message);
    }
  },

  // Obtener datos del usuario actual
  getCurrentUserData: async function() {
    if (!this.currentUser) return null;
    
    try {
      const doc = await db.collection('users').doc(this.currentUser.uid).get();
      return doc.data();
    } catch (error) {
      console.error('❌ Error obteniendo datos del usuario:', error);
      return null;
    }
  },

  // Cambiar rol de un usuario (solo Owner)
  changeUserRole: async function(userId, newRole) {
    if (this.currentUserData?.role !== 'owner') {
      alert('Solo el Owner puede cambiar roles');
      return;
    }

    try {
      await db.collection('users').doc(userId).update({
        role: newRole,
        updatedAt: new Date()
      });
      
      console.log(`✅ Rol actualizado para ${userId}: ${newRole}`);
      window.ui.renderUsersList();
      
    } catch (error) {
      console.error('❌ Error cambiando rol:', error);
      alert('Error: ' + error.message);
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async function() {
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return [];
    }
  },

  // Verificar si es Admin o Owner
  isAdminOrOwner: function() {
    return this.currentUserData?.role === 'admin' || this.currentUserData?.role === 'owner';
  },

  // Escuchar cambios de autenticación
  initAuthListener: function() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        
        // Asegurar que existe en Firestore
        const isFirstLogin = await this.ensureUserExists(user);
        
        // Obtener datos del usuario
        this.currentUserData = await this.getCurrentUserData();
        
        console.log('👤 Usuario:', user.email, 'Rol:', this.currentUserData?.role);
        
        // Mostrar modal de username si no lo tiene
        if (!this.currentUserData?.username) {
          document.getElementById('usernameModal').style.display = 'flex';
          document.getElementById('usernameInput').value = '';
        } else {
          document.getElementById('usernameModal').style.display = 'none';
          window.ui.updateUserProfile();
          window.ui.renderAllItems();
        }
        
      } else {
        this.currentUser = null;
        this.currentUserData = null;
        window.ui.updateUserProfile();
        window.ui.renderAllItems();
        console.log('🚫 Sin usuario autenticado');
      }
    });
  }
};
