class Metronome {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.bpm = 60;
        this.isPlaying = false;
        this.beatCount = 0;
        this.patternLength = 30;
        this.patternType = 'single';
        this.intervalId = null;
    }

    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.beatCount = 0;
        this.scheduleBeats();
    }

    stop() {
        if (!this.isPlaying) return;

        clearTimeout(this.intervalId);
        this.isPlaying = false;
    }

    scheduleBeats() {
        const intervalTime = (60 / this.bpm) * 1000;
        const now = this.audioContext.currentTime;

        this.playSound(now);
        this.beatCount++;

        if (this.patternType === 'nRepeat' && this.beatCount >= this.patternLength) {
            this.beatCount = 0;
        }

        this.intervalId = setTimeout(() => this.scheduleBeats(), intervalTime);
    }

    playSound(time) {
        let frequency;
        switch(this.patternType) {
            case 'single':
                frequency = 1000;
                break;
            case 'twoSounds':
                frequency = this.beatCount % 2 === 0 ? 1000 : 800;
                break;
            case 'nRepeat':
                frequency = this.beatCount < this.patternLength ? 1000 : 800;
                break;
        }

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, time);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(time);
        oscillator.stop(time + 0.1);
    }

    updateBPM(newBPM) {
        this.bpm = newBPM;
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }
}

const metronome = new Metronome();

document.getElementById('startStop').addEventListener('click', () => {
    if (metronome.isPlaying) {
        metronome.stop();
        document.getElementById('startStop').textContent = '시작';
    } else {
        metronome.start();
        document.getElementById('startStop').textContent = '정지';
    }
});

function updateBPM(bpmValue) {
    metronome.updateBPM(bpmValue);
    document.getElementById('bpmSlider').value = bpmValue;
    document.getElementById('bpmInput').value = bpmValue;
    document.getElementById('bpmValue').textContent = bpmValue;
}

document.getElementById('bpmSlider').addEventListener('input', (e) => {
    updateBPM(parseInt(e.target.value));
});

document.getElementById('bpmInput').addEventListener('change', (e) => {
    let bpmValue = parseInt(e.target.value);
    if (bpmValue >= 40 && bpmValue <= 220) {
        updateBPM(bpmValue);
    }
});

document.getElementById('bpmMinus').addEventListener('click', () => {
    let currentBPM = parseInt(document.getElementById('bpmInput').value);
    if (currentBPM > 40) {
        updateBPM(currentBPM - 1);
    }
});

document.getElementById('bpmPlus').addEventListener('click', () => {
    let currentBPM = parseInt(document.getElementById('bpmInput').value);
    if (currentBPM < 220) {
        updateBPM(currentBPM + 1);
    }
});
/*
document.getElementById('patternType').addEventListener('change', (e) => {
    metronome.patternType = e.target.value;
    const patternLengthContainer = document.getElementById('patternLengthContainer');
    if (e.target.value === 'single' || e.target.value === 'twoSounds') {
        patternLengthContainer.classList.add('disabled');
    } else {
        patternLengthContainer.classList.remove('disabled');
    }
});
*/
// patternType 변경 이벤트 핸들러 수정
document.getElementById('patternType').addEventListener('change', (e) => {
    metronome.patternType = e.target.value;
    const patternLength = document.getElementById('patternLength');
    
    if (e.target.value === 'single' || e.target.value === 'twoSounds') {
        patternLength.disabled = true;
        patternLength.value = 30; // 기본값으로 리셋
    } else {
        patternLength.disabled = false;
    }
});

// 초기 상태 설정
document.getElementById('patternLength').disabled = true;


document.getElementById('patternLength').addEventListener('change', (e) => {
    metronome.patternLength = parseInt(e.target.value);
});

// 초기 상태 설정
document.getElementById('patternLengthContainer').classList.add('disabled');

//////////////////

let intervalId = null;
const REPEAT_DELAY = 100;

function increaseBPM() {
    let currentBPM = parseInt(document.getElementById('bpmInput').value);
    if (currentBPM < 220) {
        updateBPM(currentBPM + 1);
    }
}

function decreaseBPM() {
    let currentBPM = parseInt(document.getElementById('bpmInput').value);
    if (currentBPM > 40) {
        updateBPM(currentBPM - 1);
    }
}

// 버튼 이벤트 핸들러
function handleButtonPress(action, event) {
    if (event) {
        event.preventDefault(); // 기본 동작 방지
    }
    action();
    intervalId = setInterval(action, REPEAT_DELAY);
}

function handleButtonRelease() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// 마우스 이벤트
document.getElementById('bpmPlus').addEventListener('mousedown', (e) => handleButtonPress(increaseBPM, e));
document.getElementById('bpmMinus').addEventListener('mousedown', (e) => handleButtonPress(decreaseBPM, e));

// 터치 이벤트
document.getElementById('bpmPlus').addEventListener('touchstart', (e) => handleButtonPress(increaseBPM, e));
document.getElementById('bpmMinus').addEventListener('touchstart', (e) => handleButtonPress(decreaseBPM, e));

// 이벤트 중지
document.addEventListener('mouseup', handleButtonRelease);
document.addEventListener('touchend', handleButtonRelease);
document.addEventListener('mouseleave', handleButtonRelease);
document.addEventListener('touchcancel', handleButtonRelease);
