/* ----------------------------------------------------------
   FILE: admin.js
   FUNGSI: Pusat Kendali Langsung (Login -> Team -> Materi)
   ----------------------------------------------------------
*/

// [ADMIN-JS-01] - Variabel Global
let materiData = [];
let indexBab = 0;

// [ADMIN-JS-02] - Auto-Loading Saat Web Dibuka
window.onload = () => {
    // --- 1. LOGIKA ANIMASI BOOTING ---
    const bar = document.querySelector('#boot-bar');
    const bootText = document.getElementById('boot-text');
    const accessArea = document.getElementById('access-area');
    
    if (bar) { // Cek dulu ada gak elemennya biar gak error
        setTimeout(() => {
            bar.style.width = "100%";
            bootText.innerText = "MEMASUKI LOBBY BEM";
            
            setTimeout(() => {
                if (accessArea) accessArea.style.display = "block";
                bootText.style.color = "#00f2ff";
            }, 2200);
        }, 500);
    }

    // --- 2. LOGIKA AUTO-REDIRECT KE LEADERBOARD ---
    // Pastikan di public.js kamu pakai setItem('target_section', 'leaderboard-screen')
    const target = localStorage.getItem('target_section');
    
    if (target === 'leaderboard-screen') {
        // Langsung pindah ke section leaderboard tanpa lewat login
        showSection('leaderboard-screen');
        updateLeaderboardTable(); 
        localStorage.removeItem('target_section'); // Hapus tanda biar gak nyangkut
    }
};

// --- 3. FUNGSI UPDATE TABEL (TAMPILIN SEMUA KELOMPOK) ---
function updateLeaderboardTable() {
    const tableBody = document.getElementById('leaderboard-body');
    // Ambil daftar semua hasil kelompok
    const allResults = JSON.parse(localStorage.getItem('leaderboard_data')) || [];
    
    if (allResults.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>BELUM ADA DATA KELOMPOK</td></tr>";
        return;
    }

    // [LOGIKA SORTING BARU]
    allResults.sort((a, b) => {
        // 1. Prioritas utama: Skor tertinggi (Besar ke Kecil)
        if (b.skor !== a.skor) {
            return b.skor - a.skor;
        }
        // 2. Jika skor sama, bandingkan waktu (Kecil ke Besar / Tercepat)
        // Kita bandingkan string durasinya (misal "0m 30s" vs "1m 10s")
        return a.waktu.localeCompare(b.waktu);
    });

    // Render semua data ke tabel
    tableBody.innerHTML = allResults.map((res, index) => {
        // Tambahkan efek mahkota/warna emas untuk juara 1 biar keren
        const rankDisplay = (index === 0) ? `🥇 ${index + 1}` : index + 1;
        
        return `
            <tr>
                <td style="font-weight: bold; color: ${index === 0 ? '#ffcc00' : '#00f2ff'}">${rankDisplay}</td>
                <td>${res.nama}</td>
                <td>${res.skor} <span style="font-size: 0.8em; color: #ff0055;">PTS</span></td>
                <td>${res.waktu || "-"}</td>
            </tr>
        `;
    }).join('');
}

// [ADMIN-JS-03] - Fungsi Masuk Langsung (Satu Klik ke Team & Music)
function bootSystem() {
    // Nyalakan Musik BGM
    const bgm = document.getElementById('bgm');
    bgm.play().catch(e => console.log("Audio play blocked."));
    
    // Langsung pindah ke perkenalan kelompok
    showSection('team-screen');
}

// [ADMIN-JS-04] - Ambil Data Materi dari JSON
async function goToMateri() {
    try {
        const response = await fetch('data_materi.json');
        const data = await response.json();
        materiData = data.materi_deskripsi;
        
        showSection('materi-screen');
        updateMateriDisplay();
    } catch (e) {
        alert("Sistem Error: Gagal memuat data_materi.json!");
    }
}

