/**
 * BKB Explorer - Sidebar Component
 *
 * Handles domain tree navigation.
 */

const Sidebar = {
    container: null,
    domainsData: null,

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
                this.handleClick(item);
            });
        });

        // Expand RBCZ, MIB and Test by default
        this.expandNode('RBCZ');
        this.expandNode('MIB');
        this.expandNode('Test');
    },

    /**
     * Render hierarchy recursively
     */
    renderHierarchy(node, depth) {
        let html = '';

        for (const [name, data] of Object.entries(node)) {
            const hasChildren = data.children && Object.keys(data.children).length > 0;
            const isClickable = data.type === 'domain';
            const conceptCount = data.stats?.concepts || 0;

            // Determine icon (simple Unicode symbols)
            let icon = '○';
            if (data.type === 'enterprise') icon = '◆';
            else if (data.type === 'business_unit') icon = '▶';
            else if (hasChildren) icon = '▶';

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

            if (hasChildren) {
                html += `<div class="tree-children collapsed" data-parent="${name}">`;
                html += this.renderHierarchy(data.children, depth + 1);
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
                if (icon && item.dataset.type !== 'enterprise') {
                    icon.textContent = '▼';
                }
            }
        }
    },

    /**
     * Handle tree item click
     */
    handleClick(item) {
        const name = item.dataset.name;
        const type = item.dataset.type;
        const isClickable = item.dataset.clickable === 'true';

        // Toggle children visibility for folders
        const children = this.container.querySelector(`.tree-children[data-parent="${name}"]`);
        if (children) {
            const isCollapsed = children.classList.contains('collapsed');
            children.classList.toggle('collapsed');

            // Update icon (not for enterprise)
            if (type !== 'enterprise') {
                const icon = item.querySelector('.icon');
                if (icon) {
                    icon.textContent = isCollapsed ? '▼' : '▶';
                }
            }
        }

        // Load domain if it's a domain type
        if (isClickable) {
            BKBExplorer.selectDomain(name);
        }
    },

    /**
     * Set active domain in sidebar
     */
    setActive(domainName) {
        // Remove previous active and reset icon
        this.container.querySelectorAll('.tree-item.active').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.icon');
            if (icon) {
                icon.textContent = '○';
            }
        });

        // Set new active
        const item = this.container.querySelector(`.tree-item[data-name="${domainName}"]`);
        if (item) {
            item.classList.add('active');
            item.querySelector('.icon').textContent = '●';

            // Expand parent folders
            let parent = item.parentElement;
            while (parent) {
                if (parent.classList.contains('tree-children')) {
                    parent.classList.remove('collapsed');
                    const parentName = parent.dataset.parent;
                    const parentItem = this.container.querySelector(`.tree-item[data-name="${parentName}"]`);
                    if (parentItem && parentItem.dataset.type !== 'enterprise') {
                        parentItem.querySelector('.icon').textContent = '▼';
                    }
                }
                parent = parent.parentElement;
            }
        }
    }
};
