#!/bin/bash
#
# BKB Explorer - Test Demo Preparation Script (ADR-029, ADR-024)
#
# Directory structure follows ADR-024 Amendment 1:
#   test/
#   ├── RBCZ/MIB/Investment/DP_EDI_AUM/   (Data Product view)
#   └── Test/Order|Position|...           (Test domain views)
#
# Usage: ./prepare-test-demo.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONCEPTSPEAK_DIR="$SCRIPT_DIR/../conceptspeak"
DOMAIN_FORGE_DIR="$SCRIPT_DIR/../domain-forge"
ONTOLOGY_LIFT_DIR="$SCRIPT_DIR/../ontology-lift"
OUTPUT_FILE="$SCRIPT_DIR/js/data.js"

echo "BKB Explorer - Preparing test demo data (ADR-024 structure)..."
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

# Create ADR-024 compliant directory structure
echo "Creating ADR-024 directory structure..."
mkdir -p "$SCRIPT_DIR/test/Test/Order"
mkdir -p "$SCRIPT_DIR/test/Test/Position"
mkdir -p "$SCRIPT_DIR/test/Test/Transaction"
mkdir -p "$SCRIPT_DIR/test/Test/Payment"
mkdir -p "$SCRIPT_DIR/test/Test/FinancialAccount"
mkdir -p "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM"

echo "Step 1: Copying test data from conceptspeak/tests..."

# Copy test files (Single Source of Truth) - already in ADR-024 structure
# Source: conceptspeak/tests/{domain-path}/{view}.test
cp "$CONCEPTSPEAK_DIR/tests/Test/Investment_Order.test" "$SCRIPT_DIR/test/Test/Order/Investment_Order.cs"
cp "$CONCEPTSPEAK_DIR/tests/Test/InvestmentPosition.test" "$SCRIPT_DIR/test/Test/Position/Investment_Position.cs"
cp "$CONCEPTSPEAK_DIR/tests/Test/Investment_Transaction.test" "$SCRIPT_DIR/test/Test/Transaction/Investment_Transaction.cs"
cp "$CONCEPTSPEAK_DIR/tests/Test/Investment_Payment.test" "$SCRIPT_DIR/test/Test/Payment/Investment_Payment.cs"
cp "$CONCEPTSPEAK_DIR/tests/Test/Investment_Financial_Account.test" "$SCRIPT_DIR/test/Test/FinancialAccount/Financial_Account.cs"

# Copy DP_EDI_AUM data product YAML for reference
cp "$CONCEPTSPEAK_DIR/tests/dp_edi_aum.yaml" "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/" 2>/dev/null || true

echo "  - Test/Order/Investment_Order.cs"
echo "  - Test/Position/Investment_Position.cs"
echo "  - Test/Transaction/Investment_Transaction.cs"
echo "  - Test/Payment/Investment_Payment.cs"
echo "  - Test/FinancialAccount/Financial_Account.cs"
echo "  - RBCZ/MIB/Investment/DP_EDI_AUM/dp_edi_aum.yaml (if exists)"
echo ""

# Create config files - Test domain views (GOV-003 Section 8)
cat > "$SCRIPT_DIR/test/Test/Order/config.json" << 'EOF'
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

cat > "$SCRIPT_DIR/test/Test/Position/config.json" << 'EOF'
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

cat > "$SCRIPT_DIR/test/Test/Transaction/config.json" << 'EOF'
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

cat > "$SCRIPT_DIR/test/Test/Payment/config.json" << 'EOF'
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

cat > "$SCRIPT_DIR/test/Test/FinancialAccount/config.json" << 'EOF'
{
  "domain": {
    "path": "Test",
    "name": "Test"
  },
  "view": "FinancialAccount",
  "sources": [
    "Financial_Account.cs"
  ]
}
EOF

# RBCZ:MIB:Investment/DP_EDI_AUM config (GOV-003 v1.4 - use info.title from YAML)
cat > "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/config.json" << 'EOF'
{
  "domain": {
    "path": "RBCZ:MIB:Investment",
    "name": "Investment"
  },
  "view": "DP_EDI_AUM",
  "sources": [
    "dp_edi_aum.cs"
  ]
}
EOF

