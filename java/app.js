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
    
    let stream = null;
    let facingMode = 'environment';

    // Save image to localStorage only
    function saveImageToStorage(imageData) {
        try {
            const savedImages = JSON.parse(localStorage.getItem('captureHubImages') || '[]');
            const newImage = {
                id: Date.now(),
                url: imageData,
                timestamp: new Date().toISOString()
            };
            savedImages.unshift(newImage);
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
            
            const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
            saveImageToStorage(imageUrl);
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
                        saveImageToStorage(event.target.result);
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

    // Initialize particles
    createParticles();
});