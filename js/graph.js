/**
 * BKB Explorer - Graph Component
 *
 * Cytoscape.js wrapper for concept visualization.
 */

const Graph = {
    cy: null,
    container: null,
    currentDomain: null,
    currentLayout: 'dagre',

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
        const initialLayout = this.getLayoutConfig();
        initialLayout.animate = false; // No animation on initial load

        this.cy = cytoscape({
            container: this.container,
            elements: elements,
            style: this.getStyles(),
            layout: initialLayout,
            minZoom: 0.2,
            maxZoom: 3,
            wheelSensitivity: 0.5,
            userPanningEnabled: true,   // Enable for touch gestures
            userZoomingEnabled: true,
            zoomingEnabled: true,
            panningEnabled: true
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
        const parentChildCount = new Map();  // parent -> count of children
        categorizations.forEach(cat => {
            const parentName = cat.parent_name;
            const schema = cat.category_name || '';
            const children = cat.children_names || [];
            children.forEach(childName => {
                if (internalNames.has(childName) && internalNames.has(parentName)) {
                    childToParent.set(childName, { parent: parentName, schema });
                }
            });
            // Count children for parent
            const validChildren = children.filter(ch => internalNames.has(ch));
            parentChildCount.set(parentName, (parentChildCount.get(parentName) || 0) + validChildren.length);
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
                    hasSchema: concept.has_schema_mapping || false,
                    extendsName: concept.hierarchy?.extends_name || null,
                    childCount: parentChildCount.get(concept.name) || 0,
                    isHub: isHub,
                    isContext: isContext
                },
                classes: classes
            });
        });

        // Add categorization edges with junction nodes
        // Structure: parent → junction (●) → children
        // Junction node shows the categorization label
        const addedJunctions = new Set();
        let junctionIndex = 0;

        categorizations.forEach(cat => {
            const parentName = cat.parent_name;
            const schema = cat.category_name || '';
            const children = (cat.children_names || []).filter(ch => visibleNames.has(ch));

            if (!visibleNames.has(parentName) || children.length === 0) return;

            const junctionId = `junction-${parentName}-${schema.replace(/\s+/g, '_')}`;
            if (addedJunctions.has(junctionId)) return;
            addedJunctions.add(junctionId);

            // Junction node (small circle with label)
            nodes.push({
                data: {
                    id: junctionId,
                    name: schema || '●',
                    label: schema,
                    isJunction: true,
                    junctionIndex: junctionIndex++
                },
                classes: 'junction'
            });

            // Trunk edge: parent → junction
            edges.push({
                data: {
                    id: `trunk-${parentName}-to-${junctionId}`,
                    source: parentName,
                    target: junctionId,
                    type: 'trunk',
                    schema: schema
                },
                classes: 'trunk'
            });

            // Branch edges: junction → children
            children.forEach(childName => {
                edges.push({
                    data: {
                        id: `branch-${junctionId}-to-${childName}`,
                        source: junctionId,
                        target: childName,
                        type: 'branch'
                    },
                    classes: 'branch'
                });
            });
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

        // Add cross-domain indicator for concepts shared between domains
        const crossDomain = window.BKB_DATA.domains?.crossDomain || {};
        visibleConcepts.forEach(concept => {
            const crossDomains = crossDomain[concept.name];
            if (crossDomains && crossDomains.domains) {
                const otherDomains = crossDomains.domains.filter(d =>
                    d !== domainData.domain.name
                );
                if (otherDomains.length > 0) {
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
     * Categories: fibo, schema, domain-local, unknown
     */
    getNodeClasses(concept) {
        const classes = [];
        const hasFibo = concept.has_fibo_mapping || false;
        const hasSchema = concept.has_schema_mapping || false;
        const source = concept.definition?.source?.toLowerCase() || '';
        const hasLocalDef = concept.local_definition && concept.local_definition.trim() !== '';

        // Determine category based on mapping priority
        if (hasFibo) {
            classes.push('fibo');
        } else if (hasSchema || source === 'explicit') {
            classes.push('schema');
        } else if (hasLocalDef || source === 'domain') {
            classes.push('domain-local');
        } else {
            classes.push('unknown');
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
            // BASE EDGE STYLE (fallback) - must be first
            // ===========================================
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#95a5a6',
                    'curve-style': 'bezier'
                }
            },

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
                    'border-width': 1,
                    'border-color': '#1a1a1a'  // Dark border
                }
            },
            // FIBO mapped - green fill
            {
                selector: 'node.fibo',
                style: {
                    'background-color': '#d5f4e6'
                }
            },
            // Schema.org - blue fill
            {
                selector: 'node.schema',
                style: {
                    'background-color': '#e3f2fd'
                }
            },
            // Domain local - purple fill (default)
            {
                selector: 'node.domain-local',
                style: {
                    'background-color': '#dedaff'
                }
            },
            // Unknown - orange fill
            {
                selector: 'node.unknown',
                style: {
                    'background-color': '#fef3e2'
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
            // Edge hover - connected nodes (dynamic styling applied in JS)
            // Note: actual border-width is set dynamically as original + 2

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
            // JUNCTION NODES (categorization branch points)
            // Small filled circle, 8px diameter (same as line width)
            // ===========================================
            {
                selector: 'node.junction',
                style: {
                    'shape': 'ellipse',
                    'width': 2,
                    'height': 2,
                    'background-color': '#333333',
                    'border-width': 0,
                    'padding': 0,
                    'label': ''  // Label moved to trunk edge
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
                    'width': 1,  // Thin line per CSV
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
            // CATEGORIZATION EDGES - MUST BE LAST for CSS priority
            // ===========================================
            // Trunk: parent → junction (haystack spreads edges along node border)
            {
                selector: 'edge.trunk',
                style: {
                    'width': 2,
                    'line-color': '#333333',
                    'curve-style': 'haystack',
                    'haystack-radius': 0.5,
                    'label': 'data(schema)',
                    'font-size': 10,
                    'color': '#333333',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.9,
                    'text-background-padding': '2px'
                }
            },
            // Branch: junction → children
            {
                selector: 'edge.branch',
                style: {
                    'width': 2,
                    'line-color': '#333333',
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': 20,
                    'control-point-weights': 0.5
                }
            },

            // ===========================================
            // EDGE HIGHLIGHT (on hover)
            // Note: actual width is set dynamically as original + 2
            // ===========================================
        ];
    },

    /**
     * Check if we're on mobile
     */
    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    },

    /**
     * Currently selected node (for mobile tap-to-select)
     */
    selectedNode: null,
    selectedEdge: null,

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Node hover - show tooltip and highlight (desktop only)
        this.cy.on('mouseover', 'node', (e) => {
            if (this.isMobile()) return; // Skip on mobile
            const node = e.target;
            if (!node.hasClass('junction')) {
                Tooltip.show(node, e.renderedPosition);
                this.highlightNode(node);
            }
        });

        this.cy.on('mouseout', 'node', () => {
            if (this.isMobile()) return; // Skip on mobile
            Tooltip.hide();
            this.clearEdgeHighlight();
        });

        // Edge hover - show edge tooltip and highlight (desktop only)
        this.cy.on('mouseover', 'edge', (e) => {
            if (this.isMobile()) return; // Skip on mobile
            const edge = e.target;
            Tooltip.showEdge(edge, e.renderedPosition);
            this.highlightEdge(edge);
        });

        this.cy.on('mouseout', 'edge', () => {
            if (this.isMobile()) return; // Skip on mobile
            Tooltip.hideEdge();
            this.clearEdgeHighlight();
        });

        // Node tap - different behavior for mobile vs desktop
        this.cy.on('tap', 'node', (e) => {
            const node = e.target;
            if (node.hasClass('junction')) return;

            if (this.isMobile()) {
                // Mobile: first tap shows tooltip, second tap on same node expands
                if (this.selectedNode && this.selectedNode.id() === node.id()) {
                    // Second tap on same node - expand/collapse
                    this.toggleExpand(node);
                } else {
                    // First tap - show tooltip and highlight
                    this.clearSelection();
                    this.selectedNode = node;
                    node.select();
                    Tooltip.show(node, e.renderedPosition);
                    this.highlightNode(node);
                }
            } else {
                // Desktop: click expands/collapses
                this.toggleExpand(node);
            }
        });

        // Edge tap - show tooltip on mobile
        this.cy.on('tap', 'edge', (e) => {
            const edge = e.target;

            if (this.isMobile()) {
                // Mobile: tap shows tooltip
                this.clearSelection();
                this.selectedEdge = edge;
                Tooltip.showEdge(edge, e.renderedPosition);
                this.highlightEdge(edge);
            }
        });

        // Canvas tap - deselect and hide tooltips
        this.cy.on('tap', (e) => {
            if (e.target === this.cy) {
                this.clearSelection();
                Tooltip.hide();
                Tooltip.hideEdge();
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
     * Clear mobile selection state
     */
    clearSelection() {
        if (this.selectedNode) {
            this.selectedNode.unselect();
            this.selectedNode = null;
        }
        if (this.selectedEdge) {
            this.selectedEdge = null;
        }
        this.clearEdgeHighlight();
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
     * Apply highlight style to a node (dynamic +2 border width)
     */
    applyNodeHighlight(node) {
        if (node.data('_origBorderWidth') !== undefined) return; // Already highlighted

        const origWidth = node.numericStyle('border-width') || 1;
        const origColor = node.style('border-color');

        node.data('_origBorderWidth', origWidth);
        node.data('_origBorderColor', origColor);
        node.addClass('edge-connected');
        node.style({
            'border-width': origWidth + 2,
            'border-color': '#9b59b6'
        });
    },

    /**
     * Apply highlight style to an edge (dynamic +2 line width)
     */
    applyEdgeHighlight(edge) {
        if (edge.data('_origWidth') !== undefined) return; // Already highlighted

        const origWidth = edge.numericStyle('width') || 2;
        const origColor = edge.style('line-color');

        edge.data('_origWidth', origWidth);
        edge.data('_origColor', origColor);
        edge.addClass('edge-highlighted');
        edge.style({
            'width': origWidth + 2,
            'line-color': '#9b59b6',
            'z-index': 999
        });
    },

    /**
     * Highlight node and all connected edges/concepts
     */
    highlightNode(node) {
        // Highlight the node itself
        this.applyNodeHighlight(node);

        // Get all connected edges
        const connectedEdges = node.connectedEdges();

        connectedEdges.forEach(edge => {
            const type = edge.data('type') || '';

            if (type === 'trunk') {
                // This node is parent, highlight trunk and all branches
                this.applyEdgeHighlight(edge);
                const junctionId = edge.target().id();

                const branchEdges = this.cy.edges().filter(e =>
                    e.data('type') === 'branch' && e.data('source') === junctionId
                );
                branchEdges.forEach(branchEdge => {
                    this.applyEdgeHighlight(branchEdge);
                    this.applyNodeHighlight(branchEdge.target());
                });

            } else if (type === 'branch') {
                // This node is child, highlight branch and trunk to parent
                this.applyEdgeHighlight(edge);
                const junctionId = edge.source().id();

                const trunkEdge = this.cy.edges().filter(e =>
                    e.data('type') === 'trunk' && e.data('target') === junctionId
                ).first();

                if (trunkEdge && trunkEdge.length > 0) {
                    this.applyEdgeHighlight(trunkEdge);
                    this.applyNodeHighlight(trunkEdge.source());
                }

            } else if (type === 'relationship') {
                // Binary verb - highlight edge and other endpoint
                this.applyEdgeHighlight(edge);
                const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
                this.applyNodeHighlight(otherNode);
            }
        });
    },

    /**
     * Highlight edge and connected concepts
     */
    highlightEdge(edge) {
        const data = edge.data();
        const type = data.type || '';

        // Highlight the edge
        this.applyEdgeHighlight(edge);

        if (type === 'branch') {
            // For branch: highlight child and find actual parent through trunk
            const junctionNode = edge.source();
            const childNode = edge.target();
            const junctionId = junctionNode.id();

            // Find trunk edge to get actual parent
            const trunkEdge = this.cy.edges().filter(e =>
                e.data('type') === 'trunk' && e.data('target') === junctionId
            ).first();

            if (trunkEdge && trunkEdge.length > 0) {
                const parentNode = trunkEdge.source();
                this.applyNodeHighlight(parentNode);
                this.applyEdgeHighlight(trunkEdge);
            }
            this.applyNodeHighlight(childNode);

        } else if (type === 'trunk') {
            // For trunk: highlight parent and all children through branches
            const parentNode = edge.source();
            const junctionNode = edge.target();
            const junctionId = junctionNode.id();

            this.applyNodeHighlight(parentNode);

            // Find all branch edges from this junction
            const branchEdges = this.cy.edges().filter(e =>
                e.data('type') === 'branch' && e.data('source') === junctionId
            );
            branchEdges.forEach(branchEdge => {
                this.applyEdgeHighlight(branchEdge);
                this.applyNodeHighlight(branchEdge.target());
            });

        } else {
            // For regular edges: highlight both endpoints
            this.applyNodeHighlight(edge.source());
            this.applyNodeHighlight(edge.target());
        }
    },

    /**
     * Clear edge highlight and restore original styles
     */
    clearEdgeHighlight() {
        // Restore node original styles
        this.cy.nodes('.edge-connected').forEach(node => {
            const origWidth = node.data('_origBorderWidth');
            const origColor = node.data('_origBorderColor');

            if (origWidth !== undefined) {
                node.style({
                    'border-width': origWidth,
                    'border-color': origColor
                });
                node.removeData('_origBorderWidth');
                node.removeData('_origBorderColor');
            }
            node.removeClass('edge-connected');
        });

        // Restore edge original styles
        this.cy.edges('.edge-highlighted').forEach(edge => {
            const origWidth = edge.data('_origWidth');
            const origColor = edge.data('_origColor');

            if (origWidth !== undefined) {
                edge.style({
                    'width': origWidth,
                    'line-color': origColor,
                    'z-index': 0
                });
                edge.removeData('_origWidth');
                edge.removeData('_origColor');
            }
            edge.removeClass('edge-highlighted');
        });
    },

    /**
     * Apply filter based on CST element visibility toggles
     * @param {Object} show - visibility toggles { domain, fibo, schema, unknown, context, categorizations, relationships }
     */
    applyFilter(show) {
        const prevShowCat = this._prevShowCategorizations;
        const prevShowRel = this._prevShowRelationships;
        this._prevShowCategorizations = show.categorizations;
        this._prevShowRelationships = show.relationships;

        // Find child concepts (targets of branch edges) to hide with categorizations
        const childConcepts = new Set();
        if (!show.categorizations) {
            this.cy.edges('.branch').forEach(edge => {
                const targetId = edge.target().id();
                childConcepts.add(targetId);
            });
        }

        this.cy.nodes().forEach(node => {
            // Handle junction nodes
            if (node.hasClass('junction')) {
                if (show.categorizations) {
                    node.show();
                } else {
                    node.hide();
                }
                return;
            }

            let visible = false;
            const isContext = node.hasClass('context');
            const nodeId = node.id();

            // Determine visibility based on concept type toggles
            if (isContext) {
                visible = show.context;
            } else if (node.hasClass('fibo')) {
                visible = show.fibo;
            } else if (node.hasClass('schema')) {
                visible = show.schema;
            } else if (node.hasClass('domain-local')) {
                visible = show.domain;
            } else if (node.hasClass('unknown')) {
                visible = show.unknown;
            }

            // Hide child concepts when categorizations are hidden
            if (!show.categorizations && childConcepts.has(nodeId)) {
                visible = false;
            }

            if (visible) {
                node.show();
            } else {
                node.hide();
            }
        });

        // Handle edge visibility
        this.cy.edges().forEach(edge => {
            const source = edge.source();
            const target = edge.target();
            const type = edge.data('type');

            // Hide if endpoints are hidden
            if (source.hidden() || target.hidden()) {
                edge.hide();
            }
            // Hide categorization edges (trunk/branch) when toggle is off
            else if (!show.categorizations && (type === 'trunk' || type === 'branch')) {
                edge.hide();
            }
            // Hide relationship edges when toggle is off
            else if (!show.relationships && type === 'relationship') {
                edge.hide();
            } else {
                edge.show();
            }
        });

        // Detect and handle orphans (nodes with no visible edges)
        if (!show.orphans) {
            this.cy.nodes().forEach(node => {
                if (node.hidden() || node.hasClass('junction')) return;

                // Count visible edges for this node
                const visibleEdges = node.connectedEdges().filter(edge => !edge.hidden());
                if (visibleEdges.length === 0) {
                    node.hide();
                }
            });

            // Hide edges connected to newly hidden orphan nodes
            this.cy.edges().forEach(edge => {
                if (edge.source().hidden() || edge.target().hidden()) {
                    edge.hide();
                }
            });
        }

        // Re-run layout only on visible elements to compact the graph
        const visibleElements = this.cy.elements().filter(ele => !ele.hidden());
        visibleElements.layout(this.getLayoutConfig()).run();
    },

    /**
     * Get layout configuration based on current layout type
     */
    getLayoutConfig() {
        const baseConfig = {
            animate: true,
            animationDuration: 300,
            padding: 20
        };

        switch (this.currentLayout) {
            case 'dagre':
                return {
                    ...baseConfig,
                    name: 'dagre',
                    rankDir: 'TB',
                    nodeSep: 15,
                    rankSep: 40,
                    edgeSep: 10
                };
            case 'cose':
                return {
                    ...baseConfig,
                    name: 'cose',
                    nodeRepulsion: 4000,
                    idealEdgeLength: 100,
                    edgeElasticity: 100,
                    nestingFactor: 5,
                    gravity: 80,
                    numIter: 1000,
                    coolingFactor: 0.95
                };
            case 'breadthfirst':
                return {
                    ...baseConfig,
                    name: 'breadthfirst',
                    directed: true,
                    spacingFactor: 1.5
                };
            case 'circle':
                return {
                    ...baseConfig,
                    name: 'circle',
                    spacingFactor: 1.5
                };
            case 'grid':
                return {
                    ...baseConfig,
                    name: 'grid',
                    spacingFactor: 1.2
                };
            case 'concentric':
                return {
                    ...baseConfig,
                    name: 'concentric',
                    spacingFactor: 1.5,
                    concentric: (node) => node.degree(),
                    levelWidth: () => 2
                };
            default:
                return {
                    ...baseConfig,
                    name: 'dagre',
                    rankDir: 'TB'
                };
        }
    },

    /**
     * Set and apply new layout
     */
    setLayout(layoutName) {
        this.currentLayout = layoutName;
        const visibleElements = this.cy.elements().filter(ele => !ele.hidden());
        visibleElements.layout(this.getLayoutConfig()).run();
    },

    /**
     * Calculate filter counts for current domain
     */
    getFilterCounts() {
        if (!this.cy) return { domain: 0, fibo: 0, schema: 0, unknown: 0, orphans: 0, context: 0, categorizations: 0, relationships: 0 };

        const counts = { domain: 0, fibo: 0, schema: 0, unknown: 0, orphans: 0, context: 0, categorizations: 0, relationships: 0 };

        // Count nodes by type
        this.cy.nodes().forEach(node => {
            if (node.hasClass('junction')) return;

            if (node.hasClass('context')) {
                counts.context++;
            } else if (node.hasClass('fibo')) {
                counts.fibo++;
            } else if (node.hasClass('schema')) {
                counts.schema++;
            } else if (node.hasClass('domain-local')) {
                counts.domain++;
            } else if (node.hasClass('unknown')) {
                counts.unknown++;
            }

            // Count orphans (visible nodes with no visible edges)
            const visibleEdges = node.connectedEdges().filter(e => !e.hidden());
            if (!node.hidden() && visibleEdges.length === 0) {
                counts.orphans++;
            }
        });

        // Count edges by type
        this.cy.edges().forEach(edge => {
            const type = edge.data('type');
            if (type === 'trunk' || type === 'branch') {
                counts.categorizations++;
            } else if (type === 'relationship') {
                counts.relationships++;
            }
        });

        return counts;
    }
};
