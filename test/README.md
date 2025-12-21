# Test Data

Test diagrams for BKB Explorer visual testing.

## Order

Investment Order diagram from ConceptSpeak specification.

**Source:** `Order/Investment_Order.cs`

Contains:
- 14 domain concepts (Order, Buy, Sell, etc.)
- 3 context concepts (Position, Payment, Custody fee)
- 5 categorizations (by state, by frequency, etc.)
- 4 binary verb relationships (1 domain, 3 context)

**Usage:**
1. Run domain-forge: `python -m domain_forge consolidate test/Order/config.json`
2. Run ontology-lift on the output
3. Copy generated ontology.json to js/data.js
