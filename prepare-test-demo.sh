#!/bin/bash
#
# BKB Explorer - Test Demo Preparation Script (ADR-029)
#
# Copies test data from conceptspeak/tests (Single Source of Truth),
# runs the pipeline, and generates js/data.js for visualization.
#
# Usage: ./prepare-test-demo.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONCEPTSPEAK_DIR="$SCRIPT_DIR/../conceptspeak"
DOMAIN_FORGE_DIR="$SCRIPT_DIR/../domain-forge"
ONTOLOGY_LIFT_DIR="$SCRIPT_DIR/../ontology-lift"
OUTPUT_FILE="$SCRIPT_DIR/js/data.js"

echo "BKB Explorer - Preparing test demo data..."
echo ""

# Check dependencies
if [ ! -d "$CONCEPTSPEAK_DIR/tests" ]; then
    echo "Error: conceptspeak/tests not found at $CONCEPTSPEAK_DIR/tests"
    exit 1
fi

if [ ! -d "$DOMAIN_FORGE_DIR" ]; then
    echo "Error: domain-forge not found at $DOMAIN_FORGE_DIR"
    exit 1
fi

if [ ! -d "$ONTOLOGY_LIFT_DIR" ]; then
    echo "Error: ontology-lift not found at $ONTOLOGY_LIFT_DIR"
    exit 1
fi

# Create test directories
mkdir -p "$SCRIPT_DIR/test/Order"
mkdir -p "$SCRIPT_DIR/test/Position"
mkdir -p "$SCRIPT_DIR/test/Transaction"
mkdir -p "$SCRIPT_DIR/test/Payment"
mkdir -p "$SCRIPT_DIR/test/FinancialAccount"

echo "Step 1: Copying test data from conceptspeak/tests..."

# Copy test files (Single Source of Truth)
cp "$CONCEPTSPEAK_DIR/tests/Investment_Order.test" "$SCRIPT_DIR/test/Order/Investment_Order.cs"
cp "$CONCEPTSPEAK_DIR/tests/InvestmentPosition.test" "$SCRIPT_DIR/test/Position/Investment_Position.cs"
cp "$CONCEPTSPEAK_DIR/tests/Investment_Transaction.test" "$SCRIPT_DIR/test/Transaction/Investment_Transaction.cs"
cp "$CONCEPTSPEAK_DIR/tests/Investment_Payment.test" "$SCRIPT_DIR/test/Payment/Investment_Payment.cs"
cp "$CONCEPTSPEAK_DIR/tests/Investment_Financial_Account.test" "$SCRIPT_DIR/test/FinancialAccount/Investment_Financial_Account.cs"

echo "  - Order/Investment_Order.cs"
echo "  - Position/Investment_Position.cs"
echo "  - Transaction/Investment_Transaction.cs"
echo "  - Payment/Investment_Payment.cs"
echo "  - FinancialAccount/Investment_Financial_Account.cs"
echo ""

# Create config files - all use domain "Test", views derived from source file
cat > "$SCRIPT_DIR/test/Order/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "Order",
  "sources": [
    "Investment_Order.cs"
  ]
}
EOF

cat > "$SCRIPT_DIR/test/Position/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "Position",
  "sources": [
    "Investment_Position.cs"
  ]
}
EOF

cat > "$SCRIPT_DIR/test/Transaction/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "Transaction",
  "sources": [
    "Investment_Transaction.cs"
  ]
}
EOF

cat > "$SCRIPT_DIR/test/Payment/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "Payment",
  "sources": [
    "Investment_Payment.cs"
  ]
}
EOF

cat > "$SCRIPT_DIR/test/FinancialAccount/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "FinancialAccount",
  "sources": [
    "Investment_Financial_Account.cs"
  ]
}
EOF

echo "Step 2: Running domain-forge..."

# Run domain-forge
cd "$DOMAIN_FORGE_DIR"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Order/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Position/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Transaction/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Payment/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/FinancialAccount/config.json"
echo ""

echo "Step 3: Running ontology-lift..."

# Run ontology-lift
cd "$ONTOLOGY_LIFT_DIR"
python -m ontology_lift.cli lift "$SCRIPT_DIR/test/Order/domain.json" -o "$SCRIPT_DIR/test/Order/"
python -m ontology_lift.cli lift "$SCRIPT_DIR/test/Position/domain.json" -o "$SCRIPT_DIR/test/Position/"
python -m ontology_lift.cli lift "$SCRIPT_DIR/test/Transaction/domain.json" -o "$SCRIPT_DIR/test/Transaction/"
python -m ontology_lift.cli lift "$SCRIPT_DIR/test/Payment/domain.json" -o "$SCRIPT_DIR/test/Payment/"
python -m ontology_lift.cli lift "$SCRIPT_DIR/test/FinancialAccount/domain.json" -o "$SCRIPT_DIR/test/FinancialAccount/"
echo ""

echo "Step 4: Generating data.js..."

