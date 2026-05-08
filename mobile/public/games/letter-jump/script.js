// 100 Polish child-friendly words (3-7 characters) without special characters
const WORDS_POLISH = [
    "KOT", "PIES", "DOM", "MYSZ", "LAS", "NOS", "OKO", "UCHO", "BUT", "SOK",
    "SER", "PTAK", "LIS", "RZEKA", "RAK", "BYK", "DNO", "OGON", "SUM", "PILOT",
    "MAMA", "TATA", "BRAT", "KURA", "RYBA", "KOZA", "OWCA", "DZIURA", "NOGA", "STOPA",
    "LODY", "TORT", "MAPA", "KULA", "LATO", "ZIMA", "WODA", "NIEBO", "SOWA", "SOSNA",
    "LAMPA", "DRZWI", "KRZAK", "WRAK", "OKNO", "KLUCZ", "KUNA", "CHLEB", "WOREK", "JOGURT",
    "MOTYL", "ZEBRA", "TYGRYS", "PINGWIN", "DELFIN", "KANGUR", "PAPUGA", "CHOMIK", "KACZKA",
    "MARS", "JOWISZ", "GWIAZDA", "CHMURA", "DESZCZ", "KLAMKA", "WIATR",
    "POMIDOR", "ORZECH", "GRUSZA", "PAPRYKA", "SIOSTRA", "KWIATY", "TO", "JAJKO",
    "ARBUZ", "MELON", "ANANAS", "CYTRYNA", "TRAWA", "KWIAT", "LISTEK",
    "ZAMEK", "PLAC", "MOSTEK", "PLECAK", "KREDKA", "BALON", "LALKA", "MISIO",
    "ZIMNO", "TALERZ", "KOC", "MOC", "KUBEK", "FOTEL", "NOS", "SZAFA",
    "BUTY", "CZAPKA", "KURTKA", "SPODNIE", "SKARPETY", "BAJKA", "PIESKI"
];

// 100 English child-friendly words (3-7 characters)
const WORDS_ENGLISH = [
    "CAT", "DOG", "SUN", "HAT", "BAT", "PIG", "COW", "HEN", "BEE", "ANT",
    "OWL", "FOX", "BOX", "TOY", "JOY", "BOY", "CUP", "MUG", "RUG", "BUG",
    "HUG", "RED", "BED", "PEN", "TEN", "NET", "PET", "SET", "WET", "JET",
    "BUS", "RUN", "FUN", "NUT", "CUT", "HUT", "TOP", "POP", "HOP", "MOP",
    "HOT", "POT", "NOT", "DOT", "MAP", "CAP", "TAP", "NAP", "ZAP", "LAP",
    "FROG", "DUCK", "BIRD", "FISH", "BEAR", "LION", "WOLF", "DEER", "SEAL", "CRAB",
    "STAR", "MOON", "TREE", "LEAF", "RAIN", "SNOW", "WIND", "HILL", "LAKE", "POND",
    "CAKE", "MILK", "RICE", "SOUP", "BEAN", "CORN", "PLUM", "PEAR", "KIWI", "LIME",
    "BALL", "DOLL", "KITE", "DRUM", "BELL", "BOOK", "DESK", "LAMP", "DOOR", "WALL",
    "SHOE", "SOCK", "COAT", "RING", "CROWN", "SMILE", "HAPPY", "SUNNY", "CLOUD", "HEART"
];

let WORDS = [];
let currentLanguage = 'english';
let currentMode = 'mixed';
let currentWordIndex = 0;
let currentLetterIndex = 0;
let soundEnabled = true;
let gameStarted = false;
let preloadedLetterFallback = {};
let activeLetterAudioTag = null;
let letterSoundTimeout = null;
let effectDataUris = {};
let activeEffectAudio = null;
let effectEndTimer = null;
let isTransitioning = false;
let inputLocked = false;
let lockedKeyCode = null;
let lockReleaseFallback = null;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let keyboardVisible = isMobile;

