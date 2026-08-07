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

// Inisialisasi fungsi secara bersamaan setelah delay 1 detik
setTimeout(() => {
    fetchGitHubStats();
    fetchGitHubActivity();
}, 1000);