echo "Step 2: Running domain-forge..."

# Run domain-forge for Test views
cd "$DOMAIN_FORGE_DIR"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Test/Order/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Test/Position/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Test/Transaction/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Test/Payment/config.json"
python -m domain_forge consolidate "$SCRIPT_DIR/test/Test/FinancialAccount/config.json"

# Run domain-forge for Investment/DP_EDI_AUM if source exists
if [ -f "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/dp_edi_aum.cs" ]; then
    python -m domain_forge consolidate "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/config.json"
fi
echo ""

echo "Step 3: Running ontology-lift..."

# Run ontology-lift for Test views
cd "$ONTOLOGY_LIFT_DIR"

# Function to run ontology-lift and move output in-place (ADR-024 V-2 workaround)
run_lift_inplace() {
    local VIEW_DIR="$1"
    local DOMAIN_PATH="$2"

    python -m ontology_lift.cli lift "$VIEW_DIR/domain.json" -o "$VIEW_DIR/"

    # Workaround: ontology-lift creates nested directories, move to in-place
    local NESTED_PATH="$VIEW_DIR/$DOMAIN_PATH/ontology.json"
    if [ -f "$NESTED_PATH" ]; then
        mv "$NESTED_PATH" "$VIEW_DIR/ontology.json"
        rm -rf "$VIEW_DIR/$DOMAIN_PATH" 2>/dev/null || true
        # Clean up parent directories if empty
        rmdir "$VIEW_DIR/$(dirname "$DOMAIN_PATH")" 2>/dev/null || true
    fi
}

run_lift_inplace "$SCRIPT_DIR/test/Test/Order" "Test"
run_lift_inplace "$SCRIPT_DIR/test/Test/Position" "Test"
run_lift_inplace "$SCRIPT_DIR/test/Test/Transaction" "Test"
run_lift_inplace "$SCRIPT_DIR/test/Test/Payment" "Test"
run_lift_inplace "$SCRIPT_DIR/test/Test/FinancialAccount" "Test"

# Run for Investment/DP_EDI_AUM if domain.json exists
if [ -f "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/domain.json" ]; then
    run_lift_inplace "$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM" "RBCZ/MIB/Investment"
fi
echo ""

echo "Step 4: Generating data.js..."

# Define file paths (ADR-024 structure - ontology.json directly in view dir)
ORDER_FILE="$SCRIPT_DIR/test/Test/Order/ontology.json"
POSITION_FILE="$SCRIPT_DIR/test/Test/Position/ontology.json"
TRANSACTION_FILE="$SCRIPT_DIR/test/Test/Transaction/ontology.json"
PAYMENT_FILE="$SCRIPT_DIR/test/Test/Payment/ontology.json"
FINANCIAL_ACCOUNT_FILE="$SCRIPT_DIR/test/Test/FinancialAccount/ontology.json"
DP_EDI_AUM_FILE="$SCRIPT_DIR/test/RBCZ/MIB/Investment/DP_EDI_AUM/ontology.json"

python3 << PYTHON
import json
import sys
import os
from datetime import datetime

# Add domain-forge to path for merge utility
sys.path.insert(0, '$SCRIPT_DIR/../domain-forge')
from domain_forge.utils import merge_domains

# Load Test domain ontologies
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

# Load Investment/DP_EDI_AUM if exists
dp_edi_aum_data = None
if os.path.exists('$DP_EDI_AUM_FILE'):
    with open('$DP_EDI_AUM_FILE') as f:
        dp_edi_aum_data = json.load(f)

# ADR-044: Count total concepts = domain concepts + external concepts
def total_concepts(data):
    return len(data.get('concepts', [])) + len(data.get('external_concepts', []))

# Build hierarchy (ADR-024)
hierarchy = {
    "RBCZ": {
        "type": "folder",
        "children": {
            "MIB": {
                "type": "folder",
                "children": {
                    "Investment": {
                        "type": "domain",
                        "views": {
                            "DP_EDI_AUM": {}
                        }
                    }
                }
            }
        }
    },
    "Test": {
        "type": "domain",
        "views": {
            "Order": {},
            "Position": {},
            "Transaction": {},
            "Payment": {},
            "FinancialAccount": {}
        }
    }
}