const UI_TEXT = {
    english: {
        wordLabel: 'Word',
        instruction: 'Type the highlighted letter!',
        tapHint: '👆 Tap the keys to type!',
        startLangLabel: 'Choose your language:',
        startModeLabel: 'Choose a mode:',
        startButton: 'Start!',
        homeButton: 'Menu',
        modeLetters: 'Letters',
        modeDigits: 'Digits',
        modeMixed: 'Mixed',
        celebration: '⭐ GREAT! ⭐',
        soundOn: '🔊 Sound ON',
        soundOff: '🔇 Sound OFF',
        keyboardShow: '⌨️ Show Keyboard',
        keyboardHide: '⌨️ Hide Keyboard',
        completeAlert: '🎉 Congratulations! You completed all words! 🎉\nFinal Score: ',
        finishTitle: '🎉 GREAT JOB! 🎉',
        finishButton: 'Play Again'
    },
    polish: {
        wordLabel: 'Słowo',
        instruction: 'Naciśnij podświetloną literę!',
        tapHint: '👆 Stukaj w klawisze, aby pisać!',
        startLangLabel: 'Wybierz język:',
        startModeLabel: 'Wybierz tryb:',
        startButton: 'Start!',
        homeButton: 'Menu',
        modeLetters: 'Litery',
        modeDigits: 'Cyfry',
        modeMixed: 'Mieszany',
        celebration: '⭐ BRAWO! ⭐',
        soundOn: '🔊 Dźwięk WŁ',
        soundOff: '🔇 Dźwięk WYŁ',
        keyboardShow: '⌨️ Pokaż klawiaturę',
        keyboardHide: '⌨️ Ukryj klawiaturę',
        completeAlert: '🎉 Brawo! Ukończyłeś wszystkie słowa! 🎉\nWynik końcowy: ',
        finishTitle: '🎉 ŚWIETNA ROBOTA! 🎉',
        finishButton: 'Zagraj ponownie'
    }
};

const KEYBOARD_LAYOUT = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
    ['0','1','2','3','4','5','6','7','8','9']
];

const EFFECT_DEFS = {
    positive: { duration: 0.45 },
    correct: { duration: 0.32 },
    wrong: { duration: 0.42 },
    success: { duration: 0.75 }
};
const EFFECT_SAMPLE_RATE = 44100;

function buildEffectAudioData() {
    effectDataUris = {
        positive: generateEffectDataUri('positive', EFFECT_SAMPLE_RATE),
        correct: generateEffectDataUri('correct', EFFECT_SAMPLE_RATE),
        wrong: generateEffectDataUri('wrong', EFFECT_SAMPLE_RATE),
        success: generateEffectDataUri('success', EFFECT_SAMPLE_RATE)
    };
}

function generateEffectDataUri(type, sampleRate) {
    const samples = generateEffectSamples(type, sampleRate);
    if (!samples) return null;
    return pcmToWavBase64(samples, sampleRate);
}

function generateEffectSamples(type, sampleRate) {
    const twoPi = Math.PI * 2;
    const makeArray = (duration) => new Float32Array(Math.floor(duration * sampleRate));
    const addSine = (data, start, duration, freqFrom, freqTo, amp) => {
        const len = Math.floor(duration * sampleRate);
        let phase = 0;
        for (let i = 0; i < len && (start + i) < data.length; i++) {
            const t = i / len;
            const freq = freqFrom + (freqTo - freqFrom) * t;
            phase += twoPi * freq / sampleRate;
            const env = amp * (1 - t) * (1 - t);
            data[start + i] += Math.sin(phase) * env;
        }
    };
    const addSaw = (data, start, duration, freqFrom, freqTo, amp) => {
        const len = Math.floor(duration * sampleRate);
        let phase = 0;
        for (let i = 0; i < len && (start + i) < data.length; i++) {
            const t = i / len;
            const freq = freqFrom + (freqTo - freqFrom) * t;
            phase += freq / sampleRate;
            const env = amp * (1 - t) * (1 - t);
            const frac = phase - Math.floor(phase);
            const sample = (2 * frac - 1) * env;
            data[start + i] += sample;
        }
    };

    switch(type) {
        case 'positive': {
            const dur = EFFECT_DEFS.positive.duration;
            const data = makeArray(dur);
            addSine(data, 0, dur, 520, 980, 0.35);
            return data;
        }
        case 'correct': {
            const dur = EFFECT_DEFS.correct.duration;
            const data = makeArray(dur);
            addSine(data, 0, dur, 523, 659, 0.32);
            return data;
        }
        case 'wrong': {
            const dur = EFFECT_DEFS.wrong.duration;
            const data = makeArray(dur);
            addSaw(data, 0, dur, 200, 90, 0.28);
            return data;
        }
        case 'success': {
            const dur = EFFECT_DEFS.success.duration;
            const data = makeArray(dur);
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const start = Math.floor(i * 0.12 * sampleRate);
                addSine(data, start, 0.18, freq, freq, 0.28);
            });
            return data;
        }
        default:
            return null;
    }
}

