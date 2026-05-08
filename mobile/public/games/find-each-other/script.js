// Find Each Other - Two friends adventure game
// A chick and a cat take turns completing levels to find each other

// Game configuration
let levelsPerPlayer = 3; // Default, can be changed in menu
let obstaclesPerLevel = 10; // Default, can be changed in menu (5, 10, or 15)
const CHARACTERS_ENGLISH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const CHARACTERS_POLISH = 'ABCDEFGHIJKLMNOPRSTUWYZ0123456789'.split('');

// Keyboard layout
const KEYBOARD_LAYOUT = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
    ['0','1','2','3','4','5','6','7','8','9']
];

// Players
const PLAYERS = {
    chick: { emoji: '🐥', name: { en: 'Chick', pl: 'Kurczak' } },
    cat: { emoji: '🐱', name: { en: 'Cat', pl: 'Kotek' } }
};

// Language detection
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    return browserLang.toLowerCase().startsWith('pl') ? 'polish' : 'english';
}

// Game state
let currentLanguage = detectLanguage();
let soundEnabled = true;
let gameStarted = false;
let currentPlayer = 'chick'; // 'chick' or 'cat'
let currentLevel = 1;
let currentObstacleIndex = 0;
let obstacles = [];
let isWalking = false;
let characterPosition = 0;
let preloadedLetterSounds = {};
let chickLevelsCompleted = 0;
let catLevelsCompleted = 0;

// Mobile detection
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let keyboardVisible = isMobile;

// UI Text
const UI_TEXT = {
    english: {
        title: 'Find Each Other!',
        storyText: 'Two best friends got separated! Help them find each other by typing the letters and numbers!',
        langLabel: 'Choose your language:',
        levelsLabel: 'How many levels?',
        obstaclesLabel: 'How many obstacles?',
        startButton: 'Start Adventure!',
        levelLabel: 'Level',
        pressLabel: 'Press:',
        levelComplete: '🎉 Level Complete! 🎉',
        levelCompleteMsg: 'Great job! Ready for the next level?',
        continueBtn: 'Continue',
        switchTitle: '🔄 Switch Players! 🔄',
        switchMsgTocat: "Now it's Cat's turn to find Chick!",
        switchMsgTochick: "Now it's Chick's turn to find Cat!",
        letsGo: "Let's Go!",
        reunionTitle: '🎊 REUNITED! 🎊',
        reunionMessage: 'The best friends found each other!',
        playAgain: 'Play Again!',
        soundOn: '🔊 Sound ON',
        soundOff: '🔇 Sound OFF',
        menu: 'Menu',
        showKeyboard: '⌨️ Show Keyboard',
        hideKeyboard: '⌨️ Hide Keyboard'
    },
    polish: {
        title: 'Znajdź Się!',
        storyText: 'Dwóch najlepszych przyjaciół się zgubiło! Pomóż im się odnaleźć wpisując litery i cyfry!',
        langLabel: 'Wybierz język:',
        levelsLabel: 'Ile poziomów?',
        obstaclesLabel: 'Ile przeszkód?',
        startButton: 'Rozpocznij Przygodę!',
        levelLabel: 'Poziom',
        pressLabel: 'Naciśnij:',
        levelComplete: '🎉 Poziom Ukończony! 🎉',
        levelCompleteMsg: 'Świetnie! Gotowy na następny poziom?',
        continueBtn: 'Kontynuuj',
        switchTitle: '🔄 Zmiana Graczy! 🔄',
        switchMsgTocat: 'Teraz kolej Kotka na szukanie Kurczaka!',
        switchMsgTochick: 'Teraz kolej Kurczaka na szukanie Kotka!',
        letsGo: 'Zaczynamy!',
        reunionTitle: '🎊 RAZEM! 🎊',
        reunionMessage: 'Najlepsi przyjaciele się odnaleźli!',
        playAgain: 'Zagraj Ponownie!',
        soundOn: '🔊 Dźwięk WŁ',
        soundOff: '🔇 Dźwięk WYŁ',
        menu: 'Menu',
        showKeyboard: '⌨️ Pokaż Klawiaturę',
        hideKeyboard: '⌨️ Ukryj Klawiaturę'
    }
};

function getUIText() {
    return currentLanguage === 'polish' ? UI_TEXT.polish : UI_TEXT.english;
}

