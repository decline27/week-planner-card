const fs = require('fs');
const path = require('path');

// Updated Base64 encoded valid 1x1 transparent PNG image
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/Qp9ddkAAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Image, 'base64');

const images = ['preview-light.png', 'preview-dark.png'];

images.forEach(fileName => {
  const filePath = path.join(__dirname, '..', 'widgets', 'weekplanner', fileName);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${filePath}`);
});
