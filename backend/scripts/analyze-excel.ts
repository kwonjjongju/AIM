import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(__dirname, '../../0_SPEC/00_브레인스토밍/본부별 업무개선SW개발리스트_취합.xlsx');

try {
  const wb = XLSX.readFile(filePath);
  console.log('=== Sheet Names ===');
  console.log(wb.SheetNames);
  
  wb.SheetNames.forEach((sheetName, sheetIdx) => {
    console.log(`\n=== Sheet ${sheetIdx + 1}: ${sheetName} ===`);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    
    console.log(`Total rows: ${data.length}`);
    console.log('\nFirst 10 rows:');
    data.slice(0, 10).forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
    });
  });
} catch (error) {
  console.error('Error:', error);
}
