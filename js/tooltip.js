/**
 * BKB Explorer - Tooltip Component
 *
 * Handles hover tooltips for concept and edge details.
 */

const Tooltip = {
    element: null,
    edgeElement: null,

    /**
     * Check if we're on mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Initialize tooltip
     */
    init() {
        this.element = document.getElementById('tooltip');
        this.edgeElement = document.getElementById('edge-tooltip');

        // On mobile, tap outside graph to close tooltip
        if (this.isMobile()) {
            document.addEventListener('click', (e) => {
                // Don't close if clicking on tooltip or graph container
                if (e.target.closest('.tooltip') || e.target.closest('#graph-container')) {
                    return;
                }
                this.hide();
                this.hideEdge();
            });
        }
    },

    /**
     * Show tooltip for a node
     */
    show(node, position) {
        if (!this.element) return;

        const data = node.data();

        // Get node bounding box to position tooltip outside
        const bb = node.renderedBoundingBox();
        this.nodeBox = bb;

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
     * Position tooltip near the node (outside the node)
     */
    position(renderedPosition) {
        // On mobile, CSS handles positioning as bottom sheet
        if (this.isMobile()) {
            return;
        }

        const container = document.getElementById('graph-container');
        const containerRect = container.getBoundingClientRect();

        // Position to the right of the node
        let x, y;
        if (this.nodeBox) {
            x = containerRect.left + this.nodeBox.x2 + 15;
            y = containerRect.top + this.nodeBox.y1;
        } else {
            x = containerRect.left + renderedPosition.x + 30;
            y = containerRect.top + renderedPosition.y - 20;
        }

        // Show temporarily to measure
        this.element.style.visibility = 'hidden';
        this.element.style.display = 'block';
        const tooltipRect = this.element.getBoundingClientRect();
        this.element.style.visibility = 'visible';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // If tooltip goes off right edge, show on left of node
        if (x + tooltipRect.width > viewportWidth - 20) {
            if (this.nodeBox) {
                x = containerRect.left + this.nodeBox.x1 - tooltipRect.width - 15;
            } else {
                x = containerRect.left + renderedPosition.x - tooltipRect.width - 30;
            }
        }

        // Keep within vertical bounds
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
    },

    /**
     * Show tooltip for an edge
     */
    showEdge(edge, position) {
        if (!this.edgeElement) return;

        const data = edge.data();
        const type = data.type || 'edge';

        // Get source and target names
        const sourceName = edge.source().data('name') || data.source;
        const targetName = edge.target().data('name') || data.target;

        // Set type header
        const typeEl = document.getElementById('edge-tooltip-type');
        const relationEl = document.getElementById('edge-tooltip-relation');
        const cstEl = document.getElementById('edge-tooltip-cst');

        if (type === 'relationship') {
            // Binary verb relationship
            const verb = data.sourceLabel || 'relates to';
            const inverse = data.targetLabel || '';

            typeEl.textContent = 'Binary Verb';
            relationEl.innerHTML = `<strong>${sourceName}</strong> ${verb} <strong>${targetName}</strong>`;

            // CST notation: Subject [verb phrase | inverse phrase] Object
            if (inverse) {
                cstEl.innerHTML = `<code>${sourceName} [${verb} | ${inverse}] ${targetName}</code>`;
            } else {
                cstEl.innerHTML = `<code>${sourceName} [${verb}] ${targetName}</code>`;
            }
        } else if (type === 'trunk' || type === 'branch') {
            // Categorization edge
            typeEl.textContent = 'Categorization';

            if (type === 'trunk') {
                const schema = data.schema || '';
                relationEl.innerHTML = `<strong>${sourceName}</strong> is categorized by "${schema}"`;
                cstEl.innerHTML = `<code>${sourceName} =&lt; @ ${schema} &gt;= [...]</code>`;
            } else {
                // Branch: junction → child
                // Find the trunk edge to get the actual parent and schema
                const junctionNode = edge.source();
                const junctionId = junctionNode.id();
                const cy = edge.cy();

                // Find trunk edge (parent → junction)
                const trunkEdge = cy.edges().filter(e =>
                    e.data('type') === 'trunk' && e.data('target') === junctionId
                ).first();

                let parentName = 'Parent';
                let schema = '';

                if (trunkEdge && trunkEdge.length > 0) {
                    parentName = trunkEdge.source().data('name') || 'Parent';
                    schema = trunkEdge.data('schema') || '';
                }

                // Format: "Child is {schema} Parent"
                // Remove bracketed concept from schema (e.g., "kind of [Payment]" → "kind of")
                const schemaClean = schema.replace(/\s*\[[^\]]*\]\s*/g, ' ').trim();
                const schemaText = schemaClean ? schemaClean : 'kind of';
                relationEl.innerHTML = `<strong>${targetName}</strong> is ${schemaText} <strong>${parentName}</strong>`;
                cstEl.innerHTML = `<code>${parentName} =&lt; @ ${schema} &gt;= [${targetName}, ...]</code>`;
            }
        } else {
            // Generic edge
            typeEl.textContent = 'Relationship';
            relationEl.innerHTML = `<strong>${sourceName}</strong> → <strong>${targetName}</strong>`;
            cstEl.innerHTML = `<code>${sourceName} → ${targetName}</code>`;
        }

        // Position and show
        this.positionEdge(position);
        this.edgeElement.style.display = 'block';
    },

    /**
     * Position edge tooltip (away from edge)
     */
    positionEdge(renderedPosition) {
        // On mobile, CSS handles positioning as bottom sheet
        if (this.isMobile()) {
            return;
        }

        const container = document.getElementById('graph-container');
        const containerRect = container.getBoundingClientRect();

        // Position tooltip below and to the right of cursor, with more offset
        let x = containerRect.left + renderedPosition.x + 40;
        let y = containerRect.top + renderedPosition.y + 30;

        // Show temporarily to measure
        this.edgeElement.style.visibility = 'hidden';
        this.edgeElement.style.display = 'block';
        const tooltipRect = this.edgeElement.getBoundingClientRect();
        this.edgeElement.style.visibility = 'visible';

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // If goes off right, show on left
        if (x + tooltipRect.width > viewportWidth - 20) {
            x = containerRect.left + renderedPosition.x - tooltipRect.width - 40;
        }

        // If goes off bottom, show above
        if (y + tooltipRect.height > viewportHeight - 20) {
            y = containerRect.top + renderedPosition.y - tooltipRect.height - 30;
        }

        if (y < 20) {
            y = 20;
        }

        this.edgeElement.style.left = x + 'px';
        this.edgeElement.style.top = y + 'px';
    },

    /**
     * Hide edge tooltip
     */
    hideEdge() {
        if (this.edgeElement) {
            this.edgeElement.style.display = 'none';
        }
    }
};
