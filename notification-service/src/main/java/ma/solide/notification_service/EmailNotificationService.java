package ma.solide.notification_service;

import ma.solide.notification_service.event.PaymentReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${notification.email.from}")
    private String from;

    @Value("${notification.email.to}")
    private String to;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPaymentReceivedEmail(PaymentReceivedEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Payment received");
            message.setText(
                    "Hello,\n\n" +
                    "A payment has been received for student " + event.studentName() + ".\n" +
                    "Payment ID: " + event.paymentId() + "\n" +
                    "Amount: " + event.amount() + " " + event.currency() + "\n" +
                    "Method: " + event.paymentMethod() + "\n\n" +
                    "Regards,\nECOLE Finance"
            );

            mailSender.send(message);
            log.info("Payment email sent for paymentId={}, studentName={}", event.paymentId(), event.studentName());
        } catch (Exception ex) {
            log.error("Failed to send payment notification email for paymentId={}, studentName={}",
                    event.paymentId(), event.studentName(), ex);
        }
    }
}
