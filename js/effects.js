/**
 * 视觉特效模块
 * 负责处理彩带、动态模糊等视觉效果
 */

class EffectsManager {
    constructor() {
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.ctx = this.confettiCanvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * 调整画布大小
     */
    resizeCanvas() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    /**
     * 播放彩带动画
     * @param {number} duration - 持续时间（毫秒）
     */
    playConfetti(duration = 3000) {
        this.createConfetti();
        this.animateConfetti();
        
        // 指定时间后停止动画
        setTimeout(() => {
            this.stopConfetti();
        }, duration);
    }

    /**
     * 创建彩带粒子
     */
    createConfetti() {
        const colors = [
            '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D',
            '#FF8E53', '#F48FB1', '#81D4FA', '#A5D6A7', '#FFE082'
        ];

        const particleCount = 150;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: Math.random() * this.confettiCanvas.height - this.confettiCanvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5,
                opacity: 1
            });
        }
    }

    /**
     * 动画循环
     */
    animateConfetti() {
        this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
        
        this.particles.forEach((particle, index) => {
            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;
            
            // 逐渐降低透明度
            particle.opacity -= 0.003;
            
            // 绘制粒子
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.globalAlpha = Math.max(0, particle.opacity);
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.ctx.restore();
            
            // 移除透明度为 0 的粒子
            if (particle.opacity <= 0 || particle.y > this.confettiCanvas.height) {
                this.particles.splice(index, 1);
            }
        });
        
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
        }
    }

    /**
     * 停止彩带动画
     */
    stopConfetti() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }

    /**
     * 添加动态模糊效果
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addDynamicBlur(element) {
        element.style.filter = 'blur(0px)';
        element.style.transition = 'filter 0.1s ease-out';
        
        let blurAmount = 0;
        const maxBlur = 3;
        
        const animate = () => {
            blurAmount = (blurAmount + 1) % (maxBlur + 1);
            element.style.filter = `blur(${blurAmount}px)`;
            
            if (this.isAnimating) {
                requestAnimationFrame(animate);
            }
        };
        
        this.isAnimating = true;
        animate();
    }

    /**
     * 移除动态模糊效果
     * @param {HTMLElement} element - 要移除效果的元素
     */
    removeDynamicBlur(element) {
        this.isAnimating = false;
        element.style.filter = 'blur(0px)';
    }

    /**
     * 添加弹跳动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addBounceAnimation(element) {
        element.style.animation = 'bounce 0.5s ease-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    /**
     * 添加脉冲动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addPulseAnimation(element) {
        element.style.animation = 'pulse 1s ease-in-out infinite';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 3000);
    }

    /**
     * 添加发光效果
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addGlowEffect(element) {
        element.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8)';
        element.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
    }

    /**
     * 添加缩放动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addScaleAnimation(element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }

    /**
     * 添加淡入动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addFadeInAnimation(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    /**
     * 添加淡出动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addFadeOutAnimation(element) {
        element.style.opacity = '1';
        element.style.transition = 'opacity 0.5s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '0';
        });
    }

    /**
     * 添加旋转动画
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addRotateAnimation(element) {
        element.style.animation = 'rotate 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    /**
     * 添加震动效果
     * @param {HTMLElement} element - 要添加效果的元素
     */
    addShakeAnimation(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// 添加 CSS 动画定义
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// 创建全局特效管理器
const effectsManager = new EffectsManager();
