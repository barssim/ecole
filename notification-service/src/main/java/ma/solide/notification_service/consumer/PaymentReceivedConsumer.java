package ma.solide.notification_service.consumer;

import ma.solide.notification_service.EmailNotificationService;
import ma.solide.notification_service.config.RabbitMQConfig;
import ma.solide.notification_service.event.PaymentReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class PaymentReceivedConsumer {

    private static final Logger log = LoggerFactory.getLogger(PaymentReceivedConsumer.class);

    private final EmailNotificationService emailNotificationService;

    public PaymentReceivedConsumer(EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void consume(PaymentReceivedEvent event) {
        log.info("Received payment-received event: paymentId={}, studentName={}, amount={}, currency={}, paymentMethod={}",
                event.paymentId(), event.studentName(), event.amount(), event.currency(), event.paymentMethod());

        emailNotificationService.sendPaymentReceivedEmail(event);
    }
}
