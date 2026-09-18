package ma.solide.finance_manager.service;

import ma.solide.finance_manager.config.RabbitMQConfig;
import ma.solide.finance_manager.entity.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public PaymentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
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

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, event);
        log.info("Published payment received event for paymentId={}, student={}, amount={}",
                payment.getId(), payment.getStudentName(), payment.getAmount());
    }
}
