const canvas = document.querySelector('canvas');
const paddleImg = document.querySelector('#paddle');
const bricksImg = document.querySelector('#bricks');
let animationFrame;

const ctx = canvas.getContext('2d');

canvas.width = 448;
canvas.height = 400;

// VARIABLES DE LA PELOTA
const ballRadius = 3;
// posicion de la pelota
let x = canvas.width / 2;
let y = canvas.height - 30;
// velocidad y direccion de la pelota
let dx = 3;
let dy = -3;

// VARIABLES DE LA PALETA
// alto y ancho de la paleta
const paddleHeight = 10;
const paddleWidth = 50;
// posicion inicial en en X y Y de la paleta
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 10;
// indica si la tecla derecha o izquierda fueron presionadas
let rightPressed = false;
let leftPressed = false;
// sensibilidad de la paleta
const PADDLE_SENSITIVITY = 4;

// VARIABLES DE LOS LADRILLOS
const brickRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 30;
const brickHeight = 14;
const brickPadding = 2;
const brickOffsetTop = 80;
const brickOffsetLeft = 16;
const bricks = [];

const BRICK_STATUS = {
    ACTIVE : 1,
    DESTROYED : 0
}

for ( let c = 0; c < brickColumnCount; c++ ){
    bricks[c] = [];
    for (let r=0; r<brickRowCount; r++){
        // calculamos la posicion del ladrillo en la pantalla
        const brickX = c * ( brickWidth + brickPadding ) + brickOffsetLeft;
        const brickY = r * ( brickHeight + brickPadding ) + brickOffsetTop;
        // asignar un color aleatorio a cada ladrillo
        const randomColor = Math.floor(Math.random() * 8);
        // guardamos la informacion de cada ladrillo
        bricks[c][r] = { 
            x: brickX, 
            y: brickY, 
            status: BRICK_STATUS.ACTIVE, 
            color: randomColor
        }
    }
}


function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.closePath();
};

function drawPaddle() {
    ctx.fillStyle = 'red';
    // ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.drawImage(
        paddleImg, // imagen
        94, // clipX: coordenadas de recorte
        228, // clipY: coordenadas de recorte
        32, // ancho del recorte
        8, // alto del recorte
        paddleX, // ubicacion del dibujo en X en canvas
        paddleY, // ubicacion del dibujo en Y en canvas
        paddleWidth + 5, // ancho del dibujo
        paddleHeight + 2 // alto del dibujo
    )
};

function drawBricks() {
    for ( let c = 0; c < brickColumnCount; c++ ){
        for (let r=0; r<brickRowCount; r++){
            const currentBrick = bricks[c][r];
            const { x, y, status, color } = currentBrick;
            if ( status.DESTROYED ) continue;
            // ctx.beginPath();
            // ctx.fillStyle = 'red';
            // ctx.rect(x, y, brickWidth, brickHeight);
            // ctx.strokeStyle = 'black';
            // ctx.stroke();
            // ctx.fill();
            // ctx.closePath();

            const brickX = color * 32; 
            ctx.drawImage(
                bricksImg,
                brickX,
                0,
                brickWidth,
                brickHeight,
                x,
                y,
                brickWidth,
                brickHeight
            )
        }
    }
};

function colisionDetection() {
    for ( let c = 0; c < brickColumnCount; c++ ){
        for (let r=0; r<brickRowCount; r++){
            const currentBrick = bricks[c][r];
            const { status, color } = currentBrick;
            if ( status.DESTROYED ) continue;
            const isBallSameXAsBrick = 
                x > currentBrick.x && 
                x < currentBrick.x + brickWidth;
            const isBallSameYAsBrick =
                y > currentBrick.y &&
                y < currentBrick.y + brickHeight;

            if( isBallSameXAsBrick && isBallSameYAsBrick ){
                currentBrick.status = { ACTIVE: 0, DESTROYED: 1 };
                dy = -dy;
            }
        }
    }
};

function ballMovement() {
    // rebotar las pelotas en los laterales
    if( x + dx > canvas.width - ballRadius || // pared derecha
        x + dx < ballRadius // pared izquierda
    ) {
        dx = -dx;
    }

    // rebotar en la parte superior
    if( y + dy < ballRadius ){
        dy = -dy;
    }

    // reiniciar juego cuando la pelota toca el suelo
    if( y + dy > canvas.height - ballRadius ){
        cancelAnimation();
        document.location.reload();
    }

    // la pelota toca la paleta
    if( x > paddleX && x < paddleX + 40 && y > paddleY  ){
        dy = -dy;
    }

    // mover la pelota
    x += dx;
    y += dy;
};

function paddleMovement() {
    if(rightPressed && paddleX < canvas.width - paddleWidth){
        paddleX += PADDLE_SENSITIVITY;
    }

    if(leftPressed && paddleX > 0 ){
        paddleX -= PADDLE_SENSITIVITY;
    }
};

function cleanCanvas() {
    // elimina los canvas creados desde la posicion 0 en X y 0 en Y
    // hasta el ancho maximo y el alto maximo del canvas. Osea todo el contenido del canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
        const { key } = event;
        if( key === 'Right' || key === 'ArrowRight' ){
            rightPressed = true;
        } else if ( key === 'Left' || key === 'ArrowLeft' ){
            leftPressed = true;
        }
    }

    function keyUpHandler(event) {
        const { key } = event;
        if( key === 'Right' || key === 'ArrowRight' ){
            rightPressed = false;
        } else if ( key === 'Left' || key === 'ArrowLeft' ){
            leftPressed = false;
        }
    }
}

function cancelAnimation() {
    window.cancelAnimationFrame(animationFrame);
}


function draw() {
    // limpiar dibujo anterior antes de uno nuevo
    cleanCanvas();

    // Dibujar los elementos
    drawBall();
    drawPaddle();
    drawBricks();

    // Colisiones y movimientos
    ballMovement();
    colisionDetection();
    paddleMovement();

    animationFrame = window.requestAnimationFrame(draw);
}
draw();
initEvents();