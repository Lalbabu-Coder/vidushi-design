/**
 * Atelier Vidushi - 3D Fashion Scene & Garment Engine
 * Manages Three.js renderer, mannequin, 3D garments, fabrics, lights, and camera.
 */

class FashionStudio {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Groups
        this.mannequinGroup = new THREE.Group();
        this.garmentGroup = new THREE.Group();
        this.studioGroup = new THREE.Group();

        // Active States
        this.currentGarmentKey = 'eveningGown';
        this.garments = {};
        this.materials = {};
        this.activeTexture = null;
        this.normalMapTexture = null;

        // Settings
        this.fabricType = 'silk';
        this.baseColor = '#d4af37';
        this.tintColor = '#ffffff';
        this.textureScale = 2.0;
        this.textureRotation = 0;
        this.textureOffsetX = 0;
        this.textureOffsetY = 0;
        this.isAutoRotate = true;
        this.rotateSpeed = 0.8;
        this.showMannequin = true;
        this.isWindActive = true;
        this.isCadMode = false;

        // Clock & Wind Physics
        this.clock = new THREE.Clock();
        this.animatedMeshes = [];
        this.measurementGroup = new THREE.Group();

        // Lighting presets
        this.lights = {};
        this.currentLighting = 'runway';

        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0d);
        this.scene.fog = new THREE.FogExp2(0x0a0a0d, 0.05);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        this.camera.position.set(0, 1.4, 3.8);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below floor
            this.controls.minDistance = 1.2;
            this.controls.maxDistance = 6.0;
            this.controls.target.set(0, 1.15, 0);
            this.controls.autoRotate = this.isAutoRotate;
            this.controls.autoRotateSpeed = this.rotateSpeed;
        }

        // Add groups
        this.scene.add(this.studioGroup);
        this.scene.add(this.mannequinGroup);
        this.scene.add(this.garmentGroup);
        this.scene.add(this.measurementGroup);

        // Build Scene Elements
        this.setupLighting();
        this.buildStudioStage();
        this.buildMannequin();
        this.buildMeasurementGuides();
        this.initTextures();
        this.buildGarments();
        this.setGarment('eveningGown');

        // Events
        window.addEventListener('resize', () => this.onWindowResize());

        // Animation Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setupLighting() {
        // Ambient Light
        this.lights.ambient = new THREE.AmbientLight(0xfff5ea, 0.45);
        this.scene.add(this.lights.ambient);

        // Key Spotlight (Runway focus)
        this.lights.spot = new THREE.SpotLight(0xfff1dc, 2.4);
        this.lights.spot.position.set(2, 4.2, 3);
        this.lights.spot.angle = Math.PI / 5;
        this.lights.spot.penumbra = 0.5;
        this.lights.spot.castShadow = true;
        this.lights.spot.shadow.mapSize.width = 2048;
        this.lights.spot.shadow.mapSize.height = 2048;
        this.lights.spot.shadow.camera.near = 1;
        this.lights.spot.shadow.camera.far = 10;
        this.lights.spot.shadow.bias = -0.001;
        this.scene.add(this.lights.spot);

        // Fill Light
        this.lights.fill = new THREE.DirectionalLight(0xdbe6ff, 0.8);
        this.lights.fill.position.set(-3, 2, 2);
        this.scene.add(this.lights.fill);

        // Rim / Backlight for haute couture silhouette glow
        this.lights.rim = new THREE.PointLight(0xffffff, 1.4, 8);
        this.lights.rim.position.set(0, 2.5, -2.5);
        this.scene.add(this.lights.rim);

        // Base Spotlight (soft floor illumination)
        this.lights.floorSpot = new THREE.SpotLight(0xd4af37, 1.0, 5, Math.PI / 4, 0.8);
        this.lights.floorSpot.position.set(0, 0.1, 0);
        this.lights.floorSpot.target.position.set(0, 1.2, 0);
        this.scene.add(this.lights.floorSpot);
        this.scene.add(this.lights.floorSpot.target);
    }

    setLightingPreset(preset) {
        this.currentLighting = preset;
        switch (preset) {
            case 'runway':
                this.scene.background.set(0x0a0a0d);
                this.lights.ambient.color.set(0xfff5ea);
                this.lights.ambient.intensity = 0.45;
                this.lights.spot.color.set(0xfff1dc);
                this.lights.spot.intensity = 2.4;
                this.lights.rim.color.set(0xffffff);
                this.lights.rim.intensity = 1.4;
                break;
            case 'daylight':
                this.scene.background.set(0x1a1a22);
                this.lights.ambient.color.set(0xffffff);
                this.lights.ambient.intensity = 0.9;
                this.lights.spot.color.set(0xfff8ee);
                this.lights.spot.intensity = 1.5;
                this.lights.rim.color.set(0xd0e2ff);
                this.lights.rim.intensity = 0.8;
                break;
            case 'sunset':
                this.scene.background.set(0x140d12);
                this.lights.ambient.color.set(0xffb088);
                this.lights.ambient.intensity = 0.55;
                this.lights.spot.color.set(0xff9944);
                this.lights.spot.intensity = 2.8;
                this.lights.rim.color.set(0xffd56b);
                this.lights.rim.intensity = 1.6;
                break;
            case 'neon':
                this.scene.background.set(0x06060c);
                this.lights.ambient.color.set(0x221133);
                this.lights.ambient.intensity = 0.35;
                this.lights.spot.color.set(0x00d9ff);
                this.lights.spot.intensity = 2.2;
                this.lights.rim.color.set(0xff007f);
                this.lights.rim.intensity = 2.5;
                break;
        }
    }

    buildStudioStage() {
        // Runway circular podium
        const stageGeo = new THREE.CylinderGeometry(1.4, 1.45, 0.08, 64);
        const stageMat = new THREE.MeshStandardMaterial({
            color: 0x141418,
            roughness: 0.35,
            metalness: 0.4
        });
        const stage = new THREE.Mesh(stageGeo, stageMat);
        stage.position.y = 0.04;
        stage.receiveShadow = true;
        this.studioGroup.add(stage);

        // Gold rim ring on the podium
        const rimGeo = new THREE.TorusGeometry(1.4, 0.015, 16, 64);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.85
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.08;
        this.studioGroup.add(rim);

        // Outer floor circle
        const floorGeo = new THREE.CircleGeometry(4, 64);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x08080a,
            roughness: 0.7,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.studioGroup.add(floor);
    }

    buildMannequin() {
        const mannequinMat = new THREE.MeshStandardMaterial({
            color: 0x24242a,
            roughness: 0.5,
            metalness: 0.15
        });

        const goldAccentMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.85
        });

        const woodBaseMat = new THREE.MeshStandardMaterial({
            color: 0x181514,
            roughness: 0.6,
            metalness: 0.1
        });

        // 1. Stand Base (Tripod & Brass Pole)
        const poleGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.4, 32);
        const pole = new THREE.Mesh(poleGeo, goldAccentMat);
        pole.position.y = 0.7;
        pole.castShadow = true;
        this.mannequinGroup.add(pole);

        // Stand base disc
        const baseDiscGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.03, 32);
        const baseDisc = new THREE.Mesh(baseDiscGeo, goldAccentMat);
        baseDisc.position.y = 0.095;
        this.mannequinGroup.add(baseDisc);

        // 2. Torso (Sculpted high-fashion dress form)
        // Upper Neck Finial (Couture Brass topper)
        const finialGeo = new THREE.SphereGeometry(0.045, 32, 16);
        const finial = new THREE.Mesh(finialGeo, goldAccentMat);
        finial.position.y = 1.76;
        finial.scale.set(1, 1.2, 1);
        this.mannequinGroup.add(finial);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.05, 0.065, 0.14, 32);
        const neck = new THREE.Mesh(neckGeo, mannequinMat);
        neck.position.y = 1.66;
        neck.castShadow = true;
        this.mannequinGroup.add(neck);

        // Sculpted Torso Form using Lathe or stacked curves
        // High couture silhouette points: neck base -> bust -> waist -> hips
        const points = [];
        points.push(new THREE.Vector2(0.065, 1.60)); // Neck base
        points.push(new THREE.Vector2(0.19, 1.52));  // Shoulder line
        points.push(new THREE.Vector2(0.185, 1.40)); // Bust apex
        points.push(new THREE.Vector2(0.13, 1.22));  // Cinched Waist
        points.push(new THREE.Vector2(0.18, 1.05));  // Flare to hips
        points.push(new THREE.Vector2(0.17, 0.95));  // Hip base
        points.push(new THREE.Vector2(0.08, 0.92));  // Bottom seal

        const torsoGeo = new THREE.LatheGeometry(points, 48);
        // Slightly flatten depth (Z axis) for natural human proportions (wider chest than depth)
        const pos = torsoGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, pos.getZ(i) * 0.72);
        }
        torsoGeo.computeVertexNormals();

        const torso = new THREE.Mesh(torsoGeo, mannequinMat);
        torso.castShadow = true;
        torso.receiveShadow = true;
        this.mannequinGroup.add(torso);

        // Elegant gold rim at bottom of torso
        const lowerRimGeo = new THREE.TorusGeometry(0.08, 0.008, 16, 32);
        const lowerRim = new THREE.Mesh(lowerRimGeo, goldAccentMat);
        lowerRim.rotation.x = Math.PI / 2;
        lowerRim.position.y = 0.92;
        this.mannequinGroup.add(lowerRim);
    }

    initTextures() {
        // Microscopic fabric normal map
        if (window.PatternEngine) {
            const normalCanvas = window.PatternEngine.generateFabricWeaveNormalMap();
            this.normalMapTexture = new THREE.CanvasTexture(normalCanvas);
            this.normalMapTexture.wrapS = THREE.RepeatWrapping;
            this.normalMapTexture.wrapT = THREE.RepeatWrapping;
            this.normalMapTexture.repeat.set(16, 16);
        }

        // Default initial pattern: Mughal Gold Embroidery
        this.loadPresetPattern('mughal');
    }

    getGarmentMaterial() {
        // Base material for garments with PBR capabilities
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.tintColor),
            roughness: 0.25,
            metalness: 0.1,
            normalMap: this.normalMapTexture,
            normalScale: new THREE.Vector2(0.4, 0.4),
            side: THREE.DoubleSide
        });

        if (this.activeTexture) {
            mat.map = this.activeTexture;
        }

        this.applyFabricTypeProperties(mat, this.fabricType);
        return mat;
    }

    applyFabricTypeProperties(mat, type) {
        if (!mat) return;
        switch (type) {
            case 'silk': // Silk Satin - glossy, soft sheen, gentle reflection
                mat.roughness = 0.2;
                mat.metalness = 0.25;
                mat.transparent = false;
                mat.opacity = 1.0;
                break;
            case 'velvet': // Velvet - soft, low gloss, deep diffuse
                mat.roughness = 0.85;
                mat.metalness = 0.05;
                mat.transparent = false;
                mat.opacity = 1.0;
                break;
            case 'organza': // Sheer Chiffon / Organza - translucent & airy
                mat.roughness = 0.35;
                mat.metalness = 0.15;
                mat.transparent = true;
                mat.opacity = 0.82;
                break;
            case 'brocade': // Metallic Brocade / Lurex - rich golden shine
                mat.roughness = 0.3;
                mat.metalness = 0.75;
                mat.transparent = false;
                mat.opacity = 1.0;
                break;
            case 'linen': // Pure Crisp Linen / Cotton
                mat.roughness = 0.9;
                mat.metalness = 0.0;
                mat.transparent = false;
                mat.opacity = 1.0;
                break;
        }
        mat.needsUpdate = true;
    }

    updateMaterialSettings() {
        Object.values(this.garments).forEach(group => {
            group.traverse(child => {
                if (child.isMesh && child.material) {
                    if (child.userData.isAccent) return; // Keep metallic accessories intact
                    this.applyFabricTypeProperties(child.material, this.fabricType);
                    child.material.color.set(this.tintColor);
                    if (this.activeTexture) {
                        child.material.map = this.activeTexture;
                    }
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    // ==========================================
    // 3D GARMENT SILHOUETTES
    // ==========================================

    buildGarments() {
        this.garments.eveningGown = this.createEveningGown();
        this.garments.cocktailWrap = this.createCocktailWrapDress();
        this.garments.coutureBlazer = this.createCoutureBlazer();
        this.garments.royalSaree = this.createRoyalSaree();
        this.garments.modernStreet = this.createModernStreetwear();

        // Add all to garmentGroup (initially hidden)
        Object.values(this.garments).forEach(g => {
            g.visible = false;
            this.garmentGroup.add(g);
        });
    }

    // 1. Royal Flared Evening Gown (Iconic Ballgown with Organic Ripples)
    createEveningGown() {
        const group = new THREE.Group();
        const mat = this.getGarmentMaterial();

        // Bodice / Corset
        const corsetPts = [
            new THREE.Vector2(0.188, 1.48), // Top bustline
            new THREE.Vector2(0.192, 1.40), // Bust
            new THREE.Vector2(0.138, 1.22), // Waist
            new THREE.Vector2(0.170, 1.10)  // Hip seam
        ];
        const corsetGeo = new THREE.LatheGeometry(corsetPts, 48);
        // Reshape Z for natural bust contour
        const cPos = corsetGeo.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
            cPos.setZ(i, cPos.getZ(i) * 0.74);
        }
        corsetGeo.computeVertexNormals();
        const corset = new THREE.Mesh(corsetGeo, mat);
        corset.castShadow = true;
        group.add(corset);

        // Flared Skirt with realistic ripples/drapes
        const radialSegments = 64;
        const heightSegments = 32;
        const skirtGeo = new THREE.CylinderGeometry(0.165, 0.65, 1.02, radialSegments, heightSegments, true);
        
        // Displace vertices to create organic flowing folds
        const sPos = skirtGeo.attributes.position;
        const sUv = skirtGeo.attributes.uv;

        for (let i = 0; i < sPos.count; i++) {
            const y = sPos.getY(i);
            const x = sPos.getX(i);
            const z = sPos.getZ(i);

            // Factor increases as skirt falls towards hemline
            const fallFactor = Math.pow((0.51 - y) / 1.02, 1.3);
            const angle = Math.atan2(z, x);

            // 10 elegant fabric wave ripples around skirt
            const fold = Math.sin(angle * 10) * 0.05 * fallFactor;
            const subFold = Math.cos(angle * 20) * 0.015 * fallFactor;
            const radius = Math.sqrt(x * x + z * z) + fold + subFold;

            sPos.setX(i, Math.cos(angle) * radius);
            sPos.setZ(i, Math.sin(angle) * radius * 0.82); // Oval drape
        }
        skirtGeo.computeVertexNormals();

        const skirt = new THREE.Mesh(skirtGeo, mat);
        skirt.position.y = 0.59;
        skirt.castShadow = true;
        this.registerAnimatedMesh(skirt);
        group.add(skirt);

        // Couture Gold Waist Ribbon / Sash
        const sashGeo = new THREE.CylinderGeometry(0.142, 0.145, 0.04, 48);
        const sashMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.85
        });
        const sash = new THREE.Mesh(sashGeo, sashMat);
        sash.userData.isAccent = true;
        sash.position.y = 1.18;
        group.add(sash);

        return group;
    }

    // 2. Chic Cocktail Asymmetric Wrap Dress
    createCocktailWrapDress() {
        const group = new THREE.Group();
        const mat = this.getGarmentMaterial();

        // One-shoulder asymmetric bodice
        const bodiceGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.38, 48, 16, true);
        const bPos = bodiceGeo.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
            const x = bPos.getX(i);
            const y = bPos.getY(i);
            const z = bPos.getZ(i);
            bPos.setZ(i, z * 0.74);

            // Asymmetric shoulder cut
            if (y > 0.1) {
                if (x < 0) {
                    bPos.setY(i, y + 0.12); // Extends to left shoulder
                } else {
                    bPos.setY(i, y - 0.06); // Off right shoulder
                }
            }
        }
        bodiceGeo.computeVertexNormals();

        const bodice = new THREE.Mesh(bodiceGeo, mat);
        bodice.position.y = 1.34;
        bodice.castShadow = true;
        group.add(bodice);

        // Asymmetric Tulip / Wrap Skirt (knee length with diagonal hem)
        const skirtGeo = new THREE.CylinderGeometry(0.14, 0.32, 0.58, 48, 16, true);
        const skPos = skirtGeo.attributes.position;
        for (let i = 0; i < skPos.count; i++) {
            const x = skPos.getX(i);
            const y = skPos.getY(i);
            const z = skPos.getZ(i);

            // Diagonal wrap hemline
            if (y < -0.15) {
                skPos.setY(i, y + (x * 0.25));
            }
            skPos.setZ(i, z * 0.78);
        }
        skirtGeo.computeVertexNormals();

        const skirt = new THREE.Mesh(skirtGeo, mat);
        skirt.position.y = 0.86;
        skirt.castShadow = true;
        group.add(skirt);

        return group;
    }

    // 3. Haute Couture Tailored Blazer & Pencil Skirt
    createCoutureBlazer() {
        const group = new THREE.Group();
        const mat = this.getGarmentMaterial();

        // Structured Blazer Jacket
        const blazerGeo = new THREE.CylinderGeometry(0.22, 0.20, 0.56, 48, 16, true);
        const jPos = blazerGeo.attributes.position;
        for (let i = 0; i < jPos.count; i++) {
            const x = jPos.getX(i);
            const y = jPos.getY(i);
            const z = jPos.getZ(i);

            // Broad structured shoulders
            if (y > 0.18) {
                jPos.setX(i, x * 1.25);
            }
            // Front V-cut opening
            if (z > 0.14 && Math.abs(x) < 0.07 && y > 0) {
                jPos.setZ(i, z - 0.04);
            }
            jPos.setZ(i, z * 0.8);
        }
        blazerGeo.computeVertexNormals();

        const blazer = new THREE.Mesh(blazerGeo, mat);
        blazer.position.y = 1.32;
        blazer.castShadow = true;
        group.add(blazer);

        // Sleeves (left & right)
        const sleeveGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.52, 24);
        const leftSleeve = new THREE.Mesh(sleeveGeo, mat);
        leftSleeve.position.set(-0.25, 1.25, 0);
        leftSleeve.rotation.z = 0.18;
        leftSleeve.castShadow = true;
        group.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(sleeveGeo, mat);
        rightSleeve.position.set(0.25, 1.25, 0);
        rightSleeve.rotation.z = -0.18;
        rightSleeve.castShadow = true;
        group.add(rightSleeve);

        // Gold Couture Buttons
        const buttonGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16);
        const buttonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
        for (let b = 0; b < 3; b++) {
            const btn = new THREE.Mesh(buttonGeo, buttonMat);
            btn.userData.isAccent = true;
            btn.rotation.x = Math.PI / 2;
            btn.position.set(0.02, 1.26 - b * 0.08, 0.18);
            group.add(btn);
        }

        // Tailored Pencil Skirt
        const pencilSkirtGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.48, 48, 16, true);
        const pPos = pencilSkirtGeo.attributes.position;
        for (let i = 0; i < pPos.count; i++) {
            pPos.setZ(i, pPos.getZ(i) * 0.76);
        }
        pencilSkirtGeo.computeVertexNormals();

        const pencilSkirt = new THREE.Mesh(pencilSkirtGeo, mat);
        pencilSkirt.position.y = 0.84;
        pencilSkirt.castShadow = true;
        group.add(pencilSkirt);

        return group;
    }

    // 4. Ethereal Royal Saree & Draped Couture Gown
    createRoyalSaree() {
        const group = new THREE.Group();
        const mat = this.getGarmentMaterial();

        // Fitted Indian Blouse / Choli
        const blouseGeo = new THREE.CylinderGeometry(0.188, 0.148, 0.26, 48, 16, true);
        const bPos = blouseGeo.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
            bPos.setZ(i, bPos.getZ(i) * 0.74);
        }
        blouseGeo.computeVertexNormals();
        const blouse = new THREE.Mesh(blouseGeo, mat);
        blouse.position.y = 1.38;
        blouse.castShadow = true;
        group.add(blouse);

        // Flared Pleated Saree Skirt
        const skirtGeo = new THREE.CylinderGeometry(0.155, 0.48, 0.96, 64, 24, true);
        const sPos = skirtGeo.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
            const x = sPos.getX(i);
            const y = sPos.getY(i);
            const z = sPos.getZ(i);
            const angle = Math.atan2(z, x);
            // Front pleats grouping
            const frontFactor = z > 0.05 && Math.abs(x) < 0.18 ? Math.sin(x * 40) * 0.03 : 0;
            const radius = Math.sqrt(x * x + z * z) + frontFactor;
            sPos.setX(i, Math.cos(angle) * radius);
            sPos.setZ(i, Math.sin(angle) * radius * 0.85);
        }
        skirtGeo.computeVertexNormals();
        const skirt = new THREE.Mesh(skirtGeo, mat);
        skirt.position.y = 0.62;
        skirt.castShadow = true;
        this.registerAnimatedMesh(skirt);
        group.add(skirt);

        // Flowing Pleated Pallu Draped across shoulder
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.12, 1.10, 0.14),   // Right waist tuck
            new THREE.Vector3(-0.02, 1.30, 0.16),  // Across chest
            new THREE.Vector3(-0.16, 1.54, 0.05),  // Left shoulder drape
            new THREE.Vector3(-0.20, 1.30, -0.16), // Behind shoulder
            new THREE.Vector3(-0.22, 0.75, -0.20)  // Cascading pallu train
        ]);

        const palluGeo = new THREE.TubeGeometry(curve, 48, 0.075, 16, false);
        // Flatten tube into a wide graceful fabric ribbon
        const pPos = palluGeo.attributes.position;
        for (let i = 0; i < pPos.count; i++) {
            pPos.setZ(i, pPos.getZ(i) * 0.35);
        }
        palluGeo.computeVertexNormals();

        const pallu = new THREE.Mesh(palluGeo, mat);
        pallu.castShadow = true;
        group.add(pallu);

        // Gold border trim along pallu edge
        const borderGeo = new THREE.TubeGeometry(curve, 48, 0.012, 8, false);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.userData.isAccent = true;
        border.position.set(0.02, 0, 0);
        group.add(border);

        return group;
    }

    // 5. Modern Luxury Streetwear: Boxy Designer Tee & Pleated Skirt
    createModernStreetwear() {
        const group = new THREE.Group();
        const mat = this.getGarmentMaterial();

        // Boxy Cropped Designer Tee
        const teeGeo = new THREE.CylinderGeometry(0.21, 0.20, 0.38, 48, 16, true);
        const tPos = teeGeo.attributes.position;
        for (let i = 0; i < tPos.count; i++) {
            tPos.setZ(i, tPos.getZ(i) * 0.78);
        }
        teeGeo.computeVertexNormals();
        const tee = new THREE.Mesh(teeGeo, mat);
        tee.position.y = 1.36;
        tee.castShadow = true;
        group.add(tee);

        // Dropped short sleeves
        const sleeveGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 24);
        const lSleeve = new THREE.Mesh(sleeveGeo, mat);
        lSleeve.position.set(-0.24, 1.40, 0);
        lSleeve.rotation.z = 0.45;
        group.add(lSleeve);

        const rSleeve = new THREE.Mesh(sleeveGeo, mat);
        rSleeve.position.set(0.24, 1.40, 0);
        rSleeve.rotation.z = -0.45;
        group.add(rSleeve);

        // High-waist Pleated A-Line Skirt
        const skirtGeo = new THREE.CylinderGeometry(0.145, 0.38, 0.45, 48, 16, true);
        const sPos = skirtGeo.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
            const x = sPos.getX(i);
            const y = sPos.getY(i);
            const z = sPos.getZ(i);
            const angle = Math.atan2(z, x);
            const pleat = Math.sin(angle * 18) * 0.018 * ((0.225 - y) / 0.45);
            const r = Math.sqrt(x * x + z * z) + pleat;
            sPos.setX(i, Math.cos(angle) * r);
            sPos.setZ(i, Math.sin(angle) * r * 0.85);
        }
        skirtGeo.computeVertexNormals();
        const skirt = new THREE.Mesh(skirtGeo, mat);
        skirt.position.y = 0.94;
        skirt.castShadow = true;
        group.add(skirt);

        return group;
    }

    // ==========================================
    // GARMENT & TEXTURE SWITCHING
    // ==========================================

    setGarment(key) {
        if (!this.garments[key]) return;
        this.currentGarmentKey = key;

        Object.keys(this.garments).forEach(k => {
            this.garments[k].visible = (k === key);
        });

        this.updateMaterialSettings();
    }

    applyCustomTexture(textureImageOrCanvas) {
        if (!textureImageOrCanvas) return;

        let texture;
        if (textureImageOrCanvas instanceof THREE.Texture) {
            texture = textureImageOrCanvas;
        } else {
            texture = new THREE.CanvasTexture(textureImageOrCanvas);
        }

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.updateTextureTransform(texture);

        this.activeTexture = texture;
        this.updateMaterialSettings();
    }

    updateTextureTransform(texture = this.activeTexture) {
        if (!texture) return;
        texture.repeat.set(this.textureScale, this.textureScale);
        texture.offset.set(this.textureOffsetX, this.textureOffsetY);
        texture.rotation = (this.textureRotation * Math.PI) / 180;
        texture.center.set(0.5, 0.5);
        texture.needsUpdate = true;
    }

    loadPresetPattern(type) {
        if (!window.PatternEngine) return;
        let canvas;
        switch (type) {
            case 'mughal':
                canvas = window.PatternEngine.generateMughalEmbroidery(this.baseColor, '#e5c158');
                break;
            case 'marble':
                canvas = window.PatternEngine.generateFrenchMarble(this.baseColor, '#d4af37');
                break;
            case 'houndstooth':
                canvas = window.PatternEngine.generateHoundstooth('#111111', this.baseColor);
                break;
            case 'celestial':
                canvas = window.PatternEngine.generateCelestialFoil(this.baseColor, '#f5d77f');
                break;
            case 'floral':
                canvas = window.PatternEngine.generateWatercolorFloral();
                break;
            case 'artdeco':
                canvas = window.PatternEngine.generateGeometricArtDeco();
                break;
            default:
                canvas = window.PatternEngine.generateMughalEmbroidery();
        }
        if (canvas) {
            this.applyCustomTexture(canvas);
        }
    }

    setFabricType(type) {
        this.fabricType = type;
        this.updateMaterialSettings();
    }

    setBaseColor(hex) {
        this.baseColor = hex;
        this.tintColor = hex;
        this.updateMaterialSettings();
    }

    setTextureScale(val) {
        this.textureScale = parseFloat(val);
        this.updateTextureTransform();
    }

    setTextureRotation(deg) {
        this.textureRotation = parseFloat(deg);
        this.updateTextureTransform();
    }

    setTextureOffset(x, y) {
        this.textureOffsetX = parseFloat(x);
        this.textureOffsetY = parseFloat(y);
        this.updateTextureTransform();
    }

    toggleMannequin(visible) {
        this.showMannequin = visible;
        this.mannequinGroup.visible = visible;
    }

    toggleAutoRotate(enable) {
        this.isAutoRotate = enable;
        if (this.controls) {
            this.controls.autoRotate = enable;
        }
    }

    setCameraPreset(preset) {
        if (!this.controls) return;
        const duration = 1000;
        let targetPos = new THREE.Vector3(0, 1.4, 3.8);
        let targetLook = new THREE.Vector3(0, 1.15, 0);

        switch (preset) {
            case 'full':
                targetPos.set(0, 1.35, 3.6);
                targetLook.set(0, 1.05, 0);
                break;
            case 'bodice':
                targetPos.set(0, 1.42, 1.6);
                targetLook.set(0, 1.38, 0);
                break;
            case 'skirt':
                targetPos.set(0, 0.75, 2.0);
                targetLook.set(0, 0.65, 0);
                break;
            case 'back':
                targetPos.set(0, 1.35, -3.6);
                targetLook.set(0, 1.15, 0);
                break;
        }

        // Smooth camera transition
        const startPos = this.camera.position.clone();
        const startLook = this.controls.target.clone();
        const startTime = performance.now();

        const animateCam = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease-in-out

            this.camera.position.lerpVectors(startPos, targetPos, ease);
            this.controls.target.lerpVectors(startLook, targetLook, ease);
            this.controls.update();

            if (progress < 1.0) {
                requestAnimationFrame(animateCam);
            }
        };
        requestAnimationFrame(animateCam);
    }

    // Capture High-Res Snapshot with Atelier Vidushi Branding
    captureRunwaySnapshot() {
        // Temporarily render at clean state
        this.renderer.render(this.scene, this.camera);
        const webglCanvas = this.renderer.domElement;

        // Create high-res export canvas
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = webglCanvas.width;
        exportCanvas.height = webglCanvas.height;
        const ctx = exportCanvas.getContext('2d');

        // Draw 3D scene
        ctx.drawImage(webglCanvas, 0, 0);

        // Add Luxury Fashion Editorial Watermark & Border
        const w = exportCanvas.width;
        const h = exportCanvas.height;

        // Elegant Gold Outer Frame
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        // Lower Editorial Banner
        const bannerHeight = 85;
        const bannerY = h - bannerHeight - 35;
        ctx.fillStyle = 'rgba(10, 10, 13, 0.75)';
        ctx.fillRect(35, bannerY, w - 70, bannerHeight);

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(35, bannerY, w - 70, bannerHeight);

        // Typography
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f5e2b3';
        ctx.font = 'bold 22px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = '5px';
        ctx.fillText('ATELIER VIDUSHI', w / 2, bannerY + 36);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'italic 13px "Cinzel", Georgia, serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('HAUTE COUTURE 3D RUNWAY • EXCLUSIVE CREATION', w / 2, bannerY + 62);

        // Date Stamp
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px sans-serif';
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        ctx.fillText(dateStr, w - 50, bannerY + 48);

        return exportCanvas.toDataURL('image/png');
    }

    // Register mesh for cloth physics/wind simulation
    registerAnimatedMesh(mesh) {
        if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) return;
        const pos = mesh.geometry.attributes.position;
        const baseArr = new Float32Array(pos.array.length);
        baseArr.set(pos.array);
        this.animatedMeshes.push({
            mesh: mesh,
            basePositions: baseArr
        });
    }

    // Dynamic Runway Cloth Wave / Wind Simulation
    updateWindPhysics(time) {
        if (!this.animatedMeshes || this.animatedMeshes.length === 0) return;
        for (let m = 0; m < this.animatedMeshes.length; m++) {
            const item = this.animatedMeshes[m];
            if (!item.mesh || !item.mesh.parent || !item.mesh.parent.visible) continue;
            const pos = item.mesh.geometry.attributes.position;
            const basePos = item.basePositions;
            const count = pos.count;

            for (let i = 0; i < count; i++) {
                const bx = basePos[i * 3];
                const by = basePos[i * 3 + 1];
                const bz = basePos[i * 3 + 2];

                // Factor increases towards lower hemline
                const hemFactor = Math.max(0, (0.8 - by) * 1.2);
                const waveX = Math.sin(time * 2.8 + by * 7.0 + bx * 5.0) * 0.016 * hemFactor;
                const waveZ = Math.cos(time * 2.2 + bz * 6.0) * 0.012 * hemFactor;

                pos.setX(i, bx + waveX);
                pos.setZ(i, bz + waveZ);
            }
            pos.needsUpdate = true;
            item.mesh.geometry.computeVertexNormals();
        }
    }

    // Professional Measurement Dimension Guides (CAD Mode)
    buildMeasurementGuides() {
        this.measurementGroup.visible = false;

        const lineMat = new THREE.LineDashedMaterial({
            color: 0xd4af37,
            dashSize: 0.04,
            gapSize: 0.02,
            linewidth: 1
        });

        const createMeasureRing = (y, radius, label) => {
            const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.76, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(64);
            const pts3D = points.map(p => new THREE.Vector3(p.x, y, p.y));
            const geo = new THREE.BufferGeometry().setFromPoints(pts3D);
            const line = new THREE.Line(geo, lineMat);
            line.computeLineDistances();
            this.measurementGroup.add(line);
        };

        // Bust 34" (86 cm)
        createMeasureRing(1.40, 0.22, 'Bust 34"');
        // Waist 26" (66 cm)
        createMeasureRing(1.22, 0.17, 'Waist 26"');
        // Hips 36" (91 cm)
        createMeasureRing(1.02, 0.24, 'Hips 36"');
    }

    toggleWind(enable) {
        this.isWindActive = enable;
    }

    toggleCadMode(enable) {
        this.isCadMode = enable;
        this.measurementGroup.visible = enable;

        Object.values(this.garments).forEach(group => {
            group.traverse(child => {
                if (child.isMesh && child.material && !child.userData.isAccent) {
                    child.material.wireframe = enable;
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock ? this.clock.getElapsedTime() : 0;

        if (this.controls) {
            this.controls.update();
        }

        if (this.isWindActive) {
            this.updateWindPhysics(time);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.FashionStudio = FashionStudio;