function pcmToWavBase64(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // audio format PCM
    view.setUint16(22, 1, true); // channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
    view.setUint16(32, 2, true); // block align (channels * bytes per sample)
    view.setUint16(34, 16, true); // bits per sample

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // PCM samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    // Convert to Base64 data URI
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:audio/wav;base64,${base64}`;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildRandomDigitsPool(count = 40) {
    const values = new Set();
    while (values.size < count) {
        const len = 1 + Math.floor(Math.random() * 5); // 1-5 digits
        let num = '';
        for (let i = 0; i < len; i++) {
            const digit = i === 0 && len > 1 ? (1 + Math.floor(Math.random() * 9)) : Math.floor(Math.random() * 10);
            num += digit.toString();
        }
        values.add(num);
    }
    return Array.from(values);
}

function getWordPoolForMode(language, mode) {
    const base = language === 'polish' ? [...WORDS_POLISH] : [...WORDS_ENGLISH];
    const lettersOnly = base.filter(word => /^[A-Z]+$/.test(word));
    const digitsPool = buildRandomDigitsPool();
    if (mode === 'letters') return lettersOnly;
    if (mode === 'digits') return digitsPool;
    const mixedPool = [...lettersOnly];
    mixedPool.push(...digitsPool);
    return mixedPool;
}

function selectWordsForMode(language, mode) {
    const pool = getWordPoolForMode(language, mode);
    if (!pool.length) return [];
    const copy = shuffleArray([...pool]);
    return copy.slice(0, Math.min(10, copy.length));
}

// Screen-wide confetti overlay
let confettiEl = null;
function setupConfetti() {
    confettiEl = document.getElementById('confettiScreen');
}

function triggerConfetti() {
    if (!confettiEl) return;
    const colors = ['#ff6b6b', '#ffd166', '#4ecdc4', '#ffe66d', '#ff9f1c'];
    const count = 70;
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 6 + Math.random() * 8;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * 1.4}px`;
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
        piece.style.setProperty('--r', `${Math.random() * 360}deg`);
        piece.style.setProperty('--d', `${0.85 + Math.random() * 0.4}s`);
        piece.style.setProperty('--delay', `${Math.random() * 0.15}s`);
        piece.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
        confettiEl.appendChild(piece);
        const total = 1200;
        setTimeout(() => {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        }, total);
    }
}

// Sound generation functions
function playSound(type) {
    playEffectNow(type);
}

function playEffectNow(type, onDone) {
    if (!soundEnabled) {
        if (onDone) onDone();
        return 0;
    }

    if (type !== 'wrong') {
        stopWrongSound();
    }

    if (!effectDataUris[type]) {
        buildEffectAudioData();
    }
    const uri = effectDataUris[type];
    if (!uri) {
        if (onDone) onDone();
        return 0.2;
    }

    if (activeEffectAudio) {
        activeEffectAudio.onended = null;
        activeEffectAudio.onerror = null;
        try { activeEffectAudio.pause(); } catch (_) {}
    }
    if (effectEndTimer) {
        clearTimeout(effectEndTimer);
        effectEndTimer = null;
    }

    const audio = new Audio(uri);
    audio.volume = 0.6;

    const baseDur = EFFECT_DEFS[type]?.duration || 0.6;
    // Use a padded guard to avoid mobile browsers firing the queue before audio really ends.
    const padded = Math.max(baseDur + (isMobile ? 0.35 : 0.15), 0.8);
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        if (effectEndTimer) {
            clearTimeout(effectEndTimer);
            effectEndTimer = null;
        }
        if (audio === activeEffectAudio) {
            activeEffectAudio = null;
        }
        if (onDone) onDone();
    };

    activeEffectAudio = audio;
    audio.onended = finish;
    audio.onerror = finish;
    effectEndTimer = setTimeout(finish, padded * 1000);
    audio.play().catch(finish);

    return padded;
}

