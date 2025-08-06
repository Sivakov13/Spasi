// Performance utility functions

// Debounce function to limit function calls
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function calls
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Request idle callback polyfill
export function requestIdleCallback(callback) {
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback);
    }
    
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(() => callback({
        timeRemaining: () => 50,
        didTimeout: false
    }), 1);
}

// Batch DOM updates
export class DOMBatcher {
    constructor() {
        this.reads = [];
        this.writes = [];
        this.scheduled = false;
    }

    read(fn) {
        this.reads.push(fn);
        this.schedule();
    }

    write(fn) {
        this.writes.push(fn);
        this.schedule();
    }

    schedule() {
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }

    flush() {
        const reads = this.reads.slice();
        const writes = this.writes.slice();

        this.reads = [];
        this.writes = [];
        this.scheduled = false;

        // Execute all reads first
        reads.forEach(fn => fn());
        
        // Then execute all writes
        writes.forEach(fn => fn());
    }
}

// Memory leak prevention
export class MemoryManager {
    constructor() {
        this.listeners = new Map();
        this.intervals = new Set();
        this.timeouts = new Set();
    }

    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        
        this.listeners.get(element).push({ event, handler, options });
    }

    setInterval(fn, delay) {
        const id = setInterval(fn, delay);
        this.intervals.add(id);
        return id;
    }

    setTimeout(fn, delay) {
        const id = setTimeout(() => {
            fn();
            this.timeouts.delete(id);
        }, delay);
        this.timeouts.add(id);
        return id;
    }

    cleanup() {
        // Remove all event listeners
        this.listeners.forEach((events, element) => {
            events.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.listeners.clear();

        // Clear all intervals
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();

        // Clear all timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();
    }
}

// Measure performance
export function measurePerformance(name, fn) {
    if ('performance' in window) {
        performance.mark(`${name}-start`);
        const result = fn();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        
        return result;
    }
    return fn();
}