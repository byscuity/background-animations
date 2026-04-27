(function() {
    // Configurações do Canvas
    const canvas = document.getElementById('canvas-squares');
    let ctx = canvas.getContext('2d');
    
    // Array que armazenará os quadrados ativos
    let squares = [];
    
    // Configurações de spawn - MENOS QUADRADOS
    let spawnCounter = 0;
    const SPAWN_INTERVAL_FRAMES = 25;   // Aumentado para spawn mais lento
    const MAX_SQUARES = 35;              // REDUZIDO: de 85 para 35 quadrados
    
    // Tamanho variável dos quadrados
    const MIN_SIZE = 10;
    const MAX_SIZE = 35;
    
    // Velocidade de subida - MAIS RÁPIDA
    const BASE_SPEED = 120;      // AUMENTADO: de 45 para 120 pixels/segundo
    const SPEED_VARIATION = 50;   // Aumentado para mais variação
    
    // Duração gradativa do fade-out - MAIS CURTA (desaparecem rápido)
    const BASE_LIFE = 1.8;        // REDUZIDO: de 3.5 para 1.8 segundos
    const LIFE_VARIATION = 0.8;    // Menos variação para manter velocidade consistente
    
    // Rotação: velocidade angular (rad/s) aleatória
    const MIN_ROT_SPEED = -2.5;
    const MAX_ROT_SPEED = 2.5;
    
    // Cores: tons neutros, branco com variação sutil (sem luz neon)
    const COLORS = [
        'rgba(255, 255, 255, 0.95)',
        'rgba(245, 245, 245, 0.9)',
        'rgba(230, 230, 230, 0.85)',
        'rgba(210, 210, 210, 0.8)',
        'rgba(200, 200, 200, 0.75)',
        'rgba(220, 220, 220, 0.9)',
        'rgba(240, 240, 240, 0.85)'
    ];
    
    // Função para ajustar o canvas ao tamanho da tela
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Gera um número aleatório entre min e max
    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // Seleciona uma cor aleatória da paleta
    function getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    // Classe Quadrado
    class Square {
        constructor(x, y, size, speedY, lifeDuration, rotationSpeed, color) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speedY = speedY;
            this.rotation = randomRange(0, Math.PI * 2);
            this.rotationSpeed = rotationSpeed;
            this.lifeDuration = lifeDuration;
            this.age = 0;
            this.color = color;
        }
        
        update(dt) {
            this.y += this.speedY * dt;
            this.rotation += this.rotationSpeed * dt;
            this.age += dt;
            return this.age < this.lifeDuration;
        }
        
        draw(ctx) {
            // Calcula o fator de fade (desaparecimento gradativo)
            let lifeFactor = 1 - (this.age / this.lifeDuration);
            let alpha = Math.pow(lifeFactor, 1.2);
            
            if (alpha <= 0.02) return;
            
            ctx.save();
            ctx.translate(this.x + this.size/2, this.y + this.size/2);
            ctx.rotate(this.rotation);
            
            let tempColor = this.color;
            let rgbMatch = tempColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (rgbMatch) {
                let r = rgbMatch[1];
                let g = rgbMatch[2];
                let b = rgbMatch[3];
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            }
            
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }
    
    // Cria um novo quadrado - EXCLUSIVAMENTE da PARTE INFERIOR da tela
    function createSquare(canvasWidth, canvasHeight) {
        // Posição X: em qualquer lugar horizontal
        const margin = 20;
        const x = randomRange(margin, canvasWidth - margin);
        
        // Posição Y: APENAS na parte inferior da tela
        // Garantindo que sempre comece na borda inferior ou bem próximo
        const y = canvasHeight - randomRange(0, 15);
        
        const size = randomRange(MIN_SIZE, MAX_SIZE);
        const speedY = - (BASE_SPEED + randomRange(-SPEED_VARIATION * 0.5, SPEED_VARIATION));
        const lifeDuration = randomRange(BASE_LIFE - LIFE_VARIATION*0.3, BASE_LIFE + LIFE_VARIATION);
        const rotationSpeed = randomRange(MIN_ROT_SPEED, MAX_ROT_SPEED);
        const color = getRandomColor();
        
        return new Square(x, y, size, speedY, lifeDuration, rotationSpeed, color);
    }
    
    // Inicialização
    function init() {
        resizeCanvas();
        // Apenas 3 quadrados iniciais (menos quadrados)
        for (let i = 0; i < 3; i++) {
            let newSquare = createSquare(canvas.width, canvas.height);
            newSquare.age = Math.random() * newSquare.lifeDuration * 0.5;
            squares.push(newSquare);
        }
    }
    
    let lastFrameTime = performance.now();
    
    // Função principal de animação
    function animate(now) {
        let dt = Math.min(0.033, (now - lastFrameTime) / 1000);
        if (dt <= 0) {
            lastFrameTime = now;
            requestAnimationFrame(animate);
            return;
        }
        
        // Atualizar quadrados
        for (let i = squares.length-1; i >= 0; i--) {
            const square = squares[i];
            const isAlive = square.update(dt);
            if (!isAlive) {
                squares.splice(i,1);
            }
        }
        
        // Controlar spawn - MENOS QUADRADOS
        spawnCounter++;
        if (spawnCounter >= SPAWN_INTERVAL_FRAMES && squares.length < MAX_SQUARES) {
            spawnCounter = 0;
            // Adicionar apenas 1 ou 2 quadrados por vez
            let spawnCount = Math.min(2, MAX_SQUARES - squares.length);
            for (let i = 0; i < spawnCount; i++) {
                if (squares.length < MAX_SQUARES) {
                    let newSquare = createSquare(canvas.width, canvas.height);
                    squares.push(newSquare);
                } else {
                    break;
                }
            }
        }
        
        // Limpar e desenhar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let square of squares) {
            square.draw(ctx);
        }
        
        lastFrameTime = now;
        requestAnimationFrame(animate);
    }
    
    // Evento de resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        // Reposicionar quadrados existentes que estejam fora dos limites
        for (let sq of squares) {
            if (sq.x < 0) sq.x = 10;
            if (sq.x + sq.size > canvas.width) sq.x = canvas.width - sq.size - 10;
        }
    });
    
    // Iniciar animação
    init();
    lastFrameTime = performance.now();
    requestAnimationFrame(animate);
    
})();
