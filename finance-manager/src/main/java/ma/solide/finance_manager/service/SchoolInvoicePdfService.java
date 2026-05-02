package ma.solide.finance_manager.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
public class SchoolInvoicePdfService {

    public ByteArrayInputStream generateInvoice(String studentName, String className, List<Map<String, Object>> items) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph title = new Paragraph("Facture Scolaire", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Nom de l'élève : " + studentName, normalFont));
            document.add(new Paragraph("Classe : " + className, normalFont));
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

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération de la facture PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}