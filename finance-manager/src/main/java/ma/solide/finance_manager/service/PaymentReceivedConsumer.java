package ma.solide.finance_manager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentReceivedConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentReceivedConsumer.class);

    @KafkaListener(topics = "payment-received", groupId = "notification-service")
    public void consume(PaymentReceivedEvent event) {
        log.info("Notification service received payment event: paymentId={}, student={}, amount={}",
                event.paymentId(), event.studentName(), event.amount());
    }
}
