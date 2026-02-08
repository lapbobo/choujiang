/**
 * 主应用逻辑
 * 负责抽奖流程、配置管理、UI 更新等核心功能
 */

class LuckyDrawApp {
    constructor() {
        // 配置
        this.config = {
            eventTitle: '幸运大抽奖',
            minNumber: 1,
            maxNumber: 200,
            prizes: [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 2 },
                { name: '三等奖', count: 3 },
                { name: '幸运奖', count: 5 }
            ]
        };

        // 状态
        this.state = {
            isRunning: false,
            currentPrizeIndex: 0,
            prizePool: [],
            winners: [],
            allPrizesFinished: false
        };

        // DOM 元素
        this.elements = {
            mainTitle: document.getElementById('main-title'),
            rollingNumber: document.getElementById('rolling-number'),
            currentPrizeName: document.getElementById('current-prize-name'),
            currentPrizeCount: document.getElementById('current-prize-count'),
            btnStart: document.getElementById('btn-start'),
            btnSettings: document.getElementById('btn-settings'),
            btnFullscreen: document.getElementById('btn-fullscreen'),
            btnRestart: document.getElementById('btn-restart'),
            btnExport: document.getElementById('btn-export'),
            prizeBoard: document.getElementById('prize-board'),
            settingsModal: document.getElementById('settings-modal'),
            btnCloseModal: document.getElementById('btn-close-modal'),
            btnSaveSettings: document.getElementById('btn-save-settings'),
            btnResetDefault: document.getElementById('btn-reset-default'),
            btnAddPrize: document.getElementById('btn-add-prize'),
            prizeConfigList: document.getElementById('prize-config-list'),
            eventTitleInput: document.getElementById('event-title'),
            minNumberInput: document.getElementById('min-number'),
            maxNumberInput: document.getElementById('max-number')
        };

        // 滚动动画相关
        this.rollingInterval = null;
        this.rollingSpeed = 50;

        // 初始化
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 加载保存的配置
        this.loadConfig();

        // 初始化奖池
        this.initPrizePool();

        // 初始化中奖记录
        this.initWinners();

        // 初始化滚动数字显示
        this.updateRollingNumber('准备开始', true);

        // 更新主标题
        this.updateMainTitle();

        // 渲染奖项列表
        this.renderPrizeBoard();

        // 渲染奖项列表
        this.renderPrizeBoard();

        // 初始化滚动数字显示
        this.elements.rollingNumber.textContent = '准备开始';

        // 渲染奖项列表
        this.renderPrizeBoard();

        // 更新当前奖项显示
        this.updateCurrentPrizeDisplay();

        // 绑定事件
        this.bindEvents();

        // 如果所有奖项都已抽完，显示结束状态
        this.checkAllPrizesFinished();

