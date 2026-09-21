package ma.solide.secretaryoffice.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import ma.solide.secretaryoffice.dto.SchoolCustomizationResponseDTO;
import ma.solide.secretaryoffice.model.Attestation;

@Service
public class AttestationPdfService {

    private static final byte[] DEFAULT_LOGO = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgU8M2X8AAAAASUVORK5CYII=");

    public ByteArrayInputStream generatePdf(Attestation attestation) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph title = new Paragraph(attestation.getTitle(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Nom de l'élève : " + attestation.getStudentName(), normalFont));
            document.add(new Paragraph("Classe : " + attestation.getClassName(), normalFont));
            document.add(new Paragraph("Référence : " + attestation.getReference(), normalFont));
            document.add(new Paragraph("Date : " + attestation.getDate(), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 6});

            addRow(table, "Type", attestation.getType(), labelFont, normalFont);
            addRow(table, "Statut", attestation.getStatus(), labelFont, normalFont);
            addRow(table, "Émise par", attestation.getIssuedBy(), labelFont, normalFont);
            addRow(table, "Valide du", String.valueOf(attestation.getValidFrom()), labelFont, normalFont);
            addRow(table, "Valide jusqu'au", String.valueOf(attestation.getValidUntil()), labelFont, normalFont);

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Document généré automatiquement par ECOLE.", normalFont));
            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Erreur lors de la génération du PDF de l'attestation", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font normalFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        PdfPCell valueCell = new PdfPCell(new Phrase(value == null ? "-" : value, normalFont));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    public SchoolCustomizationResponseDTO getCustomization(Long schoolClassId) {
        String suffix = schoolClassId == null ? "" : " " + schoolClassId;
        return new SchoolCustomizationResponseDTO(
                Map.of("fr", "ECOLE", "en", "ECOLE"),
                "/api/school-customization/logo",
                null,
                Map.of("fr", "Personnalisation par défaut du secrétariat", "en", "Default secretary office branding"),
                Map.of("fr", "Siège principal" + suffix, "en", "Main campus" + suffix),
                "#1F4E79",
                "#F4B400",
                "#E8F0FE",
                "secretary-office",
                "+212 000 000 000",
                "contact@ecole.local",
                "ECOLE");
    }

    public byte[] getLogo() {
        return DEFAULT_LOGO.clone();
    }
}
