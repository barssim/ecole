package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.PaymentNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentNoticeRepository extends JpaRepository<PaymentNotice, Integer> {
    List<PaymentNotice> findByStudentName(String studentName);
    List<PaymentNotice> findByClassName(String className);
    List<PaymentNotice> findByStatus(String status);
    Optional<PaymentNotice> findByInvoiceNumber(String invoiceNumber);
}

