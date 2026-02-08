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
     * 按钮点击音效（清脆悦耳的气泡声）
     */
    playButtonSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1108, now + 0.05); // C#6

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * 开始抽奖音效（升序和弦）
     */
    playStartSound(ctx, now) {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now + index * 0.1);

            gainNode.gain.setValueAtTime(0, now + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.4);

            oscillator.start(now + index * 0.1);
            oscillator.stop(now + index * 0.1 + 0.4);
        });
    }

    /**
     * 滚动抽奖音效（轻快的滴答声）
     */
    playRollingSound(ctx, now) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.05);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    /**
     * 中奖音效（愉悦的庆祝音效）
     */
    playWinSound(ctx, now) {
        // 1. 播放喜庆的和弦
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (C major chord with octave)

        chord.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now + index * 0.03);

            gainNode.gain.setValueAtTime(0, now + index * 0.03);
            gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.03 + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.03 + 0.6);

            oscillator.start(now + index * 0.03);
            oscillator.stop(now + index * 0.03 + 0.6);
        });

        // 2. 延迟播放欢呼声
        setTimeout(() => {
            this.playCheerSound(ctx, now + 0.4);
        }, 200);
    }

    /**
     * 欢呼声（模拟）
     */
    playCheerSound(ctx, now) {
        // 创建多个振荡器模拟人群欢呼声
        const voices = 8;
        for (let i = 0; i < voices; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            const baseFreq = 400 + Math.random() * 300;
            oscillator.frequency.setValueAtTime(baseFreq, now);
            oscillator.frequency.linearRampToValueAtTime(baseFreq + 150, now + 0.25);
            oscillator.frequency.linearRampToValueAtTime(baseFreq - 80, now + 0.5);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.linearRampToValueAtTime(800, now + 0.5);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.04, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.06, now + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);

            oscillator.start(now);
            oscillator.stop(now + 0.5);
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
