/**
 * BKB Explorer Utilities
 *
 * Extracted common functions to reduce code duplication.
 * Created per Senior Developer code review (2025-12-26).
 */

const Utils = {
    /**
     * Resolve domain name to BKB_DATA key.
     * Handles hierarchical domain paths (e.g., "RBCZ:MIB:Investment" -> "investment")
     * and optional view names (e.g., "Investment" + "Order" -> "investmentorder")
     *
     * @param {string} domainName - Domain path (e.g., "RBCZ:MIB:Investment")
     * @param {string|null} viewName - Optional view name (e.g., "Order")
     * @returns {string|null} - BKB_DATA key or null if not found
     */
    resolveDomainKey(domainName, viewName = null) {
        if (viewName) {
            const lastSegment = domainName.includes(':')
                ? domainName.split(':').pop().toLowerCase()
                : domainName.toLowerCase();
            // Try compound key first (e.g., "investmentorder"), then simple (e.g., "order")
            const compoundKey = lastSegment + viewName.toLowerCase();
            if (window.BKB_DATA[compoundKey]) {
                return compoundKey;
            }
            const simpleKey = viewName.toLowerCase();
            if (window.BKB_DATA[simpleKey]) {
                return simpleKey;
            }
            return null;
        }

        // Try full path first, then last segment (for hierarchical domains)
        const fullKey = domainName.toLowerCase();
        if (window.BKB_DATA[fullKey]) {
            return fullKey;
        }
        // Try last segment (e.g., "RBCZ:MIB:Investment" -> "investment")
        const lastSegment = this.getDomainSegment(domainName);
        return window.BKB_DATA[lastSegment] ? lastSegment : null;
    },

    /**
     * Get the last segment of a domain path.
     *
     * @param {string} domainPath - Domain path (e.g., "RBCZ:MIB:Investment")
     * @returns {string} - Last segment lowercased (e.g., "investment")
     */
    getDomainSegment(domainPath) {
        return domainPath.includes(':')
            ? domainPath.split(':').pop().toLowerCase()
            : domainPath.toLowerCase();
    },

    /**
     * Get subject name from relationship object.
     * Supports multiple formats: subject_name, source_name, from
     *
     * @param {Object} rel - Relationship object
     * @returns {string} - Subject concept name
     */
    getRelSubject(rel) {
        return rel.subject_name || rel.source_name || rel.from || '';
    },

    /**
     * Get object name from relationship object.
     * Supports multiple formats: object_name, target_name, to
     *
     * @param {Object} rel - Relationship object
     * @returns {string} - Object concept name
     */
    getRelObject(rel) {
        return rel.object_name || rel.target_name || rel.to || '';
    },

    /**
     * Get verb phrase from relationship object.
     * Supports multiple formats: verb_phrase, forward_verb
     *
     * @param {Object} rel - Relationship object
     * @returns {string} - Verb phrase (trimmed)
     */
    getVerbPhrase(rel) {
        return (rel.verb_phrase || rel.forward_verb || '').trim();
    },

    /**
     * Extract short name from cross-domain reference.
     * E.g., "Schema.org:Action" -> "Action", "FIBO:FBC:Transaction" -> "FBC:Transaction"
     *
     * @param {string} fullRef - Full cross-domain reference
     * @returns {string} - Short name without first namespace
     */
    getShortName(fullRef) {
        return fullRef.includes(':') ? fullRef.split(':').slice(1).join(':') : fullRef;
    },

    /**
     * Escape HTML to prevent XSS attacks.
     *
     * @param {string} str - Untrusted string
     * @returns {string} - HTML-escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Calculate tooltip position within viewport bounds.
     *
     * @param {Object} options - Position options
     * @param {number} options.x - Base X coordinate
     * @param {number} options.y - Base Y coordinate
     * @param {number} options.tooltipWidth - Tooltip width
     * @param {number} options.tooltipHeight - Tooltip height
     * @param {number} [options.offsetX=40] - X offset from base position
     * @param {number} [options.offsetY=30] - Y offset from base position
     * @param {number} [options.padding=20] - Viewport edge padding
     * @returns {{x: number, y: number}} - Adjusted position
     */
    calculateTooltipPosition({ x, y, tooltipWidth, tooltipHeight, offsetX = 40, offsetY = 30, padding = 20 }) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let posX = x + offsetX;
        let posY = y + offsetY;

        // If goes off right, show on left
        if (posX + tooltipWidth > viewportWidth - padding) {
            posX = x - tooltipWidth - offsetX;
        }

        // If goes off bottom, show above
        if (posY + tooltipHeight > viewportHeight - padding) {
            posY = y - tooltipHeight - offsetY;
        }

        // Keep minimum distance from top
        if (posY < padding) {
            posY = padding;
        }

        return { x: posX, y: posY };
    }
};

// Make available globally
window.Utils = Utils;
