/**
 * BKB Explorer - Tooltip Component
 *
 * Handles hover tooltips for concept details.
 */

const Tooltip = {
    element: null,

    /**
     * Initialize tooltip
     */
    init() {
        this.element = document.getElementById('tooltip');
    },

    /**
     * Show tooltip for a node
     */
    show(node, position) {
        if (!this.element) return;

        const data = node.data();

        // Set content
        document.getElementById('tooltip-name').textContent = data.name;

        // Set badge
        const badge = document.getElementById('tooltip-badge');
        badge.textContent = data.source || 'DRAFT';
        badge.className = 'tooltip-badge ' + (data.source || 'draft').toLowerCase();

        // Set definition
        document.getElementById('tooltip-definition').textContent =
            data.definition || 'No definition available.';

        // Set FIBO info
        const fiboEl = document.getElementById('tooltip-fibo');
        if (data.hasFibo && data.fiboUri) {
            fiboEl.textContent = `✓ FIBO: ${data.fiboLabel || 'mapped'}`;
            fiboEl.style.display = 'block';
        } else {
            fiboEl.style.display = 'none';
        }

        // Set cross-domain info
        const crossEl = document.getElementById('tooltip-cross');
        if (data.crossDomains && data.crossDomains.length > 0) {
            crossEl.textContent = `⧉ Shared: ${data.crossDomains.join(', ')}`;
            crossEl.style.display = 'block';
        } else {
            crossEl.style.display = 'none';
        }

        // Set children count
        document.getElementById('tooltip-children').textContent =
            `▼ Children: ${data.childCount || 0}`;

        // Set portal actions
        const actionsEl = document.getElementById('tooltip-actions');
        if (data.crossDomains && data.crossDomains.length > 0) {
            actionsEl.innerHTML = data.crossDomains.map(domain =>
                `<button onclick="BKBExplorer.portal('${domain}', '${data.name}')">→ ${domain}</button>`
            ).join('');
            actionsEl.style.display = 'flex';
        } else {
            actionsEl.style.display = 'none';
        }

        // Position tooltip
        this.position(position);

        // Show
        this.element.style.display = 'block';
    },

    /**
     * Position tooltip near the node
     */
    position(renderedPosition) {
        const container = document.getElementById('graph-container');
        const containerRect = container.getBoundingClientRect();

        let x = containerRect.left + renderedPosition.x + 20;
        let y = containerRect.top + renderedPosition.y - 20;

        // Keep within viewport
        const tooltipRect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (x + tooltipRect.width > viewportWidth - 20) {
            x = renderedPosition.x - tooltipRect.width - 20 + containerRect.left;
        }

        if (y + tooltipRect.height > viewportHeight - 20) {
            y = viewportHeight - tooltipRect.height - 20;
        }

        if (y < 20) {
            y = 20;
        }

        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    },

    /**
     * Hide tooltip
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }
};
