/* ----------------------------------------------------------
   FILE: public.js - FULL AI ENGINE (FINAL VERSION)
   ---------------------------------------------------------- */

let generatedQuestions = [];
let currentQIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;

// --- TAMBAHAN VARIABEL UNTUK DURASI ---
let startTime;

// --- AUDIO SETUP ---
const bgm = new Audio('bgm_public.mp3');
const sfxCorrect = [new Audio('Benar1.mp3'), new Audio('benar2.mp3'), new Audio('benar3.mp3'), new Audio('benar4.mp3'), new Audio('benar5.mp3')];
const sfxWrong = [new Audio('salah1.mp3'), new Audio('salah2.mp3'), new Audio('salah3.mp3'), new Audio('salah4.mp3'), new Audio('salah5.mp3')];
const songVictory = new Audio('victory.mp3');
const songGameOver = new Audio('gameover.mp3');

// [1] INITIALIZE SYSTEM
window.onload = async () => {
    try {
        const response = await fetch('soal.json');
        const data = await response.json();
        
        if (data.bank_soal) {
            allQuestions = data.bank_soal
        }
        
        if (data.bank_soal) {
            generatedQuestions = data.bank_soal
                .sort(() => 0.5 - Math.random())
                .slice(0, 10);
            
            bgm.loop = true;
            bgm.volume = 0.5;
            bgm.play().catch(e => console.log("Menunggu interaksi user untuk BGM"));
            
            showSection('name-screen');
        }
    } catch (e) {
        console.error("Database soal error!", e);
        alert("ERROR: Gagal memuat soal.json!");
    }
};

// [2] FUNGSI MEMULAI KUIS
function startQuizWithGroup() {
    const nameInput = document.getElementById('group-name-input').value;
    
    if (nameInput.trim() === "") {
        alert("Isi dulu nama kelompoknya, mas/mbak!");
        return;
    }
    
    localStorage.setItem('current_group_name', nameInput);
    score = 0;
    currentQIndex = 0;
    
    // --- CATAT WAKTU MULAI DI SINI ---
    startTime = Date.now();
    
    showSection('quiz-screen');
    loadQuestion();
}

// [3] LOAD SOAL & TIMER
function loadQuestion() {
    clearInterval(timerInterval);
    timeLeft = 30;
    
    const q = generatedQuestions[currentQIndex];
    document.getElementById('q-count').innerText = `ANALYSIS: ${currentQIndex + 1}/10`;
    document.getElementById('question-text').innerText = q.pertanyaan;
    
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    
    const shuffledChoices = [...q.pilihan].sort(() => 0.5 - Math.random());
    
    shuffledChoices.forEach((pil) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        const isCorrect = pil.includes("[") && pil.includes("]");
        const cleanText = pil.replace("[", "").replace("]", "");
        btn.innerText = cleanText;
        btn.onclick = () => checkAnswer(isCorrect);
        container.appendChild(btn);
    });
    
    startTimer();
}

function startTimer() {
    const timerText = document.getElementById('q-timer');
    const fillBar = document.getElementById('timer-fill');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerText) timerText.innerText = timeLeft + "s";
        if (fillBar) fillBar.style.width = (timeLeft / 30 * 100) + "%";
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playSfx(sfxWrong);
            nextQuestion();
        }
    }, 1000);
}

// [4] CEK JAWABAN
function checkAnswer(isCorrect) {
    clearInterval(timerInterval);
    
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.style.pointerEvents = "none"; // Matikan klik biar gak spam
        
        // Cek mana jawaban yang bener (yang ada tanda [])
        // Kita cari di bank soal asli karena teks di tombol sudah bersih dari []
        const q = generatedQuestions[currentQIndex];
        const isThisBtnCorrect = q.pilihan.some(p => p.includes("[") && p.replace("[", "").replace("]", "") === btn.innerText);

        if (isThisBtnCorrect) {
            btn.style.background = "rgba(0, 255, 0, 0.4)"; // Hijau
            btn.style.border = "2px solid #00ff00";
            btn.style.boxShadow = "0 0 15px #00ff00";
            btn.classList.add('glitch'); // Tambahkan efek glitch ke jawaban benar
        } else {
            btn.style.opacity = "0.3"; // Redupkan yang salah
        }
    });

    if (isCorrect) {
        score += 10;
        playSfx(sfxCorrect);
        document.body.style.boxShadow = "inset 0 0 60px rgba(0, 255, 0, 0.3)";
    } else {
        playSfx(sfxWrong);
        document.body.style.boxShadow = "inset 0 0 60px rgba(255, 0, 0, 0.3)";
    }
    
    setTimeout(() => {
        document.body.style.boxShadow = "none";
        nextQuestion();
    }, 1200);
}

function playSfx(audioArray) {
    const random = audioArray[Math.floor(Math.random() * audioArray.length)];
    random.currentTime = 0;
    random.play();
}

function nextQuestion() {
    currentQIndex++;
    if (currentQIndex < 10) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

// [5] LAYAR SKOR & PENYIMPANAN DATA (DURASI KERJA)
function finishQuiz() {
    bgm.pause();
    clearInterval(timerInterval);
    
    // --- HITUNG DURASI TOTAL ---
    const endTime = Date.now();
    const totalSeconds = Math.floor((endTime - startTime) / 1000);
    const menit = Math.floor(totalSeconds / 60);
    const detik = totalSeconds % 60;
    const durasiString = `${menit}m ${detik}s`; // Contoh: "1m 15s"
    
    showSection('score-screen');
    document.getElementById('final-score').innerText = score;
    
    const groupName = localStorage.getItem('current_group_name') || "Anonymous";
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard_data')) || [];
    
    // SIMPAN DURASI, BUKAN JAM
    leaderboard.push({
        nama: groupName,
        skor: score,
        waktu: durasiString
    });
    
    localStorage.setItem('leaderboard_data', JSON.stringify(leaderboard));
    localStorage.setItem('redirect_to_leaderboard', 'true');
    
    if (score >= 70) songVictory.play();
    else songGameOver.play();
}

function closeSessiAndShowLeaderboard() {
    localStorage.setItem('target_section', 'leaderboard-screen');
    window.location.href = "admin.html";
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}

// Fungsi untuk mereset tampilan agar kelompok berikutnya bisa main
function nextGroup() {
    // 1. Reset variabel penting ke nol
    score = 0;
    currentQIndex = 0;
    timeLeft = 30;
    
    // 2. Kosongkan input nama sebelumnya
    const inputNama = document.getElementById('group-name-input');
    if(inputNama) inputNama.value = "";
    
    // 3. Matikan lagu kemenangan/kekalahan jika masih bunyi
    songVictory.pause();
    songVictory.currentTime = 0;
    songGameOver.pause();
    songGameOver.currentTime = 0;
    
    // 4. Acak ulang soal baru dari bank_soal (biar kelompok baru gak dapet soal yang sama persis)
    fetch('soal.json')
        .then(res => res.json())
        .then(data => {
            generatedQuestions = data.bank_soal
                .sort(() => 0.5 - Math.random())
                .slice(0, 10);
            
            // 5. Kembali ke layar input nama
            showSection('name-screen');
            
            // Putar lagi BGM-nya
            bgm.play().catch(e => console.log("BGM Replay Blocked"));
        });
}