function getCharacters() {
    return currentLanguage === 'polish' ? CHARACTERS_POLISH : CHARACTERS_ENGLISH;
}

// Sound functions
function preloadLetterSounds() {
    const symbols = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    preloadedLetterSounds = {};
    const langFolder = currentLanguage === 'polish' ? 'pl' : 'en';
    
    symbols.forEach(symbol => {
        const upper = symbol.toUpperCase();
        const path = `../assets/letters/${langFolder}/${langFolder}_${upper}.mp3`;
        const audio = new Audio(path);
        audio.preload = 'auto';
        preloadedLetterSounds[symbol] = audio;
    });
}

function playLetterSound(letter) {
    if (!soundEnabled || !letter) return;
    
    const symbol = letter.toLowerCase();
    const audio = preloadedLetterSounds[symbol];
    
    if (audio) {
        const clone = audio.cloneNode();
        clone.volume = 0.6;
        clone.play().catch(() => {});
    }
}

function playCorrectSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playWrongSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playSuccessSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    
    notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.2);
        
        oscillator.start(audioContext.currentTime + i * 0.12);
        oscillator.stop(audioContext.currentTime + i * 0.12 + 0.2);
    });
}

function playWalkSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playReunionSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const melody = [523, 587, 659, 698, 784, 880, 988, 1047];
    
    melody.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.25);
        
        oscillator.start(audioContext.currentTime + i * 0.15);
        oscillator.stop(audioContext.currentTime + i * 0.15 + 0.25);
    });
}

// Generate obstacles for a level
function generateObstacles() {
    const count = obstaclesPerLevel;
    const chars = getCharacters();
    obstacles = [];
    
    for (let i = 0; i < count; i++) {
        obstacles.push({
            character: chars[Math.floor(Math.random() * chars.length)],
            completed: false
        });
    }
}

// Update UI elements
function updateUI() {
    const t = getUIText();
    const player = PLAYERS[currentPlayer];
    const playerName = currentLanguage === 'polish' ? player.name.pl : player.name.en;
    
    // Player info
    document.getElementById('currentPlayerIcon').textContent = player.emoji;
    document.getElementById('playerName').textContent = playerName;
    
    // Switch character sprites
    const chickSprite = document.querySelector('.chick-sprite');
    const catSprite = document.querySelector('.cat-sprite');
    if (currentPlayer === 'chick') {
        chickSprite.style.display = 'block';
        catSprite.style.display = 'none';
    } else {
        chickSprite.style.display = 'none';
        catSprite.style.display = 'block';
    }
    
    // Level info
    document.getElementById('levelLabel').textContent = t.levelLabel;
    document.getElementById('currentLevel').textContent = currentLevel;
    document.getElementById('totalLevels').textContent = levelsPerPlayer;
    
    // Key display
    document.getElementById('currentKeyLabel').textContent = t.pressLabel;
    
    // Update progress bar
    updateProgressBar();
}

function selectLevels(count) {
    levelsPerPlayer = count;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.levels) === count);
    });
}

function selectObstacles(count) {
    obstaclesPerLevel = count;
    document.querySelectorAll('.obstacle-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.obstacles) === count);
    });
}

