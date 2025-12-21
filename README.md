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

- **Domain Navigation** - Browse RBCZ > MIB > Investment/Payments/Retail
- **Interactive Graph** - Cytoscape.js powered visualization
- **Concept Details** - Hover for definition, FIBO mapping, cross-domain info
- **Expand/Collapse** - Click to explore concept hierarchy
- **Cross-Domain** - Ghost nodes show shared concepts, portal navigation

## Screenshots

```
┌────────────────┬────────────────────────────────────────────┐
│ 🏦 RBCZ        │                                            │
│  └─ MIB        │     ┌────────┐      ┌────────┐             │
│     ├─ 📍 Inv  │     │Customer│──────│  Order │             │
│     └─ Pay     │     │  🟢⭐  │      │   🟢   │             │
│                │     └────────┘      └────────┘             │
│ 🔍 Search...   │                                            │
└────────────────┴────────────────────────────────────────────┘
```

## Legend

| Symbol | Meaning |
|--------|---------|
| 🟢 | FIBO mapped concept |
| 🟠 | DRAFT (needs review) |
| 🔵 | INHERITED definition |
| ⭐ | Cross-domain (shared) |
| ╌╌╌ | Ghost node (other domain) |

## Data

Data is bundled in `js/data.js`. To refresh:

```bash
./prepare-demo.sh
```

This copies latest exports from `../ontology-lift/export/`.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Internal use only - RBCZ Semantic Platform.
