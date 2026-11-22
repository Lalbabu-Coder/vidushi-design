/**
 * Atelier Vidushi - Main Application Controller
 * Handles user interactions, audio cues, modals, file uploads, pro sketch processing,
 * tech pack generator, and UI synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Studio
    const studio = new FashionStudio('studio-viewport');

    // 2. Initialize Lookbook
    const lookbook = new LookbookManager(studio);

    // 3. Initialize Professional Sketch Studio & Tech Pack Generator
    const sketchStudio = new SketchStudio(studio);
    const techPack = new TechPackGenerator(studio, sketchStudio);

    // 4. Audio Synthesizer (Chic Camera Shutter & Atelier Chime via Web Audio API)
    const AudioCues = {
        ctx: null,
        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) this.ctx = new AudioContext();
            }
        },
        playShutter() {
            try {
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
            } catch (e) {}
        },
        playChime() {
            try {
                this.init();
                if (!this.ctx) return;
                const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major luxury arpeggio
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

    // 5. Notification Toast Helper
    const showToast = (message, icon = '✨') => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-text">${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    };

    // 6. Initialize 2D Sketchpad
    const sketchpad = new SketchpadStudio('sketchpad-canvas', (canvas) => {
        sketchStudio.loadImage(canvas.toDataURL()).then(() => {
            AudioCues.playChime();
            showToast('Your hand-drawn sketch is now live on the 3D outfit!', '🎨');
            closeModal('sketchpad-modal');
        });
    });

    // ==========================================
    // GARMENT SILHOUETTE SELECTOR
    // ==========================================
    const garmentBtns = document.querySelectorAll('.garment-btn');
    garmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            garmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const garmentKey = btn.dataset.garment;
            studio.setGarment(garmentKey);
            showToast(`Switched silhouette to ${btn.querySelector('.garment-name').innerText}`, '👗');
        });
    });

    // Check URL parameters for direct garment launch from portfolio
    const urlParams = new URLSearchParams(window.location.search);
    const initialGarment = urlParams.get('garment');
    if (initialGarment && studio.garments[initialGarment]) {
        studio.setGarment(initialGarment);
        garmentBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.garment === initialGarment);
        });
    }

    // ==========================================
    // DESIGN / SKETCH UPLOAD (DRAG & DROP + PICKER)
    // ==========================================
    const uploadInput = document.getElementById('design-upload');
    const uploadDropzone = document.getElementById('upload-dropzone');

    const handleFileUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Please upload an image file (PNG, JPG, WebP, SVG)', '⚠️');
            return;
        }

        sketchStudio.loadImage(file).then(() => {
            AudioCues.playChime();
            showToast(`"${file.name}" draped onto 3D outfit with auto paper clean-up!`, '✨');
            document.querySelectorAll('.pattern-preset-btn').forEach(b => b.classList.remove('active'));
        }).catch(err => {
            console.error(err);
            showToast('Error processing sketch file', '⚠️');
        });
    };

    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    if (uploadDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadDropzone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadDropzone.classList.remove('drag-active');
            });
        });

        uploadDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    // ==========================================
    // PLACEMENT ZONE SELECTOR (ALL-OVER / BODICE / SKIRT / SHOULDER)
    // ==========================================
    const placementBtns = document.querySelectorAll('.placement-btn');
    placementBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            placementBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sketchStudio.placementMode = btn.dataset.placement;
            sketchStudio.applyTo3D();
            sketchStudio.updateCroquisPreview();
            showToast(`Placement changed to ${btn.innerText.trim()}`, '🎯');
        });
    });

    // ==========================================
    // PRO SKETCH FILTERS & PAPER CLEAN-UP
    // ==========================================
    const blendBtns = document.querySelectorAll('.blend-btn');
    blendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            blendBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sketchStudio.blendMode = btn.dataset.blend;
            sketchStudio.processSketch();
            sketchStudio.applyTo3D();
            sketchStudio.updateCroquisPreview();
            showToast(`Paper filter: ${btn.querySelector('strong').innerText}`, '✨');
        });
    });

    const contrastSlider = document.getElementById('sketch-contrast');
    const contrastVal = document.getElementById('contrast-val');
    if (contrastSlider) {
        contrastSlider.addEventListener('input', (e) => {
            sketchStudio.contrast = parseFloat(e.target.value);
            if (contrastVal) contrastVal.innerText = `${sketchStudio.contrast}x`;
            sketchStudio.processSketch();
            sketchStudio.applyTo3D();
            sketchStudio.updateCroquisPreview();
        });
    }

    const thresholdSlider = document.getElementById('sketch-threshold');
    const thresholdVal = document.getElementById('threshold-val');
    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', (e) => {
            sketchStudio.threshold = parseInt(e.target.value, 10);
            if (thresholdVal) thresholdVal.innerText = sketchStudio.threshold;
            sketchStudio.processSketch();
            sketchStudio.applyTo3D();
            sketchStudio.updateCroquisPreview();
        });
    }

    const tintToggle = document.getElementById('tint-toggle');
    const lineTintPicker = document.getElementById('line-tint-picker');
    if (tintToggle) {
        tintToggle.addEventListener('change', (e) => {
            sketchStudio.useTint = e.target.checked;
            sketchStudio.processSketch();
            sketchStudio.applyTo3D();
            sketchStudio.updateCroquisPreview();
        });
    }
    if (lineTintPicker) {
        lineTintPicker.addEventListener('input', (e) => {
            sketchStudio.lineTint = e.target.value;
            if (sketchStudio.useTint) {
                sketchStudio.processSketch();
                sketchStudio.applyTo3D();
                sketchStudio.updateCroquisPreview();
            }
        });
    }

    // ==========================================
    // PHYSICAL NOTEBOOK / WEBCAM SCANNER
    // ==========================================
    const triggerWebcamBtn = document.getElementById('trigger-webcam-btn');
    const openWebcamModalBtn = document.getElementById('open-webcam-modal-btn');
    const webcamBox = document.getElementById('webcam-box');
    const snapWebcamBtn = document.getElementById('snap-webcam-btn');
    const stopWebcamBtn = document.getElementById('stop-webcam-btn');

    const startCamera = () => {
        openModal('sketch-pro-modal');
        if (webcamBox) webcamBox.style.display = 'block';
        sketchStudio.startWebcamScanner('webcam-feed').then(() => {
            showToast('Camera active! Hold up your sketchbook to scan.', '📷');
        }).catch(err => {
            showToast('Camera access blocked or not available', '⚠️');
        });
    };

    if (triggerWebcamBtn) triggerWebcamBtn.addEventListener('click', startCamera);
    if (openWebcamModalBtn) openWebcamModalBtn.addEventListener('click', startCamera);

    if (snapWebcamBtn) {
        snapWebcamBtn.addEventListener('click', () => {
            AudioCues.playShutter();
            sketchStudio.captureWebcamSnapshot('webcam-feed');
            if (webcamBox) webcamBox.style.display = 'none';
            showToast('Physical sketch page scanned & draped onto 3D dress! ✨', '📸');
        });
    }

    if (stopWebcamBtn) {
        stopWebcamBtn.addEventListener('click', () => {
            sketchStudio.stopWebcamScanner();
            if (webcamBox) webcamBox.style.display = 'none';
        });
    }

    const applyProSketchBtn = document.getElementById('apply-pro-sketch-btn');
    if (applyProSketchBtn) {
        applyProSketchBtn.addEventListener('click', () => {
            sketchStudio.applyTo3D();
            closeModal('sketch-pro-modal');
            showToast('Pro sketch adjustments applied to 3D garment! ✨', '👗');
        });
    }

    // ==========================================
    // PRESET PATTERN BUTTONS
    // ==========================================
    const patternBtns = document.querySelectorAll('.pattern-preset-btn');
    patternBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            patternBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const pattern = btn.dataset.pattern;
            studio.loadPresetPattern(pattern);
            showToast(`Applied ${btn.dataset.name || pattern} print`, '✨');
        });
    });

    // ==========================================
    // FABRIC TYPE SELECTOR
    // ==========================================
    const fabricBtns = document.querySelectorAll('.fabric-btn');
    fabricBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fabricBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.fabric;
            studio.setFabricType(type);
            showToast(`Fabric finish changed to ${btn.innerText.trim()}`, '🧵');
        });
    });

    // ==========================================
    // COLOR PICKER & LUXURY PALETTE SWATCHES
    // ==========================================
    const colorPicker = document.getElementById('base-color-picker');
    const colorHexDisplay = document.getElementById('color-hex-label');
    const swatches = document.querySelectorAll('.color-swatch');

    const updateColor = (hex) => {
        studio.setBaseColor(hex);
        if (colorPicker) colorPicker.value = hex;
        if (colorHexDisplay) colorHexDisplay.innerText = hex.toUpperCase();
        swatches.forEach(s => {
            s.classList.toggle('active', s.dataset.color.toLowerCase() === hex.toLowerCase());
        });
        if (sketchStudio.rawImage) {
            sketchStudio.applyTo3D();
        }
    };

    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => updateColor(e.target.value));
    }

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            updateColor(swatch.dataset.color);
        });
    });

    // ==========================================
    // PATTERN TRANSFORM CONTROLS (SCALE, ROTATE, OFFSET)
    // ==========================================
    const scaleSlider = document.getElementById('pattern-scale');
    const scaleVal = document.getElementById('scale-val');
    if (scaleSlider) {
        scaleSlider.addEventListener('input', (e) => {
            const v = e.target.value;
            if (scaleVal) scaleVal.innerText = `${v}x`;
            studio.setTextureScale(v);
            sketchStudio.placementScale = parseFloat(v) / 2.0;
            if (sketchStudio.rawImage) sketchStudio.applyTo3D();
        });
    }

    const rotSlider = document.getElementById('pattern-rotation');
    const rotVal = document.getElementById('rotation-val');
    if (rotSlider) {
        rotSlider.addEventListener('input', (e) => {
            const v = e.target.value;
            if (rotVal) rotVal.innerText = `${v}°`;
            studio.setTextureRotation(v);
        });
    }

    const offsetXSlider = document.getElementById('pattern-offset-x');
    const offsetYSlider = document.getElementById('pattern-offset-y');
    const handleOffset = () => {
        const x = offsetXSlider ? offsetXSlider.value : 0;
        const y = offsetYSlider ? offsetYSlider.value : 0;
        studio.setTextureOffset(x, y);
    };
    if (offsetXSlider) offsetXSlider.addEventListener('input', handleOffset);
    if (offsetYSlider) offsetYSlider.addEventListener('input', handleOffset);

    // ==========================================
    // CAMERA & VIEWPOINT CONTROLS
    // ==========================================
    const camBtns = document.querySelectorAll('.cam-btn');
    camBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            camBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            studio.setCameraPreset(btn.dataset.cam);
        });
    });

    // CAD Wireframe & Measurements Toggle
    const cadModeBtn = document.getElementById('cad-mode-btn');
    if (cadModeBtn) {
        cadModeBtn.addEventListener('click', () => {
            const isNowCad = !studio.isCadMode;
            studio.toggleCadMode(isNowCad);
            cadModeBtn.classList.toggle('active', isNowCad);
            showToast(isNowCad ? '📐 Technical CAD Wireframe & Dimension Guides ON' : 'Photorealistic Runway Mode ON', '📐');
        });
    }

    // Runway Breeze / Cloth Wave Motion Toggle
    const windToggle = document.getElementById('wind-toggle');
    if (windToggle) {
        windToggle.addEventListener('change', (e) => {
            studio.toggleWind(e.target.checked);
            showToast(e.target.checked ? 'Runway cloth breeze enabled' : 'Cloth motion paused', '💨');
        });
    }

    // Turntable Auto-Rotate Toggle
    const rotateToggle = document.getElementById('turntable-toggle');
    if (rotateToggle) {
        rotateToggle.addEventListener('change', (e) => {
            studio.toggleAutoRotate(e.target.checked);
        });
    }

    // Mannequin Form Toggle
    const mannequinToggle = document.getElementById('mannequin-toggle');
    if (mannequinToggle) {
        mannequinToggle.addEventListener('change', (e) => {
            studio.toggleMannequin(e.target.checked);
            showToast(e.target.checked ? 'Mannequin visible' : 'Invisible / Ghost Mannequin runway mode', '✨');
        });
    }

    // Lighting Presets
    const lightBtns = document.querySelectorAll('.light-btn');
    lightBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            lightBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            studio.setLightingPreset(btn.dataset.light);
            showToast(`Lighting: ${btn.innerText.trim()}`, '💡');
        });
    });

    // ==========================================
    // SNAPSHOT / RUNWAY CAPTURE
    // ==========================================
    const snapshotBtn = document.getElementById('capture-snapshot-btn');
    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', () => {
            AudioCues.playShutter();
            const dataUrl = studio.captureRunwaySnapshot();
            
            // Trigger instant download
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `Vidushi_Couture_Look_${timestamp}_${Date.now().toString().slice(-4)}.png`;
            link.href = dataUrl;
            link.click();

            showToast('Runway snapshot captured & downloaded! 📸✨', '🌟');

            // Quick flash overlay animation
            const flash = document.getElementById('camera-flash-overlay');
            if (flash) {
                flash.classList.add('flash-active');
                setTimeout(() => flash.classList.remove('flash-active'), 400);
            }
        });
    }

    // ==========================================
    // FASHION TECH PACK & SPEC SHEET
    // ==========================================
    const printTechPackBtn = document.getElementById('print-techpack-btn');
    if (printTechPackBtn) {
        printTechPackBtn.addEventListener('click', () => {
            techPack.printTechPack();
        });
    }

    // ==========================================
    // LOOKBOOK PORTFOLIO MANAGEMENT
    // ==========================================
    const renderLookbookList = () => {
        const grid = document.getElementById('lookbook-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (lookbook.looks.length === 0) {
            grid.innerHTML = `
                <div class="empty-lookbook">
                    <p>No looks saved yet.</p>
                    <small>Create an outfit and click "Save to Vidushi's Lookbook"!</small>
                </div>
            `;
            return;
        }

        lookbook.looks.forEach(look => {
            const card = document.createElement('div');
            card.className = 'lookbook-card';
            card.innerHTML = `
                <div class="card-thumb-wrap">
                    ${look.thumbnail ? `<img src="${look.thumbnail}" alt="${look.title}" class="card-thumb" />` : '<div class="no-thumb">✨</div>'}
                    <span class="card-date">${look.date}</span>
                </div>
                <div class="card-info">
                    <h4>${look.title}</h4>
                    <p class="card-notes">${look.notes || 'Exclusive couture piece'}</p>
                    <div class="card-tags">
                        <span class="card-tag">${look.fabricType}</span>
                        <span class="card-tag">${look.garmentKey}</span>
                    </div>
                    <div class="card-actions">
                        <button class="load-look-btn" data-id="${look.id}">👗 Load in 3D</button>
                        <button class="delete-look-btn" data-id="${look.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Add event listeners for load & delete
        grid.querySelectorAll('.load-look-btn').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.dataset.id;
                const look = lookbook.looks.find(l => l.id === id);
                if (look) {
                    lookbook.loadLookIntoStudio(look);
                    closeModal('lookbook-modal');
                    showToast(`Loaded "${look.title}" into 3D Studio!`, '👗');
                }
            });
        });

        grid.querySelectorAll('.delete-look-btn').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.dataset.id;
                lookbook.deleteLook(id);
                renderLookbookList();
                showToast('Design removed from Lookbook', '🗑️');
            });
        });
    };

    const saveLookBtn = document.getElementById('save-to-lookbook-btn');
    if (saveLookBtn) {
        saveLookBtn.addEventListener('click', () => {
            const lookTitle = prompt('Enter a name for this runway look:', `Vidushi Couture Look #${lookbook.looks.length + 1}`);
            if (lookTitle) {
                const notes = prompt('Any fabric / design notes? (Optional):', 'Hand-crafted design in Atelier Vidushi');
                lookbook.saveCurrentLook(lookTitle, notes);
                AudioCues.playChime();
                showToast(`"${lookTitle}" saved to Vidushi's Lookbook! ✨`, '📖');
                renderLookbookList();
            }
        });
    }

    // ==========================================
    // FASHION INSPIRATION GENERATOR
    // ==========================================
    const getInspirationBtn = document.getElementById('get-inspiration-btn');
    const applyInspirationBtn = document.getElementById('apply-inspiration-btn');
    let currentInspiration = null;

    const showNewInspiration = () => {
        if (!window.FashionInspiration) return;
        currentInspiration = window.FashionInspiration.getRandomConcept();
        
        document.getElementById('insp-title').innerText = currentInspiration.title;
        document.getElementById('insp-vibe').innerText = currentInspiration.vibe;
        document.getElementById('insp-silhouette').innerText = currentInspiration.silhouette;
        document.getElementById('insp-fabric').innerText = currentInspiration.fabric;

        const paletteWrap = document.getElementById('insp-palette');
        if (paletteWrap) {
            paletteWrap.innerHTML = '';
            currentInspiration.palette.forEach(color => {
                const chip = document.createElement('div');
                chip.className = 'palette-chip';
                chip.style.backgroundColor = color;
                chip.title = color;
                paletteWrap.appendChild(chip);
            });
        }
    };

    if (getInspirationBtn) {
        getInspirationBtn.addEventListener('click', showNewInspiration);
    }

    if (applyInspirationBtn) {
        applyInspirationBtn.addEventListener('click', () => {
            if (!currentInspiration) return;
            // Apply dominant color
            if (currentInspiration.palette.length > 0) {
                updateColor(currentInspiration.palette[0]);
            }
            closeModal('inspiration-modal');
            showToast(`Applied inspiration theme: ${currentInspiration.title}`, '💡');
        });
    }

    // ==========================================
    // MODAL DIALOGS
    // ==========================================
    window.openModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            if (id === 'lookbook-modal') renderLookbookList();
            if (id === 'inspiration-modal') showNewInspiration();
            if (id === 'sketchpad-modal') sketchpad.resize();
            if (id === 'techpack-modal') techPack.renderTechPackModal('techpack-container');
            if (id === 'sketch-pro-modal') sketchStudio.updateCroquisPreview();
        }
    };

    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            if (id === 'sketch-pro-modal') {
                sketchStudio.stopWebcamScanner();
                if (webcamBox) webcamBox.style.display = 'none';
            }
        }
    };

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                if (modal.id === 'sketch-pro-modal') {
                    sketchStudio.stopWebcamScanner();
                    if (webcamBox) webcamBox.style.display = 'none';
                }
            }
        });
    });

    // Close when clicking outside dialog
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                if (overlay.id === 'sketch-pro-modal') {
                    sketchStudio.stopWebcamScanner();
                    if (webcamBox) webcamBox.style.display = 'none';
                }
            }
        });
    });

    // Sketchpad Toolbar Events
    const sketchColorPicker = document.getElementById('sketch-color');
    if (sketchColorPicker) {
        sketchColorPicker.addEventListener('input', (e) => {
            sketchpad.brushColor = e.target.value;
            sketchpad.isEraser = false;
        });
    }

    const sketchBrushSize = document.getElementById('sketch-brush-size');
    if (sketchBrushSize) {
        sketchBrushSize.addEventListener('input', (e) => {
            sketchpad.brushSize = parseInt(e.target.value, 10);
        });
    }

    const symmetrySelect = document.getElementById('sketch-symmetry');
    if (symmetrySelect) {
        symmetrySelect.addEventListener('change', (e) => {
            sketchpad.symmetry = e.target.value;
        });
    }

    const sketchEraserBtn = document.getElementById('sketch-eraser-btn');
    if (sketchEraserBtn) {
        sketchEraserBtn.addEventListener('click', () => {
            sketchpad.isEraser = !sketchpad.isEraser;
            sketchEraserBtn.classList.toggle('active', sketchpad.isEraser);
        });
    }

    const sketchClearBtn = document.getElementById('sketch-clear-btn');
    if (sketchClearBtn) {
        sketchClearBtn.addEventListener('click', () => sketchpad.clearCanvas());
    }

    const sketchUndoBtn = document.getElementById('sketch-undo-btn');
    if (sketchUndoBtn) {
        sketchUndoBtn.addEventListener('click', () => sketchpad.undo());
    }

    const sketchApplyBtn = document.getElementById('sketch-apply-btn');
    if (sketchApplyBtn) {
        sketchApplyBtn.addEventListener('click', () => sketchpad.applyToStudio());
    }

    // ==========================================
    // MOBILE RESPONSIVE DRAWERS & TABS
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const headerActions = document.getElementById('header-actions');
    if (mobileMenuBtn && headerActions) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActions.classList.toggle('mobile-open');
            mobileMenuBtn.innerHTML = headerActions.classList.contains('mobile-open') ? '✕' : '☰';
        });

        // Close when tapping outside
        document.addEventListener('click', (e) => {
            if (!headerActions.contains(e.target) && e.target !== mobileMenuBtn) {
                headerActions.classList.remove('mobile-open');
                mobileMenuBtn.innerHTML = '☰';
            }
        });
    }

    const atelierSidebar = document.getElementById('atelier-sidebar');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const sidebarScroll = document.getElementById('sidebar-scroll');
    const drawerTitle = document.getElementById('drawer-active-title');

    const openDrawer = (title = 'Studio Controls', scrollTarget = null) => {
        if (!atelierSidebar) return;
        atelierSidebar.classList.add('drawer-open');
        if (drawerTitle) drawerTitle.innerText = title;
        if (scrollTarget && sidebarScroll) {
            setTimeout(() => {
                const elem = document.querySelector(scrollTarget);
                if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const closeDrawer = () => {
        if (atelierSidebar) atelierSidebar.classList.remove('drawer-open');
        document.querySelectorAll('.m-nav-tab').forEach(t => t.classList.remove('active'));
        const tab3d = document.getElementById('tab-3d-view');
        if (tab3d) tab3d.classList.add('active');
    };

    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', closeDrawer);
    }

    const tab3dView = document.getElementById('tab-3d-view');
    const tabSilhouettes = document.getElementById('tab-silhouettes');
    const tabUpload = document.getElementById('tab-upload');
    const tabFabrics = document.getElementById('tab-fabrics');
    const tabAllControls = document.getElementById('tab-all-controls');

    if (tab3dView) {
        tab3dView.addEventListener('click', () => {
            closeDrawer();
            showToast('3D Interactive Runway Mode', '👁️');
        });
    }

    if (tabSilhouettes) {
        tabSilhouettes.addEventListener('click', () => {
            document.querySelectorAll('.m-nav-tab').forEach(t => t.classList.remove('active'));
            tabSilhouettes.classList.add('active');
            openDrawer('Couture Silhouettes', '.studio-section:nth-of-type(1)');
        });
    }

    if (tabUpload) {
        tabUpload.addEventListener('click', () => {
            document.querySelectorAll('.m-nav-tab').forEach(t => t.classList.remove('active'));
            tabUpload.classList.add('active');
            openDrawer('Upload Sketches', '.studio-section:nth-of-type(2)');
        });
    }

    if (tabFabrics) {
        tabFabrics.addEventListener('click', () => {
            document.querySelectorAll('.m-nav-tab').forEach(t => t.classList.remove('active'));
            tabFabrics.classList.add('active');
            openDrawer('Luxury Fabrics & Palette', '.studio-section:nth-of-type(3)');
        });
    }

    if (tabAllControls) {
        tabAllControls.addEventListener('click', () => {
            document.querySelectorAll('.m-nav-tab').forEach(t => t.classList.remove('active'));
            tabAllControls.classList.add('active');
            openDrawer('All Studio Controls');
        });
    }

    // Auto-update 3D canvas on mobile resize / orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => studio.onWindowResize(), 250);
    });

    // Welcome greeting
    setTimeout(() => {
        showToast('Welcome, Vidushi! Ready to craft your Haute Couture vision? ✨', '👗');
    }, 800);
});
