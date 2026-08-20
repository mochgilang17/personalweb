// --- 1. Animasi Scroll Reveal (Intersection Observer) ---
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Opsional: Hentikan observasi jika hanya ingin animasi 1x jalan
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Memicu animasi saat 10% elemen terlihat di layar
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
});

// --- 2. Fetch Data Statistik GitHub & Render ke UI ---
async function fetchGitHubStats() {
    const countBadge = document.getElementById('github-repo-count');
    try {
        const response = await fetch('https://api.github.com/users/mochgilang17');
        if (!response.ok) throw new Error("Gagal mengambil data");
        const data = await response.json();
        
        if (countBadge && data.public_repos !== undefined) {
            countBadge.innerHTML = `<i class="fab fa-github"></i> ${data.public_repos} Public Repos`;
            countBadge.classList.remove('animate-pulse');
        }
    } catch (error) {
        if (countBadge) {
            countBadge.innerHTML = `<i class="fas fa-exclamation-circle"></i> Data Offline`;
            countBadge.classList.remove('animate-pulse');
            countBadge.classList.add('bg-zinc-500');
        }
    }
}

// --- 3. Fetch Aktivitas Terkini (Live Feed) ---
async function fetchGitHubActivity() {
    const feedContainer = document.getElementById('github-activity-feed');
    if (!feedContainer) return;

    try {
        // Mengambil 4 aktivitas publik terbaru
        const response = await fetch('https://api.github.com/users/mochgilang17/events/public?per_page=4');
        if (!response.ok) throw new Error("Gagal mengambil aktivitas");
        
        const events = await response.json();
        feedContainer.innerHTML = ''; // Hapus animasi loading

        if (events.length === 0) {
            feedContainer.innerHTML = '<p class="text-xs text-secondary">Belum ada aktivitas publik baru-baru ini.</p>';
            return;
        }

        events.forEach(event => {
            let actionText = '';
            let iconClass = 'fas fa-code-branch';
            let iconColor = 'text-zinc-400';
            
            // Format tanggal yang rapi
            let date = new Date(event.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            let repoName = event.repo.name.split('/')[1]; // Mengambil nama repo saja

            // Menentukan ikon dan teks berdasarkan jenis aktivitas
            if (event.type === 'PushEvent') {
                actionText = `Melakukan push kode ke <span class="font-semibold text-primary block truncate">${repoName}</span>`;
                iconClass = 'fas fa-upload';
                iconColor = 'text-emerald-500';
            } else if (event.type === 'CreateEvent') {
                actionText = `Membuat ${event.payload.ref_type} di <span class="font-semibold text-primary block truncate">${repoName}</span>`;
                iconClass = 'fas fa-plus-circle';
                iconColor = 'text-blue-500';
            } else if (event.type === 'WatchEvent') {
                actionText = `Membintangi (Star) <span class="font-semibold text-primary block truncate">${repoName}</span>`;
                iconClass = 'fas fa-star';
                iconColor = 'text-yellow-500';
            } else {
                actionText = `Aktivitas di <span class="font-semibold text-primary block truncate">${repoName}</span>`;
            }

            // Render elemen HTML untuk setiap aktivitas
            const html = `
                <div class="flex gap-4 items-start group">
                    <div class="mt-0.5 w-7 h-7 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300 shadow-sm">
                        <i class="${iconClass} text-[10px] ${iconColor}"></i>
                    </div>
                    <div class="text-xs text-secondary overflow-hidden w-full leading-relaxed">
                        ${actionText}
                        <span class="text-[10px] block mt-1 text-zinc-400 font-mono">${date}</span>
                    </div>
                </div>
            `;
            feedContainer.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error("Gagal memuat aktivitas GitHub API.", error);
        feedContainer.innerHTML = '<p class="text-xs text-red-400">Gagal memuat log aktivitas.</p>';
    }
}

// --- 4. Logika Image Slider untuk Card ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.group\\/slider').forEach(sliderContainer => {
        const track = sliderContainer.querySelector('.slider-track');
        const images = track.querySelectorAll('img');
        const prevBtn = sliderContainer.querySelector('.slider-prev');
        const nextBtn = sliderContainer.querySelector('.slider-next');
        
        // Jika ada lebih dari 1 gambar, tampilkan tombol & aktifkan slide
        if (images.length > 1) {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            
            let currentIndex = 0;
            
            const updateSlider = () => {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            };

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah scroll tiba-tiba
                currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
                updateSlider();
            });

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
                updateSlider();
            });
        }
    });
});

