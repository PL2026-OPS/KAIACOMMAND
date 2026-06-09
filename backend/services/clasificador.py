"""
Email classification service using Anthropic Claude API.
Groups emails by CCS code (not by supplier) — one thread per load per supplier.
Returns confidence score + suggested CCS; never acts without Paulet's confirmation.
"""
