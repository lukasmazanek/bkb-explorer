/**
 * BKB Explorer - Sidebar Component
 *
 * Handles domain tree navigation with View support (ADR-040).
 */

const Sidebar = {
    container: null,
    domainsData: null,
    viewsEnabled: true,  // Show views under domains

    /**
     * Initialize sidebar with domain hierarchy
     */
    init(domainsData) {
        this.container = document.getElementById('domain-tree');
        this.domainsData = domainsData;

        if (!this.container) {
            console.error('❌ Sidebar container not found');
            return;
        }

        this.render();
        console.log('📁 Sidebar initialized');
    },

    /**
     * Render domain tree
     */
    render() {
        if (!this.domainsData || !this.domainsData.hierarchy) {
            this.container.innerHTML = '<div class="empty-state">No domains loaded</div>';
            return;
        }

        const html = this.renderHierarchy(this.domainsData.hierarchy, 0);
        this.container.innerHTML = html;

        // Add click handlers
        this.container.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Check if click was on the icon
                const clickedOnIcon = e.target.classList.contains('icon');
                this.handleClick(item, clickedOnIcon);
            });
        });

        // Expand all top-level domains by default (shows views underneath)
        for (const name of Object.keys(this.domainsData.hierarchy)) {
            this.expandNode(name);
            const node = this.domainsData.hierarchy[name];
            // Also expand child domains (not views - those are already visible)
            if (node.children) {
                for (const childName of Object.keys(node.children)) {
                    this.expandNode(childName);
                }
            }
        }
    },

    /**
     * Render hierarchy recursively
     * ADR-040: Views are perspectives within domains, NOT subdomains
     */
    renderHierarchy(node, depth) {
        let html = '';

        // Sort: Test always last, others alphabetically (ADR-041)
        const entries = Object.entries(node).sort(([a], [b]) => {
            if (a === 'Test') return 1;
            if (b === 'Test') return -1;
            return a.localeCompare(b);
        });

        for (const [name, data] of entries) {
            const hasChildren = data.children && Object.keys(data.children).length > 0;
            const hasViews = data.views && Object.keys(data.views).length > 0;
            const isClickable = data.type === 'domain';
            const conceptCount = data.stats?.concepts || 0;

            // Determine icon (simple Unicode symbols)
            let icon = '○';
            if (hasChildren || hasViews) icon = '▶';

            // Count display
            const countDisplay = conceptCount > 0 ? `(${conceptCount})` : '';

            html += `
                <div class="tree-item"
                     data-name="${name}"
                     data-type="${data.type || 'folder'}"
                     data-depth="${depth}"
                     data-clickable="${isClickable}">
                    <span class="icon">${icon}</span>
                    <span class="label">${name}</span>
                    <span class="count">${countDisplay}</span>
                </div>
            `;

            // Render child domains (subdomains)
            if (hasChildren) {
                html += `<div class="tree-children collapsed" data-parent="${name}">`;
                html += this.renderHierarchy(data.children, depth + 1);
                html += '</div>';
            }

            // Render views (NOT subdomains - just perspectives within the domain)
            if (hasViews) {
                html += `<div class="tree-children views-list collapsed" data-parent="${name}">`;
                // Sort views alphabetically (ADR-041)
                const viewEntries = Object.entries(data.views).sort(([a], [b]) => a.localeCompare(b));
                for (const [viewName, viewData] of viewEntries) {
                    const viewCount = viewData.stats?.concepts || 0;
                    html += `
                        <div class="tree-item view-item"
                             data-name="${viewName}"
                             data-type="view"
                             data-domain="${name}"
                             data-depth="${depth + 1}"
                             data-clickable="true">
                            <span class="icon">◇</span>
                            <span class="label">${viewName}</span>
                            <span class="count">(${viewCount})</span>
                        </div>
                    `;
                }
                html += '</div>';
            }
        }

        return html;
    },

    /**
     * Expand a node by name
     */
    expandNode(name) {
        const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
        if (children) {
            children.classList.remove('collapsed');
            const item = this.container.querySelector(`.tree-item[data-name="${name}"]`);
            if (item) {
                const icon = item.querySelector('.icon');
                if (icon) {
                    icon.textContent = '▼';
                }
            }
        }
    },

    /**
     * Handle tree item click
     * @param {HTMLElement} item - The clicked tree item
     * @param {boolean} clickedOnIcon - True if click was on the expand/collapse icon
     */
    handleClick(item, clickedOnIcon = false) {
        const name = item.dataset.name;
        const type = item.dataset.type;
        const domain = item.dataset.domain;  // For views

        // Handle view click - load view data
        if (type === 'view' && domain) {
            BKBExplorer.selectDomain(domain, name);
            this.setActiveView(domain, name);
            return;
        }

        // Handle domain click
        if (type === 'domain') {
            const viewsList = this.container.querySelector(`.tree-children.views-list[data-parent="${name}"]`);
            const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
            const expandable = viewsList || children;

            if (clickedOnIcon && expandable) {
                // Click on icon = only toggle expand/collapse
                const isCollapsed = expandable.classList.contains('collapsed');
                expandable.classList.toggle('collapsed');
                const icon = item.querySelector('.icon');
                if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
                return;
            }

            // Click on text = load domain data
            if (expandable) {
                // Ensure expanded when loading
                if (expandable.classList.contains('collapsed')) {
                    expandable.classList.remove('collapsed');
                    const icon = item.querySelector('.icon');
                    if (icon) icon.textContent = '▼';
                }
            }
            BKBExplorer.selectDomain(name);
            this.setActive(name);
            return;
        }

        // Toggle children visibility for other items (folders)
        const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
        if (children) {
            const isCollapsed = children.classList.contains('collapsed');
            children.classList.toggle('collapsed');
            const icon = item.querySelector('.icon');
            if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
        }
    },

    /**
     * Set active view in sidebar
     */
    setActiveView(domainName, viewName) {
        // Clear all active states
        this.container.querySelectorAll('.tree-item.active').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.icon');
            if (icon) {
                if (item.dataset.type === 'view') {
                    icon.textContent = '◇';
                }
                // Domain icons stay as ▼ (don't reset to ○)
            }
        });

        // Ensure domain is expanded (▼ icon)
        const domainItem = this.container.querySelector(`.tree-item[data-name="${domainName}"][data-type="domain"]`);
        if (domainItem) {
            const icon = domainItem.querySelector('.icon');
            if (icon) icon.textContent = '▼';
            // Ensure views list is expanded
            const viewsList = this.container.querySelector(`.tree-children.views-list[data-parent="${domainName}"]`);
            if (viewsList) viewsList.classList.remove('collapsed');
        }

        // Set view as active
        const viewItem = this.container.querySelector(`.tree-item.view-item[data-name="${viewName}"][data-domain="${domainName}"]`);
        if (viewItem) {
            viewItem.classList.add('active');
            viewItem.querySelector('.icon').textContent = '◆';
        }
    },

    /**
     * Set active domain in sidebar
     */
    setActive(domainName) {
        // Remove previous active
        this.container.querySelectorAll('.tree-item.active').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.icon');
            if (icon) {
                // Reset view icons (◆→◇)
                if (item.classList.contains('view-item')) {
                    icon.textContent = '◇';
                }
                // Reset leaf domain icons (●→○)
                else {
                    const hasChildren = this.container.querySelector(`.tree-children[data-parent="${item.dataset.name}"]`);
                    if (!hasChildren) {
                        icon.textContent = '○';
                    }
                }
            }
        });

        // Remove previous view items
        this.container.querySelectorAll('.views-container').forEach(el => el.remove());

        // Set new active
        const item = this.container.querySelector(`.tree-item[data-name="${domainName}"]`);
        if (item) {
            item.classList.add('active');
            // Only change icon to ● for domains without views (leaf domains)
            // Domains with views keep ▼ icon (expand state shown, selection via CSS)
            const hasViews = this.container.querySelector(`.tree-children.views-list[data-parent="${domainName}"]`);
            if (!hasViews) {
                item.querySelector('.icon').textContent = '●';
            }

            // Expand parent folders
            let parent = item.parentElement;
            while (parent) {
                if (parent.classList.contains('tree-children')) {
                    parent.classList.remove('collapsed');
                    const parentName = parent.dataset.parent;
                    const parentItem = this.container.querySelector(`.tree-item[data-name="${parentName}"]`);
                    if (parentItem) {
                        parentItem.querySelector('.icon').textContent = '▼';
                    }
                }
                parent = parent.parentElement;
            }
        }
    },

    /**
     * Render views under the active domain
     * @param {Array} views - Array of { id, name, conceptCount }
     * @param {string} domainName - Currently active domain
     */
    renderViews(views, domainName) {
        if (!this.viewsEnabled || views.length === 0) return;

        // Find the domain item
        const domainItem = this.container.querySelector(`.tree-item[data-name="${domainName}"]`);
        if (!domainItem) return;

        // Remove existing views container
        const existingContainer = domainItem.parentElement.querySelector('.views-container');
        if (existingContainer) existingContainer.remove();

        // Create views container
        const viewsContainer = document.createElement('div');
        viewsContainer.className = 'views-container';
        viewsContainer.dataset.domain = domainName;

        // Add view items (no "All" - redundant with domain count)
        views.forEach(view => {
            const viewItem = document.createElement('div');
            viewItem.className = 'tree-item view-item';
            viewItem.dataset.viewId = view.id;
            viewItem.dataset.domain = domainName;
            viewItem.innerHTML = `
                <span class="icon">○</span>
                <span class="label">${view.name}</span>
                <span class="count">(${view.conceptCount})</span>
            `;
            viewItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectView(view.id, domainName);
            });
            viewsContainer.appendChild(viewItem);
        });

        // Insert after domain item
        domainItem.insertAdjacentElement('afterend', viewsContainer);
    },

    /**
     * Select a view
     * @param {string|null} viewId - View ID or null for all
     * @param {string} domainName - Domain name
     */
    selectView(viewId, domainName) {
        // Update active state in sidebar
        const container = this.container.querySelector(`.views-container[data-domain="${domainName}"]`);
        if (container) {
            container.querySelectorAll('.view-item').forEach(item => {
                const isActive = item.dataset.viewId === (viewId || '');
                item.classList.toggle('active', isActive);
                item.querySelector('.icon').textContent = isActive ? '◉' : '○';
            });
        }

        // Notify app
        BKBExplorer.selectView(viewId);
    }
};
