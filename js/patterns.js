/**
 * Atelier Vidushi - Pattern & Fabric Texture Engine
 * Generates procedural luxury textures and handles user pattern uploads
 */

const PatternEngine = {
    // Canvas helper
    createCanvas(width = 1024, height = 1024) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        return { canvas, ctx };
    },

    // 1. Mughal Heritage Floral Embroidery (Gold on Deep Emerald / Velvet)
    generateMughalEmbroidery(baseColor = '#0b3b24', goldColor = '#e5c158') {
        const { canvas, ctx } = this.createCanvas(1024, 1024);
        
        // Base fabric
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 1024, 1024);

        // Subtle fabric texture noise
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < 30000; i++) {
            ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1.5, 1.5);
        }

        // Draw intricate ornamental Paisley / Floral Medallions
        const drawMedallion = (cx, cy, r) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.strokeStyle = goldColor;
            ctx.fillStyle = 'rgba(229, 193, 88, 0.25)';
            ctx.lineWidth = 3;

            // Outer petal ring
            const petals = 12;
            for (let i = 0; i < petals; i++) {
                const angle = (i * Math.PI * 2) / petals;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;

                ctx.beginPath();
                ctx.arc(px, py, r * 0.28, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Small gold dot
                ctx.beginPath();
                ctx.arc(px * 1.3, py * 1.3, 3, 0, Math.PI * 2);
                ctx.fillStyle = goldColor;
                ctx.fill();
            }

            // Inner rings
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = goldColor;
            ctx.fill();

            // Center gemstone look
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
            ctx.fillStyle = '#b81428'; // Ruby accent
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        };

        const grid = 4;
        const step = 1024 / grid;
        for (let x = 0; x <= grid; x++) {
            for (let y = 0; y <= grid; y++) {
                const cx = x * step;
                const cy = y * step;
                drawMedallion(cx, cy, 55);

                // Alternating delicate vines
                if (x < grid && y < grid) {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(229, 193, 88, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(cx + step/2, cy + step/2, 28, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        return canvas;
    },

    // 2. Liquid Silk French Marble (Rose Quartz & Champagne Gold)
    generateFrenchMarble(baseColor = '#fcf8f5', accentColor = '#d4af37') {
        const { canvas, ctx } = this.createCanvas(1024, 1024);

        // Soft gradient base
        const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(0.5, '#f4ece1');
        grad.addColorStop(1, '#e8d8c8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Flowing marble veins
        const drawVein = (color, width, alpha) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.globalAlpha = alpha;
            ctx.beginPath();

            let x = Math.random() * 1024;
            let y = 0;
            ctx.moveTo(x, y);

            while (y < 1024) {
                const angle = (Math.random() - 0.5) * 1.5;
                const step = 30 + Math.random() * 50;
                x += Math.sin(angle) * step;
                y += Math.cos(angle) * step;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        };

        for (let i = 0; i < 24; i++) {
            drawVein('rgba(180, 150, 130, 0.15)', 15 + Math.random() * 30, 0.6);
        }
        for (let i = 0; i < 16; i++) {
            drawVein(accentColor, 2 + Math.random() * 5, 0.7);
        }

        return canvas;
    },

    // 3. Classic Parisian Houndstooth
    generateHoundstooth(color1 = '#111111', color2 = '#ffffff') {
        const { canvas, ctx } = this.createCanvas(512, 512);
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, 512, 512);

        const size = 64;
        ctx.fillStyle = color1;

        for (let y = 0; y < 512; y += size) {
            for (let x = 0; x < 512; x += size) {
                // Top-left square
                ctx.fillRect(x, y, size / 2, size / 2);

                // Right triangle
                ctx.beginPath();
                ctx.moveTo(x + size / 2, y + size / 2);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size, y + size / 2);
                ctx.fill();

                // Bottom triangle
                ctx.beginPath();
                ctx.moveTo(x + size / 2, y + size / 2);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x + size / 2, y + size);
                ctx.fill();

                // Diagonal tooth
                ctx.beginPath();
                ctx.moveTo(x + size, y + size / 2);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x + size / 2, y + size);
                ctx.fill();
            }
        }
        return canvas;
    },

    // 4. Celestial Midnight Stars & Gold Constellations
    generateCelestialFoil(baseColor = '#0b0f19', goldColor = '#f5d77f') {
        const { canvas, ctx } = this.createCanvas(1024, 1024);

        // Deep cosmic velvet base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 1024, 1024);

        // Gold dust
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const r = Math.random() * 2;
            ctx.fillStyle = Math.random() > 0.4 ? goldColor : 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Starbursts
        const drawStar = (cx, cy, r, points = 4) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = goldColor;
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? r : r * 0.22;
                const angle = (i * Math.PI) / points;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Radiant glow
            ctx.strokeStyle = 'rgba(245, 215, 127, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        };

        // Crescent moon
        const drawMoon = (cx, cy, r) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = goldColor;
            ctx.beginPath();
            ctx.arc(0, 0, r, Math.PI * 0.2, Math.PI * 1.8);
            ctx.bezierCurveTo(r * 0.3, r * 0.8, r * 0.3, -r * 0.8, Math.cos(Math.PI * 0.2) * r, Math.sin(Math.PI * 0.2) * r);
            ctx.fill();
            ctx.restore();
        };

        const grid = 4;
        const step = 1024 / grid;
        for (let x = 0; x < grid; x++) {
            for (let y = 0; y < grid; y++) {
                const cx = (x + 0.5) * step + (Math.random() - 0.5) * 30;
                const cy = (y + 0.5) * step + (Math.random() - 0.5) * 30;
                if ((x + y) % 2 === 0) {
                    drawStar(cx, cy, 26, 8);
                } else {
                    drawMoon(cx, cy, 20);
                }
            }
        }
        return canvas;
    },

    // 5. Delicate Watercolor Botanical Blossom
    generateWatercolorFloral() {
        const { canvas, ctx } = this.createCanvas(1024, 1024);
        ctx.fillStyle = '#fff9f9';
        ctx.fillRect(0, 0, 1024, 1024);

        const drawFlower = (cx, cy, hue) => {
            ctx.save();
            ctx.translate(cx, cy);
            const petals = 6;
            for (let i = 0; i < petals; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / petals);
                ctx.fillStyle = `hsla(${hue}, 70%, 75%, 0.4)`;
                ctx.beginPath();
                ctx.ellipse(0, 30, 18, 35, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `hsla(${hue}, 80%, 65%, 0.3)`;
                ctx.beginPath();
                ctx.ellipse(0, 20, 12, 22, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Stamen center
            ctx.fillStyle = '#f9d342';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        for (let i = 0; i < 28; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const hue = 340 + Math.random() * 30; // Soft rose to peach
            drawFlower(x, y, hue);
        }

        return canvas;
    },

    // 6. Art Deco Geometric Luxury (Black & Gold)
    generateGeometricArtDeco() {
        const { canvas, ctx } = this.createCanvas(512, 512);
        ctx.fillStyle = '#141416';
        ctx.fillRect(0, 0, 512, 512);

        const gold = '#d4af37';
        ctx.strokeStyle = gold;
        ctx.lineWidth = 2;

        const size = 128;
        for (let y = 0; y < 512; y += size) {
            for (let x = 0; x < 512; x += size) {
                // Concentric Arches
                for (let r = 16; r <= size / 2; r += 12) {
                    ctx.beginPath();
                    ctx.arc(x + size / 2, y + size, r, Math.PI, Math.PI * 2);
                    ctx.stroke();
                }

                // Diamond motif
                ctx.beginPath();
                ctx.moveTo(x + size / 2, y);
                ctx.lineTo(x + size, y + size / 2);
                ctx.lineTo(x + size / 2, y + size);
                ctx.lineTo(x, y + size / 2);
                ctx.closePath();
                ctx.stroke();
            }
        }
        return canvas;
    },

    // Realistic Microscopic Fabric Weave Normal Map Generator
    generateFabricWeaveNormalMap() {
        const { canvas, ctx } = this.createCanvas(256, 256);
        const imgData = ctx.createImageData(256, 256);
        const data = imgData.data;

        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const idx = (y * 256 + x) * 4;
                // Twill weave equation
                const fx = (x % 8) / 8;
                const fy = (y % 8) / 8;
                const warp = Math.sin(fx * Math.PI);
                const weft = Math.sin(fy * Math.PI);
                const isOver = ((x >> 2) + (y >> 2)) % 2 === 0;

                const height = isOver ? warp * 0.5 : weft * 0.5;
                const nx = (isOver ? Math.cos(fx * Math.PI) : 0) * 0.5;
                const ny = (!isOver ? Math.cos(fy * Math.PI) : 0) * 0.5;

                data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);     // Red (X normal)
                data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // Green (Y normal)
                data[idx + 2] = 240;                               // Blue (Z normal up)
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }
};

window.PatternEngine = PatternEngine;
