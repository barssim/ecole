package ma.solide.notification_service.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
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
