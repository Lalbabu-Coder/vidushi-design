/**
 * Atelier Vidushi - Front Page & Boutique E-Commerce Controller
 * Manages:
 * 1. Vidushi's Designer Profile & Editorial Hero
 * 2. Boutique Store (Browse & Buy Designs Online)
 * 3. Instant Checkout & WhatsApp Order Modal
 * 4. Post New Design (Upload & List for Sale)
 * 5. Curated Lookbook & Lightbox
 * 6. Bespoke Consultations & Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. AUDIO CHIMES & NOTIFICATION HELPER
    // ==========================================
    const AudioCues = {
        ctx: null,
        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) this.ctx = new AudioContext();
            }
        },
        playChime() {
            try {
                this.init();
                if (!this.ctx) return;
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.06);
                    gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(this.ctx.currentTime + i * 0.06);
                    osc.stop(this.ctx.currentTime + i * 0.06 + 0.4);
                });
            } catch (e) {}
        }
    };

    const showToast = (message) => {
        const toast = document.getElementById('toast-notice');
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3400);
    };

    // ==========================================
    // 2. ATELIER BOUTIQUE STORE (BUY DESIGNS)
    // ==========================================
    const INITIAL_CATALOG = [
        {
            id: 'item_1',
            title: 'Nocturne Emerald Velvet Gown',
            designer: 'Vidushi',
            category: 'Haute Couture',
            price: 38500,
            sizes: ['XS', 'S', 'M', 'L', 'Custom'],
            stock: 'Made-to-Order (7-10 Days)',
            fabric: 'Deep emerald green silk velvet with antique gold filigree embroidery, structured sweetheart corset, and cathedral train.',
            image: 'assets/look1_emerald_velvet_ballgown.jpg'
        },
        {
            id: 'item_2',
            title: 'Royal Zardozi Heritage Lehenga',
            designer: 'Vidushi',
            category: 'Heritage Bridal',
            price: 75000,
            sizes: ['Made-to-measure', 'S', 'M', 'L'],
            stock: 'Bespoke Bridal Commission',
            fabric: 'Champagne ivory pure silk lehenga with 24K antique gold zardozi, dabka, and pearl embroidery with scalloped organza dupatta.',
            image: 'assets/look2_ivory_gold_lehenga.jpg'
        },
        {
            id: 'item_3',
            title: 'Solaris Pagoda Power Blazer',
            designer: 'Vidushi',
            category: 'Tailoring',
            price: 24000,
            sizes: ['S', 'M', 'L'],
            stock: 'Ready to Ship',
            fabric: 'Extreme sharp flared pagoda shoulders in jet black wool crepe with lustrous duchess satin lapels and cigarette trousers.',
            image: 'assets/look3_architectural_blazer.jpg'
        },
        {
            id: 'item_4',
            title: 'Blush Rose Cocktail Saree',
            designer: 'Vidushi',
            category: 'Cocktail Drapes',
            price: 32000,
            sizes: ['Free Size', 'Custom Blouse'],
            stock: 'Made-to-Order',
            fabric: 'Liquid asymmetric pre-pleated drape in blush pink georgette with micro-pearl borders and metallic corset blouse.',
            image: 'assets/look4_blush_draped_saree.jpg'
        },
        {
            id: 'item_5',
            title: 'Midnight Sapphire Starlight Gown',
            designer: 'Vidushi',
            category: 'Haute Couture',
            price: 45000,
            sizes: ['XS', 'S', 'M', 'Custom'],
            stock: 'Red Carpet Exclusive',
            fabric: 'Deep midnight navy silk tulle ballgown with hand-embroidered Swarovski crystal constellations and sheer corset.',
            image: 'assets/look5_sapphire_starlight_gown.jpg'
        },
        {
            id: 'item_6',
            title: 'Crimson Raw Silk Royal Anarkali',
            designer: 'Vidushi',
            category: 'Heritage Bridal',
            price: 29500,
            sizes: ['S', 'M', 'L', 'XL'],
            stock: 'Ready to Ship',
            fabric: 'Pure crimson red raw silk flared silhouette with high mandarin collar, antique gold buttons, and sheer dupatta.',
            image: 'assets/look6_crimson_royal_anarkali.jpg'
        },
        {
            id: 'item_7',
            title: 'Lavender Cloud Wave Gown',
            designer: 'Vidushi',
            category: 'Avant-Garde',
            price: 42000,
            sizes: ['S', 'M', 'Custom fit'],
            stock: 'Runway Special',
            fabric: 'Multi-tiered cascading micro-ruffles in misty lavender sheer silk organza with sculpted wave bodice.',
            image: 'assets/look7_lavender_cloud_gown.jpg'
        }
    ];

    const getCatalog = () => {
        try {
            const raw = localStorage.getItem('atelier_vidushi_store_catalog_v3');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        localStorage.setItem('atelier_vidushi_store_catalog_v3', JSON.stringify(INITIAL_CATALOG));
        return INITIAL_CATALOG;
    };

    const saveCatalog = (list) => {
        try {
            localStorage.setItem('atelier_vidushi_store_catalog_v3', JSON.stringify(list));
        } catch (e) {}
    };

    // Render Boutique Store Grid
    const renderShop = (filter = 'all') => {
        const grid = document.getElementById('shop-grid');
        const countTag = document.getElementById('shop-count-tag');
        if (!grid) return;

        const catalog = getCatalog();
        const filtered = filter === 'all' ? catalog : catalog.filter(x => x.category === filter);

        if (countTag) {
            countTag.innerText = `${filtered.length} Designs Available to Buy`;
        }

        grid.innerHTML = filtered.map(item => `
            <div class="shop-card" data-id="${item.id}" data-category="${item.category}">
                <div class="shop-card-media" onclick="openLightbox('${item.title.replace(/'/g, "\\'")}', '${item.image}')">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <span class="shop-tag-category">${item.category || 'Haute Couture'}</span>
                    <span class="shop-tag-stock">${item.stock || 'Made-to-Order'}</span>
                </div>
                <div class="shop-card-body">
                    <span class="shop-card-designer">Design by ${item.designer || 'Vidushi'}</span>
                    <h3 class="shop-card-title">${item.title}</h3>
                    <p class="shop-card-desc">${item.fabric || 'Bespoke couture creation.'}</p>
                    
                    <div class="shop-sizes-row">
                        <span class="size-label">Sizes:</span>
                        ${(item.sizes || ['Custom']).map(s => `<span class="size-chip">${s}</span>`).join('')}
                    </div>

                    <div class="shop-card-footer">
                        <div class="shop-price-col">
                            <span class="price-sub">Boutique Price</span>
                            <span class="shop-price-amount">₹${Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                        <button type="button" class="btn-buy-piece" onclick="openOrderModal('${item.title.replace(/'/g, "\\'")}', '${item.image}', ${item.price}, '${item.category}')">
                            Buy Now &rarr;
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    renderShop('all');

    // Filter Buttons in Shop
    const shopFilterBtns = document.querySelectorAll('.shop-filter-btn');
    shopFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            shopFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShop(btn.dataset.filter);
        });
    });

    // ==========================================
    // 3. CHECKOUT & ORDER PURCHASE MODAL
    // ==========================================
    const orderModal = document.getElementById('order-modal');
    const orderItemImg = document.getElementById('order-item-img');
    const orderItemTitle = document.getElementById('order-item-title');
    const orderItemCat = document.getElementById('order-item-cat');
    const orderItemPrice = document.getElementById('order-item-price');
    const closeOrderBtn = document.getElementById('close-order-modal-btn');

    let currentOrderItem = null;

    window.openOrderModal = (title, image, price, category = 'Haute Couture') => {
        currentOrderItem = { title, image, price, category };
        if (orderItemTitle) orderItemTitle.innerText = title;
        if (orderItemImg) orderItemImg.src = image;
        if (orderItemCat) orderItemCat.innerText = category;
        if (orderItemPrice) orderItemPrice.innerText = `₹${Number(price).toLocaleString('en-IN')}`;

        if (orderModal) orderModal.classList.add('active');
    };

    window.closeOrderModal = () => {
        if (orderModal) orderModal.classList.remove('active');
    };

    if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) closeOrderModal();
        });
    }

    // Direct WhatsApp Order
    const btnWhatsAppOrder = document.getElementById('btn-whatsapp-order');
    if (btnWhatsAppOrder) {
        btnWhatsAppOrder.addEventListener('click', () => {
            if (!currentOrderItem) return;

            const custName = document.getElementById('order-cust-name').value.trim() || 'Client';
            const size = document.getElementById('order-size-select').value;
            const city = document.getElementById('order-cust-city').value.trim() || 'India';
            const address = document.getElementById('order-cust-address').value.trim() || 'Direct WhatsApp';
            const notes = document.getElementById('order-cust-notes').value.trim() || 'Standard';

            const message = `Namaste Vidushi! ✨\n\nI want to order a design from your Atelier Boutique:\n` +
                `👗 *Design:* ${currentOrderItem.title}\n` +
                `💰 *Price:* ₹${Number(currentOrderItem.price).toLocaleString('en-IN')}\n` +
                `📏 *Size:* ${size}\n` +
                `👤 *Name:* ${custName}\n` +
                `📍 *City:* ${city}\n` +
                `🏡 *Address:* ${address}\n` +
                `📝 *Notes:* ${notes}\n\nPlease confirm availability and payment details. Thank you!`;

            const encoded = encodeURIComponent(message);
            // Open WhatsApp (works with any number, fallback to web)
            window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
            closeOrderModal();
            showToast('Opening WhatsApp to connect with Vidushi! 💬✨');
        });
    }

    // Confirm Instant Order Button
    const btnConfirmOrder = document.getElementById('btn-confirm-order');
    if (btnConfirmOrder) {
        btnConfirmOrder.addEventListener('click', () => {
            if (!currentOrderItem) return;

            const nameInput = document.getElementById('order-cust-name');
            const phoneInput = document.getElementById('order-cust-phone');
            const addressInput = document.getElementById('order-cust-address');

            if (!nameInput.value.trim()) {
                showToast('Please enter your full name');
                nameInput.focus();
                return;
            }
            if (!phoneInput.value.trim()) {
                showToast('Please enter your WhatsApp/Phone number');
                phoneInput.focus();
                return;
            }
            if (!addressInput.value.trim()) {
                showToast('Please enter your delivery address');
                addressInput.focus();
                return;
            }

            const orderId = 'VID-' + Math.floor(1000 + Math.random() * 9000);
            const orderData = {
                orderId,
                date: new Date().toLocaleDateString('en-IN'),
                itemTitle: currentOrderItem.title,
                itemPrice: currentOrderItem.price,
                size: document.getElementById('order-size-select').value,
                customerName: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                city: document.getElementById('order-cust-city').value.trim(),
                address: addressInput.value.trim(),
                notes: document.getElementById('order-cust-notes').value.trim()
            };

            try {
                const existing = JSON.parse(localStorage.getItem('atelier_vidushi_orders') || '[]');
                existing.unshift(orderData);
                localStorage.setItem('atelier_vidushi_orders', JSON.stringify(existing));
            } catch (err) {}

            AudioCues.playChime();
            showToast(`Order Placed! Order ID: #${orderId}. Vidushi's team will contact you. ✨`);
            closeOrderModal();

            // Reset checkout inputs
            nameInput.value = '';
            phoneInput.value = '';
            addressInput.value = '';
            document.getElementById('order-cust-city').value = '';
            document.getElementById('order-cust-notes').value = '';
        });
    }

    // ==========================================
    // 4. POST NEW DESIGN & SELL
    // ==========================================
    const postDropzone = document.getElementById('post-dropzone');
    const postFileInput = document.getElementById('post-file-input');
    const postPreviewThumb = document.getElementById('post-preview-thumb');
    let uploadedPostImageUrl = null;

    if (postDropzone && postFileInput) {
        postDropzone.addEventListener('click', () => postFileInput.click());

        ['dragenter', 'dragover'].forEach(name => {
            postDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                postDropzone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            postDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                postDropzone.classList.remove('drag-active');
            });
        });

        const handlePostFile = (file) => {
            if (!file || !file.type.startsWith('image/')) {
                showToast('Please select a valid image file (PNG, JPG, WebP)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedPostImageUrl = e.target.result;
                if (postPreviewThumb) {
                    postPreviewThumb.src = uploadedPostImageUrl;
                    postPreviewThumb.style.display = 'block';
                }
                showToast(`"${file.name}" loaded! Ready to publish.`);
            };
            reader.readAsDataURL(file);
        };

        postDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handlePostFile(e.dataTransfer.files[0]);
            }
        });

        postFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handlePostFile(e.target.files[0]);
            }
        });
    }

    // Publish New Design Button
    const btnPublishDesign = document.getElementById('btn-publish-design');
    if (btnPublishDesign) {
        btnPublishDesign.addEventListener('click', () => {
            const titleInput = document.getElementById('post-title');
            const designerInput = document.getElementById('post-designer');
            const catInput = document.getElementById('post-category');
            const priceInput = document.getElementById('post-price');
            const sizesInput = document.getElementById('post-sizes');
            const stockInput = document.getElementById('post-stock');
            const fabricInput = document.getElementById('post-fabric');

            const title = titleInput ? titleInput.value.trim() : '';
            const designer = designerInput ? designerInput.value.trim() : 'Vidushi';
            const category = catInput ? catInput.value : 'Haute Couture';
            const price = priceInput ? Number(priceInput.value) : 0;
            const sizesRaw = sizesInput ? sizesInput.value.trim() : 'S, M, L';
            const stock = stockInput ? stockInput.value : 'Made-to-Order';
            const fabric = fabricInput ? fabricInput.value.trim() : 'Bespoke hand-crafted creation.';

            if (!title) {
                showToast('Please enter a Design Title');
                titleInput.focus();
                return;
            }
            if (!price || price <= 0) {
                showToast('Please enter a valid Price in ₹');
                priceInput.focus();
                return;
            }

            const imageToUse = uploadedPostImageUrl || 'assets/look1_emerald_velvet_ballgown.jpg';
            const sizes = sizesRaw.split(',').map(s => s.trim()).filter(Boolean);

            const newProduct = {
                id: 'prod_' + Date.now(),
                title,
                designer,
                category,
                price,
                sizes: sizes.length ? sizes : ['Custom'],
                stock,
                fabric,
                image: imageToUse
            };

            const catalog = getCatalog();
            catalog.unshift(newProduct);
            saveCatalog(catalog);

            // Re-render shop and highlight
            renderShop('all');

            AudioCues.playChime();
            showToast(`Design "${title}" listed for sale at ₹${price.toLocaleString('en-IN')}! 🎉`);

            // Reset form
            titleInput.value = '';
            priceInput.value = '';
            if (fabricInput) fabricInput.value = '';
            if (postPreviewThumb) {
                postPreviewThumb.style.display = 'none';
                postPreviewThumb.src = '';
            }
            uploadedPostImageUrl = null;

            // Scroll to shop so creator sees the live listed item
            const shopSec = document.getElementById('shop');
            if (shopSec) {
                setTimeout(() => shopSec.scrollIntoView({ behavior: 'smooth' }), 300);
            }
        });
    }

    // ==========================================
    // 5. LIGHTBOX MODAL
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');

    window.openLightbox = (title, src) => {
        if (lightboxModal && lightboxImg && lightboxTitle) {
            lightboxImg.src = src;
            lightboxTitle.innerText = title;
            lightboxModal.classList.add('active');
        }
    };

    window.closeLightbox = () => {
        if (lightboxModal) lightboxModal.classList.remove('active');
    };

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // ==========================================
    // 6. BESPOKE CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('front-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cf-name').value.trim();
            const email = document.getElementById('cf-email').value.trim();
            const type = document.getElementById('cf-type').value;

            try {
                const inquiries = JSON.parse(localStorage.getItem('atelier_vidushi_inquiries') || '[]');
                inquiries.unshift({
                    id: 'inq_' + Date.now(),
                    date: new Date().toLocaleDateString('en-IN'),
                    name,
                    email,
                    type
                });
                localStorage.setItem('atelier_vidushi_inquiries', JSON.stringify(inquiries));
            } catch (err) {}

            AudioCues.playChime();
            showToast(`Thank you, ${name}! Your inquiry has been sent to Vidushi. ✨`);
            contactForm.reset();
        });
    }

    // ==========================================
    // 7. SMOOTH SCROLLING & MOBILE NAV
    // ==========================================
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

    if (mobileNavToggle && mobileNavDrawer) {
        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNavToggle.classList.toggle('open');
            mobileNavDrawer.classList.toggle('open');
        });

        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileNavToggle.classList.remove('open');
                mobileNavDrawer.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!mobileNavDrawer.contains(e.target) && !mobileNavToggle.contains(e.target)) {
                mobileNavToggle.classList.remove('open');
                mobileNavDrawer.classList.remove('open');
            }
        });
    }

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

    // Active Navigation on Scroll
    window.addEventListener('scroll', () => {
        const sections = ['hero', 'shop', 'post-design', 'collections', 'about', 'contact'];
        const scrollY = window.pageYOffset + 120;

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
