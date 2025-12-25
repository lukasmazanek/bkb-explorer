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
        currentView: null,  // Active view filter (null = all)
        expandedNodes: new Set(),
        selectedNode: null,
        // CST element visibility toggles (all default ON)
        show: {
            domain: true,
            fibo: true,
            schema: true,
            unknown: true,
            context: true,
            categorizations: true,
            relationships: true,
            orphans: true
        },
        layout: 'dagre'
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

        // Merge organization data if available (separate bundle, never committed)
        if (typeof window.BKB_ORG_DATA !== 'undefined') {
            console.log('🔐 Organization data detected, merging...');

            // Save original domains hierarchy before merge
            const originalHierarchy = { ...window.BKB_DATA.domains.hierarchy };

            // Merge domain data (investment, payments, retail keys)
            Object.assign(window.BKB_DATA, window.BKB_ORG_DATA);

            // Restore and merge domains hierarchy (Test + RBCZ)
            window.BKB_DATA.domains.hierarchy = {
                ...originalHierarchy,
                ...window.BKB_ORG_DATA.domains.hierarchy
            };

            console.log('✅ Organization data merged');
        } else {
            console.log('ℹ️ Running in public mode (Test data only)');
        }

        // Initialize components
        Sidebar.init(window.BKB_DATA.domains);
        Graph.init('graph-container');
        Tooltip.init();
        this.setupLegendToggle();

        // Set up event listeners
        this.setupEventListeners();

        // Load default domain (first available from org data, or Test from test data)
        // ADR-040: Test data uses domain "Test" with views (Order, Payment, etc.)
        const hasOrgData = typeof window.BKB_ORG_DATA !== 'undefined';
        const defaultDomain = hasOrgData ? 'Investment' : 'Test';
        this.selectDomain(defaultDomain);  // Will auto-select first view alphabetically

        console.log('✅ BKB Explorer ready');
    },

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Mobile sidebar toggle
        this.setupMobileMenu();

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // CST element toggles
        const toggles = ['domain', 'fibo', 'schema', 'unknown', 'context', 'categorizations', 'relationships', 'orphans'];
        toggles.forEach(toggle => {
            const input = document.getElementById(`show-${toggle}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.state.show[toggle] = e.target.checked;
                    this.applyFilter();
                });
            }
        });

        // Layout selector
        const layoutSelect = document.getElementById('layout-select');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                this.state.layout = e.target.value;
                Graph.setLayout(this.state.layout);
            });
        }

        // View filter selector
        const viewSelect = document.getElementById('view-select');
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => {
                const viewId = e.target.value || null;
                this.selectView(viewId);
                // Also update sidebar view selection
                if (this.state.currentDomain) {
                    Sidebar.selectView(viewId, this.state.currentDomain);
                }
            });
        }
    },

    /**
     * Select a domain to display
     * @param {string} domainName - Domain name (e.g., "Test")
     * @param {string} [viewName] - Optional view name (e.g., "Order")
     */
    selectDomain(domainName, viewName) {
        console.log(`📂 Selecting domain: ${domainName}${viewName ? ` (view: ${viewName})` : ''}`);

        this.state.currentDomain = domainName;
        this.state.currentView = viewName || null;
        this.state.expandedNodes.clear();

        // Get domain data - if viewName is provided, load that view's data
        // Views are stored as separate data objects (order, position, etc.)
        const domainKey = viewName ? viewName.toLowerCase() : domainName.toLowerCase();
        const domainData = window.BKB_DATA[domainKey];

        if (!domainData) {
            // If clicking on parent domain without view, try first view
            const hierarchy = window.BKB_DATA.domains?.hierarchy?.[domainName];
            if (hierarchy?.views) {
                const firstView = Object.keys(hierarchy.views).sort()[0];
                if (firstView) {
                    console.log(`📂 Domain ${domainName} has no data, loading first view: ${firstView}`);
                    this.selectDomain(domainName, firstView);
                    return;
                }
            }
            console.error(`❌ Data not found for: ${viewName || domainName}`);
            return;
        }

        // Update sidebar
        if (viewName) {
            Sidebar.setActiveView(domainName, viewName);
        } else {
            Sidebar.setActive(domainName);
        }

        // Extract views for filtering (views are rendered inline in sidebar hierarchy)
        Views.extractViews(domainData);
        const viewsList = Views.getViewsList();
        // Note: Sidebar.renderViews() removed - views now rendered by renderHierarchy()

        // Update view filter dropdown
        this.updateViewDropdown(viewsList);

        // Update breadcrumb
        this.updateBreadcrumb(domainData.domain.path);

        // Load graph
        Graph.loadDomain(domainData);

        // Update filter counts
        this.updateFilterCounts();

        // Reapply current filter
        this.applyFilter();

        // Close mobile sidebar after selection
        if (this.closeMobileSidebar && window.innerWidth <= 768) {
            this.closeMobileSidebar();
        }
    },

    /**
     * Select a view within the current domain
     * @param {string|null} viewId - View ID or null for all
     */
    selectView(viewId) {
        console.log(`📋 Selecting view: ${viewId || 'All'}`);

        this.state.currentView = viewId;
        Views.setActiveView(viewId);

        // Sync view dropdown
        const viewSelect = document.getElementById('view-select');
        if (viewSelect) {
            viewSelect.value = viewId || '';
        }

        // Update breadcrumb to show view
        const domainData = window.BKB_DATA[this.state.currentDomain.toLowerCase()];
        if (domainData) {
            const viewInfo = viewId ? Views.viewsMap.get(viewId) : null;
            const path = viewInfo
                ? `${domainData.domain.path} › ${viewInfo.name}`
                : domainData.domain.path;
            this.updateBreadcrumb(path);
        }

        // Reapply filter (includes view filter)
        this.applyFilter();
    },

    /**
     * Update the view dropdown with current views
     * @param {Array} views - Array of { id, name, conceptCount }
     */
    updateViewDropdown(views) {
        const container = document.getElementById('view-filter-container');
        const select = document.getElementById('view-select');
        if (!container || !select) return;

        // Show/hide based on whether there are views
        if (views.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = '';

        // Rebuild options
        select.innerHTML = '<option value="">All concepts</option>';
        views.forEach(view => {
            const option = document.createElement('option');
            option.value = view.id;
            option.textContent = `${view.name} (${view.conceptCount})`;
            select.appendChild(option);
        });

        // Reset to "All"
        select.value = '';
    },

    /**
     * Update filter count labels
     */
    updateFilterCounts() {
        const counts = Graph.getFilterCounts();

        document.getElementById('count-domain').textContent = `(${counts.domain})`;
        document.getElementById('count-fibo').textContent = `(${counts.fibo})`;
        document.getElementById('count-schema').textContent = `(${counts.schema})`;
        document.getElementById('count-unknown').textContent = `(${counts.unknown})`;
        document.getElementById('count-orphans').textContent = `(${counts.orphans})`;
        document.getElementById('count-context').textContent = `(${counts.context})`;
        document.getElementById('count-categorizations').textContent = `(${counts.categorizations})`;
        document.getElementById('count-relationships').textContent = `(${counts.relationships})`;
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
        Graph.applyFilter(this.state.show);
        // Update counts after filter (orphan count depends on visible edges)
        this.updateFilterCounts();
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
     * Set up legend toggle (collapsible)
     */
    setupLegendToggle() {
        const legend = document.getElementById('legend');
        const toggle = document.getElementById('legend-toggle');
        if (legend && toggle) {
            toggle.addEventListener('click', () => {
                legend.classList.toggle('expanded');
                toggle.textContent = legend.classList.contains('expanded')
                    ? '▼ BKB Notation'
                    : '▶ BKB Notation';
            });
        }
    },

    /**
     * Set up mobile menu (hamburger toggle)
     */
    setupMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('sidebar-close-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        const openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        };

        if (menuBtn) {
            menuBtn.addEventListener('click', openSidebar);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // Close sidebar when domain is selected (mobile)
        this.closeMobileSidebar = closeSidebar;
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
