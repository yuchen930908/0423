document.addEventListener('DOMContentLoaded', function() {
    console.log('全畫面波浪動畫已載入！');
    
    // 建立 canvas 元素並插入 body
    let canvas = document.getElementById('waveCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'waveCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    
    // 設定基本參數，使用隨機值
    let verticalCenter = window.innerHeight * (0.3 + Math.random() * 0.4); // 隨機位置在畫面30%-70%之間
    let baseAmplitude = (97.5 + Math.random() * 39); // 增加 30%（從 75-105 增加到 97.5-136.5）
    
    // 波形參數 - 使用隨機值初始化
    const waveParams = {
        frequency: (0.0013 + Math.random() * 0.00195), // 增加 30%
        phase: Math.random() * Math.PI * 2, // 隨機相位
        speed: 0.01 + Math.random() * 0.02, // 隨機速度
        horizontalSpeed: 1 + Math.random() * 0.5, // 水平移動速度 (每幀移動的像素數)
        floatSpeed: 0.0008 + Math.random() * 0.0004, // 飄浮速度
        floatAmplitude: 30 + Math.random() * 20 // 飄浮幅度
    };
    
    // 用於創建自然變化的多個波
    const subWaves = [
        { 
            frequency: waveParams.frequency * (0.325 + Math.random() * 0.13), // 增加 30%
            amplitude: baseAmplitude * 0.195, // 增加 30%
            speed: waveParams.speed * 0.7,
            phase: Math.random() * Math.PI * 2
        },
        { 
            frequency: waveParams.frequency * (0.975 + Math.random() * 0.195), // 增加 30%
            amplitude: baseAmplitude * 0.0975, // 增加 30%
            speed: waveParams.speed * 1.3,
            phase: Math.random() * Math.PI * 2
        }
    ];
    
    // === 進階：更多更複雜的波浪 ===
    // 產生多組子波參數，讓波浪更豐富
    const extraSubWaves = [];
    for (let i = 0; i < 4; i++) { // 新增4組子波
        extraSubWaves.push({
            frequency: (0.0008 + Math.random() * 0.003),
            amplitude: (20 + Math.random() * 40),
            speed: 0.008 + Math.random() * 0.025,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    // === 多條獨立波浪參數 ===
    const numWaves = 40; // 波浪條數由20改為40
    const multiWaves = [];
    for (let i = 0; i < numWaves; i++) {
        // 藍色系：色相固定200~230，亮度依序遞增
        const hue = 210 + 20 * (i / (numWaves - 1)); // 210~230
        const light = 35 + 40 * (i / (numWaves - 1)); // 35%~75%
        multiWaves.push({
            verticalCenter: window.innerHeight * (0.1 + 0.8 * i / (numWaves - 1)),
            baseAmplitude: 60 + Math.random() * 80,
            frequency: 0.001 + Math.random() * 0.004,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            color: `hsl(${hue}, 70%, ${light}%)`,
            // 線條粗細：最細0.5，最粗3，依序遞增
            lineWidth: 0.5 + (i * 2.5) / (numWaves - 1)
        });
    }
    
    // 時間變數
    let time = Math.random() * 100; // 隨機的起始時間
    
    // 水平偏移量 - 用於實現右至左的移動
    let horizontalOffset = 0;
    
    // 儲存前一幀的波形，用於高比例平滑過渡
    let previousWavePoints = [];
    
    // 延伸參數 - 讓線條延伸到畫面外
    const extensionFactor = 0.3; // 每側延伸畫面寬度的30%

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 重設前一幀波形
        previousWavePoints = Array(Math.ceil(canvas.width * (1 + extensionFactor * 2))).fill(verticalCenter);
    }

    // 使用平滑曲線繪製波浪
    function drawSmoothWave(points) {
        if (points.length < 2) return;
        
        const startX = -canvas.width * extensionFactor;
        
        ctx.beginPath();
        ctx.moveTo(startX, points[0]);
        
        // 使用平滑的曲線連接點
        for (let i = 1; i < points.length; i++) {
            const x = startX + i;
            ctx.lineTo(x, points[i]);
        }
        
        ctx.stroke();
    }
    
    // 使用平滑曲線繪製波浪（改為色塊填滿下方區域）
    function drawSmoothWaveFilled(points, fillColor) {
        if (points.length < 2) return;
        const startX = -canvas.width * extensionFactor;
        ctx.beginPath();
        ctx.moveTo(startX, 0); // 從畫面頂端開始
        for (let i = 0; i < points.length; i++) {
            const x = startX + i;
            ctx.lineTo(x, points[i]);
        }
        ctx.lineTo(startX + points.length - 1, canvas.height); // 畫到底部
        ctx.lineTo(startX, canvas.height); // 回到左下
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = 0.45; // 疊加透明度
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // 自然平滑波形函數 - 加入水平偏移
    function generateWavePoint(x, time, offset) {
        const adjustedX = x + offset;
        // 主波
        let value = Math.sin(adjustedX * waveParams.frequency + time * waveParams.speed + waveParams.phase) * baseAmplitude;
        // 原有子波
        for (const wave of subWaves) {
            value += Math.sin(adjustedX * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        }
        // 新增子波
        for (const wave of extraSubWaves) {
            value += Math.sin(adjustedX * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        }
        return value;
    }

    // 新的 generateWavePoint 支援多條波浪
    function generateMultiWavePoint(x, time, offset, wave) {
        // 主波
        let value = Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.baseAmplitude;
        // 疊加隨機子波
        for (const sub of subWaves) {
            value += Math.sin(x * sub.frequency + time * sub.speed + sub.phase) * sub.amplitude * 0.5;
        }
        for (const sub of extraSubWaves) {
            value += Math.sin(x * sub.frequency + time * sub.speed + sub.phase) * sub.amplitude * 0.5;
        }
        return value;
    }

    // 幾何小魚繪製（4正方形組成大正方形，整體旋轉45度，魚鰭為三角形，與身體邊線貼齊）
    const fishCount = 14;
    // 每隻魚的基礎位置、靈敏度、方向、大小
    let fishes = [];
    function randomizeFishes() {
        fishes = [];
        const w = canvas.width, h = canvas.height;
        // 以4x4格分布（最多16格，取前14格），分布於中央（X:0.30~0.50, Y:0.50~0.80）
        const gridRows = 4, gridCols = 4;
        const xStart = 0.30, xEnd = 0.50;
        const yStart = 0.50, yEnd = 0.80;
        let gridIndices = [];
        for (let i = 0; i < gridRows * gridCols; i++) gridIndices.push(i);
        // 隨機取14格
        gridIndices = gridIndices.sort(() => Math.random() - 0.5).slice(0, fishCount);
        for (let i = 0; i < fishCount; i++) {
            const minSize = 0.036 * w;
            const maxSize = 0.09 * w;
            const size = minSize + Math.random() * (maxSize - minSize);
            const bodySize = size * 2;
            const margin = bodySize * Math.SQRT2 / 2;
            // 取格點
            const gridIdx = gridIndices[i];
            const row = Math.floor(gridIdx / gridCols);
            const col = gridIdx % gridCols;
            const gridX = xStart + (xEnd - xStart) * (col / (gridCols - 1));
            const gridY = yStart + (yEnd - yStart) * (row / (gridRows - 1));
            // 在格點附近隨機微調，避免完全重疊
            const jitterX = (Math.random() - 0.5) * 0.04;
            const jitterY = (Math.random() - 0.5) * 0.04;
            const baseX = margin + (w - 2 * margin) * (gridX + jitterX);
            const baseY = margin + (h - 2 * margin) * (gridY + jitterY);
            // 隨機靈敏度（移動幅度）
            const sensX = 0.15 + 0.7 * Math.random();
            const sensY = 0.15 + 0.7 * Math.random();
            // 隨機方向（+1或-1）
            const dirX = Math.random() < 0.5 ? 1 : -1;
            const dirY = Math.random() < 0.5 ? 1 : -1;
            fishes.push({
                baseX, baseY, sensX, sensY, dirX, dirY, size,
                x: baseX, y: baseY, targetX: baseX, targetY: baseY
            });
        }
    }
    randomizeFishes();
    window.addEventListener('resize', function() {
        resizeCanvas();
        randomizeFishes();
    });
    // 修改 drawLittleFish 支援指定位置
    function drawLittleFish(progress, customX, customY, customSize) {
        if (progress <= 0) return;
        const w = canvas.width, h = canvas.height;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, progress));
        // 支援自訂 size
        const size = customSize !== undefined ? customSize : 0.025 * w;
        const bodySize = size * 2;
        // 限制魚中心點不超出畫面
        let centerX, centerY;
        if (customX !== undefined && customY !== undefined && customX !== null && customY !== null) {
            // 預留邊界：魚身體對角線一半
            const margin = bodySize * Math.SQRT2 / 2;
            centerX = Math.max(margin, Math.min(w - margin, customX));
            centerY = Math.max(margin, Math.min(h - margin, customY));
        } else {
            centerX = 0.72 * w + bodySize / 2 + fishX;
            centerY = 0.16 * h + bodySize / 2 + fishY;
        }
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 4); // 整體旋轉45度
        // 左上
        ctx.beginPath();
        ctx.rect(-size, -size, size, size);
        ctx.fillStyle = '#f7c873';
        ctx.fill();
        // 右上
        ctx.beginPath();
        ctx.rect(0, -size, size, size);
        ctx.fillStyle = '#f9e7b0';
        ctx.fill();
        // 左下
        ctx.beginPath();
        ctx.rect(-size, 0, size, size);
        ctx.fillStyle = '#f9e7b0';
        ctx.fill();
        // 右下
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        ctx.fillStyle = '#e6a23c';
        ctx.fill();
        ctx.restore();
        // 魚鰭（三角形，與身體邊線貼齊，縮小一點）
        const bodyDiag = bodySize / Math.SQRT2;
        const edge1x = centerX + bodyDiag / 2;
        const edge1y = centerY - bodyDiag / 2;
        const edge2x = centerX + bodyDiag;
        const edge2y = centerY;
        const finScale = 0.45; // 鰭縮小比例
        ctx.beginPath();
        ctx.moveTo(edge1x, edge1y);
        ctx.lineTo(edge1x + size * finScale, edge1y - size * finScale);
        ctx.lineTo(edge2x, edge2y);
        ctx.closePath();
        ctx.fillStyle = '#e6a23c';
        ctx.fill();
        // 右下三角鰭
        const edge3x = centerX + bodyDiag / 2;
        const edge3y = centerY + bodyDiag / 2;
        const edge4x = centerX + bodyDiag;
        const edge4y = centerY;
        ctx.beginPath();
        ctx.moveTo(edge3x, edge3y);
        ctx.lineTo(edge3x + size * finScale, edge3y + size * finScale);
        ctx.lineTo(edge4x, edge4y);
        ctx.closePath();
        ctx.fillStyle = '#e6a23c';
        ctx.fill();
        // 尾巴（三角形，較小，接在右側）
        ctx.beginPath();
        ctx.moveTo(centerX + bodyDiag, centerY);
        ctx.lineTo(centerX + bodyDiag + size * 0.7, centerY - size * 0.5);
        ctx.lineTo(centerX + bodyDiag + size * 0.7, centerY + size * 0.5);
        ctx.closePath();
        ctx.fillStyle = '#e6a23c';
        ctx.fill();
        ctx.restore();
    }

    function drawWave() {
        time += 0.01;
        horizontalOffset += waveParams.horizontalSpeed;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const totalWidth = Math.ceil(canvas.width * (1 + extensionFactor * 2));
        // === 多條波浪 ===
        for (let w = 0; w < numWaves; w++) {
            const wave = multiWaves[w];
            wave.baseAmplitude = 50 + (baseAmplitude - 50) * (0.7 + 0.3 * w / (numWaves - 1));
            wave.frequency = 0.001 + (waveParams.frequency - 0.001) * (0.7 + 0.3 * w / (numWaves - 1));
            wave.speed = 0.01 + (waveParams.speed - 0.01) * (0.7 + 0.3 * w / (numWaves - 1));
            const points = [];
            for (let i = 0; i < totalWidth; i++) {
                const x = i;
                const y = wave.verticalCenter + generateMultiWavePoint(x + horizontalOffset, time, horizontalOffset, wave);
                points[i] = y;
            }
            // 填色塊（海浪效果）
            drawSmoothWaveFilled(points, wave.color);
            // 若要同時保留線條可加下行
            // ctx.strokeStyle = wave.color; ctx.lineWidth = wave.lineWidth; drawSmoothWave(points);
        }
        // 畫14隻魚（每隻魚位置獨立、大小不同）
        for (let i = 0; i < fishCount; i++) {
            drawLittleFish(1, fishes[i].x, fishes[i].y, fishes[i].size);
        }
        requestAnimationFrame(drawWave);
    }

    window.addEventListener('resize', function() {
        resizeCanvas();
    });
    
    resizeCanvas();
    // 開始動畫循環
    requestAnimationFrame(drawWave);
    
    // === 優化：移除 WebSocket 相關程式碼，只保留 Web Serial API ===
    // === Web Serial API 連接 Arduino（單旋鈕控制，易於擴充） ===
    let serialPort, serialReader;
    const serialBtn = document.createElement('button');
    Object.assign(serialBtn.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1000
    });
    serialBtn.textContent = '連接 Arduino';
    document.body.appendChild(serialBtn);

    serialBtn.addEventListener('click', async () => {
        if (!('serial' in navigator)) {
            alert('此瀏覽器不支援 Web Serial API，請用 Chrome 或 Edge！');
            return;
        }
        try {
            serialPort = await navigator.serial.requestPort();
            await serialPort.open({ baudRate: 9600 });
            serialReader = serialPort.readable.getReader();
            serialBtn.textContent = '已連接';
            serialBtn.disabled = true;
            console.log('已連接 Arduino！');
            readSerialLoop();
        } catch (e) {
            alert('連接失敗：' + e);
        }
    });

    async function readSerialLoop() {
        let buffer = '';
        const decoder = new TextDecoder();
        while (serialPort && serialPort.readable) {
            try {
                const { value, done } = await serialReader.read();
                if (done) break;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    let lines = buffer.split(/\r?\n/);
                    buffer = lines.pop();
                    for (const line of lines) {
                        const rawValue = Number.parseInt(line.trim(), 10);
                        if (!Number.isNaN(rawValue)) {
                            // 讓一個旋鈕同時控制多個參數，讓波浪變化更豐富
                            baseAmplitude = 50 + (rawValue / 1023) * 150;
                            waveParams.frequency = 0.001 + (rawValue / 1023) * 0.004;
                            waveParams.speed = 0.01 + (rawValue / 1023) * 0.02;
                            // 每隻魚根據自己的靈敏度/方向計算目標位置
                            const percent = rawValue / 1023;
                            for (let i = 0; i < fishCount; i++) {
                                const f = fishes[i];
                                const w = canvas.width, h = canvas.height;
                                const size = f.size;
                                const bodySize = size * 2;
                                const margin = bodySize * Math.SQRT2 / 2;
                                // 移動幅度最大為畫面寬/高的 0.25，並考慮邊界
                                const maxX = (w - 2 * margin) * 0.25 * f.sensX;
                                const maxY = (h - 2 * margin) * 0.18 * f.sensY;
                                let tx = f.baseX + f.dirX * (percent - 0.5) * 2 * maxX;
                                let ty = f.baseY + f.dirY * (percent - 0.5) * 2 * maxY;
                                // 限制目標位置不超出畫面
                                tx = Math.max(margin, Math.min(w - margin, tx));
                                ty = Math.max(margin, Math.min(h - margin, ty));
                                f.targetX = tx;
                                f.targetY = ty;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('讀取序列埠失敗', e);
                break;
            }
        }
        if (serialReader) {
            await serialReader.releaseLock();
        }
    }

    // 幀間平滑移動每隻魚
    function smoothFishMove() {
        for (let i = 0; i < fishCount; i++) {
            const f = fishes[i];
            const w = canvas.width, h = canvas.height;
            const size = f.size;
            const bodySize = size * 2;
            const margin = bodySize * Math.SQRT2 / 2;
            // 平滑移動
            f.x += (f.targetX - f.x) * 0.08;
            f.y += (f.targetY - f.y) * 0.08;
            // 限制實際位置不超出畫面
            f.x = Math.max(margin, Math.min(w - margin, f.x));
            f.y = Math.max(margin, Math.min(h - margin, f.y));
        }
        requestAnimationFrame(smoothFishMove);
    }
    smoothFishMove();
});