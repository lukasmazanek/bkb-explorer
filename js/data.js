/**
 * BKB Explorer - Data
 *
 * Test data for Order diagram visualization
 * Generated: 2025-12-21T08:07:43.647050
 */

// Domain hierarchy
const DOMAINS_DATA = {
  "version": "1.0",
  "hierarchy": {
    "Test": {
      "type": "test",
      "children": {
        "Order": { "type": "domain", "stats": { "concepts": 18 } }
      }
    }
  },
  "crossDomain": {}
};

// Order domain
const ORDER_DATA = {
  "domain": {
    "path": "Test:Order",
    "name": "Order",
    "version": "1.0.0",
    "created": "2025-12-21T08:06:06.080960",
    "sources": [
      "Investment_Order.cs"
    ]
  },
  "concepts": [
    {
      "id": "7d8a5978-c664-4033-b36d-61e91d3016db",
      "name": "Buy",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 2
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "inherited",
        "confidence": 0.7,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "extends_name": "Order",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "0d9f9b4b-f7a5-40ed-81ea-c139a3558951",
      "name": "Sell",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 3
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "parent",
        "confidence": 0.8,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "173feecc-dfb5-41da-a91a-78509429e06a",
        "extends_name": "Order",
        "depth": 2,
        "path": [
          "173feecc-dfb5-41da-a91a-78509429e06a"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": true,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "922fabbb-9b45-4cad-a6e6-b6dbbbe20274",
      "name": "Saving plan (regular investment)",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 4
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/FunctionalEntities/NorthAmericanEntities/USFinancialServicesEntities/SavingsBank",
        "label": "savings bank",
        "match_type": "keyword",
        "confidence": 0.738,
        "fibo_definition": "banking institution organized to accept savings deposits and pay interest on those savings deposits",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "banking institution organized to accept savings deposits and pay interest on those savings deposits",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/FunctionalEntities/NorthAmericanEntities/USFinancialServicesEntities/SavingsBank",
        "extends_name": "savings bank",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/FunctionalEntities/NorthAmericanEntities/USFinancialServicesEntities/SavingsBank"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "f1f61e18-be0e-466b-a4b2-9cb680c59285",
      "name": "One-time",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 5
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/TimeDirection",
        "label": "time direction",
        "match_type": "keyword",
        "confidence": 0.736,
        "fibo_definition": "enumeration that indicates whether a calendar-specified date is figured from the start or the end of a calendar period",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "enumeration that indicates whether a calendar-specified date is figured from the start or the end of a calendar period",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/TimeDirection",
        "extends_name": "time direction",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FND/DatesAndTimes/FinancialDates/TimeDirection"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "848d31a7-40fd-40b5-bc16-bf363524f59e",
      "name": "Weekly",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 6
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/IND/EconomicIndicators/EconomicIndicators/AverageWeeklyEarnings",
        "label": "average weekly earnings",
        "match_type": "keyword",
        "confidence": 0.6769999999999999,
        "fibo_definition": "measure of the average weekly wage an employee makes over the reporting period",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "measure of the average weekly wage an employee makes over the reporting period",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/IND/EconomicIndicators/EconomicIndicators/AverageWeeklyEarnings",
        "extends_name": "average weekly earnings",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/IND/EconomicIndicators/EconomicIndicators/AverageWeeklyEarnings"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "28e1b31e-7268-45be-bb69-3b90cdcf2314",
      "name": "Monthly",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 7
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/LoanApplications/BorrowerMonthlyIncome",
        "label": "borrower monthly income",
        "match_type": "keyword",
        "confidence": 0.6769999999999999,
        "fibo_definition": "total monthly qualifying income of a potential borrower",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "total monthly qualifying income of a potential borrower",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/LoanApplications/BorrowerMonthlyIncome",
        "extends_name": "borrower monthly income",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/LOAN/LoansGeneral/LoanApplications/BorrowerMonthlyIncome"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "name": "Order",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 8
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "exact",
        "confidence": 1.0,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "extends_name": "Order",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "b66a9f98-f335-4e35-b077-5d39e6b7d063",
      "name": "Executed order",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 9
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "keyword",
        "confidence": 0.845,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "extends_name": "Order",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "b9b491e5-75cb-4033-ad05-9910bdd4778e",
      "name": "Digital Onboarding Channel",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 10
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "parent",
        "confidence": 0.8,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "173feecc-dfb5-41da-a91a-78509429e06a",
        "extends_name": "Order",
        "depth": 2,
        "path": [
          "173feecc-dfb5-41da-a91a-78509429e06a"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": true,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "fb9c5bc9-76fb-4cbf-9ead-9481a1375211",
      "name": "Non-digital Onboarding Channel",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 11
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "parent",
        "confidence": 0.8,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "173feecc-dfb5-41da-a91a-78509429e06a",
        "extends_name": "Order",
        "depth": 2,
        "path": [
          "173feecc-dfb5-41da-a91a-78509429e06a"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": true,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "5adaaaae-4d52-421b-beec-b78362873a32",
      "name": "Placed order",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 12
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "keyword",
        "confidence": 0.845,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "extends_name": "Order",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "b8b808b4-56de-4a04-a257-aca416dbecc3",
      "name": "Settled order",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 13
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "label": "Order",
        "match_type": "keyword",
        "confidence": 0.845,
        "fibo_definition": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "An instruction from a customer or client to buy or sell securities, commodities, or other financial instruments.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order",
        "extends_name": "Order",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Order"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "7cb39532-98dc-4f43-b9b8-cbcd58e52db5",
      "name": "Sales",
      "type": "concept",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 14
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/ProductsAndServices/Sale",
        "label": "sale",
        "match_type": "fuzzy",
        "confidence": 0.8,
        "fibo_definition": "exchange of goods or services for money",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "exchange of goods or services for money",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/ProductsAndServices/Sale",
        "extends_name": "sale",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/ProductsAndServices/Sale"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "befc2d96-d411-4008-9f25-d34c1bedbd99",
      "name": "Position",
      "type": "context_reference",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 15
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Position",
        "label": "position",
        "match_type": "exact",
        "confidence": 1.0,
        "fibo_definition": "investor's stake, i.e., a holding, in a particular asset (such as an individual security)",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "investor's stake, i.e., a holding, in a particular asset (such as an individual security)",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Position",
        "extends_name": "position",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FBC/ProductsAndServices/FinancialProductsAndServices/Position"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "7408716d-dd1a-498c-b402-b5424d09e3a1",
      "name": "Payment",
      "type": "context_reference",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 16
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/PaymentsAndSchedules/Payment",
        "label": "payment",
        "match_type": "exact",
        "confidence": 1.0,
        "fibo_definition": "delivery of money in fulfillment of an obligation, such as to satisfy a claim or debt",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "delivery of money in fulfillment of an obligation, such as to satisfy a claim or debt",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/PaymentsAndSchedules/Payment",
        "extends_name": "payment",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/FND/ProductsAndServices/PaymentsAndSchedules/Payment"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "6e43f611-688b-4aae-afac-b6bd572eb943",
      "name": "Custody fee",
      "type": "context_reference",
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 17
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "",
      "fibo_mapping": {
        "uri": "https://spec.edmcouncil.org/fibo/ontology/SEC/Securities/SecuritiesHoldings/CustodyAgreement",
        "label": "Custody Agreement",
        "match_type": "keyword",
        "confidence": 0.733,
        "fibo_definition": "A contract between an investor and a custodian bank for the safekeeping of securities and other assets.",
        "fibo_module": "",
        "isA": ""
      },
      "definition": {
        "text": "A contract between an investor and a custodian bank for the safekeeping of securities and other assets.",
        "source": "FIBO",
        "confidence": "MAPPED",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "https://spec.edmcouncil.org/fibo/ontology/SEC/Securities/SecuritiesHoldings/CustodyAgreement",
        "extends_name": "Custody Agreement",
        "depth": 1,
        "path": [
          "https://spec.edmcouncil.org/fibo/ontology/SEC/Securities/SecuritiesHoldings/CustodyAgreement"
        ]
      },
      "has_fibo_mapping": true,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "494a2c96-b4af-4ef8-a031-92baabc00638",
      "name": "SellAction",
      "type": "concept",
      "sources": [
        {
          "type": "schema.org",
          "uri": "https://schema.org/SellAction"
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "Schema.org concept: https://schema.org/SellAction",
      "fibo_mapping": null,
      "definition": {
        "text": "Schema.org concept: https://schema.org/SellAction",
        "source": "EXPLICIT",
        "confidence": "EXPLICIT",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "owl:Thing",
        "extends_name": "Thing",
        "depth": 1,
        "path": [
          "owl:Thing"
        ]
      },
      "has_fibo_mapping": false,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    },
    {
      "id": "16b5c1ee-3c01-4777-ace2-a5529b986d5d",
      "name": "Service Channel",
      "type": "concept",
      "sources": [
        {
          "type": "schema.org",
          "uri": "https://schema.org/ServiceChannel"
        }
      ],
      "aliases": [],
      "merged_from": [],
      "local_definition": "Schema.org concept: https://schema.org/ServiceChannel",
      "fibo_mapping": null,
      "definition": {
        "text": "Schema.org concept: https://schema.org/ServiceChannel",
        "source": "EXPLICIT",
        "confidence": "EXPLICIT",
        "needs_review": false,
        "parent_name": ""
      },
      "hierarchy": {
        "extends": "owl:Thing",
        "extends_name": "Thing",
        "depth": 1,
        "path": [
          "owl:Thing"
        ]
      },
      "has_fibo_mapping": false,
      "has_schema_mapping": false,
      "has_definition": true,
      "has_parent": true
    }
  ],
  "categorizations": [
    {
      "id": "3c5be200-c67d-4e16-8603-6e35f273cf66",
      "parent_id": "922fabbb-9b45-4cad-a6e6-b6dbbbe20274",
      "parent_name": "Saving plan (regular investment)",
      "category_name": "@ by the frequency",
      "children_ids": [
        "848d31a7-40fd-40b5-bc16-bf363524f59e",
        "28e1b31e-7268-45be-bb69-3b90cdcf2314"
      ],
      "children_names": [
        "Weekly",
        "Monthly"
      ],
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 20
        }
      ]
    },
    {
      "id": "378c1bfc-7878-401a-b96c-34cfebb0d14a",
      "parent_id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "parent_name": "Order",
      "category_name": "@ by the frequency of trading",
      "children_ids": [
        "922fabbb-9b45-4cad-a6e6-b6dbbbe20274",
        "f1f61e18-be0e-466b-a4b2-9cb680c59285"
      ],
      "children_names": [
        "Saving plan (regular investment)",
        "One-time"
      ],
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 21
        }
      ]
    },
    {
      "id": "78ee7d50-397d-4858-890f-c5112acec337",
      "parent_id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "parent_name": "Order",
      "category_name": "@ by the kind of trading",
      "children_ids": [
        "0d9f9b4b-f7a5-40ed-81ea-c139a3558951",
        "7d8a5978-c664-4033-b36d-61e91d3016db"
      ],
      "children_names": [
        "Sell",
        "Buy"
      ],
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 22
        }
      ]
    },
    {
      "id": "56aeece8-ec7d-42c2-98ed-428cfd9e1f2f",
      "parent_id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "parent_name": "Order",
      "category_name": "@ by state",
      "children_ids": [
        "b66a9f98-f335-4e35-b077-5d39e6b7d063",
        "b8b808b4-56de-4a04-a257-aca416dbecc3",
        "5adaaaae-4d52-421b-beec-b78362873a32"
      ],
      "children_names": [
        "Executed order",
        "Settled order",
        "Placed order"
      ],
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 23
        }
      ]
    },
    {
      "id": "42bc9639-a778-4c5f-aed8-ac6985db48db",
      "parent_id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "parent_name": "Order",
      "category_name": "@ by [Onboarding Channel]",
      "children_ids": [
        "fb9c5bc9-76fb-4cbf-9ead-9481a1375211",
        "b9b491e5-75cb-4033-ad05-9910bdd4778e"
      ],
      "children_names": [
        "Non-digital Onboarding Channel",
        "Digital Onboarding Channel"
      ],
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 24
        }
      ]
    },
    {
      "from": "Sell",
      "to": "SellAction",
      "type": "isA",
      "source": "auto:synonym"
    },
    {
      "from": "Digital Onboarding Channel",
      "to": "Service Channel",
      "type": "isA",
      "source": "manual:channels"
    },
    {
      "from": "Non-digital Onboarding Channel",
      "to": "Service Channel",
      "type": "isA",
      "source": "manual:channels"
    }
  ],
  "relationships": [
    {
      "id": "88c3c85e-00a9-4a84-92ff-a836132effcf",
      "subject_id": "7cb39532-98dc-4f43-b9b8-cbcd58e52db5",
      "subject_name": "Sales",
      "object_id": "173feecc-dfb5-41da-a91a-78509429e06a",
      "object_name": "Order",
      "verb_phrase": "is sum of",
      "inverse_verb_phrase": "generates",
      "role_subject": "",
      "role_object": "",
      "objectification_name": "",
      "is_context": false,
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 27
        }
      ]
    },
    {
      "id": "0b59c1fe-e48b-4360-866e-154b5b0421e7",
      "subject_id": "b66a9f98-f335-4e35-b077-5d39e6b7d063",
      "subject_name": "Executed order",
      "object_id": "befc2d96-d411-4008-9f25-d34c1bedbd99",
      "object_name": "Position",
      "verb_phrase": "predicts",
      "inverse_verb_phrase": "consists of",
      "role_subject": "",
      "role_object": "",
      "objectification_name": "",
      "is_context": true,
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 30
        }
      ]
    },
    {
      "id": "b56f5c70-e0f4-477e-864e-02ed551620b2",
      "subject_id": "b66a9f98-f335-4e35-b077-5d39e6b7d063",
      "subject_name": "Executed order",
      "object_id": "7408716d-dd1a-498c-b402-b5424d09e3a1",
      "object_name": "Payment",
      "verb_phrase": "is being settled for",
      "inverse_verb_phrase": "is settled to",
      "role_subject": "",
      "role_object": "",
      "objectification_name": "Settlement",
      "is_context": true,
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 31
        }
      ]
    },
    {
      "id": "165adf91-caf7-4cac-939f-7b3146e0213a",
      "subject_id": "6e43f611-688b-4aae-afac-b6bd572eb943",
      "subject_name": "Custody fee",
      "object_id": "befc2d96-d411-4008-9f25-d34c1bedbd99",
      "object_name": "Position",
      "verb_phrase": "is charged for",
      "inverse_verb_phrase": "generates",
      "role_subject": "",
      "role_object": "",
      "objectification_name": "",
      "is_context": true,
      "sources": [
        {
          "file": "Investment_Order.cs",
          "line": 32
        }
      ]
    }
  ],
  "enumerations": [],
  "unary_states": [],
  "metadata": {
    "concept_count": 18,
    "fibo_mapped_count": 16,
    "fibo_coverage": 88.88888888888889,
    "schema_mapped_count": 3,
    "semantic_coverage": 105.55555555555556,
    "definition_coverage": 100.0,
    "exact_matches": 3,
    "synonym_matches": 0,
    "parent_matches": 3,
    "hierarchical_matches": 0,
    "llm_matches": 0,
    "no_matches": 2,
    "non_fibo_count": 2,
    "draft_definitions": 0,
    "validation_errors": [],
    "validation_warnings": []
  },
  "schema_version": "1.0.0",
  "created_at": "2025-12-21T08:06:36.587164",
  "modified_at": "2025-12-21T08:06:36.587175",
  "generated": "2025-12-21T08:06:36.587176",
  "fibo_version": "2024Q1"
};

// Placeholder for other domains
const INVESTMENT_DATA = { "domain": { "name": "Investment", "path": "Test:Order" }, "concepts": [] };
const PAYMENTS_DATA = { "domain": { "name": "Payments", "path": "Test:Order" }, "concepts": [] };
const RETAIL_DATA = { "domain": { "name": "Retail", "path": "Test:Order" }, "concepts": [] };

// Export for application
window.BKB_DATA = {
  domains: DOMAINS_DATA,
  investment: ORDER_DATA,
  order: ORDER_DATA,  // Map both 'investment' and 'order' to ORDER_DATA
  payments: PAYMENTS_DATA,
  retail: RETAIL_DATA
};

console.log('BKB Test data loaded:', Object.keys(window.BKB_DATA));