        console.log('App initialized', {
            config: this.config,
            prizes: this.config.prizes.length,
            winners: this.state.winners,
            currentPrizeIndex: this.state.currentPrizeIndex,
            prizePoolSize: this.state.prizePool.length
        });
    }

    /**
     * 加载保存的配置
     */
    loadConfig() {
        const savedConfig = localStorage.getItem('luckyDrawConfig');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (e) {
                console.error('Failed to load config:', e);
            }
        }
    }

    /**
     * 保存配置
     */
    saveConfig() {
        localStorage.setItem('luckyDrawConfig', JSON.stringify(this.config));
    }

    /**
     * 重置为默认配置
     */
    resetConfig() {
        this.config = {
            minNumber: 1,
            maxNumber: 200,
            prizes: [
                { name: '一等奖', count: 1 },
                { name: '二等奖', count: 2 },
                { name: '三等奖', count: 3 },
                { name: '幸运奖', count: 5 }
            ]
        };
        this.saveConfig();
    }

    /**
     * 初始化奖池
     */
    initPrizePool() {
        this.state.prizePool = [];
        for (let i = this.config.minNumber; i <= this.config.maxNumber; i++) {
            this.state.prizePool.push(i);
        }
    }

    /**
     * 初始化中奖记录
     */
    initWinners() {
        const savedWinners = localStorage.getItem('luckyDrawWinners');
        if (savedWinners) {
            try {
                const parsedWinners = JSON.parse(savedWinners);
                // 检查 winners 数组长度是否与配置一致
                if (Array.isArray(parsedWinners) && parsedWinners.length === this.config.prizes.length) {
                    this.state.winners = parsedWinners;
                    // 从奖池中移除已中奖号码
                    this.state.winners.forEach((winnerList) => {
                        winnerList.forEach(winner => {
                            const index = this.state.prizePool.indexOf(winner);
                            if (index !== -1) {
                                this.state.prizePool.splice(index, 1);
                            }
                        });
                    });
                    // 计算当前应该抽哪个奖项
                    this.state.currentPrizeIndex = this.state.winners.findIndex((winnerList, index) => {
                        return winnerList.length < this.config.prizes[index].count;
                    });
                    if (this.state.currentPrizeIndex === -1) {
                        this.state.currentPrizeIndex = 0;
                        this.state.allPrizesFinished = true;
                    }
                } else {
                    // 如果数据不一致，重新初始化并清除旧数据
                    console.warn('Winners data inconsistent, resetting');
                    this.state.winners = this.config.prizes.map(() => []);
                    localStorage.removeItem('luckyDrawWinners');
                }
            } catch (e) {
                console.error('Failed to load winners:', e);
                this.state.winners = this.config.prizes.map(() => []);
                localStorage.removeItem('luckyDrawWinners');
            }
        } else {
            this.state.winners = this.config.prizes.map(() => []);
        }
    }

    /**
     * 保存中奖记录
     */
    saveWinners() {
        localStorage.setItem('luckyDrawWinners', JSON.stringify(this.state.winners));
    }

    /**
     * 清除所有数据
     */
    clearAllData() {
        localStorage.removeItem('luckyDrawConfig');
        localStorage.removeItem('luckyDrawWinners');
        this.resetConfig();
        this.initPrizePool();
        this.initWinners();
        this.state.currentPrizeIndex = 0;
        this.state.allPrizesFinished = false;
        this.state.isRunning = false;
        this.updateRollingNumber('准备开始', true);
        this.elements.btnStart.disabled = false;
        this.elements.btnStart.textContent = '开始抽奖';
        this.renderPrizeBoard();
        this.updateCurrentPrizeDisplay();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 开始/停止按钮
        this.elements.btnStart.addEventListener('click', () => this.toggleDraw());

        // 空格键控制
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleDraw();
            }
        });

        // 设置按钮
        this.elements.btnSettings.addEventListener('click', () => this.openSettingsModal());

        // 全屏按钮
        this.elements.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

        // 重新开始按钮
        this.elements.btnRestart.addEventListener('click', () => this.confirmRestart());

        // 导出图片按钮
        this.elements.btnExport.addEventListener('click', () => this.exportAsImage());

        // 关闭弹窗
        this.elements.btnCloseModal.addEventListener('click', () => this.closeSettingsModal());

        // 点击遮罩层关闭弹窗
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettingsModal();
            }
        });

        // 保存设置
        this.elements.btnSaveSettings.addEventListener('click', () => this.saveSettings());

        // 重置默认设置
        this.elements.btnResetDefault.addEventListener('click', () => this.resetDefaultSettings());

        // 添加奖项
        this.elements.btnAddPrize.addEventListener('click', () => this.addPrizeConfig());

        // 主标题编辑
        this.elements.mainTitle.addEventListener('input', (e) => {
            const text = e.target.textContent.trim();
            if (text.length > 10) {
                e.target.textContent = text.substring(0, 10);
                // 将光标移到最后
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(e.target);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

        this.elements.mainTitle.addEventListener('blur', (e) => {
            const text = e.target.textContent.trim() || '幸运大抽奖';
            this.config.eventTitle = text.substring(0, 10);
            e.target.textContent = this.config.eventTitle;
            this.saveConfig();
        });
    }

    /**
     * 开始/停止抽奖
     */
    toggleDraw() {
        // 如果所有奖项都已抽完，不允许抽奖
        if (this.state.allPrizesFinished) {
            return;
        }

        if (this.state.isRunning) {
            this.stopDraw();
        } else {
            this.startDraw();
        }
    }

    /**
     * 开始抽奖
     */
    startDraw() {
        if (this.state.isRunning) return;

        console.log('Starting draw', {
            currentPrizeIndex: this.state.currentPrizeIndex,
            prizePoolSize: this.state.prizePool.length,
            isRunning: this.state.isRunning,
            allFinished: this.state.allPrizesFinished
        });

        // 检查当前奖项是否还有剩余
        const currentPrize = this.config.prizes[this.state.currentPrizeIndex];
        const currentWinners = this.state.winners[this.state.currentPrizeIndex];
        
        console.log('Current prize check', {
            prize: currentPrize,
            winnersCount: currentWinners.length,
            remaining: currentPrize.count - currentWinners.length
        });

        if (currentWinners.length >= currentPrize.count) {
            // 当前奖项已抽完，切换到下一个奖项
            console.log('Current prize finished, moving to next');
            this.nextPrize();
            return;
        }

        // 检查奖池是否为空
        if (this.state.prizePool.length === 0) {
            alert('所有号码已中奖！');
            return;
        }

        this.state.isRunning = true;
        this.elements.btnStart.textContent = '停止';
        audioManager.play('start');

        // 添加滚动状态类（移除过渡效果）
        this.elements.rollingNumber.classList.remove('text-state', 'winner');
        this.elements.rollingNumber.classList.add('rolling');

        // 开始滚动数字
        this.rollingInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * this.state.prizePool.length);
            const randomNumber = this.state.prizePool[randomIndex];
            this.elements.rollingNumber.textContent = randomNumber;
            audioManager.play('rolling');
        }, this.rollingSpeed);
    }

    /**
     * 停止抽奖
     */
    stopDraw() {
        if (!this.state.isRunning) return;

        this.state.isRunning = false;
        this.elements.btnStart.textContent = '开始抽奖';

        // 停止滚动
        clearInterval(this.rollingInterval);

        // 随机选择一个中奖号码
        const randomIndex = Math.floor(Math.random() * this.state.prizePool.length);
        const winner = this.state.prizePool[randomIndex];

        // 从奖池中移除
        this.state.prizePool.splice(randomIndex, 1);

        // 记录中奖号码
        this.state.winners[this.state.currentPrizeIndex].push(winner);
        this.saveWinners();

        // 更新 UI
        this.elements.rollingNumber.textContent = winner;
        this.elements.rollingNumber.classList.remove('rolling');
        this.elements.rollingNumber.classList.add('winner');
        effectsManager.addGlowEffect(this.elements.rollingNumber);
        effectsManager.playConfetti();
        audioManager.play('win');

        // 移除中奖动画类
        setTimeout(() => {
            this.elements.rollingNumber.classList.remove('winner');
        }, 500);

        // 更新奖项列表
        this.renderPrizeBoard();
        this.updateCurrentPrizeDisplay();

        // 检查是否所有奖项都已抽完
        this.checkAllPrizesFinished();
    }

    /**
     * 切换到下一个奖项
     */
    nextPrize() {
        if (this.state.currentPrizeIndex < this.config.prizes.length - 1) {
            this.state.currentPrizeIndex++;
            this.updateCurrentPrizeDisplay();
            this.renderPrizeBoard();
        } else {
            // 所有奖项都已抽完
            this.state.allPrizesFinished = true;
            this.updateRollingNumber('抽奖结束', true);
            this.elements.btnStart.disabled = true;
            this.elements.btnStart.textContent = '已完成';
            audioManager.play('finish');
            effectsManager.playConfetti(5000);
        }
    }

    /**
     * 检查所有奖项是否都已抽完
     */
    checkAllPrizesFinished() {
        const allFinished = this.config.prizes.every((prize, index) => {
            return this.state.winners[index].length >= prize.count;
        });

        if (allFinished) {
            this.state.allPrizesFinished = true;
            this.updateRollingNumber('抽奖结束', true);
            this.elements.btnStart.disabled = true;
            this.elements.btnStart.textContent = '已完成';
        }
    }

    /**
     * 更新当前奖项显示
     */
    updateCurrentPrizeDisplay() {
        const currentPrize = this.config.prizes[this.state.currentPrizeIndex];
        const currentWinners = this.state.winners[this.state.currentPrizeIndex];
        const remaining = currentPrize.count - currentWinners.length;

        this.elements.currentPrizeName.textContent = currentPrize.name;
        this.elements.currentPrizeCount.textContent = `剩余 ${remaining} 个`;
    }

    /**
     * 更新主标题
     */
    updateMainTitle() {
        this.elements.mainTitle.textContent = this.config.eventTitle || '幸运大抽奖';
    }

    /**
     * 渲染奖项列表
     */
    renderPrizeBoard() {
        this.elements.prizeBoard.innerHTML = '';

        // 创建奖项容器
        const prizesContainer = document.createElement('div');
        prizesContainer.className = 'prize-board-row';

        // 遍历奖项
        this.config.prizes.forEach((prize, index) => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            prizeItem.dataset.prizeIndex = index;

            // 添加可点击样式（如果奖项未完成）
            const winners = this.state.winners[index];
            const remaining = prize.count - winners.length;

            if (remaining > 0) {
                prizeItem.classList.add('clickable');
                prizeItem.style.cursor = 'pointer';

                // 点击事件
                prizeItem.addEventListener('click', () => {
                    this.selectPrize(index);
                });
            }

            if (index === this.state.currentPrizeIndex && !this.state.allPrizesFinished) {
                prizeItem.classList.add('active');
            }

            prizeItem.innerHTML = `
                <div class="prize-item-header">
                    <span class="prize-item-name">${prize.name}</span>
                    <span class="prize-item-count">剩余 ${remaining} 个</span>
                </div>
                <div class="prize-item-numbers">
                    ${winners.map(winner => `<span class="winner-number" data-prize-index="${index}">${winner}</span>`).join('')}
                </div>
            `;

            prizesContainer.appendChild(prizeItem);
        });

        // 添加奖项容器
        this.elements.prizeBoard.appendChild(prizesContainer);
    }

    /**
     * 选择奖项
     * @param {number} index - 奖项索引
     */
    selectPrize(index) {
        // 如果正在抽奖中，不允许切换
        if (this.state.isRunning) {
            alert('请先停止抽奖后再切换奖项！');
            return;
        }

        // 检查奖项是否还有剩余
        const prize = this.config.prizes[index];
        const winners = this.state.winners[index];
        const remaining = prize.count - winners.length;

        if (remaining === 0) {
            alert(`「${prize.name}」已全部抽取完毕！`);
            return;
        }

        // 切换奖项
        this.state.currentPrizeIndex = index;
        this.updateCurrentPrizeDisplay();
        this.renderPrizeBoard();
        audioManager.play('button');
    }

    /**
     * 打开设置弹窗
     */
    openSettingsModal() {
        // 填充当前配置
        this.elements.eventTitleInput.value = this.config.eventTitle;
        this.elements.minNumberInput.value = this.config.minNumber;
        this.elements.maxNumberInput.value = this.config.maxNumber;

        // 渲染奖项配置列表
        this.renderPrizeConfigList();

        // 显示弹窗
        this.elements.settingsModal.classList.add('show');
        audioManager.play('button');
    }

    /**
     * 关闭设置弹窗
     */
    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('show');
        audioManager.play('button');
    }

    /**
     * 渲染奖项配置列表
     */
    renderPrizeConfigList() {
        this.elements.prizeConfigList.innerHTML = '';

        this.config.prizes.forEach((prize, index) => {
            const configItem = document.createElement('div');
            configItem.className = 'prize-config-item';
            configItem.innerHTML = `
                <input type="text" value="${prize.name}" data-index="${index}" class="prize-name-input">
                <input type="number" value="${prize.count}" data-index="${index}" class="prize-count-input" min="1">
                <button class="btn-remove" data-index="${index}" ${this.config.prizes.length <= 1 ? 'disabled' : ''}>×</button>
            `;
            this.elements.prizeConfigList.appendChild(configItem);
        });

        // 绑定删除事件
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removePrizeConfig(index);
            });
        });
    }

    /**
     * 添加奖项配置
     */
    addPrizeConfig() {
        this.config.prizes.push({
            name: '新奖项',
            count: 1
        });
        this.state.winners.push([]);
        this.renderPrizeConfigList();
        audioManager.play('button');
    }

    /**
     * 移除奖项配置
     * @param {number} index - 奖项索引
     */
    removePrizeConfig(index) {
        if (this.config.prizes.length <= 1) return;

        this.config.prizes.splice(index, 1);
        this.state.winners.splice(index, 1);
        this.renderPrizeConfigList();
        audioManager.play('button');
    }

    /**
     * 保存设置
     */
    saveSettings() {
        // 保存主标题
        const eventTitle = this.elements.eventTitleInput.value.trim() || '幸运大抽奖';
        this.config.eventTitle = eventTitle.substring(0, 10);

        const minNumber = parseInt(this.elements.minNumberInput.value);
        const maxNumber = parseInt(this.elements.maxNumberInput.value);

        // 验证输入
        if (minNumber >= maxNumber) {
            alert('最小号码必须小于最大号码！');
            return;
        }

        if (maxNumber - minNumber > 10000) {
            alert('号码范围过大，请缩小范围！');
            return;
        }

        // 获取奖项配置
        const prizeNameInputs = document.querySelectorAll('.prize-name-input');
        const prizeCountInputs = document.querySelectorAll('.prize-count-input');
        const newPrizes = [];

        prizeNameInputs.forEach((input, index) => {
            const name = input.value.trim() || `奖项${index + 1}`;
            const count = parseInt(prizeCountInputs[index].value) || 1;
            newPrizes.push({ name, count });
        });

        // 检查奖项数量是否变化
        const prizesCountChanged = this.config.prizes.length !== newPrizes.length;

        // 检查奖项配置是否需要清除数据
        let needClearData = false;
        if (prizesCountChanged) {
            needClearData = true;
        } else {
            // 检查是否有奖项的数量小于已中奖数量
            for (let i = 0; i < newPrizes.length; i++) {
                if (newPrizes[i].count < this.state.winners[i].length) {
                    needClearData = true;
                    break;
                }
            }
        }

        // 更新配置
        this.config.minNumber = minNumber;
        this.config.maxNumber = maxNumber;
        this.config.prizes = newPrizes;
        this.saveConfig();

        // 更新主标题显示
        this.updateMainTitle();

        // 如果需要清除数据
        if (needClearData) {
            if (confirm('奖项配置已更改，是否清除所有抽奖结果？')) {
                this.clearAllData();
            } else {
                // 恢复奖项配置
                const savedConfig = JSON.parse(localStorage.getItem('luckyDrawConfig'));
                this.config.prizes = savedConfig.prizes;
                this.saveConfig();
                alert('奖项配置未保存！');
                return;
            }
        } else {
            // 只更新奖池和 UI
            this.initPrizePool();
            this.initWinners();
            this.renderPrizeBoard();
            this.updateCurrentPrizeDisplay();
        }

        this.closeSettingsModal();
        audioManager.play('button');
    }

    /**
     * 重置为默认设置
     */
    resetDefaultSettings() {
        if (confirm('确定要重置为默认设置吗？所有抽奖结果将被清除！')) {
            this.clearAllData();
            this.elements.minNumberInput.value = this.config.minNumber;
            this.elements.maxNumberInput.value = this.config.maxNumber;
            this.renderPrizeConfigList();
            audioManager.play('button');
        }
    }

    /**
     * 更新滚动数字显示
     * @param {string|number} text - 要显示的文本或数字
     * @param {boolean} isText - 是否为文本（非数字）
     */
    updateRollingNumber(text, isText = true) {
        this.elements.rollingNumber.textContent = text;

        // 移除所有状态类
        this.elements.rollingNumber.classList.remove('rolling', 'winner', 'text-state');

        if (isText) {
            this.elements.rollingNumber.classList.add('text-state');
        }
    }

    /**
     * 确认重置抽奖（二次确认）
     */
    confirmRestart() {
        audioManager.play('button');

        if (this.state.allPrizesFinished) {
            // 如果抽奖已结束，直接重新开始
            if (confirm('🎉 恭喜！所有奖项已抽取完毕！\n\n确定要重置抽奖吗？\n⚠️ 所有中奖记录将被清除！')) {
                this.clearAllData();
                alert('✅ 抽奖已重置！');
            }
        } else {
            // 如果抽奖未结束，需要二次确认
            const currentPrize = this.config.prizes[this.state.currentPrizeIndex];
            const currentWinners = this.state.winners[this.state.currentPrizeIndex];
            const remaining = currentPrize.count - currentWinners.length;

            const message = `当前正在进行「${currentPrize.name}」抽奖\n已抽取 ${currentWinners.length} 个，剩余 ${remaining} 个\n\n⚠️ 确定要重置抽奖吗？\n⚠️ 所有中奖记录将被清除！\n\n请再次确认是否继续？`;

            // 第一次确认
            if (confirm(message)) {
                // 第二次确认（防止误操作）
                if (confirm('⚠️ 警告：此操作不可撤销！\n\n您确定要删除所有中奖记录并重置抽奖吗？')) {
                    this.clearAllData();
                    alert('✅ 抽奖已重置！');
                } else {
                    audioManager.play('button');
                }
            }
        }
    }

    /**
     * 切换全屏
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Fullscreen failed:', err);
            });
            this.elements.btnFullscreen.textContent = '退出全屏';
        } else {
            document.exitFullscreen();
            this.elements.btnFullscreen.textContent = '全屏显示';
        }
        audioManager.play('button');
    }

    /**
     * 导出为图片
     */
    exportAsImage() {
        // 创建一个临时的 canvas 来渲染中奖名单
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置画布大小
        canvas.width = 1200;
        canvas.height = 1600;

        // 绘制背景
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF9A9E');
        gradient.addColorStop(1, '#FECFEF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制标题
        ctx.fillStyle = '#2D3748';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('幸运大抽奖 - 中奖名单', canvas.width / 2, 100);

        // 绘制奖项
        let y = 200;
        this.config.prizes.forEach((prize, index) => {
            const winners = this.state.winners[index];

            // 绘制奖项名称
            ctx.fillStyle = '#FF6B6B';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${prize.name} (${winners.length}/${prize.count})`, 100, y);

            // 绘制中奖号码
            ctx.fillStyle = '#2D3748';
            ctx.font = '24px Arial';
            let x = 100;
            winners.forEach(winner => {
                ctx.fillText(winner, x, y + 40);
                x += 80;
                if (x > canvas.width - 100) {
                    x = 100;
                    y += 70;
                }
            });

            y += 80;
        });

        // 添加水印
        ctx.fillStyle = 'rgba(45, 55, 72, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Powered by Choujiang-Webapp', canvas.width / 2, canvas.height - 30);

        // 下载图片
        const link = document.createElement('a');
        link.download = `中奖名单_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        audioManager.play('button');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new LuckyDrawApp();
});
