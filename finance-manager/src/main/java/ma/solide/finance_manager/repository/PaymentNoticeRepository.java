package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.PaymentNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentNoticeRepository extends JpaRepository<PaymentNotice, Integer> {
    List<PaymentNotice> findByTenantIdAndStudentName(String tenantId, String studentName);

    List<PaymentNotice> findByTenantIdAndClassName(String tenantId, String className);

    List<PaymentNotice> findByTenantIdAndStatus(String tenantId, String status);

    Optional<PaymentNotice> findByTenantIdAndInvoiceNumber(String tenantId, String invoiceNumber);

    List<PaymentNotice> findByTenantId(String tenantId);

    Optional<PaymentNotice> findByIdAndTenantId(Integer id, String tenantId);
}

