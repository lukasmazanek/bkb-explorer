/**
 * BKB Explorer - Views Component
 *
 * Handles View abstraction per ADR-040.
 * Views are derived from sources[].file - they are virtual (no data copy).
 *
 * Rules:
 * - ID = filename without extension (e.g., "Investment_Order")
 * - Name = ID with _ replaced by space (e.g., "Investment Order")
 * - Shared membership: concept can be in multiple Views
 * - Within domain scope only
 * - Flat structure (no nested Views)
 */

const Views = {
    /**
     * Current domain's views
     * Structure: Map<viewId, { id, name, conceptNames: Set<string> }>
     */
    viewsMap: new Map(),

    /**
     * Reverse mapping: concept name -> Set of view IDs
     */
    conceptToViews: new Map(),

    /**
     * Currently active view (null = show all)
     */
    activeView: null,

    /**
     * Extract views from domain data
     * @param {Object} domainData - Domain data with concepts array
     * @returns {Map} Map of viewId -> { id, name, conceptNames }
     */
    extractViews(domainData) {
        this.viewsMap.clear();
        this.conceptToViews.clear();
        this.activeView = null;

        const concepts = domainData.concepts || [];

        concepts.forEach(concept => {
            const sources = concept.sources || [];

            sources.forEach(source => {
                const file = source.file || '';
                if (!file) return;

                // Extract view ID from filename (remove extension)
                const viewId = this.fileToViewId(file);
                const viewName = this.viewIdToName(viewId);

                // Create or update view
                if (!this.viewsMap.has(viewId)) {
                    this.viewsMap.set(viewId, {
                        id: viewId,
                        name: viewName,
                        conceptNames: new Set()
                    });
                }

                // Add concept to view
                this.viewsMap.get(viewId).conceptNames.add(concept.name);

                // Add reverse mapping
                if (!this.conceptToViews.has(concept.name)) {
                    this.conceptToViews.set(concept.name, new Set());
                }
                this.conceptToViews.get(concept.name).add(viewId);
            });
        });

        console.log(`📋 Extracted ${this.viewsMap.size} views from domain`);
        return this.viewsMap;
    },

    /**
     * Convert filename to view ID
     * @param {string} file - Filename (e.g., "Investment_Order.cs")
     * @returns {string} View ID (e.g., "Investment_Order")
     */
    fileToViewId(file) {
        // Remove path if present
        const filename = file.split('/').pop();
        // Remove extension
        return filename.replace(/\.[^.]+$/, '');
    },

    /**
     * Convert view ID to display name
     * Normalizes different naming conventions to clean names:
     * - "Investment_Order" → "Order"
     * - "allininvestment-financial-transaction" → "Transaction"
     * @param {string} viewId - View ID
     * @returns {string} Display name
     */
    viewIdToName(viewId) {
        let name = viewId;

        // Strip common prefixes (case-insensitive)
        const prefixes = [
            /^allininvestment-/i,
            /^investment[_-]/i,
            /^financial[_-]/i,
        ];
        for (const prefix of prefixes) {
            name = name.replace(prefix, '');
        }

        // Replace separators with spaces
        name = name.replace(/[_-]/g, ' ');

        // Title case
        name = name.replace(/\b\w/g, c => c.toUpperCase());

        return name;
    },

    /**
     * Get all views as sorted array
     * @returns {Array} Array of { id, name, conceptCount }
     */
    getViewsList() {
        const views = [];
        this.viewsMap.forEach((view) => {
            views.push({
                id: view.id,
                name: view.name,
                conceptCount: view.conceptNames.size
            });
        });

        // Sort by name
        views.sort((a, b) => a.name.localeCompare(b.name));
        return views;
    },

    /**
     * Get concepts in a view
     * @param {string} viewId - View ID
     * @returns {Set<string>} Set of concept names
     */
    getConceptsInView(viewId) {
        const view = this.viewsMap.get(viewId);
        return view ? view.conceptNames : new Set();
    },

    /**
     * Get views containing a concept
     * @param {string} conceptName - Concept name
     * @returns {Set<string>} Set of view IDs
     */
    getViewsForConcept(conceptName) {
        return this.conceptToViews.get(conceptName) || new Set();
    },

    /**
     * Set active view
     * @param {string|null} viewId - View ID or null for all
     */
    setActiveView(viewId) {
        this.activeView = viewId;
        console.log(`📋 Active view: ${viewId || 'All'}`);
    },

    /**
     * Check if concept should be visible in current view
     * @param {string} conceptName - Concept name
     * @returns {boolean} True if visible
     */
    isConceptInActiveView(conceptName) {
        if (!this.activeView) return true; // No view filter = show all

        const conceptViews = this.conceptToViews.get(conceptName);
        return conceptViews && conceptViews.has(this.activeView);
    },

    /**
     * Get active view info
     * @returns {Object|null} Active view info or null
     */
    getActiveView() {
        if (!this.activeView) return null;
        return this.viewsMap.get(this.activeView);
    }
};
