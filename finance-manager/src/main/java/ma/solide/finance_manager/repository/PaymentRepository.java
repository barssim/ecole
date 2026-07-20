package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByStudentName(String studentName);
    List<Payment> findByClassName(String className);
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
}

