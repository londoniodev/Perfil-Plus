const fs = require('fs');
const path = require('path');

const s3Url = 'https://s3.xn--alvarolondoo-khb.dev';
const dirs = [
  'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/packages/landing-builder/inputs/mauromera',
  'c:/Users/Pc/Desktop/ALVARO/REPOSITORIOS/Web Projects/packages/landing-builder/inputs/mauro'
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace src="/... and src='/...
      content = content.replace(/src=\"\//g, 'src=\"' + s3Url + '/');
      content = content.replace(/src=\'\//g, 'src=\'' + s3Url + '/');
      
      // Replace url('/... and url("/...
      content = content.replace(/url\(\'\//g, 'url(\'' + s3Url + '/');
      content = content.replace(/url\(\"\//g, 'url(\"' + s3Url + '/');
      
      // Also background-image: url(/...
      content = content.replace(/url\(\//g, 'url(' + s3Url + '/');

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed:', fullPath);
    }
  }
}

dirs.forEach(processDir);
console.log('Done replacing image urls.');
