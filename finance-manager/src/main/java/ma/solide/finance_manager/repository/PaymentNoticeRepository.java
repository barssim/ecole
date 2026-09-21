package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.PaymentNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentNoticeRepository extends JpaRepository<PaymentNotice, Integer> {
    List<PaymentNotice> findBySchoolIdAndStudentName(String schoolId, String studentName);

    List<PaymentNotice> findBySchoolIdAndClassName(String schoolId, String className);

    List<PaymentNotice> findBySchoolIdAndStatus(String schoolId, String status);

    Optional<PaymentNotice> findBySchoolIdAndInvoiceNumber(String schoolId, String invoiceNumber);

    List<PaymentNotice> findBySchoolId(String schoolId);

    Optional<PaymentNotice> findByIdAndSchoolId(Integer id, String schoolId);
}
