// googleSheets.js
// Integración con Google Sheets para cargar preguntas dinámicamente

// CONFIGURACIÓN
// 1. Crear una hoja de Google Sheets con las columnas especificadas
// 2. Hacer la hoja pública: Archivo → Compartir → Cambiar a "Cualquiera con el enlace"
// 3. Publicar como CSV: Archivo → Compartir → Publicar en la web → formato CSV
// 4. Copiar el ID de la hoja (está en la URL)

const SHEET_ID = '1RpkPBs_QXUhiQ4vRx7ab49HX5ZhUXAA1t-zaw_UNbzc'; // Reemplazar con tu ID
const SHEET_NAME = 'Preguntas'; // Nombre de la pestaña
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// Función para parsear CSV a JSON
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = [];
    let current = '';
    let insideQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      data.push(obj);
    }
  }
  
  return data;
}

// Función para convertir datos de Sheets al formato de la app
function convertirAPreguntasApp(datosSheet) {
  const preguntasPorDia = {};
  
  datosSheet.forEach(row => {
    // Solo incluir preguntas activas
    if (row.activo !== 'TRUE') return;
    
    const dia = parseInt(row.dia);
    if (!preguntasPorDia[dia]) {
      preguntasPorDia[dia] = [];
    }
    
    const pregunta = {
      id: parseInt(row.orden) + (dia * 10), // ID único
      tipo: row.tipo || 'trivia',
      titulo: row.titulo,
      pregunta: row.pregunta,
      opciones: [
        { texto: row.opcion_a, correcto: row.correcta === 'A' },
        { texto: row.opcion_b, correcto: row.correcta === 'B' },
        { texto: row.opcion_c, correcto: row.correcta === 'C' },
        { texto: row.opcion_d, correcto: row.correcta === 'D' }
      ],
      puntos: parseInt(row.puntos) || 10,
      explicacion: row.explicacion
    };
    
    preguntasPorDia[dia].push(pregunta);
  });
  
  // Ordenar preguntas dentro de cada día por 'orden'
  Object.keys(preguntasPorDia).forEach(dia => {
    preguntasPorDia[dia].sort((a, b) => a.id - b.id);
  });
  
  return preguntasPorDia;
}

// Función principal para cargar preguntas desde Google Sheets
export async function cargarPreguntasDesdeSheets() {
  try {
    console.log('📊 Cargando preguntas desde Google Sheets...');
    
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Error al cargar Google Sheets');
    }
    
    const csvText = await response.text();
    const datosSheet = parseCSV(csvText);
    const preguntasPorDia = convertirAPreguntasApp(datosSheet);
    
    console.log(`✅ ${Object.keys(preguntasPorDia).length} días cargados con preguntas`);
    
    return preguntasPorDia;
    
  } catch (error) {
    console.error('❌ Error cargando desde Sheets:', error);
    // Retornar null para usar las preguntas hardcodeadas como fallback
    return null;
  }
}

// Función para validar configuración
export function validarConfiguracion() {
  if (SHEET_ID === 'TU_SHEET_ID_AQUI') {
    console.warn('⚠️ Google Sheets no configurado. Usando preguntas hardcodeadas.');
    return false;
  }
  return true;
}
