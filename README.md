# Google Drive File Uploader

This is a web application that allows users to upload files directly to their Google Drive account. It features a modern, user-friendly interface with support for drag-and-drop, file previews, and animations.

## Features

- **Google Drive Integration:** Upload files directly to your Google Drive.
- **Secure Authentication:** Uses OAuth 2.0 to securely connect to your Google account.
- **Modern UI:** A clean and attractive interface with animations and a responsive design.
- **Drag-and-Drop:** Easily drag and drop files to the upload area.
- **File Previews:** See a preview of the images you are about to upload.
- **Easy to Set Up:** Follow the instructions below to get the application running in a few minutes.

## Project Structure

```
.
├── index.html          # The main page of the application
├── style.css           # The stylesheet for the UI
├── script.js           # The client-side JavaScript logic
├── server.js           # The Node.js backend server
├── package.json        # Project dependencies
├── credentials.json    # Your Google API credentials (should not be committed)
└── README.md           # This file
```

## Setup and Installation

To run this project locally, you will need to have [Node.js](https://nodejs.org/) installed.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install the necessary Node.js packages using npm:

```bash
npm install
```

### 3. Get Google Drive API Credentials

You will need to get OAuth 2.0 credentials from the Google Cloud Platform to use the Google Drive API.

1.  **Go to the Google Cloud Platform Console:** [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Create a new project** (or select an existing one).
3.  **Enable the Google Drive API** for your project.
4.  **Configure the OAuth consent screen.** Make sure to add your email as a test user if you are in testing mode.
5.  **Create an OAuth client ID** for a **Web application**.
    *   Under **Authorized JavaScript origins**, add `http://localhost:3000`.
    *   Under **Authorized redirect URIs**, add `http://localhost:3000/oauth2callback`.
6.  **Download the credentials.** After creating the client ID, you will be able to download a JSON file with your credentials. Rename this file to `credentials.json` and place it in the root directory of the project.

The `credentials.json` file should look like this:

```json
{
  "web": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "YOUR_PROJECT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": [
      "http://localhost:3000/oauth2callback"
    ],
    "javascript_origins": [
      "http://localhost:3000"
    ]
  }
}
```

### 4. Run Locally (Optional)

To run the project locally, you can use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

The application will be running at `http://localhost:8888`.

## Manual Configuration (for local development)

If you are not deploying to Netlify and want to run the application on a different server or locally, you can configure the credentials manually by creating a `credentials.json` file in the root of the project.

**⚠️ Security Warning:** This method is **not recommended for production or public repositories**. If you commit this file to a public GitHub repository, your Client Secret will be exposed. It is highly recommended to use environment variables for production environments.

1.  Create a file named `credentials.json` in the root directory of the project.
2.  Add the following content to the file, replacing the placeholder values with your actual credentials:

```json
{
  "web": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID",
    "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
    "redirect_uris": ["YOUR_REDIRECT_URI"]
  }
}
```

-   `YOUR_GOOGLE_CLIENT_ID`: Replace with your Google Client ID.
-   `YOUR_GOOGLE_CLIENT_SECRET`: Replace with your Google Client Secret.
-   `YOUR_REDIRECT_URI`: Replace with the redirect URI you have configured in the Google Cloud Console (e.g., `http://localhost:3000/callback.html`).

## Deploy to Netlify

You can deploy this application to Netlify to make it available online.

### 1. Create a GitHub Repository

Create a new repository on GitHub and push the project files to it.

### 2. Connect to Netlify

1.  Go to [Netlify](https://app.netlify.com/signup) and sign up or log in.
2.  Click on **"Add new site"** and select **"Import an existing project"**.
3.  Connect to your GitHub account and select the repository you just created.

### 3. Configure the Deployment

Netlify will automatically detect the `netlify.toml` file and configure the build settings. The last step is to add the environment variables.

1.  In your site's dashboard on Netlify, go to **Site settings > Build & deploy > Environment**.
2.  Click on **"Edit variables"** and add the following environment variables:
    *   `GOOGLE_CLIENT_ID`: Your Google API Client ID.
    *   `GOOGLE_CLIENT_SECRET`: Your Google API Client Secret.
    *   `GOOGLE_REDIRECT_URI`: The redirect URI for your application. This should be `https://YOUR_NETLIFY_SITE_NAME.netlify.app/callback.html`. Make sure to update your Google Cloud Platform credentials to include this new redirect URI.

### 4. Deploy

Once the environment variables are set, you can trigger a new deploy from the **Deploys** tab in your Netlify dashboard. Your site will be live at the URL provided by Netlify.
