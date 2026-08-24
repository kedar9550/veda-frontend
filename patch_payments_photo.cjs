const fs = require('fs');

function patchController() {
  const ctrlPath = 'c:/Users/Mic_Lab/Documents/MIS_NEW/unified-backend/modules/Payments/Payments.controller.js';
  let content = fs.readFileSync(ctrlPath, 'utf8');

  if (!content.includes('exports.uploadPhoto =')) {
    const patch = `
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }
    return res.json({ filename: req.file.filename, url: \`/uploads/othercollegephotos/\${req.file.filename}\` });
  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
};

exports.checkPhoto = async (req, res) => {
  try {
    const roll = req.params.roll;
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, '../../uploads/othercollegephotos');
    
    if (!fs.existsSync(dir)) return res.json({ exists: false });
    
    const files = fs.readdirSync(dir);
    const photoFile = files.reverse().find(f => f.startsWith(\`photo-\${roll}-\`));
    
    if (photoFile) {
      return res.json({ exists: true, url: \`/uploads/othercollegephotos/\${photoFile}\` });
    }
    return res.json({ exists: false });
  } catch (err) {
    console.error('Error checking photo:', err);
    return res.status(500).json({ error: 'Check failed' });
  }
};
`;
    content += patch;
    fs.writeFileSync(ctrlPath, content, 'utf8');
    console.log('Successfully patched Payments.controller.js');
  } else {
    console.log('Payments.controller.js already has photo methods');
  }
}

function patchRoute() {
  const routePath = 'c:/Users/Mic_Lab/Documents/MIS_NEW/unified-backend/modules/Payments/Payments.route.js';
  let content = fs.readFileSync(routePath, 'utf8');

  if (!content.includes('registrations/photo')) {
    // Add multer configuration near the top, right after `const paymentsController = require('./Payments.controller');`
    const multerCode = `
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/othercollegephotos');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const roll = req.body.rollnumber || 'unknown';
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, \`photo-\${roll}-\${Date.now()}\${ext}\`);
  }
});
const upload = multer({ storage: storage });
`;
    
    // Insert after the second line
    const lines = content.split('\\n');
    lines.splice(3, 0, multerCode);

    // Insert routes before module.exports
    const routesCode = `
// Participant Photo Upload
router.post('/registrations/photo', upload.single('photo'), paymentsController.uploadPhoto);
router.get('/registrations/photo/:roll', paymentsController.checkPhoto);
`;
    const finalContent = lines.join('\\n').replace('module.exports = router;', routesCode + '\\nmodule.exports = router;');
    
    fs.writeFileSync(routePath, finalContent, 'utf8');
    console.log('Successfully patched Payments.route.js');
  } else {
    console.log('Payments.route.js already has photo routes');
  }
}

patchController();
patchRoute();
