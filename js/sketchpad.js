/**
 * Atelier Vidushi - 2D Fashion Pattern Sketchpad
 * Allows Vidushi to draw custom prints, embroidery, and motifs directly in the app
 * and project them onto the 3D dress in real-time.
 */

class SketchpadStudio {
    constructor(canvasId, onApplyCallback) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.onApplyCallback = onApplyCallback;

        this.isDrawing = false;
        this.brushColor = '#d4af37';
        this.brushSize = 6;
        this.isEraser = false;
        this.symmetry = 'none'; // 'none', 'mirrorX', 'mandala4', 'mandala8'
        this.history = [];
        this.historyStep = -1;

        this.init();
    }

    init() {
        this.resize();
        this.clearCanvas('#121216');
        this.saveState();

        // Mouse & Touch events
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        window.addEventListener('mouseup', () => this.stopDraw());

        this.canvas.addEventListener('touchstart', (e) => this.startTouch(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.drawTouch(e), { passive: false });
        window.addEventListener('touchend', () => this.stopDraw());
    }

    resize() {
        // Set internal resolution
        this.canvas.width = 600;
        this.canvas.height = 600;
    }

    clearCanvas(bgColor = '#121216') {
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDraw(e) {
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getPos(e);
        this.drawLineWithSymmetry(this.lastX, this.lastY, pos.x, pos.y);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    startTouch(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            this.startDraw(e.touches[0]);
        }
    }

    drawTouch(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            this.draw(e.touches[0]);
        }
    }

    stopDraw() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    drawLineSegment(x1, y1, x2, y2) {
        this.ctx.save();
        this.ctx.strokeStyle = this.isEraser ? '#121216' : this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawLineWithSymmetry(x1, y1, x2, y2) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        if (this.symmetry === 'none') {
            this.drawLineSegment(x1, y1, x2, y2);
        } else if (this.symmetry === 'mirrorX') {
            this.drawLineSegment(x1, y1, x2, y2);
            this.drawLineSegment(w - x1, y1, w - x2, y2);
        } else if (this.symmetry === 'mandala4') {
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                this.drawRotatedLine(x1 - cx, y1 - cy, x2 - cx, y2 - cy, angle, cx, cy);
            }
        } else if (this.symmetry === 'mandala8') {
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                this.drawRotatedLine(x1 - cx, y1 - cy, x2 - cx, y2 - cy, angle, cx, cy);
            }
        }
    }

    drawRotatedLine(rx1, ry1, rx2, ry2, angle, cx, cy) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const nx1 = cx + rx1 * cos - ry1 * sin;
        const ny1 = cy + rx1 * sin + ry1 * cos;
        const nx2 = cx + rx2 * cos - ry2 * sin;
        const ny2 = cy + rx2 * sin + ry2 * cos;

        this.drawLineSegment(nx1, ny1, nx2, ny2);
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        if (this.history.length > 25) {
            this.history.shift();
            this.historyStep--;
        }
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.ctx.putImageData(this.history[this.historyStep], 0, 0);
        }
    }

    applyToStudio() {
        if (this.onApplyCallback) {
            this.onApplyCallback(this.canvas);
        }
    }
}

window.SketchpadStudio = SketchpadStudio;
