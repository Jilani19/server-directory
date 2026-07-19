const fs = require('fs');
const path = require('path');

const files = [
  'src/connectors/BaseConnector.ts',
  'src/connectors/ClinicalTrialsConnector.ts',
  'src/connectors/CrossRefConnector.ts',
  'src/connectors/GleifConnector.ts',
  'src/connectors/OpenFdaConnector.ts',
  'src/connectors/PubMedConnector.ts',
  'src/connectors/SecEdgarConnector.ts',
  'src/workers/domain/IdentityWorker.ts'
];

files.forEach(f => {
  const p = path.join(__dirname, '../../', f);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/\\\\`/g, '`');
    c = c.replace(/\\`/g, '`'); // just in case
    fs.writeFileSync(p, c);
    console.log('Fixed ' + f);
  }
});
