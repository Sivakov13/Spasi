/**
 * Performance Monitor for Orthodox Dating App
 * Collects and reports performance metrics for optimization
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.config = {
            reportInterval: 30000, // Report every 30 seconds
            sampleRate: 0.1, // Sample 10% of users
            enabledMetrics: {
                navigation: true,
                resources: true,
                paint: true,
                layout: true,
                userInteraction: true,
                customMetrics: true
            }
        };
        
        this.init();
    }

    // Initialize performance monitoring
    init() {
        if (!this.shouldCollectMetrics()) {
            return;
        }

        console.log('Performance Monitor: Initializing...');
        
        // Set up observers
        this.setupNavigationObserver();
        this.setupResourceObserver();
        this.setupPaintObserver();
        this.setupLayoutObserver();
        this.setupUserInteractionObserver();
        this.setupLongTaskObserver();
        
        // Start periodic reporting
        this.startPeriodicReporting();
        
        // Monitor page visibility changes
        this.setupVisibilityObserver();
        
        // Monitor memory usage
        this.setupMemoryObserver();
    }

    // Check if we should collect metrics (sampling)
    shouldCollectMetrics() {
        return Math.random() < this.config.sampleRate;
    }

    // Setup navigation timing observer
    setupNavigationObserver() {
        if (!this.config.enabledMetrics.navigation || !('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordNavigationMetrics(entry);
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
            this.observers.set('navigation', observer);
            
        } catch (error) {
            console.warn('Performance Monitor: Navigation observer not supported');
        }
    }

    // Setup resource timing observer
    setupResourceObserver() {
        if (!this.config.enabledMetrics.resources || !('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordResourceMetrics(entry);
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
            
        } catch (error) {
            console.warn('Performance Monitor: Resource observer not supported');
        }
    }

    // Setup paint timing observer
    setupPaintObserver() {
        if (!this.config.enabledMetrics.paint || !('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordPaintMetrics(entry);
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
            this.observers.set('paint', observer);
            
        } catch (error) {
            console.warn('Performance Monitor: Paint observer not supported');
        }
    }

    // Setup layout shift observer
    setupLayoutObserver() {
        if (!this.config.enabledMetrics.layout || !('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordLayoutShift(entry);
                });
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('layout-shift', observer);
            
        } catch (error) {
            console.warn('Performance Monitor: Layout shift observer not supported');
        }
    }

    // Setup user interaction observer
    setupUserInteractionObserver() {
        if (!this.config.enabledMetrics.userInteraction) {
            return;
        }

        // Track click interactions
        document.addEventListener('click', (event) => {
            this.recordUserInteraction('click', event.target);
        }, { passive: true });

        // Track scroll interactions
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.recordUserInteraction('scroll', document.documentElement);
            }, 100);
        }, { passive: true });

        // Track form interactions
        document.addEventListener('submit', (event) => {
            this.recordUserInteraction('form-submit', event.target);
        }, { passive: true });
    }

    // Setup long task observer
    setupLongTaskObserver() {
        if (!('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordLongTask(entry);
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', observer);
            
        } catch (error) {
            console.warn('Performance Monitor: Long task observer not supported');
        }
    }

    // Setup visibility observer
    setupVisibilityObserver() {
        document.addEventListener('visibilitychange', () => {
            const isVisible = !document.hidden;
            this.recordVisibilityChange(isVisible);
        });
    }

    // Setup memory observer
    setupMemoryObserver() {
        if (!('memory' in performance)) {
            return;
        }

        setInterval(() => {
            this.recordMemoryUsage();
        }, 10000); // Every 10 seconds
    }

    // Record navigation metrics
    recordNavigationMetrics(entry) {
        const metrics = {
            type: 'navigation',
            timestamp: Date.now(),
            url: entry.name,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.navigationStart,
            firstByte: entry.responseStart - entry.navigationStart,
            dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcpConnect: entry.connectEnd - entry.connectStart,
            sslConnect: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize
        };

        this.addMetric('navigation', metrics);
    }

    // Record resource metrics
    recordResourceMetrics(entry) {
        const resourceType = this.getResourceType(entry.name);
        
        const metrics = {
            type: 'resource',
            timestamp: Date.now(),
            name: entry.name,
            resourceType: resourceType,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            initiatorType: entry.initiatorType
        };

        this.addMetric('resource', metrics);
        
        // Track slow resources
        if (entry.duration > 1000) { // Slower than 1 second
            this.addMetric('slow-resource', {
                ...metrics,
                severity: entry.duration > 3000 ? 'high' : 'medium'
            });
        }
    }

    // Record paint metrics
    recordPaintMetrics(entry) {
        const metrics = {
            type: 'paint',
            timestamp: Date.now(),
            name: entry.name,
            startTime: entry.startTime
        };

        this.addMetric('paint', metrics);

        // Track Core Web Vitals
        if (entry.name === 'first-contentful-paint') {
            this.addMetric('core-web-vitals', {
                metric: 'FCP',
                value: entry.startTime,
                rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
            });
        }
    }

    // Record layout shift
    recordLayoutShift(entry) {
        if (entry.hadRecentInput) {
            return; // Ignore shifts caused by user input
        }

        const metrics = {
            type: 'layout-shift',
            timestamp: Date.now(),
            value: entry.value,
            sources: entry.sources?.map(source => ({
                node: source.node?.tagName,
                previousRect: source.previousRect,
                currentRect: source.currentRect
            }))
        };

        this.addMetric('layout-shift', metrics);

        // Track Cumulative Layout Shift (CLS)
        this.updateCLS(entry.value);
    }

    // Record user interactions
    recordUserInteraction(type, target) {
        const metrics = {
            type: 'user-interaction',
            timestamp: Date.now(),
            interactionType: type,
            targetTag: target?.tagName,
            targetClass: target?.className,
            targetId: target?.id
        };

        this.addMetric('user-interaction', metrics);
    }

    // Record long tasks
    recordLongTask(entry) {
        const metrics = {
            type: 'long-task',
            timestamp: Date.now(),
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution?.map(attr => ({
                name: attr.name,
                entryType: attr.entryType,
                startTime: attr.startTime,
                duration: attr.duration
            }))
        };

        this.addMetric('long-task', metrics);
    }

    // Record visibility changes
    recordVisibilityChange(isVisible) {
        const metrics = {
            type: 'visibility',
            timestamp: Date.now(),
            isVisible: isVisible
        };

        this.addMetric('visibility', metrics);
    }

    // Record memory usage
    recordMemoryUsage() {
        if (!('memory' in performance)) {
            return;
        }

        const memory = performance.memory;
        const metrics = {
            type: 'memory',
            timestamp: Date.now(),
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        };

        this.addMetric('memory', metrics);

        // Alert if memory usage is high
        if (metrics.usageRatio > 0.8) {
            console.warn('Performance Monitor: High memory usage detected', metrics);
        }
    }

    // Update Cumulative Layout Shift
    updateCLS(shiftValue) {
        const currentCLS = this.metrics.get('cls') || 0;
        const newCLS = currentCLS + shiftValue;
        
        this.metrics.set('cls', newCLS);
        
        // Report CLS if it exceeds thresholds
        if (newCLS > 0.25) {
            this.addMetric('core-web-vitals', {
                metric: 'CLS',
                value: newCLS,
                rating: 'poor'
            });
        } else if (newCLS > 0.1) {
            this.addMetric('core-web-vitals', {
                metric: 'CLS',
                value: newCLS,
                rating: 'needs-improvement'
            });
        }
    }

    // Add metric to collection
    addMetric(category, metric) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, []);
        }
        
        this.metrics.get(category).push(metric);
        
        // Limit stored metrics to prevent memory issues
        const maxMetrics = 100;
        const categoryMetrics = this.metrics.get(category);
        if (categoryMetrics.length > maxMetrics) {
            categoryMetrics.splice(0, categoryMetrics.length - maxMetrics);
        }
    }

    // Get resource type from URL
    getResourceType(url) {
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'script';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'other';
    }

    // Start periodic reporting
    startPeriodicReporting() {
        setInterval(() => {
            this.reportMetrics();
        }, this.config.reportInterval);
    }

    // Report metrics to analytics service
    reportMetrics() {
        const report = this.generateReport();
        
        if (report.totalMetrics === 0) {
            return;
        }

        console.log('Performance Monitor: Reporting metrics', report);
        
        // Send to analytics service (placeholder)
        this.sendToAnalytics(report);
        
        // Clear old metrics
        this.clearOldMetrics();
    }

    // Generate performance report
    generateReport() {
        const report = {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            totalMetrics: 0,
            categories: {}
        };

        // Aggregate metrics by category
        this.metrics.forEach((metrics, category) => {
            if (metrics.length === 0) return;
            
            report.totalMetrics += metrics.length;
            report.categories[category] = {
                count: metrics.length,
                summary: this.summarizeMetrics(category, metrics)
            };
        });

        return report;
    }

    // Summarize metrics for a category
    summarizeMetrics(category, metrics) {
        switch (category) {
            case 'navigation':
                return this.summarizeNavigationMetrics(metrics);
            case 'resource':
                return this.summarizeResourceMetrics(metrics);
            case 'paint':
                return this.summarizePaintMetrics(metrics);
            case 'layout-shift':
                return this.summarizeLayoutShiftMetrics(metrics);
            case 'long-task':
                return this.summarizeLongTaskMetrics(metrics);
            case 'memory':
                return this.summarizeMemoryMetrics(metrics);
            default:
                return { count: metrics.length };
        }
    }

    // Summarize navigation metrics
    summarizeNavigationMetrics(metrics) {
        const latest = metrics[metrics.length - 1];
        return {
            domContentLoaded: latest.domContentLoaded,
            loadComplete: latest.loadComplete,
            firstByte: latest.firstByte,
            transferSize: latest.transferSize
        };
    }

    // Summarize resource metrics
    summarizeResourceMetrics(metrics) {
        const byType = {};
        let totalDuration = 0;
        let totalSize = 0;

        metrics.forEach(metric => {
            const type = metric.resourceType;
            if (!byType[type]) {
                byType[type] = { count: 0, duration: 0, size: 0 };
            }
            byType[type].count++;
            byType[type].duration += metric.duration;
            byType[type].size += metric.transferSize || 0;
            
            totalDuration += metric.duration;
            totalSize += metric.transferSize || 0;
        });

        return {
            totalDuration,
            totalSize,
            byType
        };
    }

    // Summarize paint metrics
    summarizePaintMetrics(metrics) {
        const summary = {};
        metrics.forEach(metric => {
            summary[metric.name] = metric.startTime;
        });
        return summary;
    }

    // Summarize layout shift metrics
    summarizeLayoutShiftMetrics(metrics) {
        const totalShift = metrics.reduce((sum, metric) => sum + metric.value, 0);
        return {
            totalShift,
            count: metrics.length,
            averageShift: totalShift / metrics.length
        };
    }

    // Summarize long task metrics
    summarizeLongTaskMetrics(metrics) {
        const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
        return {
            count: metrics.length,
            totalDuration,
            averageDuration: totalDuration / metrics.length
        };
    }

    // Summarize memory metrics
    summarizeMemoryMetrics(metrics) {
        const latest = metrics[metrics.length - 1];
        const peak = metrics.reduce((max, metric) => 
            Math.max(max, metric.usedJSHeapSize), 0);
        
        return {
            current: latest.usedJSHeapSize,
            peak,
            limit: latest.jsHeapSizeLimit,
            currentRatio: latest.usageRatio
        };
    }

    // Send report to analytics service
    sendToAnalytics(report) {
        // In a real implementation, this would send to your analytics service
        // For now, we'll just log it
        
        if ('sendBeacon' in navigator) {
            // Use sendBeacon for reliable delivery
            const data = JSON.stringify(report);
            navigator.sendBeacon('/api/analytics/performance', data);
        } else {
            // Fallback to fetch
            fetch('/api/analytics/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            }).catch(error => {
                console.warn('Performance Monitor: Failed to send metrics', error);
            });
        }
    }

    // Clear old metrics to prevent memory leaks
    clearOldMetrics() {
        this.metrics.forEach((metrics, category) => {
            // Keep only recent metrics
            const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes ago
            const filtered = metrics.filter(metric => metric.timestamp > cutoff);
            this.metrics.set(category, filtered);
        });
    }

    // Custom metric recording
    recordCustomMetric(name, value, metadata = {}) {
        const metric = {
            type: 'custom',
            timestamp: Date.now(),
            name,
            value,
            metadata
        };

        this.addMetric('custom', metric);
    }

    // Mark custom timing
    markTiming(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(name);
        }
    }

    // Measure custom timing
    measureTiming(name, startMark, endMark) {
        if ('performance' in window && 'measure' in performance) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name, 'measure')[0];
                if (measure) {
                    this.recordCustomMetric(name, measure.duration);
                }
            } catch (error) {
                console.warn('Performance Monitor: Failed to measure timing', error);
            }
        }
    }

    // Get current performance summary
    getPerformanceSummary() {
        return {
            cls: this.metrics.get('cls') || 0,
            metricsCollected: Array.from(this.metrics.keys()).reduce(
                (sum, key) => sum + this.metrics.get(key).length, 0
            ),
            memoryUsage: 'memory' in performance ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    // Cleanup
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Clear metrics
        this.metrics.clear();
        
        console.log('Performance Monitor: Destroyed');
    }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for global access
window.PerformanceMonitor = performanceMonitor;