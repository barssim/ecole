package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findBySchoolIdAndStudentName(String schoolId, String studentName);

    List<Payment> findBySchoolIdAndClassName(String schoolId, String className);

    List<Payment> findBySchoolIdAndPaymentDateBetween(String schoolId, LocalDate startDate, LocalDate endDate);

    List<Payment> findBySchoolId(String schoolId);

    java.util.Optional<Payment> findByIdAndSchoolId(Integer id, String schoolId);
}
