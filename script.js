(function() {
    // Configurações do Canvas
    const canvas = document.getElementById('canvas-squares');
    let ctx = canvas.getContext('2d');
    
    // Array que armazenará os quadrados ativos
    let squares = [];
    
    // Configurações de spawn (quantos quadrados por frame? Controlado por taxa)
    let spawnCounter = 0;
    const SPAWN_INTERVAL_FRAMES = 18;   // A cada ~18 frames (ajustável)
    const MAX_SQUARES = 85;              // Máximo de quadrados simultâneos
    
    // Tamanho variável dos quadrados (entre min e max)
    const MIN_SIZE = 12;
    const MAX_SIZE = 45;
    
    // Velocidade de subida (pixels por segundo)
    const BASE_SPEED = 45;      // pixels/segundo
    const SPEED_VARIATION = 35; // variação adicional
    
    // Duração gradativa do fade-out / tempo de vida (segundos)
    const BASE_LIFE = 3.5;       // segundos até desaparecer completamente
    const LIFE_VARIATION = 2.2;   // variação
    
    // Rotação: velocidade angular (rad/s) aleatória
    const MIN_ROT_SPEED = -1.8;
    const MAX_ROT_SPEED = 1.8;
    
    // Cores: tons neutros, branco com variação sutil (sem luz neon)
    // Paleta: branco, cinza claro, prata suave, cinza médio, branco gelo
    const COLORS = [
        'rgba(255, 255, 255, 0.95)',
        'rgba(245, 245, 245, 0.9)',
        'rgba(230, 230, 230, 0.85)',
        'rgba(210, 210, 210, 0.8)',
        'rgba(200, 200, 200, 0.75)',
        'rgba(220, 220, 220, 0.9)',
        'rgba(240, 240, 240, 0.85)'
    ];
    
    // Função para ajustar o canvas ao tamanho da tela (responsivo)
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Gera um número aleatório entre min e max (inclusive)
    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // Seleciona uma cor aleatória da paleta
    function getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    // Classe Quadrado (simples, com propriedades de animação)
    class Square {
        constructor(x, y, size, speedY, lifeDuration, rotationSpeed, color) {
            this.x = x;                // posição X inicial
            this.y = y;                // posição Y inicial
            this.size = size;          // largura/altura
            this.speedY = speedY;      // velocidade vertical (px/s)
            this.rotation = randomRange(0, Math.PI * 2);  // ângulo inicial aleatório
            this.rotationSpeed = rotationSpeed;           // rad/s
            this.lifeDuration = lifeDuration;              // vida total (segundos)
            this.age = 0;              // idade atual (segundos)
            this.color = color;         // cor inicial (rgba)
            this.initialY = y;
        }
        
        // Atualiza posição, rotação e idade (dt em segundos)
        update(dt) {
            this.y += this.speedY * dt;
            this.rotation += this.rotationSpeed * dt;
            this.age += dt;
            return this.age < this.lifeDuration; // retorna true se ainda vivo
        }
        
        // Desenha o quadrado com transparência baseada no progresso do fade
        draw(ctx, canvasWidth) {
            // Calcula o fator de fade (1 -> totalmente opaco, 0 -> totalmente transparente)
            let lifeFactor = 1 - (this.age / this.lifeDuration);
            // Suavizar um pouco a curva (ease-out)
            let alpha = Math.pow(lifeFactor, 1.2);
            
            // Se o alpha for muito baixo, não desenha (otimização)
            if (alpha <= 0.02) return;
            
            // A cor base vinda da paleta extrai os componentes RGBA e ajusta o alpha
            // Vamos aplicar o alpha dinâmico sobre a cor escolhida
            ctx.save();
            ctx.translate(this.x + this.size/2, this.y + this.size/2);
            ctx.rotate(this.rotation);
            
            // Para utilizar o alpha dinâmico, é melhor definir um fillStyle com RGBA customizado
            // Como a paleta já contém alpha fixo, recombinamos com novo alpha baseado no fade
            // Extrair o tom RGB da cor da paleta (descartar alpha original)
            let tempColor = this.color;
            let rgbMatch = tempColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (rgbMatch) {
                let r = rgbMatch[1];
                let g = rgbMatch[2];
                let b = rgbMatch[3];
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                // fallback: branco puro com alpha
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            }
            
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }
    
    // Cria um novo quadrado com propriedades aleatórias
    function createSquare(canvasWidth, canvasHeight) {
        // Posição X: dentro das margens da tela (evita bordas muito extremas, mas pode)
        const margin = 20;
        const x = randomRange(margin, canvasWidth - margin);
        // Posição Y: começa na parte inferior da tela ou levemente abaixo (para dar sensação contínua)
        // Para efeito de subir, vamos iniciar da parte de baixo + um pouco aleatório
        let y = canvasHeight - randomRange(5, 25);
        // Alternativamente, também pode gerar alguns quadrados já na metade inferior? melhor da borda inferior mesmo.
        // Mas para ter variedade, alguns podem vir um pouco acima da borda inferior (natural)
        if (Math.random() > 0.6) {
            y = canvasHeight - randomRange(0, canvasHeight * 0.2);
        } else {
            y = canvasHeight + randomRange(-15, 15);
        }
        
        const size = randomRange(MIN_SIZE, MAX_SIZE);
        const speedY = - (BASE_SPEED + randomRange(-SPEED_VARIATION * 0.5, SPEED_VARIATION)); // negativo para subir
        const lifeDuration = randomRange(BASE_LIFE - LIFE_VARIATION*0.5, BASE_LIFE + LIFE_VARIATION);
        const rotationSpeed = randomRange(MIN_ROT_SPEED, MAX_ROT_SPEED);
        const color = getRandomColor();
        
        return new Square(x, y, size, speedY, lifeDuration, rotationSpeed, color);
    }
    
    // Inicialização: ajusta resolução e começa a animação
    function init() {
        resizeCanvas();
        // Preencher alguns quadrados iniciais para não ficar vazio
        for (let i = 0; i < 12; i++) {
            let newSquare = createSquare(canvas.width, canvas.height);
            // Variar idade para não nascerem todos sincronizados
            newSquare.age = Math.random() * newSquare.lifeDuration * 0.6;
            squares.push(newSquare);
        }
    }
    
    // Variáveis de controle de tempo para animação suave (delta time)
    let lastFrameTime = performance.now();
    
    // Função principal de animação
    function animate(now) {
        // Calcular delta time em segundos (limitado a 0.033 para evitar saltos grandes)
        let dt = Math.min(0.033, (now - lastFrameTime) / 1000);
        if (dt <= 0) {
            lastFrameTime = now;
            requestAnimationFrame(animate);
            return;
        }
        
        // ATUALIZAÇÃO DOS QUADRADOS:
        // 1. Atualizar cada quadrado (posição, rotação, idade)
        for (let i = squares.length-1; i >= 0; i--) {
            const square = squares[i];
            const isAlive = square.update(dt);
            if (!isAlive) {
                squares.splice(i,1);  // remove quadrado que desapareceu completamente
            }
        }
        
        // 2. Criar novos quadrados gradualmente (controle de spawn)
        // Usar um contador baseado em frames para não sobrecarregar
        spawnCounter++;
        if (spawnCounter >= SPAWN_INTERVAL_FRAMES && squares.length < MAX_SQUARES) {
            spawnCounter = 0;
            // Adicionar de 1 a 3 quadrados por vez
            let spawnCount = Math.min(3, MAX_SQUARES - squares.length);
            for (let i = 0; i < spawnCount; i++) {
                if (squares.length < MAX_SQUARES) {
                    let newSquare = createSquare(canvas.width, canvas.height);
                    squares.push(newSquare);
                } else {
                    break;
                }
            }
        }
        
        // Se estiver muito abaixo do máximo, aumentar um pouco a taxa opcionalmente
        if (squares.length < MAX_SQUARES * 0.4 && Math.random() < 0.1) {
            if (squares.length + 2 <= MAX_SQUARES) {
                for (let i = 0; i < 2; i++) {
                    squares.push(createSquare(canvas.width, canvas.height));
                }
            }
        }
        
        // LIMPEZA E DESENHO DO CANVAS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar todos os quadrados com sua rotação e fade gradativo
        for (let square of squares) {
            square.draw(ctx, canvas.width);
        }
        
        lastFrameTime = now;
        requestAnimationFrame(animate);
    }
    
    // Evento de resize: ajustar canvas e reposicionar quadrados de forma inteligente?
    // Ao redimensionar, mantemos os quadrados existentes, mas eventuais spawns futuros se adaptarão.
    window.addEventListener('resize', function() {
        resizeCanvas();
        // Opcional: reposicionar quadrados existentes para evitar que fiquem fora dos limites extremos horizontais
        // Para manter a experiência suave, apenas garante que a posição X não extrapole demais.
        for (let sq of squares) {
            if (sq.x < 0) sq.x = 10;
            if (sq.x + sq.size > canvas.width) sq.x = canvas.width - sq.size - 10;
            // não há necessidade extrema de ajustar Y pois eles sobem naturalmente
        }
    });
    
    // Iniciar tudo
    init();
    lastFrameTime = performance.now();
    requestAnimationFrame(animate);
    
    // Prevenir scroll indesejado (opcional)
    window.addEventListener('touchmove', function(e) {
        // sem ação, apenas mantém a tela navegável, mas sem interferir nos elementos
    }, { passive: false });
})();
