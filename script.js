* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    min-height: 100vh;
    background-color: black;
    overflow-x: hidden;
    position: relative;
    font-family: 'Arial', 'Segoe UI', 'Montserrat', sans-serif;
}

/* Container do título com linhas */
.title-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
    pointer-events: none;
    white-space: nowrap;
}

.line {
    height: 2px;
    background-color: white;
    margin: 20px auto;
    animation: subtlePulse 2.5s ease-in-out infinite;
}

.main-title {
    color: white;
    font-size: clamp(1.8rem, 8vw, 4rem);
    letter-spacing: 0.3em;
    font-weight: 600;
    text-transform: uppercase;
    background: linear-gradient(90deg, #fff, #aaa, #fff);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shimmer 4s linear infinite;
}

/* Linhas aumentadas - MAIORES */
.line-top, .line-bottom {
    width: 450px;        /* Aumentado de 280px para 450px */
    max-width: 90vw;
}

/* Animações sutis para linhas */
@keyframes subtlePulse {
    0%, 100% { opacity: 0.7; transform: scaleX(1); }
    50% { opacity: 1; transform: scaleX(1.05); }
}

@keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

/* Canvas para os quadrados */
#canvas-squares {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 1;
    pointer-events: none;
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
    .main-title {
        letter-spacing: 0.15em;
    }
    .line-top, .line-bottom {
        width: 300px;     /* Aumentado também para mobile */
    }
}

/* Efeito suave no texto */
.main-title {
    text-shadow: 0 0 5px rgba(255,255,255,0.3);
}
