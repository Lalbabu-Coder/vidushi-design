/**
 * Atelier Vidushi - Professional Portfolio Controller
 * Manages lookbook filtering, image lightbox, bespoke inquiries, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Audio Chime Synthesizer
    const playChime = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
                gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.06);
                osc.stop(ctx.currentTime + i * 0.06 + 0.4);
            });
        } catch (e) {}
    };

    // 2. Toast Notification Helper
    const showToast = (message, icon = '✨') => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    };

    // ==========================================
    // 3. LOOKBOOK FILTERING (ALL / COUTURE / HERITAGE / CONTEMPORARY)
    // ==========================================
    const filterPills = document.querySelectorAll('.filter-pill');
    const collectionCards = document.querySelectorAll('.collection-card');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.dataset.filter;

            collectionCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 4. LIGHTBOX MODAL FOR SKETCHES & ARCHIVES
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const zoomableCards = document.querySelectorAll('.sketch-card.zoomable');

    zoomableCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.dataset.title;
            const imgSrc = card.dataset.img;
            if (lightboxImg && lightboxTitle && lightboxModal) {
                lightboxImg.src = imgSrc;
                lightboxTitle.innerText = title;
                lightboxModal.classList.add('active');
            }
        });
    });

    window.closeLightbox = () => {
        if (lightboxModal) lightboxModal.classList.remove('active');
    };

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // ==========================================
    // 5. BESPOKE COMMISSION INQUIRY FORM
    // ==========================================
    const inquiryForm = document.getElementById('bespoke-inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('inq-name').value;
            const email = document.getElementById('inq-email').value;
            const type = document.getElementById('inq-type').value;
            const date = document.getElementById('inq-date').value;
            const notes = document.getElementById('inq-notes').value;

            const inquiry = {
                id: 'inq_' + Date.now(),
                dateSubmitted: new Date().toLocaleDateString(),
                name,
                email,
                type,
                targetDate: date || 'Flexible',
                notes: notes || 'Bespoke consultation request'
            };

            // Save to localStorage
            try {
                const existing = JSON.parse(localStorage.getItem('atelier_vidushi_inquiries') || '[]');
                existing.unshift(inquiry);
                localStorage.setItem('atelier_vidushi_inquiries', JSON.stringify(existing));
            } catch (err) {}

            playChime();
            showToast(`Thank you, ${name}! Your bespoke inquiry has been registered for Vidushi.`, '⚜️');
            inquiryForm.reset();
        });
    }

    // ==========================================
    // 6. DOSSIER DETAILS MODAL
    // ==========================================
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    const dossierDetails = {
        look1: {
            title: 'Nocturne Royale Ballgown • Spec Dossier',
            img: 'assets/look1_evening_gown.svg',
            specs: 'Corset: 16-point spiral steel boning. Skirt: 10 flowing flared panels with 2" horsehair braid hemline. Textile: 100% Mulberry Silk Satin (82 GSM).'
        },
        look2: {
            title: 'Royal Jaipur Draped Saree Gown • Spec Dossier',
            img: 'assets/look2_royal_saree.svg',
            specs: 'Pallu: 2.8m sweeping diagonal pleat over shoulder. Border: Hand-woven 24K gold zari trim. Blouse: Fitted velvet choli with invisible rear zip.'
        },
        look3: {
            title: 'Solaris Met Gala Blazer • Spec Dossier',
            img: 'assets/look3_couture_blazer.svg',
            specs: 'Shoulders: Extended 3.5cm structured shoulder canvas. Closure: Double-breasted sculpted brass buttons. Skirt: Tailored wool pencil silhouette.'
        },
        look4: {
            title: 'Ethereal Rose Quartz Wrap Dress • Spec Dossier',
            img: 'assets/sample_rosegold_deco.svg',
            specs: 'Neckline: Asymmetric one-shoulder with stay-tape. Skirt: Overlapping tulip bias drape. Textile: Sheer silk organza over rose silk crepe.'
        }
    };

    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lookKey = btn.dataset.look;
            const data = dossierDetails[lookKey];
            if (data && lightboxImg && lightboxTitle && lightboxModal) {
                lightboxImg.src = data.img;
                lightboxTitle.innerText = data.title;
                lightboxModal.classList.add('active');
            }
        });
    });
});
