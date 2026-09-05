package ma.solide.finance_manager.service;

import ma.solide.finance_manager.entity.Payment;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);
    private static final String TOPIC = "payment-received";

    private final KafkaTemplate<String, PaymentReceivedEvent> kafkaTemplate;

    public PaymentEventPublisher(KafkaTemplate<String, PaymentReceivedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishPaymentReceived(Payment payment) {
        PaymentReceivedEvent event = new PaymentReceivedEvent(
                UUID.randomUUID().toString(),
                payment.getId(),
                payment.getStudentName(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getMethod(),
                Instant.now()
        );

        kafkaTemplate.send(new ProducerRecord<>(TOPIC, payment.getStudentName(), event));
        log.info("Published payment received event for paymentId={}, student={}, amount={}",
                payment.getId(), payment.getStudentName(), payment.getAmount());
    }
}
