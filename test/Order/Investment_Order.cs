# Concepts
Buy
Sell
Saving plan (regular investment)
One-time
Weekly
Monthly
Order
Executed order
Digital Onboarding Channel
Non-digital Onboarding Channel
Placed order
Settled order
Sales
# Position
# Payment
# Custody fee

# Categorizations
Saving plan (regular investment) =< @ by the frequency >= [Weekly, Monthly]
Order =< @ by the frequency of trading >= [Saving plan (regular investment), One-time]
Order =< @ by the kind of trading >= [Sell, Buy]
Order =< @ by state >= [Executed order, Settled order, Placed order]
Order =< @ by [Onboarding Channel] >= [Non-digital Onboarding Channel, Digital Onboarding Channel]

# Binary Verb Concepts
Sales -< is sum of / generates >- Order

# Context (dotted lines)
# Executed order -< predicts / consists of >- Position
# Settlement: Executed order -< is being settled for / is settled to >- Payment
# Custody fee -< is charged for / generates >- Position
