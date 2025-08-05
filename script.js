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
    const previewContainer = document.getElementById('preview-container');

    // Check authentication status on page load
    const tokens = localStorage.getItem('google_tokens');
    if (tokens) {
        fetch(`/.netlify/functions/api/check-auth?tokens=${encodeURIComponent(tokens)}`)
            .then(response => response.json())
            .then(data => {
                if (data.isAuthenticated) {
                    showUploader(data.user);
                } else {
                    showLogin();
                }
            });
    } else {
        showLogin();
    }

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
        fetch('/.netlify/functions/api/auth/google')
            .then(response => response.json())
            .then(data => {
                window.location.href = data.authUrl;
            });
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('google_tokens');
        showLogin();
    });

    fileInput.addEventListener('change', () => {
        updateFileLabel();
        previewFiles();
    });

    function updateFileLabel() {
        if (fileInput.files.length > 0) {
            if (fileInput.files.length === 1) {
                fileLabel.textContent = fileInput.files[0].name;
            } else {
                fileLabel.textContent = `${fileInput.files.length} files selected`;
            }
        } else {
            fileLabel.textContent = 'Choose files';
        }
    }

    function previewFiles() {
        previewContainer.innerHTML = '';
        const files = fileInput.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let element;
                if (file.type.startsWith('image/')) {
                    element = document.createElement('img');
                    element.src = e.target.result;
                    element.classList.add('preview-image');
                } else if (file.type.startsWith('video/')) {
                    element = document.createElement('video');
                    element.src = e.target.result;
                    element.classList.add('preview-image'); // same class for styling
                    element.controls = true;
                }
                if (element) {
                    previewContainer.appendChild(element);
                }
            }
            reader.readAsDataURL(file);
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
        formData.append('tokens', localStorage.getItem('google_tokens'));

        fetch('/.netlify/functions/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            statusDiv.innerHTML = `<p>${data.message || data.error}</p>`;
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
            previewFiles();
        }
    });
});
