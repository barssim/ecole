package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByTenantIdAndStudentName(String tenantId, String studentName);

    List<Payment> findByTenantIdAndClassName(String tenantId, String className);

    List<Payment> findByTenantIdAndPaymentDateBetween(String tenantId, LocalDate startDate, LocalDate endDate);

    List<Payment> findByTenantId(String tenantId);

    java.util.Optional<Payment> findByIdAndTenantId(Integer id, String tenantId);
}