function updateProgressBar() {
    const progress = obstacles.length > 0 ? (currentObstacleIndex / obstacles.length) * 100 : 0;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function updateCurrentKey() {
    if (currentObstacleIndex < obstacles.length) {
        const currentChar = obstacles[currentObstacleIndex].character;
        document.getElementById('currentKey').textContent = currentChar;
        document.getElementById('obstacleLetter').textContent = currentChar;
        
        // Play the letter sound
        setTimeout(() => {
            playLetterSound(currentChar);
        }, 300);
    }
}

// Character movement with Mario-style camera
let cameraOffset = 0;
const CHARACTER_SCREEN_POS = 35; // Character stays at 35% of screen (center-left)
const TOTAL_SCROLL = 150; // Total scroll distance in percent

// Mobile responsive positions
function getCharacterScreenPos() {
    return window.innerWidth <= 480 ? 15 : CHARACTER_SCREEN_POS;
}

function getObstacleOffset() {
    return window.innerWidth <= 480 ? 35 : 8;
}

function setCharacterPosition(position) {
    characterPosition = position;
    const character = document.getElementById('character');
    const parallaxBg = document.getElementById('parallaxBg');
    const parallaxBgFar = document.getElementById('parallaxBgFar');
    
    // Progress goes from 0 to 1
    // Camera scrolls the world as character "moves"
    cameraOffset = position * TOTAL_SCROLL;
    
    // Move parallax backgrounds at different speeds (scrolling left = negative)
    if (parallaxBgFar) {
        parallaxBgFar.style.transform = `translateX(${-cameraOffset * 0.3}%)`;
    }
    if (parallaxBg) {
        parallaxBg.style.transform = `translateX(${-cameraOffset * 0.6}%)`;
    }
    
    // Move ground elements at 1x speed
    const groundScroll = document.getElementById('groundScroll');
    if (groundScroll) {
        groundScroll.style.transform = `translateX(${-cameraOffset}%)`;
    }
    
    // Character position on screen (stays fixed)
    character.style.left = `${getCharacterScreenPos()}%`;
}

function setObstaclePosition(obstacleProgress) {
    const obstacle = document.getElementById('obstacle');
    
    // Obstacle is placed in world at same progress as character target
    // obstacleProgress matches where character will walk to (0 to ~1)
    const obstacleWorldPos = obstacleProgress * TOTAL_SCROLL;
    
    // Screen position: character pos + distance ahead of camera
    // When camera reaches obstacle (cameraOffset = obstacleWorldPos), it's at CHARACTER_SCREEN_POS + small offset
    const OBSTACLE_OFFSET = 8; // Small offset so obstacle is slightly ahead of character
    const obstacleScreenPos = getCharacterScreenPos() + OBSTACLE_OFFSET + (obstacleWorldPos - cameraOffset);
    
    obstacle.style.left = `${obstacleScreenPos}%`;
}

function setGoalPosition() {
    const goalFlag = document.getElementById('goalFlag');
    if (!goalFlag) return;
    
    // Goal is at the very end (position = 1)
    const goalWorldPos = TOTAL_SCROLL;
    
    const OBSTACLE_OFFSET = 8;
    const goalScreenPos = getCharacterScreenPos() + OBSTACLE_OFFSET + (goalWorldPos - cameraOffset);
    
    goalFlag.style.left = `${goalScreenPos}%`;
}

function walkToNextObstacle() {
    if (currentObstacleIndex >= obstacles.length) {
        // Level complete - walk to goal
        walkToGoal();
        return;
    }
    
    // Update the key display BEFORE showing obstacle
    updateCurrentKey();
    
    const character = document.getElementById('character');
    const obstacle = document.getElementById('obstacle');
    
    // Fixed obstacle position: use responsive offset on mobile
    const obstacleFixedScreenPos = getCharacterScreenPos() + getObstacleOffset();
    
    // Show obstacle immediately at fixed position - no walking/camera movement
    // The jump animation will handle camera scrolling
    obstacle.classList.remove('destroyed');
    obstacle.style.display = 'flex';
    obstacle.style.left = `${obstacleFixedScreenPos}%`;
    obstacle.classList.add('active');
    isWalking = false;
}

function walkToGoal() {
    const character = document.getElementById('character');
    const obstacle = document.getElementById('obstacle');
    const goal = document.getElementById('goalFlag');
    
    obstacle.style.display = 'none';
    
    // Fixed goal position: use responsive offset on mobile
    const goalFixedScreenPos = getCharacterScreenPos() + getObstacleOffset();
    
    // Show goal immediately at fixed position (like obstacles)
    goal.style.display = 'flex';
    goal.style.left = `${goalFixedScreenPos}%`;
    
    // Short celebration delay then complete
    setTimeout(() => {
        playSuccessSound();
        setTimeout(() => {
            showLevelComplete();
        }, 500);
    }, 300);
}

function destroyObstacle() {
    const obstacle = document.getElementById('obstacle');
    const character = document.getElementById('character');
    
    obstacle.classList.remove('active');
    
    playCorrectSound();
    
    // Add jumping animation to character (only vertical movement via CSS)
    character.classList.add('jumping');
    
    // Jump phases:
    // - Start (0%): obstacle is ahead (to the right) of character
    // - Middle (50%): obstacle center is directly under character  
    // - End (100%): obstacle is behind (to the left) of character
    
    // The obstacle travels across the screen during the jump (using responsive offset)
    const obstacleOffset = getObstacleOffset();
    
    // Get the obstacle's current screen position as starting point
    const startScreenPos = getCharacterScreenPos() + obstacleOffset;
    const endScreenPos = getCharacterScreenPos() - obstacleOffset;
    
    // Camera scroll needed
    const OBSTACLE_TRAVEL = obstacleOffset * 2; // Total screen % the obstacle travels
    const startPos = characterPosition;
    const scrollAmount = OBSTACLE_TRAVEL / TOTAL_SCROLL;
    const endPos = startPos + scrollAmount;
    
    const duration = 700;
    const startTime = Date.now();
    
    function animateJump() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Linear progress - obstacle moves at constant speed
        // At 50% progress, obstacle is directly under character
        
        // Directly set obstacle screen position based on progress
        const obstacleScreenPos = startScreenPos + (endScreenPos - startScreenPos) * progress;
        obstacle.style.left = `${obstacleScreenPos}%`;
        
        // Update camera for background parallax
        const currentPos = startPos + (endPos - startPos) * progress;
        characterPosition = currentPos;
        cameraOffset = currentPos * TOTAL_SCROLL;
        
        // Scroll backgrounds
        const parallaxBgFar = document.getElementById('parallaxBgFar');
        const parallaxBg = document.getElementById('parallaxBg');
        const groundScroll = document.getElementById('groundScroll');
        
        if (parallaxBgFar) {
            parallaxBgFar.style.transform = `translateX(${-cameraOffset * 0.3}%)`;
        }
        if (parallaxBg) {
            parallaxBg.style.transform = `translateX(${-cameraOffset * 0.6}%)`;
        }
        if (groundScroll) {
            groundScroll.style.transform = `translateX(${-cameraOffset}%)`;
        }
        
        // Hide obstacle after it passes under character (past 65%)
        if (progress > 0.65 && !obstacle.classList.contains('destroyed')) {
            obstacle.classList.add('destroyed');
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateJump);
        } else {
            // Jump complete
            character.classList.remove('jumping');
            
            currentObstacleIndex++;
            updateProgressBar();
            
            // Short delay then walk to next obstacle
            setTimeout(() => {
                walkToNextObstacle();
            }, 200);
        }
    }
    
    animateJump();
}

