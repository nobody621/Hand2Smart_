document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cameraModal = document.getElementById('cameraModal');
    const cameraFeed = document.getElementById('cameraFeed');
    const captureBtn = document.getElementById('captureBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const mobileCaptureBtn = document.getElementById('mobileCaptureBtn');
    const mobileUploadBtn = document.getElementById('mobileUploadBtn');
    const takePictureBtn = document.getElementById('takePictureBtn');
    const closeBtn = document.getElementById('closeBtn');
    const doneBtn = document.getElementById('doneBtn');
    const switchCameraBtn = document.getElementById('switchCameraBtn');
    const previewStrip = document.getElementById('previewStrip');
    const flashBtn = document.getElementById('flashBtn');

    // State variables
    let stream = null;
    let facingMode = 'environment';
    let currentImages = [];
    let flashEnabled = false;

    // Particle system initialization
    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--x', `${Math.random() * 100}%`);
            particle.style.setProperty('--y', `${Math.random() * 100}%`);
            particle.style.setProperty('--duration', `${10 + Math.random() * 20}s`);
            particle.style.setProperty('--delay', `${-Math.random() * 20}s`);
            particlesContainer.appendChild(particle);
        }
    }

    // Image storage functions
     function saveImageToStorage(imageData) {
        try {
            const newImage = {
                id: Date.now(),
                url: imageData,
                timestamp: new Date().toISOString()
            };
            currentImages.push(newImage);
            
            // Add thumbnail to preview strip
            const thumb = document.createElement('img');
            thumb.src = imageData;
            thumb.className = 'preview-thumb';
            thumb.setAttribute('data-id', newImage.id);
            previewStrip.insertBefore(thumb, previewStrip.firstChild);
            
            // Scroll to show the new thumbnail
            previewStrip.scrollLeft = 0;
            
            return newImage;
        } catch (error) {
            console.error('Storage error:', error);
                alert('Failed to save image locally. Please try again.');
           throw error;
        }
    }

    // Load images from images.json
    async function loadImages() {
        try {
            const response = await fetch('images.json');
             if(!response.ok){
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
             currentImages = data;
        } catch (error) {
           console.error('Failed to load images:', error);
           alert('Failed to load images.');
        }
     }
    

    // Camera initialization
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
            
            // Reset flash state
            flashEnabled = false;
            flashBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            
            requestAnimationFrame(() => {
                cameraModal.style.opacity = '1';
            });

        } catch (error) {
            console.error('Camera error:', error);
            handleCameraError(error);
        }
    }

    // Error handling
    function handleCameraError(error) {
        let message = 'An error occurred while accessing the camera.';
        
        if (error.name === 'NotAllowedError') {
            message = 'Camera access denied. Please enable camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            message = 'No camera found. Please make sure your device has a working camera.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera is in use by another application. Please close other apps using the camera.';
        }
        
        alert(message);
    }

    // Image capture
   async function captureImage() {
        try {
            // Show focus animation
            const focusRing = document.querySelector('.focus-ring');
            focusRing.classList.add('active');
            
            // Flash effect
            if (flashEnabled) {
                const flash = document.getElementById('captureFlash');
                flash.style.animation = 'none';
                flash.offsetHeight; // Trigger reflow
                flash.style.animation = 'captureFlash 0.5s ease-out';
            }
            
            // Capture frame
            const canvas = document.createElement('canvas');
            canvas.width = cameraFeed.videoWidth;
            canvas.height = cameraFeed.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Apply any necessary filters or effects
            ctx.drawImage(cameraFeed, 0, 0);
            
            // Convert to JPEG with good quality
            const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
             saveImageToStorage(imageUrl);
           
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Remove focus ring after capture
            setTimeout(() => {
                focusRing.classList.remove('active');
            }, 300);
            
        } catch (error) {
            console.error('Capture error:', error);
            alert('Failed to capture image. Please try again.');
        }
    }
    

    // Camera controls
    async function closeCamera(saveImages = false) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
       if(saveImages && currentImages.length > 0) {
           try{
              const response = await fetch('/save-images',{
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json'
                   },
                   body: JSON.stringify(currentImages)
                });
               if(!response.ok){
                   throw new Error(`HTTP error! status: ${response.status}`)
               }
                console.log('Images saved to server.');

            } catch (error) {
            console.error('Failed to save images:', error);
            alert('Failed to save images to the server.');
           }
         }

        // Reset currentImages if not saving
        currentImages = [];

         //Animate modal close
         cameraModal.style.opacity = '0';
         setTimeout(() => {
             cameraModal.style.display = 'none';
             previewStrip.innerHTML = '';
         }, 300);
    }

    // Flash toggle
    function toggleFlash() {
        flashEnabled = !flashEnabled;
        flashBtn.style.backgroundColor = flashEnabled ? '#2196f3' : 'rgba(255, 255, 255, 0.2)';
        
        // Attempt to toggle device flash if available
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if (track.getCapabilities().torch) {
                track.applyConstraints({
                    advanced: [{ torch: flashEnabled }]
                }).catch(error => {
                    console.error('Flash error:', error);
                });
            }
        }
    }

    // File upload handling
   function handleFileUpload() {
       const input = document.createElement('input');
       input.type = 'file';
       input.accept = 'image/*';
       input.multiple = true;
       
       input.onchange = async (e) => {
           const files = Array.from(e.target.files);
           
           for (const file of files) {
               try {
                   const reader = new FileReader();
                   await new Promise((resolve, reject) => {
                       reader.onload = () => {
                           try {
                                saveImageToStorage(reader.result);
                                resolve();
                           } catch (error) {
                               reject(error);
                           }
                       };
                       reader.onerror = reject;
                       reader.readAsDataURL(file);
                   });
               } catch (error) {
                   console.error('Upload error:', error);
                   alert(`Failed to upload ${file.name}`);
               }
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
    closeBtn.addEventListener('click', () => closeCamera(false));
    doneBtn.addEventListener('click', () => closeCamera(true));
    flashBtn.addEventListener('click', toggleFlash);
    
    switchCameraBtn.addEventListener('click', () => {
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        initCamera();
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (cameraModal.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeCamera(false);
            } else if (e.key === ' ' || e.key === 'Enter') {
                captureImage();
            }
        }
    });

    // Initialize particles
    createParticles();
    
    // Load initial data
    loadImages();
});