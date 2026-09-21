package ma.solide.finance_manager.service;

import java.time.Instant;

public record PaymentReceivedEvent(
        String eventId,
        Integer paymentId,
        String schoolId,
        String studentName,
        String studentEmail,
        Double amount,
        String currency,
        String paymentMethod,
        Instant occurredAt
) {
}
