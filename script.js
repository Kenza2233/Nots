document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const statusDiv = document.getElementById('status');
    const fileLabel = document.querySelector('.file-label span');
    const container = document.querySelector('.container');

    const authContainer = document.getElementById('auth-container');
    const loginButton = document.getElementById('login-button');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');
    const uploader = document.getElementById('uploader');

    // Check authentication status on page load
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                showUploader(data.user);
            } else {
                showLogin();
            }
        });

    function showUploader(user) {
        authContainer.style.display = 'none';
        userInfo.style.display = 'block';
        userName.textContent = user.name;
        uploader.style.display = 'block';
    }

    function showLogin() {
        authContainer.style.display = 'block';
        userInfo.style.display = 'none';
        uploader.style.display = 'none';
    }

    loginButton.addEventListener('click', () => {
        window.location.href = '/auth/google';
    });

    logoutButton.addEventListener('click', () => {
        window.location.href = '/logout';
    });

    fileInput.addEventListener('change', () => {
        updateFileLabel();
    });

    function updateFileLabel() {
        if (fileInput.files.length > 0) {
            if (fileInput.files.length === 1) {
                fileLabel.textContent = fileInput.files[0].name;
            } else {
                fileLabel.textContent = `${fileInput.files.length} files selected`;
            }
        } else {
            fileLabel.textContent = 'Choose a file';
        }
    }

    uploadButton.addEventListener('click', () => {
        const files = fileInput.files;
        if (files.length === 0) {
            alert('Please select files to upload.');
            return;
        }

        statusDiv.innerHTML = ''; // Clear previous statuses
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            statusDiv.innerHTML = `<p>${data.message}</p>`;
        })
        .catch(error => {
            console.error('Error uploading files:', error);
            statusDiv.innerHTML = `<p>Error uploading files. See console for details.</p>`;
        });
    });

    // Drag and drop (remains the same)
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            updateFileLabel();
        }
    });
});