function stopWrongSound() {
    if (activeEffectAudio) {
        try { activeEffectAudio.pause(); } catch (_) {}
        activeEffectAudio = null;
    }
    if (effectEndTimer) {
        clearTimeout(effectEndTimer);
        effectEndTimer = null;
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();
}

// Preload all letter sounds for current language
function preloadLetterSounds() {
    const symbols = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    preloadedLetterFallback = {};

    const langFolder = currentLanguage === 'polish' ? 'pl' : 'en';
    const letterBasePath = (symbol) => {
        const upper = symbol.toUpperCase();
        return `../assets/letters/${langFolder}/${langFolder}_${upper}.mp3`;
    };

    symbols.forEach(symbol => {
        const path = letterBasePath(symbol);
        const audioTag = new Audio(path);
        audioTag.preload = 'auto';
        preloadedLetterFallback[symbol] = audioTag;
    });
}

// Play letter audio file (direct)
function playLetterSound(letter) {
    if (!soundEnabled || !letter) return;
    playLetterNow(letter);
}

function playLetterNow(letter, onDone) {
    if (!soundEnabled || !letter) {
        if (onDone) onDone();
        return;
    }

    const symbol = letter.toLowerCase();

    const finish = () => {
        if (onDone) onDone();
    };

    const tag = preloadedLetterFallback[symbol];
    if (activeLetterAudioTag) {
        activeLetterAudioTag.pause();
        activeLetterAudioTag.currentTime = 0;
        activeLetterAudioTag = null;
    }
    if (tag) {
        const clone = tag.cloneNode();
        clone.volume = 0.6;
        activeLetterAudioTag = clone;
        //const finishTimer = setTimeout(finish, 1200);
        clone.play().catch(() => {
            //clearTimeout(finishTimer);
            finish();
        });
        clone.onended = () => {
            //clearTimeout(finishTimer);
            if (activeLetterAudioTag === clone) activeLetterAudioTag = null;
            finish();
        };
    } else {
        finish();
    }
}

function cancelLetterSoundQueue() {
    if (letterSoundTimeout) {
        clearTimeout(letterSoundTimeout);
        letterSoundTimeout = null;
    }
}

function queueLetterSound(letter, delay = 0) {
    cancelLetterSoundQueue();
    if (!letter) return;
    if (delay <= 0) {
        playLetterSound(letter);
        return;
    }
    letterSoundTimeout = setTimeout(() => {
        playLetterSound(letter);
        letterSoundTimeout = null;
    }, delay);
}

function focusMobileInput() {
    // No-op: we now use the built-in on-screen keyboard to avoid showing the system keyboard.
}

function startGame(language) {
    if (language) currentLanguage = language;
    WORDS = selectWordsForMode(currentLanguage, currentMode);
    if (!WORDS.length) {
        alert('No words available for this selection.');
        return;
    }
    
    buildEffectAudioData();
    
    // Preload letter sounds
    preloadLetterSounds();
    
    document.getElementById('startScreen').style.display = 'none';
    
    gameStarted = true;
    currentWordIndex = 0;
    currentLetterIndex = 0;
    document.getElementById('level').textContent = 1;
    document.getElementById('levelTotal').textContent = WORDS.length;
    updateUIStrings();
    
    // Show tap hint on mobile
    if (isMobile) {
        document.getElementById('tapHint').classList.add('show');
    }
    
    renderWord();
    updateHeight();
    renderKeyboard();
}

function renderWord() {
    const word = WORDS[currentWordIndex];
    const display = document.getElementById('wordDisplay');
    
    display.innerHTML = '';
    display.classList.remove('exit-down', 'enter-from-top', 'shake');
    
    // Create letter platforms
    word.split('').forEach((letter, index) => {
        const platform = document.createElement('div');
        platform.className = 'letter-platform';
        platform.id = `letter-${index}`;
        platform.textContent = letter;
        
        if (index < currentLetterIndex) {
            platform.classList.add('completed');
        } else if (index === currentLetterIndex) {
            platform.classList.add('current');
        }
        
        display.appendChild(platform);
    });

    // Add chick (hidden initially)
    const chickContainer = document.createElement('div');
    chickContainer.className = 'chick-container hidden';
    chickContainer.id = 'chickContainer';
    chickContainer.innerHTML = `
        <div class="chick" id="chick">
            <div class="chick-body">
                <div class="chick-belly"></div>
                <div class="chick-eye left"></div>
                <div class="chick-eye right"></div>
                <div class="chick-beak"></div>
                <div class="chick-cheek left"></div>
                <div class="chick-cheek right"></div>
            </div>
            <div class="chick-wing left"></div>
            <div class="chick-wing right"></div>
            <div class="chick-feet">
                <div class="chick-foot"></div>
                <div class="chick-foot"></div>
            </div>
        </div>
    `;
    display.appendChild(chickContainer);

    // Position chick first, then show with animation
    setTimeout(() => {
        positionChick();
        
        const container = document.getElementById('chickContainer');
        const chick = document.getElementById('chick');
        
        if (container && chick) {
            container.classList.remove('hidden');
            chick.classList.add('drop-in');
            
            setTimeout(() => {
                const firstPlatform = document.getElementById('letter-0');
                if (firstPlatform) {
                    firstPlatform.classList.add('bounce');
                    setTimeout(() => firstPlatform.classList.remove('bounce'), 300);
                }
                if (chick) chick.classList.remove('drop-in');
                
                // Play the first letter sound after chick lands
                queueLetterSound(word[0]);
            }, 500);
        }
    }, 100);
}

function positionChick() {
    const currentPlatform = document.getElementById(`letter-${currentLetterIndex}`);
    const chickContainer = document.getElementById('chickContainer');
    
    if (currentPlatform && chickContainer) {
        const platformRect = currentPlatform.getBoundingClientRect();
        const displayRect = document.getElementById('wordDisplay').getBoundingClientRect();
        const chickWidth = chickContainer.offsetWidth || 60;
        const chickHeight = chickContainer.offsetHeight || 55;
        // Center horizontally over the target platform
        chickContainer.style.left = (platformRect.left - displayRect.left + (platformRect.width - chickWidth) / 2) + 'px';
        // Place the chick so its feet sit just inside the top of the platform, even when wrapped to new rows
        const perchOffset = Math.min(platformRect.height * 0.12, 12);
        const chickTop = (platformRect.top - displayRect.top) + perchOffset - chickHeight;
        chickContainer.style.top = `${chickTop}px`;
        chickContainer.style.bottom = 'auto';
    }
}

function handleKeyPress(e) {
    if (!gameStarted || isTransitioning) {
        return;
    }
    if (e.repeat) {
        return;
    }
    if (inputLocked) {
        return;
    }
    inputLocked = true;
    lockedKeyCode = e.code;
    // Safety: if keyup is missed, auto-unlock after short delay
    clearTimeout(lockReleaseFallback);
    lockReleaseFallback = setTimeout(() => {
        inputLocked = false;
        lockedKeyCode = null;
    }, 400);
    processKey(e);
}

function handleKeyUp(e) {
    if (inputLocked && (!lockedKeyCode || lockedKeyCode === e.code)) {
        inputLocked = false;
        lockedKeyCode = null;
        clearTimeout(lockReleaseFallback);
    }
}

// Don't process if transitioning between words
function processKey(e) {
    if (isTransitioning) return;
    
    const key = e.key.toUpperCase();
    const word = WORDS[currentWordIndex];
    if (!/^[A-Z0-9]$/.test(key)) return;
    
    if (!word) return;
    
    const expectedLetter = word[currentLetterIndex];
    const chick = document.getElementById('chick');
    const currentPlatform = document.getElementById(`letter-${currentLetterIndex}`);
    const wordDisplay = document.getElementById('wordDisplay');

    // Guard check - make sure elements exist
    if (!chick || !currentPlatform || !wordDisplay) return;

    // Hide tap hint after first interaction
    document.getElementById('tapHint').classList.remove('show');

    if (key === expectedLetter) {
        stopWrongSound();
        playSound('positive');
        currentPlatform.classList.remove('current');
        currentPlatform.classList.add('completed');
        triggerConfetti();
        
        // Add shake to word display
        wordDisplay.classList.add('shake');
        setTimeout(() => wordDisplay.classList.remove('shake'), 400);
        
        chick.classList.add('jumping');
        setTimeout(() => chick.classList.remove('jumping'), 400);
        
        // Add bounce to the platform being landed on
        if (currentLetterIndex + 1 < word.length) {
            const nextPlatform = document.getElementById(`letter-${currentLetterIndex + 1}`);
            if (nextPlatform) {
                setTimeout(() => {
                    nextPlatform.classList.add('bounce');
                    setTimeout(() => nextPlatform.classList.remove('bounce'), 300);
                }, 200);
            }
        }
        
        currentLetterIndex++;

        if (currentLetterIndex >= word.length) {
            // Word complete!
            wordComplete();
        } else {
            // Move to next letter
            const nextPlatform = document.getElementById(`letter-${currentLetterIndex}`);
            if (nextPlatform) {
                nextPlatform.classList.add('current');
            }
            setTimeout(() => positionChick(), 100);
            
            // Play the next letter sound after chick lands
            queueLetterSound(word[currentLetterIndex], 350);
        }
    } else {
        // Wrong letter/digit - play wrong sound, then repeat the correct letter
        playSound('wrong');
        
        currentPlatform.classList.add('wrong');
        chick.classList.add('wrong-jump');
        
        // Play the correct letter sound again after wrong sound finishes
        queueLetterSound(expectedLetter, 400);
        
        setTimeout(() => {
            if (currentPlatform) currentPlatform.classList.remove('wrong');
            if (chick) chick.classList.remove('wrong-jump');
        }, 500);
    }
}

// Handle mobile input
function handleMobileInput(e) {
    if (!gameStarted || isTransitioning) return;
    if (inputLocked) return;
    
    const input = e.target;
    const value = input.value.toUpperCase();
    
    if (value.length > 0) {
        const key = value.slice(-1); // Get last character
        
        // Simulate key press
        const fakeEvent = { key: key };
        processKey(fakeEvent);
        
        // Clear input
        input.value = '';
    }
}

function wordComplete() {
    isTransitioning = true;
    cancelLetterSoundQueue();
    playSound('success');
    
    const chick = document.getElementById('chick');
    const wordDisplay = document.getElementById('wordDisplay');
    
    if (chick) chick.classList.add('big-jump');
    
    const celebration = document.getElementById('celebration');
    celebration.classList.add('show');
    
    // Animate old word moving down
    setTimeout(() => {
        if (wordDisplay) wordDisplay.classList.add('exit-down');
    }, 400);
    
    setTimeout(() => {
        celebration.classList.remove('show');
        
        currentWordIndex++;
        currentLetterIndex = 0;
        
        document.getElementById('level').textContent = currentWordIndex + 1;
        updateHeight();
        updateBackground();
        
        if (currentWordIndex >= WORDS.length) {
            // Game complete!
            isTransitioning = false;
            showFinishScreen();
            currentWordIndex = 0;
            updateBackground();
            return;
        }
        
        // Render new word with enter animation
        renderWordWithAnimation();
    }, 900);
}

function renderWordWithAnimation() {
    const word = WORDS[currentWordIndex];
    const display = document.getElementById('wordDisplay');
    
    // Clear and remove old animation classes
    display.innerHTML = '';
    display.classList.remove('exit-down', 'shake');
    
    // Create letter platforms
    word.split('').forEach((letter, index) => {
        const platform = document.createElement('div');
        platform.className = 'letter-platform';
        platform.id = `letter-${index}`;
        platform.textContent = letter;
        
        if (index < currentLetterIndex) {
            platform.classList.add('completed');
        } else if (index === currentLetterIndex) {
            platform.classList.add('current');
        }
        
        display.appendChild(platform);
    });

    // Add chick (hidden initially)
    const chickContainer = document.createElement('div');
    chickContainer.className = 'chick-container hidden';
    chickContainer.id = 'chickContainer';
    chickContainer.innerHTML = `
        <div class="chick" id="chick">
            <div class="chick-body">
                <div class="chick-belly"></div>
                <div class="chick-eye left"></div>
                <div class="chick-eye right"></div>
                <div class="chick-beak"></div>
                <div class="chick-cheek left"></div>
                <div class="chick-cheek right"></div>
            </div>
            <div class="chick-wing left"></div>
            <div class="chick-wing right"></div>
            <div class="chick-feet">
                <div class="chick-foot"></div>
                <div class="chick-foot"></div>
            </div>
        </div>
    `;
    display.appendChild(chickContainer);

    // Add enter animation for word
    display.classList.add('enter-from-top');
    
    // After word animation completes, show and animate chick
    setTimeout(() => {
        display.classList.remove('enter-from-top');
        
        // Position chick first
        positionChick();
        
        // Show chick and start drop-in animation
        const container = document.getElementById('chickContainer');
        const newChick = document.getElementById('chick');
        
        if (container && newChick) {
            container.classList.remove('hidden');
            newChick.classList.add('drop-in');
            
            // Bounce the first platform when chick lands
            setTimeout(() => {
                const firstPlatform = document.getElementById('letter-0');
                if (firstPlatform) {
                    firstPlatform.classList.add('bounce');
                    setTimeout(() => firstPlatform.classList.remove('bounce'), 300);
                }
                if (newChick) newChick.classList.remove('drop-in');
                
                // Allow input again after animation completes
                isTransitioning = false;
                
                // Play the first letter sound after chick lands
                queueLetterSound(word[0]);
            }, 500);
        }
    }, 600);
}

function updateHeight() {
    const progress = (currentWordIndex / WORDS.length) * 100;
    document.getElementById('heightFill').style.height = progress + '%';
}

function updateBackground() {
    const progress = currentWordIndex / WORDS.length;
    const skyBg = document.getElementById('skyBg');
    // Push the gradient harder between levels for a clearer visual ramp
    const strength = Math.min(progress * 1.2, 1); // slightly overdrive midgame
    const hueTop = 210 - strength * 140; // bright blue -> deep magenta
    const hueBottom = 150 - strength * 120; // teal -> indigo
    const lightTop = 76 - strength * 36; // brighter to darker
    const lightBottom = 72 - strength * 28;
    skyBg.style.background = `linear-gradient(180deg,
        hsl(${hueTop}, 78%, ${lightTop}%) 0%,
        hsl(${hueBottom}, 70%, ${lightBottom}%) 100%)`;
}

// Create decorative clouds
function createClouds() {
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.width = (80 + Math.random() * 100) + 'px';
        cloud.style.height = (30 + Math.random() * 30) + 'px';
        cloud.style.top = (Math.random() * 40) + '%';
        cloud.style.left = (Math.random() * 100) + '%';
        document.body.appendChild(cloud);
    }
}

