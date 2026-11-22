/**
 * Atelier Vidushi - Professional Fashion Tech Pack & Spec Sheet Generator
 * Generates industry-standard technical sheets for garment production and portfolio presentations.
 */

class TechPackGenerator {
    constructor(studioInstance, sketchStudioInstance) {
        this.studio = studioInstance;
        this.sketchStudio = sketchStudioInstance;
    }

    generateData(customTitle = '', clientNotes = '') {
        const dateStr = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const garmentNames = {
            eveningGown: 'Royal Flared Evening Gown',
            royalSaree: 'Haute Couture Royal Saree & Draped Gown',
            cocktailWrap: 'Asymmetric Cocktail Wrap Dress',
            coutureBlazer: 'Architectural Power Blazer & Pencil Skirt',
            modernStreet: 'Modern Luxury Streetwear Ensemble'
        };

        const fabricCompositions = {
            silk: '100% Mulberry Silk Satin (19 Momme, 82 GSM) - High Gloss Sheen',
            velvet: 'Silk-Rayon Blend Velvet (240 GSM) - Matte Deep Pile',
            organza: '100% Pure Silk Organza (45 GSM) - Sheer Crisp Translucency',
            brocade: 'Metallic Lurex & Zari Jacquard Brocade (220 GSM) - Opulent Gold Weave',
            linen: '100% Belgian Long-Staple Linen (165 GSM) - Natural Textured Weave'
        };

        const seamNotes = {
            eveningGown: 'Interior boned corset bodice with spiral steel boning. French seams along flared skirt panels with 2" horsehair braid hemline.',
            royalSaree: 'Micro-pleated front drape with reinforced inner waistband. Hand-finished gold zardozi border along pallu hem.',
            cocktailWrap: 'Bias-cut drape with reinforced stay-tape at asymmetric neckline. Invisible side zipper closure.',
            coutureBlazer: 'Fused tailored canvas chest piece with shoulder pads. Double-breasted functional horn/gold button closures.',
            modernStreet: 'Drop-shoulder reinforced neckband with twin-needle hem. Knife-pleated skirt with clean waistband.'
        };

        const codeNum = Math.floor(100 + Math.random() * 900);
        const styleCode = `VID-SS26-${codeNum}`;
        const renderImg = this.studio.captureRunwaySnapshot();

        return {
            designer: 'Vidushi',
            brand: 'Atelier Vidushi Haute Couture',
            styleCode: styleCode,
            title: customTitle || garmentNames[this.studio.currentGarmentKey] || 'Exclusive Couture Design',
            garmentType: garmentNames[this.studio.currentGarmentKey],
            date: dateStr,
            season: 'Spring/Summer Haute Couture 2026',
            fabricComposition: fabricCompositions[this.studio.fabricType] || 'Luxury Blend',
            baseColor: this.studio.baseColor.toUpperCase(),
            seamDetails: seamNotes[this.studio.currentGarmentKey],
            renderThumbnail: renderImg,
            sketchThumbnail: this.sketchStudio && this.sketchStudio.processedCanvas ? this.sketchStudio.processedCanvas.toDataURL() : null,
            measurements: {
                bust: '34" (86 cm)',
                waist: '26" (66 cm)',
                hips: '36" (91 cm)',
                shoulder: '15.5" (39 cm)',
                length: '58" (147 cm)',
                sweep: '120" (305 cm)'
            },
            notes: clientNotes || 'Created for runway and bespoke haute couture clients in Atelier Vidushi.'
        };
    }

