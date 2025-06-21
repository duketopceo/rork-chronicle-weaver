const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

fs.readFile(indexPath, 'utf8', (err, html) => {
  if (err) {
    console.error('Error reading index.html:', err);
    return;
  }
  // Add type="module" to all script tags that have a src attribute and are not already modules
  const modifiedHtml = html.replace(/<script\s+src="([^"]*)"([^>]*)><\/script>/g, '<script type="module" src="$1"$2></script>');

  fs.writeFile(indexPath, modifiedHtml, 'utf8', (err) => {
    if (err) {
      console.error('Error writing modified index.html:', err);
      return;
    }
    console.log('Successfully added type="module" to script tags in index.html');
  });
});
