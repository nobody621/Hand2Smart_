function createParticles() {
    const particles = document.querySelector('.particles');
    const particleCount = 50;
    const colors = ['#ffffff', '#7aa2f7', '#bb9af7'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.6 + 0.4;
        particle.style.animation = `float ${Math.random() * 10 + 15}s linear infinite`;
        particle.style.animationDelay = `-${Math.random() * 15}s`;
        
        particles.appendChild(particle);
    }
}