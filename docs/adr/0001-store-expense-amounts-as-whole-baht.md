# Store Expense Amounts as Whole Baht

The tracker records amounts in Thai Baht and does not need fractional amounts, so each expense amount is a positive whole number of Baht stored as an integer. This avoids floating-point arithmetic and deliberately rejects the alternative of accepting satang precision.
