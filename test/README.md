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

## Position

Investment Position diagram for portfolio holdings.

**Source:** `Position/Investment_Position.cs`

Contains:
- 10 domain concepts (Position, Open/Closed, Long/Short, etc.)
- 2 context concepts (Account, Market value)
- 4 categorizations (by state, by direction, by asset type, by instrument)
- 2 binary verb relationships

## Usage

1. Run domain-forge: `python -m domain_forge consolidate test/{diagram}/config.json`
2. Run ontology-lift on the output
3. Copy generated ontology.json to js/data.js
