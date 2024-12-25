// Get DOM elements
const uploadBtn = document.querySelector('.upload-button');
const scanBtn = document.querySelector('.scan-btn');

// Function to handle file upload
function handleFileUpload() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle file selection
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Here you can handle the file (e.g., upload to server)
            console.log('File selected:', file);
            // Add your file handling logic here
        }
    };
    
    // Trigger file input click
    fileInput.click();
}

// Function to handle camera access
async function handleCameraScan() {
    try {
        // Create video element
        const video = document.createElement('video');
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '1000';
        
        // Request camera access with back camera preference
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { exact: "environment" } // This specifically requests the back camera
            }
        });
        
        // If back camera is not available, fall back to any available camera
        video.srcObject = stream;
        document.body.appendChild(video);
        
        // Create capture button
        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'Capture';
        captureBtn.className = 'action-button';
        captureBtn.style.position = 'fixed';
        captureBtn.style.bottom = '20px';
        captureBtn.style.left = '50%';
        captureBtn.style.transform = 'translateX(-50%)';
        captureBtn.style.zIndex = '1001';
        document.body.appendChild(captureBtn);
        
        // Start video playback
        await video.play();
        
        // Handle capture
        captureBtn.onclick = () => {
            // Create canvas to capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Convert to image data
            const imageData = canvas.toDataURL('image/jpeg');
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            captureBtn.remove();
            
            // Here you can handle the captured image (e.g., upload to server)
            console.log('Image captured:', imageData);
            // Add your image handling logic here
        };
        
    } catch (error) {
        if (error.name === 'OverconstrainedError') {
            // If back camera is not available, try again with any camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                video.srcObject = stream;
            } catch (fallbackError) {
                console.error('Camera access error:', fallbackError);
                alert('Unable to access camera. Please make sure you have granted camera permissions.');
            }
        } else {
            console.error('Camera access error:', error);
            alert('Unable to access camera. Please make sure you have granted camera permissions.');
        }
    }
}

// Add event listeners to buttons
uploadBtn.addEventListener('click', handleFileUpload);
scanBtn.addEventListener('click', handleCameraScan);
document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.querySelector('.scan-btn');
    const cameraInterface = document.getElementById('cameraInterface');
    const video = document.getElementById('video');
    const captureButton = document.getElementById('captureButton');
    const doneButton = document.getElementById('doneButton');
    const exitButton = document.getElementById('exitButton');
    let mediaStream = null;
    let capturedImages = [];

    scanBtn.addEventListener('click', async () => {
        cameraInterface.style.display = 'flex';
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = mediaStream;
    });

    captureButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        capturedImages.push(imageData);
        localStorage.setItem('capturedImages', JSON.stringify(capturedImages));
    });

    doneButton.addEventListener('click', () => {
        mediaStream.getTracks().forEach(track => track.stop());
        cameraInterface.style.display = 'none';
    });

    exitButton.addEventListener('click', () => {
        mediaStream.getTracks().forEach(track => track.stop());
        cameraInterface.style.display = 'none';
        capturedImages = [];
        localStorage.removeItem('capturedImages');
    });
});
// Add this to your app.js file
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration between 10s and 20s
        const duration = Math.random() * 10 + 10;
        particle.style.animation = `float-particle ${duration}s infinite linear`;
        
        // Random delay to start animation
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', createParticles);
