package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentPaymentView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentPaymentRepository extends JpaRepository<ParentPaymentView, Long> {

    List<ParentPaymentView> findAllByTenantIdAndStudentNameOrderByPaymentDateDesc(String tenantId, String studentName);

    List<ParentPaymentView> findAllByTenantIdOrderByPaymentDateDesc(String tenantId);
}

