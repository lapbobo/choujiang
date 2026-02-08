/**
 * 音效管理模块
 * 负责播放各种操作音效
 */

class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.sounds = {};
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     */
    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.play();
        } else {
            // 使用 Web Audio API 生成音效
            this.generateSound(soundName);
        }
    }

    /**
     * 生成音效（使用 Web Audio API）
     * @param {string} soundName - 音效名称
     */
    generateSound(soundName) {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        switch (soundName) {
            case 'button':
                this.playButtonSound(ctx, now);
                break;
            case 'start':
                this.playStartSound(ctx, now);
                break;
            case 'rolling':
                this.playRollingSound(ctx, now);
                break;
            case 'win':
                this.playWinSound(ctx, now);
                break;
            case 'finish':
                this.playFinishSound(ctx, now);
                break;
            default:
                console.warn('Unknown sound:', soundName);
        }
    }

    /**
     * 按钮点击音效
     */
    playButtonSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * 开始抽奖音效（引擎启动声）
     */
    playStartSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * 滚动抽奖音效（机械齿轮快速转动声）
     */
    playRollingSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.setValueAtTime(300, now + 0.05);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.setValueAtTime(0.01, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * 中奖音效（礼炮/欢呼声）
     */
    playWinSound(ctx, now) {
        // 1. 礼炮音效
        this.playFireworkSound(ctx, now);

        // 2. 欢呼声（模拟）
        setTimeout(() => {
            this.playCheerSound(ctx, now + 0.5);
        }, 200);
    }

    /**
     * 礼炮音效
     */
    playFireworkSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.4);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    /**
     * 欢呼声（模拟）
     */
    playCheerSound(ctx, now) {
        // 创建多个振荡器模拟人群欢呼声
        const voices = 5;
        for (let i = 0; i < voices; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            const baseFreq = 300 + Math.random() * 200;
            oscillator.frequency.setValueAtTime(baseFreq, now);
            oscillator.frequency.linearRampToValueAtTime(baseFreq + 100, now + 0.3);
            oscillator.frequency.linearRampToValueAtTime(baseFreq - 50, now + 0.6);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);

            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.linearRampToValueAtTime(0.08, now + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);

            oscillator.start(now);
            oscillator.stop(now + 0.6);
        }
    }

    /**
     * 完成抽奖音效
     */
    playFinishSound(ctx, now) {
        // 1. 长音效
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 1.0);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        oscillator.start(now);
        oscillator.stop(now + 1.2);

        // 2. 第二次欢呼声
        setTimeout(() => {
            this.playCheerSound(ctx, now + 1.5);
        }, 1500);
    }

    /**
     * 切换音效开关
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * 设置音效状态
     * @param {boolean} enabled - 是否启用音效
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// 创建全局音效管理器
const audioManager = new AudioManager();
