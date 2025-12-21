# BKB Explorer

Interactive **Business Knowledge Blueprint** Explorer for Semantic Platform.

> **BKB** = Business Knowledge Blueprint
> **CST** = ConceptSpeak Text

## Quick Start

```bash
# 1. Prepare data (requires ontology-lift export)
./prepare-demo.sh

# 2. Open in browser
open index.html
```

No server required - works offline.

## Features

### Domain Navigation
- Browse **RBCZ** > MIB > Investment / Payments / Retail
- Browse **Test** > Order / Position / Transaction / Payment
- Sidebar tree with concept counts

### Interactive Graph
- **Cytoscape.js** powered visualization
- **Zoom** - mouse scroll
- **Pan** - right-click drag
- **Hover** - tooltips for concepts and edges
- **Click** - expand/collapse hierarchy

### CST Element Toggles

Filter what's visible in the graph:

```
☑ Domain (45)      - Domain-specific concepts
☑ FIBO (32)        - FIBO-mapped concepts
☑ Schema.org (15)  - Schema.org-mapped concepts
☑ Unknown (60)     - Unmapped concepts
☑ Orphans (3)      - Concepts with no visible edges
───────────────────
☑ Context (12)     - Context reference concepts
☑ Categorizations  - Is-a hierarchy edges
☑ Relationships    - Binary verb edges
```

All toggles default ON. Uncheck to hide. Graph re-layouts automatically.

### Layout Selector

Choose graph layout algorithm:

| Layout | Best for |
|--------|----------|
| **Dagre** (default) | Hierarchical structures |
| **Cose** | Force-directed, relationships |
| **Breadthfirst** | Tree exploration |
| **Circle** | Small graphs |
| **Grid** | Overview of all concepts |
| **Concentric** | Hub-centric graphs |

### Tooltips

**Concept tooltip:**
- Name and source badge (FIBO/Schema/Domain/Unknown)
- Definition text
- FIBO mapping URI
- Cross-domain indicator
- Child count

**Edge tooltip:**
- Relationship type (Binary Verb / Categorization)
- Natural language description
- CST notation

### Cross-Domain

- Thick border indicates concept shared across domains
- Portal buttons to navigate to other domains
- Ghost nodes show external references

## BKB Notation Legend

### Concepts

| Style | Meaning |
|-------|---------|
| Green fill | FIBO mapped |
| Blue fill | Schema.org mapped |
| Purple fill | Domain-specific |
| Orange fill | Unknown (needs mapping) |
| Dotted border | Context reference |
| Thick border | Cross-domain shared |

### Edges

| Style | Meaning |
|-------|---------|
| Thick black | Categorization (is-a) |
| Thin purple | Binary verb (relationship) |

## Data

Data is bundled in `js/data.js`. Two variants available:

### Public Version (Test Data Only)

```bash
./prepare-public.sh
```

Safe for public repository. Contains only synthetic test data.

| Domain | Path | Concepts |
|--------|------|----------|
| Order | Test:Order | 18 |
| Position | Test:Position | 16 |
| Transaction | Test:Transaction | 9 |
| Payment | Test:Payment | 27 |

### Full Version (RBCZ + Test Data)

```bash
./prepare-demo.sh
```

Contains production RBCZ data. **Do not publish publicly.**

| Domain | Path | Source |
|--------|------|--------|
| Investment | RBCZ:MIB:Investment | ontology-lift |
| Payments | RBCZ:MIB:Payments | ontology-lift |
| Retail | RBCZ:Retail | ontology-lift |
| Order | Test:Order | test fixtures |
| Position | Test:Position | test fixtures |
| Transaction | Test:Transaction | test fixtures |
| Payment | Test:Payment | test fixtures |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Tech Stack

- **Cytoscape.js** - Graph visualization
- **Dagre** - Hierarchical layout algorithm
- **Vanilla JS** - No framework dependencies

## License

Internal use only - RBCZ Semantic Platform.
