// src/utils/fileProcessor.js
export function processFile(file, prefix, isGoertzel, setFileInfo, setSuccess, setError, setData, setTotalSamples) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      let data;
      if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        const separator = file.name.endsWith('.csv') ? ',' : '\t';
        data = text.split('\n').map(row => row.split(separator).map(val => val.trim()));
      } else {
        data = text.trim().split(/[\r\n]+/).filter(line => line.trim().length > 0);
      }
      setFileInfo(`File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      setSuccess('File uploaded successfully!');
      setError('');
      setData(data);
      localStorage.setItem(`scenario${prefix}Data`, JSON.stringify(data));
      if (!isGoertzel) {
        const total = data.length === 1 ? data[0].length : data.length;
        setTotalSamples(total);
      }
    } catch (err) {
      setError('Error processing file: ' + err.message);
      setSuccess('');
    }
  };
  reader.onerror = () => setError('Error reading file.');
  reader.readAsText(file);
}