// Fungsi untuk mengambil dan me-render data Aktivitas dari Google Sheets
async function fetchActivityData() {
    const container = document.getElementById('activity-container');
    if (!container) return;

    try {
        // Ganti URL ini dengan URL API JSON dari Google Sheets kamu
        const response = await fetch('https://sheetdb.io/api/v1/7l8jx5yf41fxh'); 
        const activities = await response.json();
        
        container.innerHTML = ''; // Hapus skeleton loading

        activities.forEach(item => {
            // Cek ketersediaan foto 1 sampai 3 untuk slider
            let imagesHtml = '';
            
            if (item.foto_1 && item.foto_1.trim() !== "") {
                imagesHtml += `<img src="${item.foto_1}" alt="${item.nama_kegiatan} 1" class="w-full h-full object-cover shrink-0">`;
            }
            if (item.foto_2 && item.foto_2.trim() !== "") {
                imagesHtml += `<img src="${item.foto_2}" alt="${item.nama_kegiatan} 2" class="w-full h-full object-cover shrink-0">`;
            }
            if (item.foto_3 && item.foto_3.trim() !== "") {
                imagesHtml += `<img src="${item.foto_3}" alt="${item.nama_kegiatan} 3" class="w-full h-full object-cover shrink-0">`;
            }

            // Jika tidak ada foto sama sekali, beri gambar placeholder (opsional)
            if (imagesHtml === '') {
                imagesHtml = `<div class="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">No Image</div>`;
            }

            // Struktur Card HTML
            const cardHtml = `
                <div class="border border-zinc-200/80 rounded-2xl bg-white shadow-sm flex flex-col justify-between group hover:border-zinc-300 transition overflow-hidden">
                    <div class="relative w-full h-48 bg-zinc-100 overflow-hidden group/slider">
                        <div class="flex transition-transform duration-500 ease-out h-full slider-track">
                            ${imagesHtml}
                        </div>
                        <button class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-primary opacity-0 group-hover/slider:opacity-100 transition shadow-sm slider-prev hidden z-10">
                            <i class="fas fa-chevron-left text-xs pointer-events-none"></i>
                        </button>
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-primary opacity-0 group-hover/slider:opacity-100 transition shadow-sm slider-next hidden z-10">
                            <i class="fas fa-chevron-right text-xs pointer-events-none"></i>
                        </button>
                    </div>

                    <div class="p-6 md:p-8 flex flex-col flex-grow">
                        <div>
                            <span class="text-[10px] font-mono bg-zinc-100 text-secondary px-3 py-1 rounded-full">
                                ${item.judul}
                            </span>
                            <h4 class="text-lg font-bold text-primary mt-3 mb-2">
                                ${item.nama_kegiatan}
                            </h4>
                            <p class="text-sm text-secondary leading-relaxed mb-6">
                                ${item.deskripsi}
                            </p>
                        </div>
                        <div class="pt-4 border-t border-zinc-100 mt-auto">
                            <span class="text-xs font-mono text-secondary">${item.tags}</span>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Panggil kembali fungsi slider agar tombol prev/next aktif sesuai jumlah foto
        initSliders();

    } catch (error) {
        console.error("Gagal mengambil data aktivitas:", error);
        container.innerHTML = '<p class="text-secondary text-sm">Gagal memuat rekam jejak.</p>';
    }
}

// Inisialisasi fungsi secara bersamaan setelah delay 1 detik
setTimeout(() => {
    fetchGitHubStats();
    fetchGitHubActivity();
}, 1000);