// Key handling
function handleKeyPress(e) {
    if (!gameStarted) return;
    if (e.repeat) return;
    
    const key = e.key.toUpperCase();
    processKey(key);
}

function processKey(key) {
    if (!/^[A-Z0-9]$/.test(key)) return;
    if (currentObstacleIndex >= obstacles.length) return;
    
    const currentObstacle = obstacles[currentObstacleIndex];
    
    if (key === currentObstacle.character) {
        // Correct!
        currentObstacle.completed = true;
        destroyObstacle();
    } else {
        // Wrong key
        playWrongSound();
        const obstacle = document.getElementById('obstacle');
        obstacle.classList.add('wrong');
        setTimeout(() => {
            obstacle.classList.remove('wrong');
        }, 400);
        
        // Replay correct letter sound
        setTimeout(() => {
            playLetterSound(currentObstacle.character);
        }, 400);
    }
}

function handleVirtualKey(symbol) {
    if (!gameStarted) return;
    processKey(symbol);
}

// Screen management
function showScreen(screenId) {
    ['startScreen', 'gameContainer', 'levelCompleteScreen', 'playerSwitchScreen', 'reunionScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = id === screenId ? (id === 'gameContainer' ? 'block' : 'flex') : 'none';
        }
    });
}

function showLevelComplete() {
    const t = getUIText();
    const player = PLAYERS[currentPlayer];
    
    // Track completed level for current player
    if (currentPlayer === 'chick') {
        chickLevelsCompleted++;
    } else {
        catLevelsCompleted++;
    }
    
    // Check if game is complete
    const totalLevelsPlayed = getTotalLevelsPlayed();
    const isGameComplete = totalLevelsPlayed >= levelsPerPlayer * 2;
    
    // If game is complete, go directly to reunion (no popup)
    if (isGameComplete) {
        showReunion();
        return;
    }
    
    // Prepare next player info for the message
    const nextPlayer = currentPlayer === 'chick' ? 'cat' : 'chick';
    const nextLevel = nextPlayer === 'chick' ? chickLevelsCompleted + 1 : catLevelsCompleted + 1;
    const nextPlayerName = currentLanguage === 'polish' ? PLAYERS[nextPlayer].name.pl : PLAYERS[nextPlayer].name.en;
    
    document.getElementById('levelCompleteTitle').textContent = t.levelComplete;
    document.getElementById('levelCompleteCharacter').textContent = player.emoji;
    
    // Show who's next in the message
    const nextMsg = currentLanguage === 'polish' 
        ? `Następny: ${nextPlayerName} - ${t.levelLabel} ${nextLevel}`
        : `Next: ${nextPlayerName} - ${t.levelLabel} ${nextLevel}`;
    document.getElementById('levelCompleteMessage').textContent = nextMsg;
    document.getElementById('continueBtn').textContent = t.continueBtn;
    
    showScreen('levelCompleteScreen');
    
    // Auto-continue after 2 seconds
    setTimeout(() => {
        // Only continue if we're still on the level complete screen
        const levelCompleteScreen = document.getElementById('levelCompleteScreen');
        if (levelCompleteScreen && levelCompleteScreen.style.display !== 'none') {
            continueGame();
        }
    }, 2000);
}

