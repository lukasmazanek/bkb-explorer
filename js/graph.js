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
                nodeSep: 20,
                rankSep: 50,
                edgeSep: 10,
                padding: 20,
                spacingFactor: 1.0
            },
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.5,
            userPanningEnabled: false,  // We handle panning with right-click
            userZoomingEnabled: true,
            zoomingEnabled: true
        });

        // Set up event handlers
        this.setupEventHandlers();

        // Fit graph to viewport after layout settles
        setTimeout(() => {
            this.cy.fit(50);
        }, 100);

        console.log(`📊 Graph loaded: ${elements.nodes.length} nodes, ${elements.edges.length} edges`);
    },

    /**
     * Build Cytoscape elements from domain data
     * Uses categorizations for parent-child relationships (ConceptSpeak structure)
     */
    buildElements(domainData) {
        const nodes = [];
        const edges = [];
        const concepts = domainData.concepts || [];
        const categorizations = domainData.categorizations || [];
        const relationships = domainData.relationships || [];
        const conceptMap = new Map(concepts.map(c => [c.name, c]));
        const internalNames = new Set(concepts.map(c => c.name));

        // Build parent-child map from categorizations
        const childToParent = new Map();  // child -> { parent, schema }
        categorizations.forEach(cat => {
            const parentName = cat.parent_name;
            const schema = cat.category_name || '';
            (cat.children_names || []).forEach(childName => {
                if (internalNames.has(childName) && internalNames.has(parentName)) {
                    childToParent.set(childName, { parent: parentName, schema });
                }
            });
        });

        // Find root concepts (no parent in categorizations)
        const roots = concepts.filter(c => !childToParent.has(c.name));

        // Count descendants
        const countDescendants = (name, visited = new Set()) => {
            if (visited.has(name)) return 0;
            visited.add(name);
            const children = concepts.filter(c => childToParent.get(c.name)?.parent === name);
            return children.length + children.reduce((sum, ch) =>
                sum + countDescendants(ch.name, visited), 0);
        };

        // Get roots with descendants (main trees to display)
        const rootsWithCount = roots.map(r => ({
            concept: r,
            descendants: countDescendants(r.name)
        })).filter(r => r.descendants > 0)
          .sort((a, b) => b.descendants - a.descendants)
          .slice(0, 5);

        // If no roots with descendants, show all concepts
        const showAll = rootsWithCount.length === 0;

        // Collect visible nodes
        const visibleNames = new Set();

        if (showAll) {
            concepts.forEach(c => visibleNames.add(c.name));
        } else {
            const addTree = (name, depth = 0, maxDepth = 6) => {
                if (depth > maxDepth || visibleNames.has(name)) return;
                visibleNames.add(name);
                const children = concepts.filter(c => childToParent.get(c.name)?.parent === name);
                children.forEach(ch => addTree(ch.name, depth + 1, maxDepth));
            };
            rootsWithCount.forEach(r => addTree(r.concept.name));
        }

        // Identify context concepts from concept.type field
        const contextConcepts = new Set();
        concepts.forEach(c => {
            if (c.type === 'context_reference') {
                contextConcepts.add(c.name);
            }
        });

        // Also include concepts connected via relationships to visible nodes
        relationships.forEach(rel => {
            const subj = rel.subject_name;
            const obj = rel.object_name;
            // If one end is visible, add the other end too
            if (visibleNames.has(subj) && internalNames.has(obj)) {
                visibleNames.add(obj);
            }
            if (visibleNames.has(obj) && internalNames.has(subj)) {
                visibleNames.add(subj);
            }
        });

        // Get visible concepts
        const visibleConcepts = concepts.filter(c => visibleNames.has(c.name));
        const hubNames = new Set(rootsWithCount.map(r => r.concept.name));

        // Add nodes
        visibleConcepts.forEach(concept => {
            const isHub = hubNames.has(concept.name);
            const isContext = contextConcepts.has(concept.name);
            let classes = this.getNodeClasses(concept);
            if (isHub) classes += ' hub';
            if (isContext) classes += ' context';

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
                    isHub: isHub,
                    isContext: isContext
                },
                classes: classes
            });
        });

        // Add categorization edges (parent → child)
        // Uses categorizations from ConceptSpeak, not FIBO hierarchy
        visibleConcepts.forEach(concept => {
            const parentInfo = childToParent.get(concept.name);
            if (parentInfo && visibleNames.has(parentInfo.parent)) {
                edges.push({
                    data: {
                        id: `cat-${parentInfo.parent}-to-${concept.name}`,
                        source: parentInfo.parent,  // parent (top)
                        target: concept.name,       // child (bottom)
                        type: 'extends',
                        schema: parentInfo.schema,  // categorization label
                        label: parentInfo.schema || ''
                    },
                    classes: 'extends'
                });
            }
        });

        // Add relationship edges (binary verbs from ConceptSpeak)
        relationships.forEach(rel => {
            const subj = rel.subject_name;
            const obj = rel.object_name;
            // Get both verb phrases for bidirectional labels
            const verbPhrase = (rel.verb_phrase && rel.verb_phrase.trim()) || '';
            const inversePhrase = (rel.inverse_verb_phrase && rel.inverse_verb_phrase.trim()) || '';

            // Only add if both concepts are visible
            if (visibleNames.has(subj) && visibleNames.has(obj)) {
                // Context relationships get dotted styling
                const isContextRel = rel.is_context === true;
                edges.push({
                    data: {
                        id: `rel-${rel.id || Math.random()}`,
                        source: subj,
                        target: obj,
                        type: 'relationship',
                        sourceLabel: verbPhrase,      // verb near subject
                        targetLabel: inversePhrase,   // inverse near object
                        isContext: isContextRel
                    },
                    classes: isContextRel ? 'relationship context-rel' : 'relationship'
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
     * Based on BKB (Business Knowledge Blueprint) visual notation
     * See ConceptSpeak-Visual-Manual.md for reference
     */
    getStyles() {
        return [
            // ===========================================
            // CONCEPT NODES - Solid rectangle, bold text, 2px border
            // ===========================================
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
                    'font-weight': 700,  // Bold per BKB notation
                    'background-color': '#dedaff',  // Light purple (BKB default)
                    'border-width': 2,  // 2px border per CSV notation
                    'border-color': '#1a1a1a'  // Dark border
                }
            },
            // FIBO mapped - green fill, black border
            {
                selector: 'node.fibo',
                style: {
                    'background-color': '#d5f4e6'
                }
            },
            // DRAFT - orange fill, black border
            {
                selector: 'node.draft',
                style: {
                    'background-color': '#fef3e2'
                }
            },
            // INHERITED - blue fill, black border
            {
                selector: 'node.inherited',
                style: {
                    'background-color': '#e3f2fd'
                }
            },
            // Cross-domain indicator - thicker border
            {
                selector: 'node.cross-domain',
                style: {
                    'border-width': 6
                }
            },
            // Ghost node (external reference) - dotted border
            {
                selector: 'node.ghost',
                style: {
                    'opacity': 0.6,
                    'border-style': 'dashed'
                }
            },
            // Hub node (root of tree)
            {
                selector: 'node.hub',
                style: {
                    'font-size': 14,
                    'height': 42
                }
            },
            // Selected node
            {
                selector: 'node:selected',
                style: {
                    'border-color': '#e74c3c',
                    'border-width': 5
                }
            },
            // Highlighted (search match)
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#e74c3c',
                    'border-width': 5,
                    'background-color': '#fadbd8'
                }
            },

            // ===========================================
            // CONTEXT NODES (type: context_reference)
            // Must come LAST to override all other node styles
            // ===========================================
            {
                selector: 'node.context',
                style: {
                    'border-style': 'dotted',
                    'border-width': 1,
                    'border-color': '#1a1a1a',
                    'background-color': '#ffffff'
                }
            },

            // ===========================================
            // CATEGORIZATION EDGES (extends/is-a)
            // 8px thick line, label near parent (when available)
            // ===========================================
            {
                selector: 'edge.extends',
                style: {
                    'width': 8,  // 8px per CSV notation
                    'line-color': '#1a1a1a',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-arrow-shape': 'none',
                    // Label (categorization schema) - needs data from ontology-lift
                    'label': 'data(schema)',
                    'font-size': 10,
                    'text-margin-y': -12,
                    'color': '#1a1a1a',
                    'source-text-offset': 30
                }
            },

            // ===========================================
            // BINARY VERB EDGES (relationships)
            // Thin line (2px), purple color for visibility
            // Labels on both ends: verb near source, inverse near target
            // ===========================================
            {
                selector: 'edge.relationship',
                style: {
                    'width': 2,  // Thin line per CSV
                    'line-color': '#9b59b6',  // Purple for binary verbs
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'none',
                    'source-arrow-shape': 'none',
                    // Source label (verb_phrase near subject)
                    'source-label': 'data(sourceLabel)',
                    'source-text-offset': 15,
                    'source-text-margin-y': -6,
                    // Target label (inverse_verb_phrase near object)
                    'target-label': 'data(targetLabel)',
                    'target-text-offset': 5,
                    'target-text-margin-y': -6,
                    // Common label styling
                    'font-size': 9,
                    'color': '#8e44ad',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '2px'
                }
            },
            // Context relationship edges (dotted 1px)
            // Edges connecting to/from context concepts
            {
                selector: 'edge.context-rel',
                style: {
                    'width': 1,
                    'line-style': 'dotted',
                    'line-color': '#9b59b6'
                }
            },

            // ===========================================
            // BASE EDGE STYLE (fallback)
            // ===========================================
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#95a5a6',
                    'curve-style': 'bezier'
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

        // Right-click panning
        this.setupRightClickPan();

        // Manual wheel zoom (in case default doesn't work)
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;  // Zoom out/in
            const zoom = this.cy.zoom() * delta;
            const boundedZoom = Math.max(this.cy.minZoom(), Math.min(this.cy.maxZoom(), zoom));

            // Zoom toward mouse position
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.cy.zoom({
                level: boundedZoom,
                renderedPosition: { x, y }
            });
        }, { passive: false });
    },

    /**
     * Set up right-click panning
     */
    setupRightClickPan() {
        let isPanning = false;
        let lastX, lastY;

        // Prevent context menu on graph
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                this.container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                // Use panBy for incremental panning
                this.cy.panBy({ x: dx, y: dy });
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2 && isPanning) {
                isPanning = false;
                this.container.style.cursor = 'default';
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