// [ADMIN-JS-05] - Update Tampilan Materi & Scroll Reset
function updateMateriDisplay() {
    const current = materiData[indexBab];
    const contentArea = document.getElementById('bab-content');
    
    document.getElementById('bab-title').innerText = current.bab;
    contentArea.innerText = current.deskripsi;
    
    // Reset scroll posisi ke atas setiap ganti bab
    contentArea.scrollTop = 0;
    
    // Reset area AI
    document.getElementById('ai-area').style.opacity = "0";
    document.getElementById('ai-typing').innerText = "";
    
    // Kontrol Navigasi
    const btnNext = document.getElementById('btn-next');
    const btnQuiz = document.getElementById('btn-go-quiz');
    
    if (indexBab === materiData.length - 1) {
        btnNext.style.display = "none";
        btnQuiz.style.display = "inline-block";
    } else {
        btnNext.style.display = "inline-block";
        btnQuiz.style.display = "none";
    }
}

// [ADMIN-JS-06] - AI Penjelas (Hanya Muncul Jika Diklik)
function jelaskanAi() {
    const aiArea = document.getElementById('ai-area');
    const target = document.getElementById('ai-typing');
    
    aiArea.style.opacity = "1";
    const currentText = materiData[indexBab].deskripsi;
    
    // Ringkasan AI
    const aiSpeech = "ANALISIS AI: Inti dari bab ini adalah " +
        currentText.substring(0, 150) + "... Perhatikan baik-baik poin ini ya!";
    
    target.innerText = "";
    let i = 0;
    
    function typing() {
        if (i < aiSpeech.length) {
            target.innerHTML += aiSpeech.charAt(i);
            i++;
            setTimeout(typing, 35);
        }
    }
    typing();
}

// [ADMIN-JS-07] - Navigasi
function nextMateri() {
    if (indexBab < materiData.length - 1) {
        indexBab++;
        updateMateriDisplay();
    }
}

function prevMateri() {
    if (indexBab > 0) {
        indexBab--;
        updateMateriDisplay();
    }
}

// [ADMIN-JS-08] - Pindah ke Halaman Public Quiz
function pindahKeKuis() {
    localStorage.setItem('quizStatus', 'START');
    
    // Transisi singkat
    document.body.style.opacity = "0";
    document.body.style.transition = "1s";
    
    setTimeout(() => {
        window.location.href = "public.html";
    }, 1000);
}

// [ADMIN-JS-09] - Helper: Switch Section
function showSection(id) {
    document.querySelectorAll('section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-section');
    });
    
    const target = document.getElementById(id);
    target.style.display = 'flex';
    setTimeout(() => {
        target.classList.add('active-section');
    }, 50);
}

// --- FUNGSI TOTAL RESET (Leaderboard & Score) ---
// --- FUNGSI TOTAL RESET (Leaderboard & Score) ---
function resetLeaderboard() {
    const confirmReset = confirm("WARNING: Semua data skor akan dihapus permanen. Lanjutkan?");
    
    if (confirmReset) {
        // 1. Bersihkan Memori
        localStorage.removeItem('leaderboard_data');
        localStorage.removeItem('current_group_name');
        localStorage.removeItem('target_section');
        
        // 2. Bersihkan Tampilan Tabel
        const tableBody = document.getElementById('leaderboard-body');
        if (tableBody) {
            tableBody.innerHTML = "<tr><td colspan='4'>SYSTEM CLEANED: NO DATA</td></tr>";
        }
        
        alert("Sistem berhasil dibersihkan!");
        
        // 3. Balik ke awal (Restart)
        window.location.reload(); 
    }
}

// Tambahkan pengecekan ini di dalam window.onload kamu yang sudah ada
window.onload = () => {
    const bar = document.querySelector('#boot-bar');
    const bootText = document.getElementById('boot-text');
    const accessArea = document.getElementById('access-area');
    
    // CEK REDIRECT DULU
    const target = localStorage.getItem('target_section');
    if (target === 'leaderboard-screen') {
        showSection('leaderboard-screen');
        updateLeaderboardTable(); 
        localStorage.removeItem('target_section');
        return; // Hentikan loading bar kalau sedang redirect
    }

    // Animasi Loading Bar Normal
    if (bar) {
        setTimeout(() => {
            bar.style.width = "100%";
            bootText.innerText = "MEMASUKI LOBBY BEM";
            setTimeout(() => {
                if (accessArea) accessArea.style.display = "block";
                bootText.style.color = "#00f2ff";
            }, 2200);
        }, 500);
    }
};
