# Concepts
Position
Open position
Closed position
Long position
Short position
Cash position
Securities position
Equity position
Bond position
Fund position

# Categorizations
Position =< @ by state >= [Open position, Closed position]
Position =< @ by direction >= [Long position, Short position]
Position =< @ by asset type >= [Cash position, Securities position]
Securities position =< @ by instrument >= [Equity position, Bond position, Fund position]

# Binary Verb Concepts
Position -< is held in / holds >- Account
Position -< is valued at / values >- Market value

# Context (dotted lines)
# Order -< creates / is created by >- Position
# Custody fee -< is charged for / generates >- Position
