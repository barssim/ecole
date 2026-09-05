package ma.solide.notification_service.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaymentReceivedEvent(
        String eventId,
        Integer paymentId,
        String studentName,
        Double amount,
        String currency,
        String paymentMethod,
        Instant occurredAt
) {
}