    renderTechPackModal(targetContainerId, title = '', notes = '') {
        const container = document.getElementById(targetContainerId);
        if (!container) return;

        const data = this.generateData(title, notes);

        container.innerHTML = `
            <div class="techpack-sheet" id="printable-techpack">
                <!-- Header Banner -->
                <div class="tp-header">
                    <div class="tp-brand-col">
                        <h2>ATELIER VIDUSHI</h2>
                        <span class="tp-sub">HAUTE COUTURE SPECIFICATION TECH PACK</span>
                    </div>
                    <div class="tp-meta-col">
                        <div><strong>STYLE CODE:</strong> ${data.styleCode}</div>
                        <div><strong>DESIGNER:</strong> ${data.designer}</div>
                        <div><strong>SEASON:</strong> ${data.season}</div>
                        <div><strong>DATE:</strong> ${data.date}</div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="tp-grid">
                    <!-- Left: 3D Visual & Sketch -->
                    <div class="tp-visuals-col">
                        <div class="tp-visual-box">
                            <span class="tp-box-title">3D RUNWAY PROTOTYPE</span>
                            <img src="${data.renderThumbnail}" alt="3D Render" class="tp-render-img"/>
                        </div>
                        ${data.sketchThumbnail ? `
                            <div class="tp-sketch-box">
                                <span class="tp-box-title">ORIGINAL DESIGN / PATTERN SKETCH</span>
                                <img src="${data.sketchThumbnail}" alt="Original Sketch" class="tp-sketch-img"/>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right: Technical Specifications -->
                    <div class="tp-specs-col">
                        <div class="tp-spec-group">
                            <h4>GARMENT IDENTIFICATION</h4>
                            <table class="tp-table">
                                <tr><td>Garment Name:</td><td><strong>${data.title}</strong></td></tr>
                                <tr><td>Silhouette Classification:</td><td>${data.garmentType}</td></tr>
                                <tr><td>Fit Category:</td><td>Bespoke Couture Tailoring</td></tr>
                            </table>
                        </div>

                        <div class="tp-spec-group">
                            <h4>TEXTILE & MATERIAL COMPOSITION</h4>
                            <table class="tp-table">
                                <tr><td>Fabric Type:</td><td>${data.fabricComposition}</td></tr>
                                <tr><td>Primary Color:</td><td>
                                    <div class="tp-color-swatch-row">
                                        <span class="tp-swatch-circle" style="background:${data.baseColor}"></span>
                                        <span>${data.baseColor}</span>
                                    </div>
                                </td></tr>
                                <tr><td>Finish & Treatment:</td><td>Anti-static luster treatment, hand-draped</td></tr>
                            </table>
                        </div>

                        <div class="tp-spec-group">
                            <h4>GARMENT SPEC MEASUREMENTS (STANDARD SAMPLE SIZE US 4 / UK 8)</h4>
                            <table class="tp-table tp-measurements">
                                <tr>
                                    <td>Bust: <strong>${data.measurements.bust}</strong></td>
                                    <td>Waist: <strong>${data.measurements.waist}</strong></td>
                                    <td>Hips: <strong>${data.measurements.hips}</strong></td>
                                </tr>
                                <tr>
                                    <td>Shoulder: <strong>${data.measurements.shoulder}</strong></td>
                                    <td>Total Length: <strong>${data.measurements.length}</strong></td>
                                    <td>Sweep: <strong>${data.measurements.sweep}</strong></td>
                                </tr>
                            </table>
                        </div>

                        <div class="tp-spec-group">
                            <h4>SEAM FINISHES & CONSTRUCTION DIRECTIVES</h4>
                            <p class="tp-seam-text">${data.seamDetails}</p>
                        </div>

                        <div class="tp-spec-group">
                            <h4>DESIGNER & ATELIER PRODUCTION NOTES</h4>
                            <p class="tp-notes-text">${data.notes}</p>
                        </div>
                    </div>
                </div>

                <!-- Footer Sign-off -->
                <div class="tp-footer">
                    <div class="tp-signature">
                        <span>Lead Designer Approval:</span>
                        <span class="sig-name">Vidushi ⚜️</span>
                    </div>
                    <div class="tp-stamp">
                        <span>CONFIDENTIAL • ATELIER VIDUSHI PRIVATE ARCHIVE</span>
                    </div>
                </div>
            </div>
        `;
    }

    printTechPack() {
        window.print();
    }
}

window.TechPackGenerator = TechPackGenerator;