# Generate data.js
# Note: ontology-lift creates directories with '/' separator (Test/Order) not ':' (Test:Order)
# Note: ontology-lift outputs to Test/ based on domain.path from domain.json
ORDER_FILE="$SCRIPT_DIR/test/Order/Test/ontology.json"
POSITION_FILE="$SCRIPT_DIR/test/Position/Test/ontology.json"
TRANSACTION_FILE="$SCRIPT_DIR/test/Transaction/Test/ontology.json"
PAYMENT_FILE="$SCRIPT_DIR/test/Payment/Test/ontology.json"
FINANCIAL_ACCOUNT_FILE="$SCRIPT_DIR/test/FinancialAccount/Test/ontology.json"

python3 << PYTHON
import json
import sys
from datetime import datetime

# Add domain-forge to path for merge utility
sys.path.insert(0, '$SCRIPT_DIR/../domain-forge')
from domain_forge.utils import merge_domains

# Load ontologies
with open('$ORDER_FILE') as f:
    order_data = json.load(f)

with open('$POSITION_FILE') as f:
    position_data = json.load(f)

with open('$TRANSACTION_FILE') as f:
    transaction_data = json.load(f)

with open('$PAYMENT_FILE') as f:
    payment_data = json.load(f)

with open('$FINANCIAL_ACCOUNT_FILE') as f:
    financial_account_data = json.load(f)

# ADR-044: Count total concepts = domain concepts + external concepts
def total_concepts(data):
    return len(data.get('concepts', [])) + len(data.get('external_concepts', []))

# Generate data.js
# ADR-040: Views are perspectives within a domain, not subdomains
output = f'''/**
 * BKB Explorer - Test Demo Data
 *
 * Auto-generated by prepare-test-demo.sh (ADR-029)
 * Source: conceptspeak/tests/
 * DO NOT EDIT MANUALLY
 *
 * Generated: {datetime.now().isoformat()}
 */

// Domain hierarchy (ADR-040: Views are NOT subdomains)
const DOMAINS_DATA = {{
  "version": "1.0",
  "hierarchy": {{
    "Test": {{
      "type": "domain",
      "stats": {{
        "concepts": {total_concepts(order_data) + total_concepts(position_data) + total_concepts(transaction_data) + total_concepts(payment_data) + total_concepts(financial_account_data)}
      }},
      "views": {{
        "Order": {{ "stats": {{ "concepts": {total_concepts(order_data)} }} }},
        "Position": {{ "stats": {{ "concepts": {total_concepts(position_data)} }} }},
        "Transaction": {{ "stats": {{ "concepts": {total_concepts(transaction_data)} }} }},
        "Payment": {{ "stats": {{ "concepts": {total_concepts(payment_data)} }} }},
        "FinancialAccount": {{ "stats": {{ "concepts": {total_concepts(financial_account_data)} }} }}
      }}
    }}
  }},
  "crossDomain": {{}}
}};

// Order domain
const ORDER_DATA = {json.dumps(order_data, indent=2)};

// Position domain
const POSITION_DATA = {json.dumps(position_data, indent=2)};

// Transaction domain
const TRANSACTION_DATA = {json.dumps(transaction_data, indent=2)};

// Payment domain
const PAYMENT_DATA = {json.dumps(payment_data, indent=2)};

// FinancialAccount domain
const FINANCIAL_ACCOUNT_DATA = {json.dumps(financial_account_data, indent=2)};

// Merged Test domain (all views combined, using domain-forge merge)
const TEST_DATA = {json.dumps(merge_domains([order_data, position_data, transaction_data, payment_data, financial_account_data], "Test"), indent=2)};

// Export for application
window.BKB_DATA = {{
  domains: DOMAINS_DATA,
  test: TEST_DATA,
  order: ORDER_DATA,
  position: POSITION_DATA,
  transaction: TRANSACTION_DATA,
  payment: PAYMENT_DATA,
  financialaccount: FINANCIAL_ACCOUNT_DATA
}};

console.log('BKB Test data loaded:', Object.keys(window.BKB_DATA));
'''

with open('$OUTPUT_FILE', 'w') as f:
    f.write(output)

print(f"  Order: {len(order_data['concepts'])} + {len(order_data.get('external_concepts', []))} external = {total_concepts(order_data)}")
print(f"  Position: {len(position_data['concepts'])} + {len(position_data.get('external_concepts', []))} external = {total_concepts(position_data)}")
print(f"  Transaction: {len(transaction_data['concepts'])} + {len(transaction_data.get('external_concepts', []))} external = {total_concepts(transaction_data)}")
print(f"  Payment: {len(payment_data['concepts'])} + {len(payment_data.get('external_concepts', []))} external = {total_concepts(payment_data)}")
print(f"  FinancialAccount: {len(financial_account_data['concepts'])} + {len(financial_account_data.get('external_concepts', []))} external = {total_concepts(financial_account_data)}")
PYTHON

echo ""
echo "Done!"
echo ""
echo "Generated: $OUTPUT_FILE"
echo ""
echo "Open index.html in browser to view the demo."
