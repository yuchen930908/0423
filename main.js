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
    const numWaves = 20; // 你想要的波浪條數
    const multiWaves = [];
    for (let i = 0; i < numWaves; i++) {
        multiWaves.push({
            verticalCenter: window.innerHeight * (0.1 + 0.8 * i / (numWaves - 1)),
            baseAmplitude: 60 + Math.random() * 80,
            frequency: 0.001 + Math.random() * 0.004,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            color: `hsl(${180 + i * 8}, 70%, 50%)`,
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

    // 幾何小魚繪製（4正方形組成大正方形，整體旋轉45度，魚鰭為菱形，與身體邊線貼齊）
    function drawLittleFish(progress) {
        if (progress <= 0) return;
        const w = canvas.width, h = canvas.height;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, progress));
        // 小魚主體（4個正方形組成大正方形，整體旋轉45度）
        const size = 0.025 * w;
        const bodySize = size * 2;
        const centerX = 0.72 * w + bodySize / 2;
        const centerY = 0.16 * h + bodySize / 2;
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
        // 魚鰭（三角形，與身體邊線貼齊）
        // 右上鰭：與身體右上邊線貼齊
        // 右上邊線兩端點
        const bodyDiag = bodySize / Math.SQRT2;
        // 右上三角鰭
        const edge1x = centerX + bodyDiag / 2;
        const edge1y = centerY - bodyDiag / 2;
        const edge2x = centerX + bodyDiag;
        const edge2y = centerY;
        ctx.beginPath();
        ctx.moveTo(edge1x, edge1y);
        ctx.lineTo(edge1x + size * 0.7, edge1y - size * 0.7);
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
        ctx.lineTo(edge3x + size * 0.7, edge3y + size * 0.7);
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
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = wave.lineWidth;
            drawSmoothWave(points);
        }
        // === 幾何小魚浮現（橢圓身體+三角形鰭尾，無眼睛） ===
        drawLittleFish(1);
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
                            // 振幅 50~200
                            baseAmplitude = 50 + (rawValue / 1023) * 150;
                            // 頻率 0.001~0.005
                            waveParams.frequency = 0.001 + (rawValue / 1023) * 0.004;
                            // 速度 0.01~0.03
                            waveParams.speed = 0.01 + (rawValue / 1023) * 0.02;
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
});