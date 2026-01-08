# 📊 Guía de Integración con Google Sheets

## Paso 1: Crear la hoja de Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja llamada "Trivia Don Roi - Preguntas"
3. Renombra la primera pestaña a "Preguntas"

## Paso 2: Configurar las columnas

Crea estas columnas en la primera fila (exactamente con estos nombres):

```
dia | orden | tipo | titulo | pregunta | opcion_a | opcion_b | opcion_c | opcion_d | correcta | puntos | explicacion | activo
```

### Descripción de columnas:

- **dia**: Número del día (1-30)
- **orden**: Orden de la pregunta dentro del día (1-5)
- **tipo**: Categoría visual (`noticia`, `trivia`, `calculo`, `decision`, `realidad`)
- **titulo**: Título corto con emoji
- **pregunta**: La consigna completa
- **opcion_a** a **opcion_d**: Las 4 opciones de respuesta
- **correcta**: Letra de la respuesta correcta (A, B, C o D)
- **puntos**: Puntos que otorga (10-25)
- **explicacion**: Explicación de Don Roi
- **activo**: TRUE para mostrar, FALSE para ocultar

## Paso 3: Importar datos de ejemplo

1. Descarga el archivo `plantilla-preguntas.csv`
2. En Google Sheets: **Archivo → Importar**
3. Selecciona el CSV
4. Elige "Reemplazar hoja actual"

## Paso 4: Publicar la hoja

1. **Archivo → Compartir → Publicar en la web**
2. En "Contenido publicado y configuración":
   - Selecciona la pestaña "Preguntas"
   - Formato: **Valores separados por comas (.csv)**
3. Click en **Publicar**
4. Copia el enlace generado

## Paso 5: Hacer la hoja pública (solo lectura)

1. **Archivo → Compartir → Compartir con otros**
2. En "Obtener enlace":
   - Cambia a "Cualquiera con el enlace"
   - Rol: **Lector** (solo lectura)
3. Click en **Copiar enlace**

## Paso 6: Obtener el ID de la hoja

De la URL de tu hoja:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
```

El ID es la parte entre `/d/` y `/edit`:
```
1ABC123xyz456
```

## Paso 7: Configurar en el código

Abre `src/googleSheets.js` y reemplaza:

```javascript
const SHEET_ID = '1ABC123xyz456'; // ← Tu ID aquí
const SHEET_NAME = 'Preguntas';   // ← Nombre de tu pestaña
```

## Paso 8: Deploy

```bash
git add .
git commit -m "feat: integración con Google Sheets"
git push origin main
```

---

## 🎯 Cómo usar después de configurado:

### Agregar nuevas preguntas:
1. Abre tu Google Sheet
2. Agrega una nueva fila con los datos
3. Asegúrate que `activo = TRUE`
4. Guarda (se auto-guarda)
5. **La app se actualiza automáticamente** al recargar

### Editar preguntas existentes:
1. Modifica directamente en Google Sheets
2. Guarda
3. Los cambios se ven al recargar la app

### Desactivar una pregunta:
1. Cambia `activo` de TRUE a FALSE
2. La pregunta deja de aparecer sin necesidad de borrarla

### Organizar por días:
- Usa la columna `dia` para agrupar (1-30)
- Usa la columna `orden` para ordenar dentro de cada día (1-5)

---

## 🐛 Troubleshooting

### "No se cargan las preguntas de Sheets"
- Verifica que el SHEET_ID esté correcto
- Confirma que la hoja esté publicada en la web
- Revisa la consola del navegador (F12) para ver errores

### "Aparecen las preguntas hardcodeadas"
- La app usa las preguntas hardcodeadas como fallback
- Si Sheets falla, no rompe la app

### "Las preguntas no se actualizan"
- Limpia el caché del navegador (Ctrl + Shift + R)
- Puede haber delay de 1-2 minutos de Google Sheets

---

## 📝 Estructura recomendada:

### Días 1-10: Costo de Oportunidad
- Inflación vs tasas
- Monedas duras vs locales
- ROI básico

### Días 11-20: Cash Flow
- Gastos vs inversiones
- Activos que generan ingreso
- Pasivos ocultos

### Días 21-30: Decisiones de Inversión
- Diversificación
- Riesgo vs retorno
- Portfolio allocation

---

## ✅ Ventajas de usar Google Sheets:

- ✏️ Editas contenido sin tocar código
- 👥 Múltiples personas pueden colaborar
- 📊 Ves todas las preguntas organizadas
- 🔄 Cambios instantáneos
- 📱 Editas desde móvil
- 🗂️ Control de versiones incluido
- 🚀 No requiere re-deploy
