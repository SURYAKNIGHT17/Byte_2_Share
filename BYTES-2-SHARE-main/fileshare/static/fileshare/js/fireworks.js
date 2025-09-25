/**
 * Fireworks animation for celebration effects
 */
class Fireworks {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.fireworks = [];
        this.running = false;
        
        // Configure canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        
        // Add to container
        this.container.appendChild(this.canvas);
        
        // Bind methods
        this.loop = this.loop.bind(this);
        this.resize = this.resize.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.resize);
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    start(duration = 4000) {
        if (this.running) return;
        
        this.running = true;
        this.canvas.style.display = 'block';
        this.loop();
        
        // Launch initial fireworks
        this.launchFireworks(5);
        
        // Continue launching fireworks
        const interval = setInterval(() => {
            this.launchFireworks(2);
        }, 800);
        
        // Stop after duration
        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                this.stop();
            }, 1500); // Allow last fireworks to finish
        }, duration);
    }
    
    stop() {
        this.running = false;
        this.particles = [];
        this.fireworks = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display = 'none';
    }
    
    launchFireworks(count) {
        for (let i = 0; i < count; i++) {
            // Create firework
            const firework = {
                x: Math.random() * this.canvas.width,
                y: this.canvas.height,
                targetY: 100 + Math.random() * (this.canvas.height / 2),
                color: this.getRandomColor(),
                velocity: {
                    x: -1 + Math.random() * 2,
                    y: -12 - Math.random() * 5
                },
                size: 3,
                alpha: 1
            };
            
            this.fireworks.push(firework);
        }
    }
    
    explode(firework) {
        const particleCount = 50 + Math.floor(Math.random() * 30);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            
            this.particles.push({
                x: firework.x,
                y: firework.y,
                color: firework.color,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                size: 2 + Math.random() * 2,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.03
            });
        }
    }
    
    loop() {
        if (!this.running) return;
        
        // Clear canvas
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Update and draw fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            
            firework.x += firework.velocity.x;
            firework.y += firework.velocity.y;
            firework.velocity.y += 0.1; // Gravity
            
            this.ctx.beginPath();
            this.ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
            this.ctx.fillStyle = firework.color;
            this.ctx.fill();
            
            // Check if firework should explode
            if (firework.velocity.y >= 0 || firework.y <= firework.targetY) {
                this.explode(firework);
                this.fireworks.splice(i, 1);
            }
        }
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.y += 0.05; // Gravity
            particle.alpha -= particle.decay;
            
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getRGBA(particle.color, particle.alpha);
            this.ctx.fill();
        }
        
        requestAnimationFrame(this.loop);
    }
    
    getRandomColor() {
        const colors = [
            '#FF5252', // Red
            '#FFD740', // Amber
            '#64FFDA', // Teal
            '#40C4FF', // Light Blue
            '#FF4081', // Pink
            '#B388FF', // Deep Purple
            '#69F0AE', // Green
            '#FFFF00'  // Yellow
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRGBA(color, alpha) {
        return color.replace(')', `, ${alpha})`) // For hex colors
                 .replace('rgb', 'rgba');
    }
}

// Export for use in other files
window.Fireworks = Fireworks;