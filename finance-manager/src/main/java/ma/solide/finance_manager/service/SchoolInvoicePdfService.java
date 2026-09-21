package ma.solide.finance_manager.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class SchoolInvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(SchoolInvoicePdfService.class);

    public ByteArrayInputStream generateInvoice(String studentName, String className, List<Map<String, Object>> items,
            String logoUrl, String schoolName, String phoneNumber, String emailAddress, String address,
            String paymentMethod) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            // Add logo if provided (either a remote/local URL or a base64 data URI)
            if (logoUrl != null && !logoUrl.isEmpty()) {
                try {
                    Image logo = loadLogoImage(logoUrl);
                    logo.scaleToFit(80, 80);
                    logo.setAlignment(Element.ALIGN_LEFT);
                    document.add(logo);
                } catch (Exception e) {
                    log.warn("Unable to load school logo: {}", e.getMessage());
                }
            }

            // Add school name if provided
            if (schoolName != null && !schoolName.isEmpty()) {
                Paragraph schoolHeader = new Paragraph(schoolName, titleFont);
                schoolHeader.setAlignment(Element.ALIGN_CENTER);
                document.add(schoolHeader);
            }

            Paragraph title = new Paragraph("Facture Scolaire", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Nom de l'élève : " + studentName, normalFont));
            document.add(new Paragraph("Classe : " + className, normalFont));
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                document.add(new Paragraph("Méthode de paiement : " + paymentMethod, normalFont));
            }
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{7, 3});

            PdfPCell header1 = new PdfPCell(new Phrase("Désignation", labelFont));
            PdfPCell header2 = new PdfPCell(new Phrase("Montant (MAD)", labelFont));
            header1.setBackgroundColor(BaseColor.LIGHT_GRAY);
            header2.setBackgroundColor(BaseColor.LIGHT_GRAY);

            table.addCell(header1);
            table.addCell(header2);

            double total = 0;

            for (Map<String, Object> item : items) {
                String description = (String) item.get("description");
                double amount = ((Number) item.get("amount")).doubleValue();

                table.addCell(new Phrase(description, normalFont));
                table.addCell(new Phrase(String.format("%.2f", amount), normalFont));

                total += amount;
            }

            PdfPCell totalCell = new PdfPCell(new Phrase("Total", labelFont));
            totalCell.setColspan(1);
            totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(totalCell);

            table.addCell(new Phrase(String.format("%.2f MAD", total), labelFont));

            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Merci pour votre confiance.", normalFont));

            // Add contact information if provided
            document.add(new Paragraph(" "));
            document.add(new Paragraph("═══════════════════════════════════", smallFont));

            if (phoneNumber != null && !phoneNumber.isEmpty()) {
                document.add(new Paragraph("Téléphone : " + phoneNumber, smallFont));
            }
            if (emailAddress != null && !emailAddress.isEmpty()) {
                document.add(new Paragraph("Email : " + emailAddress, smallFont));
            }
            if (address != null && !address.isEmpty()) {
                document.add(new Paragraph("Adresse : " + address, smallFont));
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération de la facture PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private Image loadLogoImage(String logoUrl) throws Exception {
        if (logoUrl.startsWith("data:")) {
            int commaIndex = logoUrl.indexOf(',');
            String base64Data = commaIndex >= 0 ? logoUrl.substring(commaIndex + 1) : logoUrl;
            byte[] bytes = Base64.getDecoder().decode(base64Data);
            return Image.getInstance(bytes);
        }
        return Image.getInstance(logoUrl);
    }
}