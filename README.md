# buscaIA — Buscador gastronómico con IA

## Deploy en Netlify (5 minutos)

### 1. Subí el proyecto a GitHub
- Creá un repo nuevo en github.com
- Subí todos estos archivos

### 2. Conectá con Netlify
- Entrá a netlify.com → "Add new site" → "Import from Git"
- Conectá tu repo de GitHub
- Build settings: dejá todo en blanco (el netlify.toml ya lo configura)
- Clic en "Deploy site"

### 3. Configurá las variables de entorno (IMPORTANTE)
En Netlify: Site settings → Environment variables → Add variable

Agregá estas dos:
```
GOOGLE_API_KEY = tu-api-key-de-google
ANTHROPIC_API_KEY = tu-api-key-de-anthropic
```

Para la Anthropic API key: https://console.anthropic.com → API Keys → Create Key

### 4. Activá las APIs en Google Cloud
En console.cloud.google.com, asegurate de tener activadas:
- Places API (New)
- Geocoding API
- Billing habilitado (igual tenés $200 USD gratis por mes)

### 5. Listo
Tu app va a estar en: https://tu-nombre.netlify.app

---

## Estructura del proyecto
```
buscaia/
├── index.html                  → frontend completo
├── netlify.toml                → configuración de routing
└── netlify/functions/
    ├── geocode.js              → proxy: convierte dirección a coordenadas
    ├── places.js               → proxy: busca lugares en Google Places
    ├── place-details.js        → proxy: trae reseñas y detalles
    └── analyze.js              → proxy: análisis con Claude AI
```