function handleVirtualKey(symbol) {
    if (!gameStarted || isTransitioning || inputLocked) return;
    inputLocked = true;
    lockedKeyCode = null;
    clearTimeout(lockReleaseFallback);
    processKey({ key: symbol });
    lockReleaseFallback = setTimeout(() => {
        inputLocked = false;
        lockedKeyCode = null;
    }, 150);
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
const mobileInputEl = document.getElementById('mobileInput');
if (mobileInputEl) {
    mobileInputEl.setAttribute('readonly', 'true');
    mobileInputEl.setAttribute('tabindex', '-1');
}
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('keyup', handleKeyUp);
if (mobileInputEl) {
    mobileInputEl.addEventListener('input', handleMobileInput);
}

// Re-focus on mobile input when it loses focus (keeps keyboard open)
if (mobileInputEl) {
    mobileInputEl.addEventListener('blur', function() {
        // We now rely on the on-screen keyboard, so no need to refocus the hidden input.
    });
}

createClouds();
renderKeyboard();
updateKeyboardButton();
hideFinishScreen();
setupConfetti();
selectLanguage(currentLanguage);
selectMode(currentMode);
updateStartScreenStrings();

function getUIText() {
    return currentLanguage === 'polish' ? UI_TEXT.polish : UI_TEXT.english;
}

function updateUIStrings() {
    const t = getUIText();
    const levelLabel = document.getElementById('levelLabel');
    const instructions = document.getElementById('instructionsText');
    const tapHint = document.getElementById('tapHint');
    const celebration = document.getElementById('celebration');
    const levelTotal = document.getElementById('levelTotal');
    const finishTitle = document.getElementById('finishTitle');
    if (levelLabel) levelLabel.textContent = t.wordLabel;
    if (instructions) instructions.textContent = t.instruction;
    if (tapHint) tapHint.textContent = t.tapHint;
    if (celebration) celebration.textContent = t.celebration;
    if (levelTotal) levelTotal.textContent = WORDS.length;
    if (finishTitle) finishTitle.textContent = t.finishTitle || '🎉 GREAT JOB! 🎉';
    const homeBtn = document.getElementById('homeButton');
    if (homeBtn) homeBtn.textContent = `🏠 ${t.homeButton || 'Menu'}`;
    updateSoundButton();
    updateKeyboardButton();
}

function updateSoundButton() {
    const t = getUIText();
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? t.soundOn : t.soundOff;
    }
}

