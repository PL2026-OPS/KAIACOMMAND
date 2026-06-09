"""
CPSIA detection service.
Reads proforma Google Sheet when a load enters E3.
Analyzes products against configurable CPSIA rules.
Creates 'CPSIA Filtro' tab — NEVER modifies the original 'Proforma' sheet.
Zero false negatives required: when in doubt, flag the product.
"""
