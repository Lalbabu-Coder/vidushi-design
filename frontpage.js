/**
 * Atelier Vidushi - Master Front Page Controller
 * Clean, Minimal & High-Fashion Aesthetic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. MINIMAL TOAST HELPER
    // ==========================================
    const showToast = (message) => {
        const toast = document.getElementById('toast-notice');
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    };

    // ==========================================
    // 1.1 HERO VIEW QUALITY SWITCHER
    // ==========================================
    const heroImg = document.getElementById('hero-img-element');
    const switcherBtns = document.querySelectorAll('.hero-switcher-btn');
    switcherBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switcherBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetSrc = btn.dataset.img;
            if (heroImg && targetSrc) {
                heroImg.style.opacity = '0.3';
                setTimeout(() => {
                    heroImg.src = targetSrc;
                    heroImg.style.opacity = '0.88';
                }, 200);
                showToast(`Switched view to ${btn.innerText.trim()}`);
            }
        });
    });

    // ==========================================
    // 2. INITIALIZE 3D RUNWAY STUDIO
    // ==========================================
    let studio = null;
    let sketchStudio = null;

    if (typeof FashionStudio !== 'undefined' && document.getElementById('front-studio-viewport')) {
        studio = new FashionStudio('front-studio-viewport');
        if (typeof SketchStudio !== 'undefined') {
            sketchStudio = new SketchStudio(studio);
        }
    }

    // 3D Silhouette Buttons
    const v3dGarmentBtns = document.querySelectorAll('.v3d-garment-btn');
    v3dGarmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            v3dGarmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const garment = btn.dataset.garment;
            if (studio) {
                studio.setGarment(garment);
                showToast(`Silhouette changed to ${btn.innerText.trim()}`);
            }
        });
    });

    // 3D Fabric Buttons
    const v3dFabricBtns = document.querySelectorAll('.v3d-fabric-btn');
    v3dFabricBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            v3dFabricBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const fabric = btn.dataset.fabric;
            if (studio) {
                studio.setFabricType(fabric);
                showToast(`Fabric finish: ${btn.innerText.trim()}`);
            }
        });
    });

    // 3D Color Picker
    const v3dColorPicker = document.getElementById('v3d-color-picker');
    if (v3dColorPicker) {
        v3dColorPicker.addEventListener('input', (e) => {
            if (studio) studio.setBaseColor(e.target.value);
        });
    }

    // 3D Breeze Toggle
    const v3dBreezeToggle = document.getElementById('v3d-breeze-toggle');
    if (v3dBreezeToggle) {
        v3dBreezeToggle.addEventListener('change', (e) => {
            if (studio) {
                studio.toggleWind(e.target.checked);
                showToast(e.target.checked ? 'Runway breeze enabled' : 'Breeze paused');
            }
        });
    }

    // 3D Snapshot Capture
    const v3dSnapshotBtn = document.getElementById('v3d-snapshot-btn');
    if (v3dSnapshotBtn) {
        v3dSnapshotBtn.addEventListener('click', () => {
            if (!studio) return;
            const dataUrl = studio.captureRunwaySnapshot();
            const link = document.createElement('a');
            link.download = `Vidushi_Runway_${Date.now().toString().slice(-4)}.png`;
            link.href = dataUrl;
            link.click();
            showToast('Snapshot captured and downloaded');
        });
    }

    // ==========================================
    // 3. LOOKBOOK FILTERING
    // ==========================================
    const filterLinks = document.querySelectorAll('.filter-link');
    const lookbookCards = document.querySelectorAll('.lookbook-card');

    filterLinks.forEach(link => {
        link.addEventListener('click', () => {
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const filter = link.dataset.filter;
            lookbookCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    setTimeout(() => card.style.opacity = '1', 40);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // View in 3D buttons on lookbook cards
    document.querySelectorAll('.lookbook-3d-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const garment = link.dataset.garment;
            const section3d = document.getElementById('view-3d');
            if (section3d) {
                section3d.scrollIntoView({ behavior: 'smooth' });
            }
            if (studio && garment) {
                studio.setGarment(garment);
                v3dGarmentBtns.forEach(b => {
                    b.classList.toggle('active', b.dataset.garment === garment);
                });
                showToast(`Viewing ${garment} in 3D Runway`);
            }
        });
    });

    // ==========================================
    // 4. DESIGN HUB & PUBLIC SHOWCASE
    // ==========================================
    const DEFAULT_DESIGNS = [
        {
            id: 'des_1',
            title: 'Nocturne Emerald Velvet Gown',
            designer: 'Vidushi',
            category: 'Haute Couture',
            garment: 'eveningGown',
            fabric: 'Deep emerald green silk velvet ballgown with antique gold filigree embroidery and cathedral train.',
            image: 'assets/look1_emerald_velvet_ballgown.jpg',
            likes: 54
        },
        {
            id: 'des_2',
            title: 'Royal Zardozi Heritage Lehenga',
            designer: 'Vidushi',
            category: 'Heritage Bridal',
            garment: 'saree',
            fabric: 'Champagne ivory pure silk lehenga with 24K antique gold zardozi, dabka, and pearl embroidery.',
            image: 'assets/look2_ivory_gold_lehenga.jpg',
            likes: 62
        },
        {
            id: 'des_3',
            title: 'Solaris Pagoda Power Blazer',
            designer: 'Vidushi',
            category: 'Tailoring',
            garment: 'blazerSet',
            fabric: 'Extreme sharp flared pagoda shoulders in jet black wool crepe with duchess satin lapels.',
            image: 'assets/look3_architectural_blazer.jpg',
            likes: 47
        },
        {
            id: 'des_4',
            title: 'Blush Rose Cocktail Saree',
            designer: 'Vidushi',
            category: 'Heritage Couture',
            garment: 'saree',
            fabric: 'Liquid asymmetric pre-pleated drape in blush pink georgette with micro-pearl borders.',
            image: 'assets/look4_blush_draped_saree.jpg',
            likes: 58
        },
        {
            id: 'des_5',
            title: 'Midnight Sapphire Starlight Gown',
            designer: 'Vidushi',
            category: 'Haute Couture',
            garment: 'eveningGown',
            fabric: 'Deep midnight navy silk tulle ballgown with hand-embroidered Swarovski crystal constellations.',
            image: 'assets/look5_sapphire_starlight_gown.jpg',
            likes: 51
        },
        {
            id: 'des_6',
            title: 'Crimson Raw Silk Royal Anarkali',
            designer: 'Vidushi',
            category: 'Heritage Bridal',
            garment: 'saree',
            fabric: 'Pure crimson red raw silk flared silhouette with high mandarin collar and antique gold buttons.',
            image: 'assets/look6_crimson_royal_anarkali.jpg',
            likes: 65
        },
        {
            id: 'des_7',
            title: 'Lavender Cloud Wave Gown',
            designer: 'Vidushi',
            category: 'Avant-Garde',
            garment: 'avantGarde',
            fabric: 'Multi-tiered cascading micro-ruffles in misty lavender sheer silk organza with sculpted wave bodice.',
            image: 'assets/look7_lavender_cloud_gown.jpg',
            likes: 43
        }
    ];

    const getDesigns = () => {
        try {
            const stored = localStorage.getItem('atelier_vidushi_community_designs_v2');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        localStorage.setItem('atelier_vidushi_community_designs_v2', JSON.stringify(DEFAULT_DESIGNS));
        return DEFAULT_DESIGNS;
    };

    const saveDesigns = (list) => {
        try {
            localStorage.setItem('atelier_vidushi_community_designs_v2', JSON.stringify(list));
        } catch (e) {}
    };

    const renderHub = () => {
        const grid = document.getElementById('hub-cards-grid');
        const countTag = document.getElementById('hub-count-tag');
        if (!grid) return;

        const list = getDesigns();
        if (countTag) countTag.innerText = `${list.length} Designs Published`;

        grid.innerHTML = list.map(item => `
            <div class="hub-item-card" data-id="${item.id}">
                <div class="hub-item-media">
                    <img src="${item.image}" alt="${item.title}" onclick="openLightbox('${item.title.replace(/'/g, "\\'")}', '${item.image}')">
                    <span class="hub-item-tag">${item.category || 'Haute Couture'}</span>
                </div>
                <div class="hub-item-body">
                    <span class="hub-item-designer">By ${item.designer || 'Vidushi'}</span>
                    <h4 class="hub-item-title">${item.title}</h4>
                    <p class="hub-item-desc">${item.fabric || 'Bespoke atelier creation.'}</p>
                    <div class="hub-item-actions">
                        <button type="button" class="hub-item-3d-btn" data-garment="${item.garment || 'eveningGown'}" data-img="${item.image}" data-title="${item.title}">
                            View in 3D &rarr;
                        </button>
                        <button type="button" class="hub-like-trigger" data-id="${item.id}">
                            &hearts; <span class="like-num">${item.likes || 1}</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Wire 3D buttons
        grid.querySelectorAll('.hub-item-3d-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const garment = btn.dataset.garment || 'eveningGown';
                const imgSrc = btn.dataset.img;
                const title = btn.dataset.title;

                const sec3d = document.getElementById('view-3d');
                if (sec3d) sec3d.scrollIntoView({ behavior: 'smooth' });

                if (studio) {
                    studio.setGarment(garment);
                    v3dGarmentBtns.forEach(b => {
                        b.classList.toggle('active', b.dataset.garment === garment);
                    });

                    if (imgSrc && sketchStudio) {
                        fetch(imgSrc)
                            .then(r => r.blob())
                            .then(blob => {
                                const f = new File([blob], "sketch.png", { type: blob.type || "image/png" });
                                sketchStudio.loadImage(f);
                            }).catch(() => {});
                    }
                    showToast(`Draping "${title}" on 3D Runway`);
                }
            });
        });

        // Wire Likes
        grid.querySelectorAll('.hub-like-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const list = getDesigns();
                const target = list.find(x => x.id === id);
                if (target) {
                    target.likes = (target.likes || 0) + 1;
                    saveDesigns(list);
                    const num = btn.querySelector('.like-num');
                    if (num) num.innerText = target.likes;
                }
            });
        });
    };

    renderHub();

    // Dropzone & File Input
    const dropzone = document.getElementById('hub-dropzone');
    const fileInput = document.getElementById('hub-file-input');
    const previewThumb = document.getElementById('hub-preview-thumb');
    let uploadedDataUrl = null;

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        ['dragenter', 'dragover'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            dropzone.addEventListener(name, (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-active');
            });
        });

        const handleFile = (file) => {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select a valid image file');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedDataUrl = e.target.result;
                if (previewThumb) {
                    previewThumb.src = uploadedDataUrl;
                    previewThumb.style.display = 'block';
                }
                showToast(`"${file.name}" ready to publish`);
            };
            reader.readAsDataURL(file);
        };

        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    // Publish Button
    const publishBtn = document.getElementById('hub-publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('hub-title');
            const designerInput = document.getElementById('hub-designer');
            const catInput = document.getElementById('hub-category');
            const garmentInput = document.getElementById('hub-garment-type');
            const fabricInput = document.getElementById('hub-fabric');

            const title = titleInput ? titleInput.value.trim() : '';
            const designer = designerInput ? designerInput.value.trim() : 'Vidushi';
            const category = catInput ? catInput.value : 'Haute Couture';
            const garment = garmentInput ? garmentInput.value : 'eveningGown';
            const fabric = fabricInput ? fabricInput.value.trim() : 'Bespoke atelier creation';

            if (!title) {
                showToast('Please enter a Design Title');
                if (titleInput) titleInput.focus();
                return;
            }

            const imgToUse = uploadedDataUrl || 'assets/sketch_croquis_1.svg';

            const newEntry = {
                id: 'des_' + Date.now(),
                title,
                designer: designer || 'Vidushi',
                category,
                garment,
                fabric: fabric || 'Bespoke design',
                image: imgToUse,
                likes: 1
            };

            const current = getDesigns();
            current.unshift(newEntry);
            saveDesigns(current);

            renderHub();
            showToast(`Design "${title}" published to public showcase`);

            if (titleInput) titleInput.value = '';
            if (fabricInput) fabricInput.value = '';
            if (previewThumb) {
                previewThumb.style.display = 'none';
                previewThumb.src = '';
            }
            uploadedDataUrl = null;
        });
    }

    // ==========================================
    // 5. LIGHTBOX MODAL
    // ==========================================
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');

    window.openLightbox = (title, src) => {
        if (modal && modalImg && modalTitle) {
            modalImg.src = src;
            modalTitle.innerText = title;
            modal.classList.add('active');
        }
    };

    window.closeLightbox = () => {
        if (modal) modal.classList.remove('active');
    };

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });
    }

    // ==========================================
    // 6. CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('front-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cf-name').value;
            const email = document.getElementById('cf-email').value;
            const type = document.getElementById('cf-type').value;

            const inq = {
                id: 'inq_' + Date.now(),
                date: new Date().toLocaleDateString(),
                name,
                email,
                type
            };

            try {
                const list = JSON.parse(localStorage.getItem('atelier_vidushi_inquiries') || '[]');
                list.unshift(inq);
                localStorage.setItem('atelier_vidushi_inquiries', JSON.stringify(list));
            } catch (err) {}

            showToast(`Thank you, ${name}. Inquiry sent to Vidushi.`);
            contactForm.reset();
        });
    }

    // ==========================================
    // 7. SMOOTH SCROLLING & ACTIVE NAV LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    window.addEventListener('scroll', () => {
        const sections = ['hero', 'all-designs', 'view-3d', 'community-hub', 'contact'];
        const scrollY = window.pageYOffset + 100;

        sections.forEach(secId => {
            const sec = document.getElementById(secId);
            const link = document.querySelector(`.site-header a[href="#${secId}"]`);
            if (sec && link) {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.site-header .nav-item a').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
});