function updateKeyboardButton() {
    const t = getUIText();
    const btn = document.getElementById('keyboardToggle');
    if (btn) {
        btn.textContent = keyboardVisible ? t.keyboardHide : t.keyboardShow;
        btn.style.display = isMobile ? 'none' : 'block';
    }
    const keyboard = document.getElementById('onScreenKeyboard');
    if (keyboard) {
        keyboard.style.display = keyboardVisible ? 'flex' : 'none';
    }
}

function toggleKeyboard() {
    keyboardVisible = !keyboardVisible;
    updateKeyboardButton();
}

function updateStartScreenStrings() {
    const t = getUIText();
    const langLabel = document.getElementById('startLangLabel');
    const modeLabel = document.getElementById('startModeLabel');
    const startBtn = document.getElementById('startBtn');
    const modeLetters = document.getElementById('modeLetters');
    const modeDigits = document.getElementById('modeDigits');
    const modeMixed = document.getElementById('modeMixed');
    if (langLabel) langLabel.textContent = t.startLangLabel || 'Choose your language:';
    if (modeLabel) modeLabel.textContent = t.startModeLabel || 'Choose a mode:';
    if (startBtn) startBtn.textContent = t.startButton || 'Start!';
    if (modeLetters) modeLetters.textContent = t.modeLetters || 'Letters';
    if (modeDigits) modeDigits.textContent = t.modeDigits || 'Digits';
    if (modeMixed) modeMixed.textContent = t.modeMixed || 'Mixed';
}

