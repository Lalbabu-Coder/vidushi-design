/**
 * Atelier Vidushi - Lookbook & Portfolio Manager
 * Stores and manages Vidushi's saved fashion designs with thumbnails and metadata in LocalStorage.
 */

class LookbookManager {
    constructor(studioInstance) {
        this.studio = studioInstance;
        this.storageKey = 'atelier_vidushi_lookbook';
        this.looks = this.loadLooks();
    }

    loadLooks() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultLooks();
        } catch (e) {
            console.error('Failed to load lookbook', e);
            return this.getDefaultLooks();
        }
    }

    getDefaultLooks() {
        return [
            {
                id: 'starter-1',
                title: 'Royal Mughal Noir Gown',
                garmentKey: 'eveningGown',
                fabricType: 'silk',
                baseColor: '#0b3b24',
                patternType: 'mughal',
                date: 'Collection Debut',
                notes: 'Heavily embroidered gold filigree on emerald green silk satin.'
            },
            {
                id: 'starter-2',
                title: 'Starlight Celestial Saree',
                garmentKey: 'royalSaree',
                fabricType: 'brocade',
                baseColor: '#0b0f19',
                patternType: 'celestial',
                date: 'Midnight Gala',
                notes: 'Cosmic gold foil motifs with draped pleated pallu.'
            }
        ];
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.looks));
        } catch (e) {
            console.warn('Storage quota exceeded for lookbook thumbnails', e);
        }
    }

    saveCurrentLook(title, notes = '') {
        const thumbnail = this.studio.captureRunwaySnapshot();
        const newLook = {
            id: 'look_' + Date.now(),
            title: title || `Creation #${this.looks.length + 1}`,
            garmentKey: this.studio.currentGarmentKey,
            fabricType: this.studio.fabricType,
            baseColor: this.studio.baseColor,
            scale: this.studio.textureScale,
            rotation: this.studio.textureRotation,
            thumbnail: thumbnail,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            notes: notes || 'Designed by Vidushi'
        };

        this.looks.unshift(newLook);
        this.saveToStorage();
        return newLook;
    }

    deleteLook(id) {
        this.looks = this.looks.filter(l => l.id !== id);
        this.saveToStorage();
    }

    loadLookIntoStudio(look) {
        if (!look) return;
        this.studio.setGarment(look.garmentKey);
        this.studio.setFabricType(look.fabricType);
        this.studio.setBaseColor(look.baseColor);

        if (look.patternType) {
            this.studio.loadPresetPattern(look.patternType);
        } else if (look.thumbnail) {
            const img = new Image();
            img.onload = () => {
                this.studio.applyCustomTexture(img);
            };
            img.src = look.thumbnail;
        }

        if (look.scale) this.studio.setTextureScale(look.scale);
        if (look.rotation) this.studio.setTextureRotation(look.rotation);
    }
}

window.LookbookManager = LookbookManager;
