// Image loader utility for optimized lazy loading

export class ImageLoader {
    constructor() {
        this.loadedImages = new Set();
        this.loadingImages = new Map();
        this.supportsWebP = null;
        this.checkWebPSupport();
    }

    // Check WebP support
    async checkWebPSupport() {
        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        const img = new Image();
        
        return new Promise((resolve) => {
            img.onload = img.onerror = () => {
                this.supportsWebP = img.width === 1 && img.height === 1;
                resolve(this.supportsWebP);
            };
            img.src = webpData;
        });
    }

    // Load image with optimizations
    async load(img) {
        const src = img.dataset.src;
        
        if (!src || this.loadedImages.has(src)) {
            return;
        }

        // Check if already loading
        if (this.loadingImages.has(src)) {
            return this.loadingImages.get(src);
        }

        const loadPromise = this.loadImage(img, src);
        this.loadingImages.set(src, loadPromise);

        try {
            await loadPromise;
            this.loadedImages.add(src);
            this.loadingImages.delete(src);
        } catch (error) {
            console.error('Failed to load image:', src, error);
            this.loadingImages.delete(src);
            
            // Show fallback
            this.showFallback(img);
        }
    }

    // Load individual image
    loadImage(img, src) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            // Handle different image formats
            const finalSrc = this.getOptimizedSrc(src);

            tempImg.onload = () => {
                // Add fade-in effect
                img.style.opacity = '0';
                img.src = finalSrc;
                img.classList.add('loaded');
                
                // Fade in
                requestAnimationFrame(() => {
                    img.style.transition = 'opacity 0.3s';
                    img.style.opacity = '1';
                });
                
                resolve();
            };

            tempImg.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            // Add loading state
            img.classList.add('loading');
            
            // Start loading
            tempImg.src = finalSrc;
        });
    }

    // Get optimized image source
    getOptimizedSrc(src) {
        // If WebP is supported and alternative exists
        if (this.supportsWebP && !src.endsWith('.webp')) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            // Check if WebP version exists (in production, this would be server-side)
            return webpSrc;
        }
        
        return src;
    }

    // Show fallback for failed images
    showFallback(img) {
        img.classList.remove('loading');
        img.classList.add('error');
        
        // Add fallback image or placeholder
        const fallbackSrc = img.dataset.fallback || '/images/placeholder.svg';
        img.src = fallbackSrc;
        
        // Add error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error';
        errorMsg.textContent = 'Не удалось загрузить изображение';
        img.parentNode.appendChild(errorMsg);
    }

    // Preload critical images
    preloadCritical(urls) {
        const preloadPromises = urls.map(url => {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = this.getOptimizedSrc(url);
                link.onload = resolve;
                link.onerror = resolve;
                document.head.appendChild(link);
            });
        });

        return Promise.all(preloadPromises);
    }

    // Progressive image loading
    loadProgressive(img) {
        const lowQualitySrc = img.dataset.lowSrc;
        const highQualitySrc = img.dataset.src;

        if (!lowQualitySrc || !highQualitySrc) {
            return this.load(img);
        }

        // Load low quality first
        const lowQualityImg = new Image();
        lowQualityImg.src = lowQualitySrc;

        lowQualityImg.onload = () => {
            img.src = lowQualitySrc;
            img.classList.add('low-quality');
            
            // Then load high quality
            this.load(img).then(() => {
                img.classList.remove('low-quality');
            });
        };
    }

    // Clean up to prevent memory leaks
    cleanup() {
        this.loadedImages.clear();
        this.loadingImages.clear();
    }
}

// Export singleton instance
export const imageLoader = new ImageLoader();