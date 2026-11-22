/**
 * Atelier Vidushi - Fashion Design Inspiration Engine
 * Generates Haute Couture creative briefs, color palettes, and runway concepts for Vidushi.
 */

const FashionInspiration = {
    themes: [
        {
            title: "Midnight Versailles Masquerade",
            vibe: "Opulent baroque drama with gilded embroidery and deep velvet shadows.",
            silhouette: "Flared Evening Gown or Royal Saree",
            fabric: "Velvet or Metallic Brocade",
            palette: ["#0d131a", "#d4af37", "#4a121a", "#ffffff"]
        },
        {
            title: "Neo-Kyoto Silk Blossom",
            vibe: "Fluid watercolor botanicals with delicate pastel cherry blossom washes and structured lapels.",
            silhouette: "Couture Blazer or Cocktail Wrap",
            fabric: "Silk Satin or Sheer Organza",
            palette: ["#f7d6d0", "#ffffff", "#3b3a36", "#e88d9b"]
        },
        {
            title: "Solaris 3000 (Met Gala Avant-Garde)",
            vibe: "Futuristic iridescent gold foil motifs and celestial geometry designed for the red carpet.",
            silhouette: "Flared Evening Gown",
            fabric: "Metallic Brocade",
            palette: ["#141416", "#ffd700", "#7928ca", "#00dfd8"]
        },
        {
            title: "Royal Jaipur Heritage",
            vibe: "Intricate Mughal zardozi motifs over rich emerald and ruby silks.",
            silhouette: "Ethereal Royal Saree",
            fabric: "Silk Satin or Brocade",
            palette: ["#0b3b24", "#b81428", "#e5c158", "#fcf8f5"]
        },
        {
            title: "Parisian Monochrome Chic",
            vibe: "High contrast houndstooth and sharp architectural lapels for modern runway streetwear.",
            silhouette: "Haute Couture Blazer or Modern Streetwear",
            fabric: "Crisp Linen or Velvet",
            palette: ["#0d0d0f", "#ffffff", "#c5a059", "#44444c"]
        },
        {
            title: "Ethereal Cloud Odyssey",
            vibe: "Whispering sheer organza and liquid marble veins evoking morning mist and dawn light.",
            silhouette: "Cocktail Wrap Dress",
            fabric: "Sheer Organza or Silk Satin",
            palette: ["#fcf8f5", "#e8d8c8", "#b8c9d9", "#d4af37"]
        }
    ],

    getRandomConcept() {
        const index = Math.floor(Math.random() * this.themes.length);
        return this.themes[index];
    }
};

window.FashionInspiration = FashionInspiration;
