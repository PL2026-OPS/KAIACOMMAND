"""
Automatic retry service.
Starts a 48h counter after Paulet sends a supplier email.
Auto-resends once with '[Follow-up]' subject prefix if no response.
Hard cap: 2 retries max. Escalation alert after second retry — never a third automated email.
"""
