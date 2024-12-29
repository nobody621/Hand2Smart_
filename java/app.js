document.addEventListener('DOMContentLoaded', () => {
    const cameraModal = document.getElementById('cameraModal');
    const cameraFeed = document.getElementById('cameraFeed');
    const captureBtn = document.getElementById('captureBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const mobileCaptureBtn = document.getElementById('mobileCaptureBtn');
    const mobileUploadBtn = document.getElementById('mobileUploadBtn');
    const takePictureBtn = document.getElementById('takePictureBtn');
    const closeBtn = document.getElementById('closeBtn');
    const switchCameraBtn = document.getElementById('switchCameraBtn');
    const previewGrid = document.getElementById('previewGrid');
    const infoBlocks = document.querySelectorAll('.info-block');

    let stream = null;
    let facingMode = 'environment';

    // Load existing images from localStorage
    function loadSavedImages() {
        const savedImages = JSON.parse(localStorage.getItem('captureHubImages') || '[]');
        savedImages.forEach(imageData => {
            createPreviewElement(imageData);
        });
    }

    // Save image to localStorage
    function saveImageToStorage(imageData) {
        try {
            const savedImages = JSON.parse(localStorage.getItem('captureHubImages') || '[]');
            const newImage = {
                id: Date.now(),
                url: imageData,
                timestamp: new Date().toISOString()
            };
            savedImages.unshift(newImage); // Add new image at the beginning
            localStorage.setItem('captureHubImages', JSON.stringify(savedImages));
            return newImage;
        } catch (error) {
            console.error('Storage error:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage is full. Please delete some images.');
            }
            throw error;
        }
    }

    // Create preview element
    function createPreviewElement(imageData) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.style.animation = 'fadeInUp 0.5s ease-out';
        previewItem.dataset.id = imageData.id;
        
        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = 'Captured image';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '❌';
        deleteBtn.onclick = () => deleteImage(imageData.id);
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(imageData.timestamp).toLocaleString();
        
        previewItem.appendChild(img);
        previewItem.appendChild(deleteBtn);
        previewItem.appendChild(timestamp);
        previewGrid.insertBefore(previewItem, previewGrid.firstChild);
    }

    // Delete image from storage and UI
    function deleteImage(id) {
        try {
            const savedImages = JSON.parse(localStorage.getItem('captureHubImages') || '[]');
            const updatedImages = savedImages.filter(img => img.id !== id);
            localStorage.setItem('captureHubImages', JSON.stringify(updatedImages));
            
            const elementToRemove = document.querySelector(`[data-id="${id}"]`);
            if (elementToRemove) {
                elementToRemove.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => elementToRemove.remove(), 300);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image. Please try again.');
        }
    }

    // Handle hover effect for info blocks
    infoBlocks.forEach(block => {
        block.addEventListener('mousemove', (e) => {
            const rect = block.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            block.querySelector('.hover-effect').style.setProperty('--x', `${x}%`);
            block.querySelector('.hover-effect').style.setProperty('--y', `${y}%`);
        });
    });

    // Initialize camera with improved error handling
    async function initCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraFeed.srcObject = stream;
            cameraModal.style.display = 'flex';
            
            cameraModal.style.opacity = 0;
            requestAnimationFrame(() => {
                cameraModal.style.transition = 'opacity 0.3s ease';
                cameraModal.style.opacity = 1;
            });
        } catch (error) {
            console.error('Camera error:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera access denied. Please enable camera permissions in your browser settings.');
            } else {
                alert('Error accessing camera. Please make sure your device has a working camera.');
            }
        }
    }

    // Handle image capture
    async function captureImage() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = cameraFeed.videoWidth;
            canvas.height = cameraFeed.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(cameraFeed, 0, 0);
            
            const imageUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to save storage
            const savedImage = saveImageToStorage(imageUrl);
            createPreviewElement(savedImage);
            closeCamera();
        } catch (error) {
            console.error('Capture error:', error);
            alert('Failed to capture image. Please try again.');
        }
    }

    // Close camera
    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        cameraModal.style.transition = 'opacity 0.3s ease';
        cameraModal.style.opacity = 0;
        
        setTimeout(() => {
            cameraModal.style.display = 'none';
        }, 300);
    }

    // Handle file upload
    function handleFileUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const savedImage = saveImageToStorage(event.target.result);
                        createPreviewElement(savedImage);
                    } catch (error) {
                        console.error('Upload error:', error);
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    // Event listeners
    captureBtn.addEventListener('click', initCamera);
    mobileCaptureBtn.addEventListener('click', initCamera);
    uploadBtn.addEventListener('click', handleFileUpload);
    mobileUploadBtn.addEventListener('click', handleFileUpload);
    takePictureBtn.addEventListener('click', captureImage);
    closeBtn.addEventListener('click', closeCamera);
    
    switchCameraBtn.addEventListener('click', () => {
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        initCamera();
    });

    // Load saved images when page loads
    loadSavedImages();

    // Initialize particles
    createParticles(); // Ensure particles.js is properly included and accessible
});
