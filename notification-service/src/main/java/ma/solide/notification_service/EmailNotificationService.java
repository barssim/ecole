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
    private final SchoolEmailService schoolEmailService;

    @Value("${notification.email.from}")
    private String from;

    @Value("${notification.email.to}")
    private String to;

    public EmailNotificationService(JavaMailSender mailSender, SchoolEmailService schoolEmailService) {
        this.mailSender = mailSender;
        this.schoolEmailService = schoolEmailService;
    }

    public void sendPaymentReceivedEmail(PaymentReceivedEvent event) {
        try {
            String schoolFrom = schoolEmailService.resolveSchoolEmail(event.schoolId());
            if (schoolFrom == null || schoolFrom.isBlank()) {
                schoolFrom = from;
            }
            String recipient = (event.studentEmail() != null && !event.studentEmail().isBlank())
                    ? event.studentEmail()
                    : to;

            log.info("school_email is: {}", schoolFrom);
            String schoolSignature = (event.schoolId() != null && !event.schoolId().isBlank())
                    ? "Ecole " + event.schoolId()
                    : "Ecole Finance";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(schoolFrom);
            message.setTo(recipient);
            message.setSubject("Payment received");

            message.setText(
                    "Bonjour,\n\n" +
                    "Un paiement a été reçu pour l'élève " + event.studentName() + ".\n" +
                    "Identifiant du paiement : " + event.paymentId() + "\n" +
                    "Montant : " + event.amount() + " " + event.currency() + "\n" +
                    "Mode de paiement : " + event.paymentMethod() + "\n\n" +
                    "Cordialement,\n" + schoolSignature
            );

            mailSender.send(message);
            log.info("Payment email sent for paymentId={}, studentName={}, schoolId={}, recipient={}, from={}",
                    event.paymentId(), event.studentName(), event.schoolId(), recipient, schoolFrom);
        } catch (Exception ex) {
            log.error("Failed to send payment notification email for paymentId={}, studentName={}",
                    event.paymentId(), event.studentName(), ex);
        }
    }
}
