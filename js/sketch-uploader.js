/**
 * Atelier Vidushi - Professional Sketch & Croquis Processing Studio
 * Enables fashion sketch scanning, paper background removal, placement mapping,
 * and live webcam capture of physical sketchbook pages.
 */

class SketchStudio {
    constructor(studioInstance) {
        this.studio = studioInstance;
        this.rawImage = null;
        this.processedCanvas = document.createElement('canvas');
        this.processedCtx = this.processedCanvas.getContext('2d');

        // Processing options
        this.blendMode = 'multiply'; // 'multiply', 'extract_lines', 'full_artwork', 'watercolor'
        this.contrast = 1.25;
        this.brightness = 1.05;
        this.threshold = 180;
        this.lineTint = '#d4af37';
        this.useTint = false;

        // Placement options
        this.placementMode = 'all_over'; // 'all_over', 'bodice', 'skirt_border', 'shoulder'
        this.placementScale = 1.0;
        this.placementX = 0.5; // Normalized 0-1
        this.placementY = 0.5;

        // Camera stream
        this.videoStream = null;

        this.init();
    }

    init() {
        this.initInteractiveCroquis();
    }

    // Load Image from file, camera, or URL
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.rawImage = img;
                this.processSketch();
                this.updateCroquisPreview();
                this.applyTo3D();
                resolve(img);
            };
            img.onerror = reject;

            if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof Blob || source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(source);
            }
        });
    }

    // Process Sketch (Clean paper, adjust levels, remove paper background)
    processSketch() {
        if (!this.rawImage) return;

        const w = this.rawImage.width || 1024;
        const h = this.rawImage.height || 1024;
        const maxDim = 1536;

        let targetW = w;
        let targetH = h;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                targetW = maxDim;
                targetH = Math.round((h / w) * maxDim);
            } else {
                targetH = maxDim;
                targetW = Math.round((w / h) * maxDim);
            }
        }

        this.processedCanvas.width = targetW;
        this.processedCanvas.height = targetH;
        const ctx = this.processedCtx;

        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(this.rawImage, 0, 0, targetW, targetH);

        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;

        // Contrast and Brightness factor
        const cFactor = (259 * (this.contrast * 255 + 255)) / (255 * (259 - this.contrast * 255));
        const bOffset = (this.brightness - 1.0) * 100;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Apply Brightness & Contrast
            r = Math.min(255, Math.max(0, cFactor * (r + bOffset - 128) + 128));
            g = Math.min(255, Math.max(0, cFactor * (g + bOffset - 128) + 128));
            b = Math.min(255, Math.max(0, cFactor * (b + bOffset - 128) + 128));

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (this.blendMode === 'multiply') {
                // Transparent paper: white paper becomes 100% transparent, dark ink/pencil stays dark
                const alpha = Math.max(0, Math.min(255, (255 - lum) * 1.5));
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = alpha;
            } else if (this.blendMode === 'extract_lines') {
                // Line extraction: pure lines in selected metallic or colored tint
                const isLine = lum < this.threshold;
                if (isLine) {
                    if (this.useTint) {
                        const tintR = parseInt(this.lineTint.slice(1, 3), 16);
                        const tintG = parseInt(this.lineTint.slice(3, 5), 16);
                        const tintB = parseInt(this.lineTint.slice(5, 7), 16);
                        data[i] = tintR;
                        data[i + 1] = tintG;
                        data[i + 2] = tintB;
                    } else {
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                    data[i + 3] = Math.max(0, Math.min(255, (255 - lum) * 2));
                } else {
                    data[i + 3] = 0; // Completely transparent paper
                }
            } else if (this.blendMode === 'watercolor') {
                // Preserves color saturation while fading pure white highlights
                const alpha = lum > 245 ? 0 : Math.min(255, (255 - lum) * 1.8 + 80);
                data[i] = Math.min(255, r * 1.1);
                data[i + 1] = Math.min(255, g * 1.1);
                data[i + 2] = Math.min(255, b * 1.1);
                data[i + 3] = alpha;
            } else {
                // 'full_artwork' (standard photo/print)
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    // Generate Final Texture based on Placement Mode
    generateCompositeTexture() {
        const outCanvas = document.createElement('canvas');
        outCanvas.width = 1024;
        outCanvas.height = 1024;
        const ctx = outCanvas.getContext('2d');

        // Fill background with active studio base color
        ctx.fillStyle = this.studio.baseColor;
        ctx.fillRect(0, 0, 1024, 1024);

        if (!this.processedCanvas.width) return outCanvas;

        const sCanvas = this.processedCanvas;

        if (this.placementMode === 'all_over') {
            // Tiling Pattern Repeat
            const tileW = Math.max(128, Math.min(1024, 512 / this.placementScale));
            const tileH = Math.max(128, Math.min(1024, (512 / this.placementScale) * (sCanvas.height / sCanvas.width)));

            for (let x = 0; x < 1024; x += tileW) {
                for (let y = 0; y < 1024; y += tileH) {
                    ctx.drawImage(sCanvas, x, y, tileW, tileH);
                }
            }
        } else if (this.placementMode === 'bodice') {
            // Centered Bodice Motif
            const size = 380 * this.placementScale;
            const aspect = sCanvas.width / sCanvas.height;
            const dw = aspect >= 1 ? size : size * aspect;
            const dh = aspect >= 1 ? size / aspect : size;
            const cx = 1024 * this.placementX - dw / 2;
            const cy = 1024 * (0.28 + (this.placementY - 0.5) * 0.4) - dh / 2;
            ctx.drawImage(sCanvas, cx, cy, dw, dh);
        } else if (this.placementMode === 'skirt_border') {
            // Hemline border running along skirt bottom
            const borderH = 280 * this.placementScale;
            const tileW = borderH * (sCanvas.width / sCanvas.height);
            const borderY = 1024 - borderH - (this.placementY - 0.5) * 200;

            for (let x = 0; x < 1024; x += tileW) {
                ctx.drawImage(sCanvas, x, borderY, tileW, borderH);
            }
        } else if (this.placementMode === 'shoulder') {
            // Asymmetric Left Shoulder Motif
            const size = 320 * this.placementScale;
            const cx = 220 + (this.placementX - 0.5) * 200;
            const cy = 160 + (this.placementY - 0.5) * 200;
            ctx.drawImage(sCanvas, cx, cy, size, size * (sCanvas.height / sCanvas.width));
        }

        return outCanvas;
    }

    applyTo3D() {
        const composite = this.generateCompositeTexture();
        this.studio.applyCustomTexture(composite);
    }

    // 2D Croquis Interactive Visual Placement Canvas
    initInteractiveCroquis() {
        this.croquisCanvas = document.getElementById('croquis-placement-canvas');
        if (!this.croquisCanvas) return;
        this.croquisCtx = this.croquisCanvas.getContext('2d');
        this.croquisCanvas.width = 320;
        this.croquisCanvas.height = 480;

        let isDragging = false;

        const updatePosFromEvent = (e) => {
            const rect = this.croquisCanvas.getBoundingClientRect();
            const x = Math.max(0.1, Math.min(0.9, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / rect.height));
            this.placementX = x;
            this.placementY = y;
            this.updateCroquisPreview();
            this.applyTo3D();
        };

        this.croquisCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            updatePosFromEvent(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updatePosFromEvent(e);
        });

        window.addEventListener('mouseup', () => { isDragging = false; });
        this.updateCroquisPreview();
    }

    // Draw Fashion Mannequin Silhouette with Sketch Placement Box
    updateCroquisPreview() {
        if (!this.croquisCanvas) return;
        const ctx = this.croquisCtx;
        const w = this.croquisCanvas.width;
        const h = this.croquisCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = '#101015';
        ctx.fillRect(0, 0, w, h);

        // Draw elegant fashion croquis silhouette guidelines
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
        ctx.lineWidth = 1.5;

        // Head/neck
        ctx.beginPath();
        ctx.ellipse(w / 2, 45, 18, 24, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w / 2, 69);
        ctx.lineTo(w / 2, 85);
        ctx.stroke();

        // Shoulder to waist to hips
        ctx.beginPath();
        ctx.moveTo(w / 2 - 55, 95);  // Left shoulder
        ctx.lineTo(w / 2 + 55, 95);  // Right shoulder
        ctx.lineTo(w / 2 + 35, 160); // Waist
        ctx.lineTo(w / 2 + 55, 230); // Hips
        ctx.lineTo(w / 2 + 95, 420); // Hemline right
        ctx.lineTo(w / 2 - 95, 420); // Hemline left
        ctx.lineTo(w / 2 - 55, 230); // Hips left
        ctx.lineTo(w / 2 - 35, 160); // Waist left
        ctx.closePath();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
        ctx.fill();
        ctx.stroke();

        // Bust & waist guide lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(w / 2 - 45, 130);
        ctx.lineTo(w / 2 + 45, 130); // Bust line
        ctx.moveTo(w / 2 - 35, 160);
        ctx.lineTo(w / 2 + 35, 160); // Waist line
        ctx.moveTo(w / 2 - 55, 230);
        ctx.lineTo(w / 2 + 55, 230); // Hip line
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw placement target box
        const targetX = w * this.placementX;
        const targetY = h * this.placementY;
        const boxSize = 75 * this.placementScale;

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.strokeRect(targetX - boxSize / 2, targetY - boxSize / 2, boxSize, boxSize);
        ctx.fillRect(targetX - boxSize / 2, targetY - boxSize / 2, boxSize, boxSize);

        // Thumbnail of sketch inside box
        if (this.processedCanvas.width > 0) {
            ctx.drawImage(this.processedCanvas, targetX - boxSize / 2, targetY - boxSize / 2, boxSize, boxSize);
        }

        // Crosshair center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Instructions text
        ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ Click / Drag to position sketch on croquis ✦', w / 2, h - 16);
    }

    // Live Webcam Scanner (Capture physical paper sketchbook page)
    startWebcamScanner(videoElemId) {
        return new Promise((resolve, reject) => {
            const video = document.getElementById(videoElemId);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('Webcam not supported on this browser.'));
                return;
            }

            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
                .then(stream => {
                    this.videoStream = stream;
                    if (video) {
                        video.srcObject = stream;
                        video.play();
                    }
                    resolve(stream);
                })
                .catch(reject);
        });
    }

    captureWebcamSnapshot(videoElemId) {
        const video = document.getElementById(videoElemId);
        if (!video || !this.videoStream) return;

        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = video.videoWidth || 1280;
        snapCanvas.height = video.videoHeight || 720;
        const ctx = snapCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

        // Turn off webcam stream
        this.stopWebcamScanner();

        // Load as sketch
        return this.loadImage(snapCanvas.toDataURL('image/png'));
    }

    stopWebcamScanner() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }
}

window.SketchStudio = SketchStudio;
