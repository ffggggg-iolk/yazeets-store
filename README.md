# YAZEET'S - Tienda de Accesorios Roblox VKEI

**Tienda elegante, profesional y 100% estática** de accesorios, pelos, emotes y paquetes de animaciones para Roblox, con estética Visual Kei gótica. Construida con HTML5, CSS3, JavaScript vanilla y Firebase.

## 🎭 Características

✨ **Estética Visual Kei (VKEI) Premium**
- Fondo tipo papel antiguo desgastado con textura vintage
- Elementos barrocos: encaje, lazos, cadenas, cruces, marcos ovalados
- Paleta: rojo oscuro (#8B0000), negro, blanco roto, grises plateados
- Tipografía elegante gótica y script
- Diseño 100% responsive

🔐 **Autenticación y Roles**
- Login exclusivo con Google (Firebase Auth)
- Primer usuario → Owner automático
- Owner puede designar Admins
- Roles: Owner (control total), Admin (publicar), Usuario (ver/comprar)
- Username único requerido en primer login

📦 **Gestión de Items**
- Categorías: Pelos, Accesorios, Emotes, Paquetes de Animaciones
- Preview de videos expandibles a pantalla completa
- Publicación exclusiva para Owner/Admin
- Enlace directo a Roblox en cada item

⚡ **Tecnología**
- 100% Frontend estático (compatible GitHub Pages)
- Firebase Authentication (Google OAuth)
- Cloud Firestore (base de datos)
- Firebase Storage (imágenes y videos)
- No requiere servidor propio

---

## 🚀 Guía de Instalación Rápida

### Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Crear proyecto"**
3. Nombre: `yazeets-store`
4. Desactiva Google Analytics (opcional)
5. Click **"Crear proyecto"** y espera a que se cree

### Paso 2: Configurar Autenticación Google

1. En Firebase Console → **Authentication** → **Sign-in method**
2. Click en **Google**
3. Activa el toggle
4. Selecciona tu email de soporte
5. Click **Guardar**

### Paso 3: Crear Firestore Database

1. **Firestore Database** → **Crear base de datos**
2. Selecciona tu región (ej: `us-east1`)
3. Modo: **Producción**
4. Click **Crear**
5. Espera a que se inicialice

### Paso 4: Configurar Reglas de Seguridad

#### Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - lectura pública, escritura solo del usuario
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'admin'];
    }
    
    // Items collection - lectura pública, escritura solo owner/admin
    match /items/{itemId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
                                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'admin'];
    }
    
    // Admin settings - solo owner
    match /admin/{document=**} {
      allow read, write: if request.auth != null &&
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
    }
  }
}
```

#### Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Lectura pública
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                     request.auth.token.email in ['tu_email@gmail.com'];
    }
  }
}
```

### Paso 5: Obtener Credenciales Firebase

1. **Configuración del Proyecto** (ícono ⚙️) → **Configuración del proyecto**
2. En la sección **"Tus apps"**, haz click en crear app **web**
3. Nombre: `yazeets-store-web`
4. Registra la app
5. Copia el objeto `firebaseConfig`
6. Reemplaza en `js/firebaseConfig.js`

### Paso 6: Crear Bucket Storage

1. **Storage** → **Empezar**
2. Selecciona región
3. Modo: **Producción**
4. Click **Listo**

### Paso 7: Activar GitHub Pages

1. Ve a tu repositorio → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Click **Save**
5. Tu sitio estará en: `https://tu-usuario.github.io/yazeets-store/`

---

## 📁 Estructura del Proyecto

```
yazeets-store/
├── index.html              # Página principal
├── css/
│   ├── styles.css          # Estilos principales VKEI
│   ├── responsive.css      # Media queries
│   └── animations.css      # Animaciones suaves
├── js/
│   ├── firebaseConfig.js   # Configuración Firebase (reemplazar)
│   ├── auth.js             # Autenticación Google + roles
│   ├── firestore.js        # Operaciones Firestore
│   ├── storage.js          # Upload a Firebase Storage
│   ├── ui.js               # Renderizado de elementos
│   └── main.js             # Orquestación principal
├── assets/
│   ├── fonts/              # Tipografías góticas
│   ├── images/             # SVGs decorativos
│   └── textures/           # Texturas de fondo
├── README.md               # Este archivo
└── .gitignore              # Ignorar node_modules (si aplica)
```

---

## 🔧 Uso Local

Para pruebas locales, usa un servidor HTTP simple:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Accede a: `http://localhost:8000`

---

## 📋 Checklist de Configuración

- [ ] Crear proyecto Firebase
- [ ] Activar Google Auth
- [ ] Crear Firestore Database
- [ ] Copiar y actualizar `firebaseConfig.js`
- [ ] Configurar Firestore Rules
- [ ] Configurar Storage Rules
- [ ] Crear Storage Bucket
- [ ] Push a GitHub
- [ ] Activar GitHub Pages
- [ ] Probar login en `https://tu-usuario.github.io/yazeets-store/`

---

## 🎨 Personalización

### Colores VKEI
```css
--color-dark-red: #8B0000;    /* Rojo oscuro profundo */
--color-maroon: #6B0F1A;      /* Granate */
--color-black: #1a1a1a;       /* Negro */
--color-ivory: #f5f1e8;       /* Blanco roto */
--color-silver: #c0c0c0;      /* Gris plateado */
```

### Fuentes
- Títulos: `'Cinzel', serif` (gótica elegante)
- Cuerpo: `'Crimson Text', serif` (script)
- UI: `'Lato', sans-serif` (limpia moderna)

### URLs Importantes
- **Grupo Roblox:** https://www.roblox.com/share/g/112408850
- **Firebase Console:** https://console.firebase.google.com/
- **GitHub Pages:** [Configurar en Settings]

---

## 📱 Características Implementadas

✅ Autenticación con Google  
✅ Roles (Owner, Admin, User)  
✅ Gestión de items (CRUD)  
✅ Upload de imágenes y videos  
✅ Preview expandible de videos  
✅ Lista de usuarios con roles  
✅ Panel de administración  
✅ Diseño responsive  
✅ Animaciones suaves VKEI  
✅ 100% estático compatible GitHub Pages  

---

## 🐛 Troubleshooting

### "Firebase not initialized"
- Verifica que `firebaseConfig.js` tenga credenciales válidas
- Asegúrate que Firestore Database está creada
- Revisa la consola (F12) para más detalles

### "Access denied" en Firestore
- Revisa las reglas de seguridad
- Asegúrate que el email está autorizado en Storage
- El primer usuario debe tener role "owner" automáticamente

### Videos no se cargan
- Verifica que Storage Bucket está creado
- Revisa las reglas de Storage
- Usa formatos: MP4, WebM, Ogg

### GitHub Pages no muestra el sitio
- Espera 1-2 minutos después de activar Pages
- Verifica que rama `main` está configurada
- Comprueba que root folder `/` está seleccionado

---

## 📞 Soporte

Para problemas con Firebase:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase Community](https://stackoverflow.com/questions/tagged/firebase)

Para problemas con GitHub Pages:
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

**YAZEET'S © 2026** - Tienda VKEI Premium para Roblox  
Construida con ❤️ y elegancia gótica