# Generate data.js
output = f'''/**
 * BKB Explorer - Test Demo Data
 *
 * Auto-generated by prepare-test-demo.sh (ADR-029)
 * Directory structure: ADR-024 Amendment 1
 * Source: conceptspeak/tests/
 * DO NOT EDIT MANUALLY
 *
 * Generated: {datetime.now().isoformat()}
 */

// Domain hierarchy (ADR-024: mirrors filesystem, ADR-040: Views are NOT subdomains)
const DOMAINS_DATA = {json.dumps({"version": "1.0", "hierarchy": hierarchy, "crossDomain": {}}, indent=2)};

// --- Test Domain Views ---

const ORDER_DATA = {json.dumps(order_data, indent=2)};

const POSITION_DATA = {json.dumps(position_data, indent=2)};

const TRANSACTION_DATA = {json.dumps(transaction_data, indent=2)};

const PAYMENT_DATA = {json.dumps(payment_data, indent=2)};

const FINANCIAL_ACCOUNT_DATA = {json.dumps(financial_account_data, indent=2)};

// Merged Test domain (ADR-049)
const TEST_DATA = {json.dumps(merge_domains([order_data, position_data, transaction_data, payment_data, financial_account_data], "Test"), indent=2)};

'''

# Add Investment/DP_EDI_AUM if available
if dp_edi_aum_data:
    output += f'''// --- RBCZ:MIB:Investment Domain Views ---

const INVESTMENT_DP_EDI_AUM_DATA = {json.dumps(dp_edi_aum_data, indent=2)};

// Merged Investment domain (ADR-049) - currently only DP_EDI_AUM
const INVESTMENT_DATA = {json.dumps(merge_domains([dp_edi_aum_data], "RBCZ:MIB:Investment"), indent=2)};

'''

# Build BKB_DATA export
output += '''// Export for application
window.BKB_DATA = {
  domains: DOMAINS_DATA,
  // Test domain
  test: TEST_DATA,
  order: ORDER_DATA,
  position: POSITION_DATA,
  transaction: TRANSACTION_DATA,
  payment: PAYMENT_DATA,
  financialaccount: FINANCIAL_ACCOUNT_DATA'''

if dp_edi_aum_data:
    output += ''',
  // RBCZ:MIB:Investment domain
  investment: INVESTMENT_DATA,
  investmentdp_edi_aum: INVESTMENT_DP_EDI_AUM_DATA'''

output += '''
};

console.log('BKB Test data loaded:', Object.keys(window.BKB_DATA));
'''

with open('$OUTPUT_FILE', 'w') as f:
    f.write(output)

print(f"Test domain views:")
print(f"  Order: {len(order_data['concepts'])} + {len(order_data.get('external_concepts', []))} external = {total_concepts(order_data)}")
print(f"  Position: {len(position_data['concepts'])} + {len(position_data.get('external_concepts', []))} external = {total_concepts(position_data)}")
print(f"  Transaction: {len(transaction_data['concepts'])} + {len(transaction_data.get('external_concepts', []))} external = {total_concepts(transaction_data)}")
print(f"  Payment: {len(payment_data['concepts'])} + {len(payment_data.get('external_concepts', []))} external = {total_concepts(payment_data)}")
print(f"  FinancialAccount: {len(financial_account_data['concepts'])} + {len(financial_account_data.get('external_concepts', []))} external = {total_concepts(financial_account_data)}")

if dp_edi_aum_data:
    print(f"\nRBCZ:MIB:Investment domain views:")
    print(f"  DP_EDI_AUM: {len(dp_edi_aum_data['concepts'])} + {len(dp_edi_aum_data.get('external_concepts', []))} external = {total_concepts(dp_edi_aum_data)}")
PYTHON

echo ""
echo "Done!"
echo ""
echo "Generated: $OUTPUT_FILE"
echo ""
echo "Directory structure (ADR-024):"
find "$SCRIPT_DIR/test" -name "ontology.json" | sort
echo ""
echo "Open index.html in browser to view the demo."
