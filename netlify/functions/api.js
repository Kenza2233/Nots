const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();

// Use a temporary directory for uploads that is supported by Netlify
const uploadDir = '/tmp/uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// In-memory token storage (for this example, will be stateless in serverless)
// This will need to be handled differently, perhaps with client-side storage of tokens
let tokens;

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/auth/google', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.json({ authUrl });
});

router.post('/auth/google/callback', async (req, res) => {
    const { code } = req.body;
    try {
        const { tokens: newTokens } = await oAuth2Client.getToken(code);
        tokens = newTokens;
        oAuth2Client.setCredentials(tokens);
        // In a real app, you'd send the tokens to the client to store
        res.json({ tokens });
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/upload', upload.array('files'), async (req, res) => {
    const { tokens: clientTokens } = JSON.parse(req.body.tokens);
    if (!clientTokens) {
        return res.status(401).json({ error: 'You need to log in first.' });
    }
    oAuth2Client.setCredentials(clientTokens);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const uploadPromises = req.files.map(file => {
        const filePath = path.join(uploadDir, file.filename);
        const fileMetadata = { name: file.originalname };
        const media = { mimeType: file.mimetype, body: fs.createReadStream(filePath) };

        return drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        }).then(driveResponse => {
            fs.unlinkSync(filePath);
            return driveResponse.data.id;
        });
    });

    try {
        const fileIds = await Promise.all(uploadPromises);
        res.status(200).json({ message: 'Files uploaded successfully!', fileIds });
    } catch (error) {
        console.error('Error uploading to Google Drive', error);
        res.status(500).json({ error: 'Failed to upload files to Google Drive.' });
    }
});

router.get('/check-auth', (req, res) => {
    const { tokens: clientTokens } = req.query;
    if (clientTokens) {
        oAuth2Client.setCredentials(JSON.parse(clientTokens));
        const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
        oauth2.userinfo.get((err, response) => {
            if (err) {
                res.json({ isAuthenticated: false });
            } else {
                res.json({ isAuthenticated: true, user: response.data });
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});


app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);
