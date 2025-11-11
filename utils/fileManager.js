const fs = require('fs');
const path = require('path');

//  archivo que organiza los datos
class FileManager {
  constructor(filename) {
    // Ruta donde guardará los archivos JSON
    this.filePath = path.join(__dirname, '..', 'data', filename);
    this.ensureFileExists();  // ← Asegura que el archivo exista
  }

  // si el archivo no existe, lo crea automáticamente
  ensureFileExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });  // ← crea carpeta si no existe
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8');  // ← crea archivo vacío
    }
  }

  // lee los datos como cuando abres un libro
  leerDatos() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);  // ← convierte texto JSON a objeto JavaScript
    } catch (error) {
      console.error(`Error leyendo ${this.filePath}:`, error);
      return [];  // ←si hay error, devuelve lista vacía
    }
  }

  // Guarda los datos 
  escribirDatos(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;  // ← Éxito al guardar
    } catch (error) {
      console.error(`Error escribiendo ${this.filePath}:`, error);
      return false; // ← Error al guardar
    }
  }

  // genera IDs automáticos: P001, P002, D001, D002, etc.
  generarId(prefix, datos) {
    if (datos.length === 0) {
      return `${prefix}001`;  // ← primer ID
    }
    
    const maxId = datos.reduce((max, item) => {
      const num = parseInt(item.id.replace(prefix, '')) || 0;
      return num > max ? num : max;
    }, 0);
    
    return `${prefix}${(maxId + 1).toString().padStart(3, '0')}`;
  }
}

module.exports = FileManager;