function showPlayerSwitch() {
    const t = getUIText();
    const nextPlayer = currentPlayer === 'chick' ? 'cat' : 'chick';
    const nextLevel = nextPlayer === 'chick' ? chickLevelsCompleted + 1 : catLevelsCompleted + 1;
    
    document.getElementById('playerSwitchTitle').textContent = t.switchTitle;
    document.getElementById('switchChar1').textContent = PLAYERS[currentPlayer].emoji;
    document.getElementById('switchChar2').textContent = PLAYERS[nextPlayer].emoji;
    
    const playerName = currentLanguage === 'polish' ? PLAYERS[nextPlayer].name.pl : PLAYERS[nextPlayer].name.en;
    const switchMsg = `${playerName} - ${t.levelLabel} ${nextLevel}`;
    document.getElementById('playerSwitchMessage').textContent = switchMsg;
    
    const btn = document.querySelector('#playerSwitchScreen .continue-btn');
    if (btn) btn.textContent = t.letsGo;
    
    showScreen('playerSwitchScreen');
}

function showReunion() {
    const t = getUIText();
    
    document.getElementById('reunionTitle').textContent = t.reunionTitle;
    document.getElementById('reunionMessage').textContent = t.reunionMessage;
    
    const playAgainBtn = document.querySelector('#reunionScreen .play-again-btn');
    if (playAgainBtn) playAgainBtn.textContent = t.playAgain;
    
    showScreen('reunionScreen');
    
    playReunionSound();
    
    // Start reunion animation
    startReunionAnimation();
    
    // Big confetti!
    triggerBigConfetti();
}

function startReunionAnimation() {
    const chick = document.getElementById('reunionChick');
    const cat = document.getElementById('reunionCat');
    
    // They jump with joy!
    chick.classList.add('jumping');
    cat.classList.add('jumping');
}

// Confetti
function triggerBigConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const colors = ['#ff6b6b', '#ffd166', '#4ecdc4', '#ffe66d', '#ff9f1c', '#667eea', '#a855f7', '#f472b6'];
    const count = 200;
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 8 + Math.random() * 12;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * 1.4}px`;
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
        piece.style.setProperty('--r', `${Math.random() * 360}deg`);
        piece.style.setProperty('--d', `${1.5 + Math.random() * 1}s`);
        piece.style.setProperty('--delay', `${Math.random() * 0.5}s`);
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(piece);
    }
    
    // Keep adding confetti
    const interval = setInterval(() => {
        for (let i = 0; i < 20; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const size = 8 + Math.random() * 12;
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.4}px`;
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
            piece.style.setProperty('--r', `${Math.random() * 360}deg`);
            piece.style.setProperty('--d', `${1.5 + Math.random() * 1}s`);
            piece.style.setProperty('--delay', `0s`);
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(piece);
            
            setTimeout(() => {
                if (piece.parentNode) piece.remove();
            }, 3000);
        }
    }, 500);
    
    // Stop after a while
    setTimeout(() => {
        clearInterval(interval);
    }, 5000);
}

// Game flow
function startGame() {
    preloadLetterSounds();
    
    // Randomly select first character
    currentPlayer = Math.random() < 0.5 ? 'chick' : 'cat';
    currentLevel = 1;
    gameStarted = true;
    
    startLevel();
}

