/**
 * BKB Explorer - Graph Component
 *
 * Cytoscape.js wrapper for concept visualization.
 */

const Graph = {
    cy: null,
    container: null,
    currentDomain: null,

    /**
     * Initialize Cytoscape instance
     */
    init(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('❌ Graph container not found');
            return;
        }

        // Show loading state
        this.container.innerHTML = '<div class="loading">Select a domain from sidebar...</div>';
    },

    /**
     * Load domain data into graph
     */
    loadDomain(domainData) {
        this.currentDomain = domainData;

        // Clear container
        this.container.innerHTML = '';

        // Build Cytoscape elements
        const elements = this.buildElements(domainData);

        // Initialize Cytoscape
        this.cy = cytoscape({
            container: this.container,
            elements: elements,
            style: this.getStyles(),
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                nodeSep: 30,
                rankSep: 60,
                edgeSep: 20,
                padding: 20,
                spacingFactor: 1.2
            },
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.3
        });

        // Set up event handlers
        this.setupEventHandlers();

        console.log(`📊 Graph loaded: ${elements.nodes.length} nodes, ${elements.edges.length} edges`);
    },

    /**
     * Build Cytoscape elements from domain data
     */
    buildElements(domainData) {
        const nodes = [];
        const edges = [];
        const concepts = domainData.concepts || [];
        const conceptMap = new Map(concepts.map(c => [c.name, c]));
        const internalNames = new Set(concepts.map(c => c.name));

        // Find roots with internal hierarchies (concepts whose parent is external/none)
        const roots = concepts.filter(c => {
            const parent = c.hierarchy?.extends_name;
            return !parent || !internalNames.has(parent);
        });

        // Count descendants for each root
        const countDescendants = (name, visited = new Set()) => {
            if (visited.has(name)) return 0;
            visited.add(name);
            const children = concepts.filter(c => c.hierarchy?.extends_name === name);
            return children.length + children.reduce((sum, ch) =>
                sum + countDescendants(ch.name, visited), 0);
        };

        // Get top 3 roots by descendant count
        const rootsWithCount = roots.map(r => ({
            concept: r,
            descendants: countDescendants(r.name)
        })).filter(r => r.descendants > 0)
          .sort((a, b) => b.descendants - a.descendants)
          .slice(0, 3);

        // Collect all nodes in selected trees
        const visibleNames = new Set();

        const addTree = (name, depth = 0, maxDepth = 5) => {
            if (depth > maxDepth || visibleNames.has(name)) return;
            visibleNames.add(name);
            const children = concepts.filter(c => c.hierarchy?.extends_name === name);
            children.forEach(ch => addTree(ch.name, depth + 1, maxDepth));
        };

        rootsWithCount.forEach(r => {
            addTree(r.concept.name);
        });

        // Get visible concepts
        const visibleConcepts = concepts.filter(c => visibleNames.has(c.name));
        const hubNames = new Set(rootsWithCount.map(r => r.concept.name));

        // Add nodes
        visibleConcepts.forEach(concept => {
            const isHub = hubNames.has(concept.name);
            nodes.push({
                data: {
                    id: concept.name,
                    name: concept.name,
                    definition: concept.definition?.text || '',
                    source: concept.definition?.source || 'DRAFT',
                    fiboUri: concept.fibo_mapping?.uri || null,
                    fiboLabel: concept.fibo_mapping?.label || null,
                    matchType: concept.fibo_mapping?.match_type || null,
                    hasFibo: concept.has_fibo_mapping || false,
                    extendsName: concept.hierarchy?.extends_name || null,
                    childCount: this.countChildren(concept.name, concepts),
                    isHub: isHub
                },
                classes: this.getNodeClasses(concept) + (isHub ? ' hub' : '')
            });
        });

        // Add edges (only between visible nodes)
        // Direction: parent → child (for correct dagre TB hierarchy)
        visibleConcepts.forEach(concept => {
            const extendsName = concept.hierarchy?.extends_name;
            if (extendsName && visibleNames.has(extendsName)) {
                edges.push({
                    data: {
                        id: `${extendsName}-to-${concept.name}`,
                        source: extendsName,  // parent (top)
                        target: concept.name, // child (bottom)
                        type: 'extends'
                    },
                    classes: 'extends'
                });
            }
        });

        // Add ghost nodes for cross-domain concepts
        const crossDomain = window.BKB_DATA.domains?.crossDomain || {};
        visibleConcepts.forEach(concept => {
            const crossDomains = crossDomain[concept.name];
            if (crossDomains && crossDomains.domains) {
                const otherDomains = crossDomains.domains.filter(d =>
                    d !== domainData.domain.name
                );
                if (otherDomains.length > 0) {
                    // Mark node as cross-domain
                    const node = nodes.find(n => n.data.id === concept.name);
                    if (node) {
                        node.data.crossDomains = otherDomains;
                        node.classes += ' cross-domain';
                    }
                }
            }
        });

        return { nodes, edges };
    },

    /**
     * Calculate connectivity score for each concept
     */
    calculateConnectivity(concepts) {
        const connectivity = {};
        const crossDomain = window.BKB_DATA.domains?.crossDomain || {};

        concepts.forEach(concept => {
            let score = 0;

            // Count children
            const children = concepts.filter(c =>
                c.hierarchy?.extends_name === concept.name
            ).length;
            score += children;

            // Bonus for cross-domain
            if (crossDomain[concept.name]) {
                score += crossDomain[concept.name].domains.length * 2;
            }

            // Bonus for FIBO mapping
            if (concept.has_fibo_mapping) {
                score += 1;
            }

            connectivity[concept.name] = score;
        });

        return connectivity;
    },

    /**
     * Get top N concepts by connectivity
     */
    getTopConcepts(concepts, connectivity, limit) {
        return [...concepts]
            .sort((a, b) => (connectivity[b.name] || 0) - (connectivity[a.name] || 0))
            .slice(0, limit);
    },

    /**
     * Count children of a concept
     */
    countChildren(conceptName, concepts) {
        return concepts.filter(c =>
            c.hierarchy?.extends_name === conceptName
        ).length;
    },

    /**
     * Get CSS classes for a node
     */
    getNodeClasses(concept) {
        const classes = [];

        // Source-based styling
        const source = concept.definition?.source?.toLowerCase() || 'draft';
        if (source === 'fibo' || concept.has_fibo_mapping) {
            classes.push('fibo');
        } else if (source === 'inherited') {
            classes.push('inherited');
        } else {
            classes.push('draft');
        }

        return classes.join(' ');
    },

    /**
     * Get Cytoscape styles
     */
    getStyles() {
        return [
            // Base node style
            {
                selector: 'node',
                style: {
                    'shape': 'rectangle',
                    'width': 'label',
                    'height': 36,
                    'padding': '12px',
                    'label': 'data(name)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': 12,
                    'font-weight': 500,
                    'background-color': '#ecf0f1',
                    'border-width': 2,
                    'border-color': '#bdc3c7'
                }
            },
            // FIBO mapped
            {
                selector: 'node.fibo',
                style: {
                    'background-color': '#d5f4e6',
                    'border-color': '#2ecc71',
                    'border-width': 3
                }
            },
            // DRAFT
            {
                selector: 'node.draft',
                style: {
                    'background-color': '#fef3e2',
                    'border-color': '#f39c12',
                    'border-width': 2
                }
            },
            // INHERITED
            {
                selector: 'node.inherited',
                style: {
                    'background-color': '#e3f2fd',
                    'border-color': '#3498db',
                    'border-width': 2
                }
            },
            // Cross-domain indicator
            {
                selector: 'node.cross-domain',
                style: {
                    'border-width': 4
                }
            },
            // Ghost node
            {
                selector: 'node.ghost',
                style: {
                    'opacity': 0.5,
                    'border-style': 'dashed'
                }
            },
            // Hub node (top connectivity)
            {
                selector: 'node.hub',
                style: {
                    'font-weight': 700,
                    'font-size': 14
                }
            },
            // Selected node
            {
                selector: 'node:selected',
                style: {
                    'border-color': '#2c3e50',
                    'border-width': 4
                }
            },
            // Highlighted (search match)
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#e74c3c',
                    'border-width': 4,
                    'background-color': '#fadbd8'
                }
            },
            // Base edge style
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#95a5a6',
                    'target-arrow-color': '#95a5a6',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            // Extends edge
            {
                selector: 'edge.extends',
                style: {
                    'width': 4,
                    'line-color': '#2c3e50',
                    'target-arrow-color': '#2c3e50',
                    'label': 'extends',
                    'font-size': 10,
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'color': '#7f8c8d'
                }
            },
            // Categorizes edge
            {
                selector: 'edge.categorizes',
                style: {
                    'width': 2,
                    'line-style': 'dashed',
                    'line-color': '#95a5a6',
                    'target-arrow-color': '#95a5a6'
                }
            }
        ];
    },

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Node hover - show tooltip
        this.cy.on('mouseover', 'node', (e) => {
            const node = e.target;
            Tooltip.show(node, e.renderedPosition);
        });

        this.cy.on('mouseout', 'node', () => {
            Tooltip.hide();
        });

        // Node click - expand/collapse
        this.cy.on('tap', 'node', (e) => {
            const node = e.target;
            this.toggleExpand(node);
        });

        // Canvas click - deselect
        this.cy.on('tap', (e) => {
            if (e.target === this.cy) {
                Tooltip.hide();
            }
        });
    },

    /**
     * Toggle node expansion
     */
    toggleExpand(node) {
        const nodeId = node.id();
        const isExpanded = BKBExplorer.state.expandedNodes.has(nodeId);

        if (isExpanded) {
            this.collapseNode(node);
            BKBExplorer.state.expandedNodes.delete(nodeId);
        } else {
            this.expandNode(node);
            BKBExplorer.state.expandedNodes.add(nodeId);
        }
    },

    /**
     * Expand a node to show children
     */
    expandNode(node) {
        const nodeId = node.id();
        const concepts = this.currentDomain.concepts || [];

        // Find children
        const children = concepts.filter(c =>
            c.hierarchy?.extends_name === nodeId
        );

        // Add children nodes
        children.forEach(child => {
            if (!this.cy.getElementById(child.name).length) {
                this.cy.add({
                    data: {
                        id: child.name,
                        name: child.name,
                        definition: child.definition?.text || '',
                        source: child.definition?.source || 'DRAFT',
                        hasFibo: child.has_fibo_mapping || false,
                        extendsName: child.hierarchy?.extends_name || null
                    },
                    classes: this.getNodeClasses(child)
                });

                this.cy.add({
                    data: {
                        id: `${nodeId}-to-${child.name}`,
                        source: nodeId,      // parent (top)
                        target: child.name,  // child (bottom)
                        type: 'extends'
                    },
                    classes: 'extends'
                });
            }
        });

        // Re-run layout
        this.cy.layout({
            name: 'dagre',
            rankDir: 'TB',
            animate: true,
            animationDuration: 300
        }).run();
    },

    /**
     * Collapse a node to hide children
     */
    collapseNode(node) {
        const nodeId = node.id();

        // Find and remove children (edges go parent→child, so source=parent, target=child)
        const childEdges = this.cy.edges().filter(e =>
            e.data('source') === nodeId && e.data('type') === 'extends'
        );

        childEdges.forEach(edge => {
            const childId = edge.data('target');
            this.cy.getElementById(childId).remove();
        });
    },

    /**
     * Focus on a specific node
     */
    focusNode(nodeName) {
        const node = this.cy.getElementById(nodeName);
        if (node.length) {
            this.cy.animate({
                center: { eles: node },
                zoom: 1.5
            }, {
                duration: 500
            });
            node.select();
        }
    },

    /**
     * Highlight nodes matching search
     */
    highlightSearch(query) {
        const lowerQuery = query.toLowerCase();

        this.cy.nodes().forEach(node => {
            const name = node.data('name').toLowerCase();
            if (name.includes(lowerQuery)) {
                node.addClass('highlighted');
            } else {
                node.removeClass('highlighted');
            }
        });
    },

    /**
     * Clear search highlight
     */
    clearHighlight() {
        this.cy.nodes().removeClass('highlighted');
    },

    /**
     * Apply filter
     */
    applyFilter(filterType) {
        this.cy.nodes().forEach(node => {
            let visible = true;

            switch (filterType) {
                case 'fibo':
                    visible = node.hasClass('fibo');
                    break;
                case 'draft':
                    visible = node.hasClass('draft');
                    break;
                case 'cross':
                    visible = node.data('crossDomains')?.length > 0;
                    break;
                default:
                    visible = true;
            }

            if (visible) {
                node.show();
            } else {
                node.hide();
            }
        });
    }
};