function selectLanguage(lang) {
    currentLanguage = lang;
    const polishBtn = document.getElementById('langPolish');
    const englishBtn = document.getElementById('langEnglish');
    if (polishBtn) polishBtn.classList.toggle('active', lang === 'polish');
    if (englishBtn) englishBtn.classList.toggle('active', lang === 'english');
    updateStartScreenStrings();
}

function selectMode(mode) {
    currentMode = mode;
    const lettersBtn = document.getElementById('modeLetters');
    const digitsBtn = document.getElementById('modeDigits');
    const mixedBtn = document.getElementById('modeMixed');
    if (lettersBtn) lettersBtn.classList.toggle('active', mode === 'letters');
    if (digitsBtn) digitsBtn.classList.toggle('active', mode === 'digits');
    if (mixedBtn) mixedBtn.classList.toggle('active', mode === 'mixed');
}

function showFinishScreen() {
    const t = getUIText();
    const finish = document.getElementById('finishScreen');
    const title = document.getElementById('finishTitle');
    const btn = finish ? finish.querySelector('.finish-button') : null;
    if (title) title.textContent = t.finishTitle;
    if (btn) btn.textContent = t.finishButton;
    if (finish) {
        finish.style.display = 'flex';
    }
}

function hideFinishScreen() {
    const finish = document.getElementById('finishScreen');
    if (finish) finish.style.display = 'none';
}

function restartGame() {
    hideFinishScreen();
    startGame(currentLanguage);
}

function goHome() {
    hideFinishScreen();
    gameStarted = false;
    isTransitioning = false;
    const start = document.getElementById('startScreen');
    if (start) start.style.display = 'flex';
    const display = document.getElementById('wordDisplay');
    if (display) display.innerHTML = '';
    const celebration = document.getElementById('celebration');
    if (celebration) celebration.classList.remove('show');
    const heightFill = document.getElementById('heightFill');
    if (heightFill) heightFill.style.height = '0%';
    document.getElementById('level').textContent = 1;
    document.getElementById('levelTotal').textContent = 10;
}