function startLevel() {
    generateObstacles();
    currentObstacleIndex = 0;
    characterPosition = 0;
    cameraOffset = 0;
    
    // Reset character position and camera
    setCharacterPosition(0);
    
    // Hide obstacle and goal initially
    const obstacle = document.getElementById('obstacle');
    obstacle.style.display = 'none';
    obstacle.classList.remove('active', 'destroyed', 'wrong');
    
    const goal = document.getElementById('goalFlag');
    goal.style.display = 'none';
    
    showScreen('gameContainer');
    updateUI();
    
    // Start walking after a short delay
    setTimeout(() => {
        walkToNextObstacle();
    }, 500);
}

function continueGame() {
    // Check if game is complete (both players finished all levels)
    // Total levels = levelsPerPlayer * 2 (for both players)
    const totalLevelsPlayed = getTotalLevelsPlayed();
    
    if (totalLevelsPlayed >= levelsPerPlayer * 2) {
        // Both players done - reunion!
        showReunion();
    } else {
        // Go directly to next player's level (no switch popup)
        startNextPlayer();
    }
}

function getTotalLevelsPlayed() {
    // Calculate based on current state after completing a level
    // Each player alternates, so we track by round number
    return chickLevelsCompleted + catLevelsCompleted;
}

function startNextPlayer() {
    // Switch to other player
    currentPlayer = currentPlayer === 'chick' ? 'cat' : 'chick';
    
    // Update level number based on completed levels for this player
    if (currentPlayer === 'chick') {
        currentLevel = chickLevelsCompleted + 1;
    } else {
        currentLevel = catLevelsCompleted + 1;
    }
    
    startLevel();
}

function restartGame() {
    // Randomly select first character for next game
    currentPlayer = Math.random() < 0.5 ? 'chick' : 'cat';
    currentLevel = 1;
    currentObstacleIndex = 0;
    obstacles = [];
    gameStarted = false;
    chickLevelsCompleted = 0;
    catLevelsCompleted = 0;
    
    // Clear confetti
    const container = document.getElementById('confettiContainer');
    if (container) container.innerHTML = '';
    
    showScreen('startScreen');
    updateStartScreenStrings();
}

function goHome() {
    gameStarted = false;
    showScreen('startScreen');
    updateStartScreenStrings();
}

// Language and settings
function selectLanguage(lang) {
    currentLanguage = lang;
    
    document.getElementById('langPolish').classList.toggle('active', lang === 'polish');
    document.getElementById('langEnglish').classList.toggle('active', lang === 'english');
    
    updateStartScreenStrings();
    preloadLetterSounds();
}

function updateStartScreenStrings() {
    const t = getUIText();
    
    document.querySelector('.start-screen h1').textContent = t.title;
    document.getElementById('storyText').textContent = t.storyText;
    document.getElementById('startLangLabel').textContent = t.langLabel;
    document.getElementById('startLevelsLabel').textContent = t.levelsLabel;
    document.getElementById('startObstaclesLabel').textContent = t.obstaclesLabel;
    document.getElementById('startBtn').textContent = t.startButton;
    
    updateSoundButton();
    updateKeyboardButton();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
}

function updateSoundButton() {
    const t = getUIText();
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? t.soundOn : t.soundOff;
    }
}

function toggleKeyboard() {
    keyboardVisible = !keyboardVisible;
    updateKeyboardButton();
}

function updateKeyboardButton() {
    const t = getUIText();
    const btn = document.getElementById('keyboardToggle');
    if (btn) {
        btn.textContent = keyboardVisible ? t.hideKeyboard : t.showKeyboard;
        btn.style.display = isMobile ? 'none' : 'block';
    }
    
    const keyboard = document.getElementById('onScreenKeyboard');
    if (keyboard) {
        keyboard.style.display = keyboardVisible ? 'flex' : 'none';
    }
}

function renderKeyboard() {
    const keyboard = document.getElementById('onScreenKeyboard');
    if (!keyboard) return;
    
    keyboard.innerHTML = '';
    keyboard.style.display = keyboardVisible ? 'flex' : 'none';
    
    KEYBOARD_LAYOUT.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'key-row';
        row.forEach(symbol => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';
            btn.textContent = symbol;
            btn.setAttribute('aria-label', symbol);
            btn.addEventListener('click', () => handleVirtualKey(symbol));
            rowEl.appendChild(btn);
        });
        keyboard.appendChild(rowEl);
    });
}

// Initialize
document.addEventListener('keydown', handleKeyPress);
renderKeyboard();
selectLanguage(currentLanguage);
updateStartScreenStrings();
showScreen('startScreen');
