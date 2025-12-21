/**
 * BKB Explorer - Main Application
 *
 * Entry point for the Business Knowledge Base Explorer.
 * Initializes all components and manages global state.
 */

const BKBExplorer = {
    // Current state
    state: {
        currentDomain: null,
        expandedNodes: new Set(),
        selectedNode: null,
        filter: 'all'
    },

    /**
     * Initialize the application
     */
    init() {
        console.log('🏦 BKB Explorer initializing...');

        // Check if data is loaded
        if (typeof window.BKB_DATA === 'undefined') {
            console.error('❌ BKB_DATA not found. Run prepare-demo.sh first.');
            this.showError('Data not loaded. Run ./prepare-demo.sh first.');
            return;
        }

        // Initialize components
        Sidebar.init(window.BKB_DATA.domains);
        Graph.init('graph-container');
        Tooltip.init();

        // Set up event listeners
        this.setupEventListeners();

        // Load default domain
        const defaultDomain = 'Investment';
        this.selectDomain(defaultDomain);

        console.log('✅ BKB Explorer ready');
    },

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter radio buttons
        const filterInputs = document.querySelectorAll('input[name="filter"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.state.filter = e.target.value;
                this.applyFilter();
            });
        });
    },

    /**
     * Select a domain to display
     */
    selectDomain(domainName) {
        console.log(`📂 Selecting domain: ${domainName}`);

        this.state.currentDomain = domainName;
        this.state.expandedNodes.clear();

        // Get domain data
        const domainKey = domainName.toLowerCase();
        const domainData = window.BKB_DATA[domainKey];

        if (!domainData) {
            console.error(`❌ Domain not found: ${domainName}`);
            return;
        }

        // Update sidebar
        Sidebar.setActive(domainName);

        // Update breadcrumb
        this.updateBreadcrumb(domainData.domain.path);

        // Load graph
        Graph.loadDomain(domainData);
    },

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(path) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const parts = path.split(':');
        breadcrumb.innerHTML = parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const separator = index < parts.length - 1
                ? '<span class="breadcrumb-separator">›</span>'
                : '';
            return `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${part}</span>${separator}`;
        }).join('');
    },

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (!query || query.length < 2) {
            Graph.clearHighlight();
            return;
        }

        Graph.highlightSearch(query);
    },

    /**
     * Apply current filter
     */
    applyFilter() {
        Graph.applyFilter(this.state.filter);
    },

    /**
     * Navigate to another domain via portal
     */
    portal(targetDomain, focusNode) {
        console.log(`🚀 Portal to ${targetDomain}, focus: ${focusNode}`);
        this.selectDomain(targetDomain);

        // Focus on the node after a short delay (for graph to load)
        setTimeout(() => {
            Graph.focusNode(focusNode);
        }, 300);
    },

    /**
     * Show error message
     */
    showError(message) {
        const container = document.getElementById('graph-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>❌ Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    BKBExplorer.init();
});
