package ma.solide.usermanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import ma.solide.usermanagement.model.User;

@Service
public class WelcomeEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WelcomeEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${welcome.email.from:noreply@ecole-portal.local}")
    private String fromAddress;

    @Value("${welcome.email.enabled:true}")
    private boolean enabled;

    public WelcomeEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendWelcomeEmail(User user) {
        if (!enabled) {
            return;
        }
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            LOGGER.warn("Skipping welcome email: no email address for user {}", user != null ? user.getUserno() : null);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(user.getEmail());
            message.setSubject("Bienvenue sur le portail de l'école");
            message.setText(buildBody(user));
            mailSender.send(message);
            LOGGER.info("Welcome email sent to {}", user.getEmail());
        } catch (Exception ex) {
            LOGGER.error("Failed to send welcome email to {}", user.getEmail(), ex);
        }
    }

    private String buildBody(User user) {
        String firstname = user.getFirstname() != null ? user.getFirstname() : "";
        String surname = user.getSurname() != null ? user.getSurname() : "";
        return "Bonjour " + firstname + " " + surname + ",\n\n"
                + "Votre compte a été créé avec succès sur le portail de l'école.\n"
                + "Identifiant : " + surname + "\n\n"
                + "Vous pouvez dès à présent vous connecter au portail.\n\n"
                + "Cordialement,\n"
                + "L'équipe du portail de l'école";
    }
}
