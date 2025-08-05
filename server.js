const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const port = 3000;

// Load credentials
const credentials = require('./credentials.json');
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// In-memory token storage (for this example)
let tokens;

// Scopes required for the application
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Enable CORS
app.use(cors());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Set up multer for file storage
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route to generate authentication URL
app.get('/auth/google', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(authUrl);
});

// Callback route for Google to redirect to
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens: newTokens } = await oAuth2Client.getToken(code);
        tokens = newTokens;
        oAuth2Client.setCredentials(tokens);
        res.redirect('/'); // Redirect to home page after successful authentication
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send('Authentication failed');
    }
});

// Define the upload route
app.post('/upload', upload.array('files'), async (req, res) => {
    if (!tokens) {
        return res.status(401).send('You need to log in first.');
    }
    oAuth2Client.setCredentials(tokens);

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const uploadPromises = req.files.map(file => {
        const filePath = path.join(uploadDir, file.filename);
        const fileMetadata = {
            name: file.originalname,
        };
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(filePath),
        };
        return drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        }).then(driveResponse => {
            // Clean up the uploaded file from the server
            fs.unlinkSync(filePath);
            return driveResponse.data.id;
        });
    });

    try {
        const fileIds = await Promise.all(uploadPromises);
        res.status(200).send({
            message: 'Files uploaded to Google Drive successfully!',
            fileIds: fileIds
        });
    } catch (error) {
        console.error('Error uploading to Google Drive', error);
        res.status(500).send('Failed to upload files to Google Drive.');
    }
});

// Route to check authentication status
app.get('/check-auth', (req, res) => {
    if (tokens) {
        // To get user info, we need to make another API call
        const oauth2 = google.oauth2({
            auth: oAuth2Client,
            version: 'v2'
        });
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

// Route for logout
app.get('/logout', (req, res) => {
    tokens = null;
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
