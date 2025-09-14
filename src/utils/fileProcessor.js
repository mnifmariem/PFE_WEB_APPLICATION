// backend/src/utils/fileProcessor.js
class FileProcessor {
  static parseGoertzelFile(fileContent) {
    const lines = fileContent.trim().split(/[\r\n]+/).filter(line => line.trim().length > 0);
    const rows = [];
    
    // Find header
    const delimiters = [',', '\t'];
    let headerIndex = -1;
    let delimiterUsed = '';
    
    for (const delimiter of delimiters) {
      headerIndex = lines.findIndex(line => {
        const cols = line.split(delimiter).map(col => col.trim().toLowerCase());
        return cols.some(col => col.includes('freq'));
      });
      
      if (headerIndex >= 0) {
        const header = lines[headerIndex].split(delimiter).map(col => col.trim().toLowerCase());
        const hasRequiredColumns = header.some(col => col.includes('freq')) &&
                                  header.some(col => col.includes('coeff')) &&
                                  header.some(col => col.includes('q0')) &&
                                  header.some(col => col.includes('q1')) &&
                                  header.some(col => col.includes('q2'));
        
        if (hasRequiredColumns) {
          delimiterUsed = delimiter;
          break;
        }
      }
    }
    
    if (headerIndex === -1) {
      throw new Error('Invalid file format: Missing header with Frequency, Coefficient, Q0, Q1, Q2');
    }
    
    // Process data rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('===') || line.toLowerCase().startsWith('sending')) {
        continue;
      }
      
      const columns = line.split(delimiterUsed).map(col => col.replace(/^"|"$/g, '').trim());
      
      if (columns.length >= 5) {
        const freq = Number(columns[0]);
        const c = Number(columns[1]);
        const q0 = Number(columns[2]);
        const q1 = Number(columns[3]);
        const q2 = Number(columns[4]);
        
        if (!isNaN(freq) && !isNaN(c) && !isNaN(q0) && !isNaN(q1) && !isNaN(q2)) {
          rows.push({ freq, c, q0, q1, q2 });
        }
      }
    }
    
    if (rows.length === 0) {
      throw new Error('No valid data rows found in file');
    }
    
    return rows;
  }
}

module.exports = FileProcessor;