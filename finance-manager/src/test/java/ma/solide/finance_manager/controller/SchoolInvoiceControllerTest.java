package ma.solide.finance_manager.controller;

import ma.solide.finance_manager.dto.PaymentDTO;
import ma.solide.finance_manager.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
class SchoolInvoiceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private SchoolInvoiceController controller;

    private PaymentDTO mockPaymentDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        
        mockPaymentDTO = new PaymentDTO(1, "John Doe", "Grade 5", 1500.0, "MAD", "Cash", LocalDate.now());
    }

    @Test
    void testCreatePaymentWithFinanceRole() throws Exception {
        // Arrange
        when(paymentService.recordPayment(any(PaymentDTO.class)))
                .thenAnswer(invocation -> {
                    PaymentDTO dto = invocation.getArgument(0);
                    dto.setId(1);
                    return dto;
                });

        // Act & Assert
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "finance")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"John Doe\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentName").value("John Doe"))
                .andExpect(jsonPath("$.amount").value(1500.0));
    }

    @Test
    void testCreatePaymentWithAdminRole() throws Exception {
        // Arrange
        when(paymentService.recordPayment(any(PaymentDTO.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act & Assert
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "admin")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"Jane Smith\",\"className\":\"Grade 6\",\"amount\":2000,\"currency\":\"MAD\",\"method\":\"Card\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void testCreatePaymentWithManagerRole() throws Exception {
        // Arrange
        when(paymentService.recordPayment(any(PaymentDTO.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act & Assert
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "manager")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"Ahmed Hassan\",\"className\":\"Grade 4\",\"amount\":1800,\"currency\":\"MAD\",\"method\":\"Check\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void testCreatePaymentWithMultipleRoles() throws Exception {
        // Arrange - User has multiple roles including finance
        when(paymentService.recordPayment(any(PaymentDTO.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act & Assert
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "student, finance, parent")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"Fatima Ali\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void testCreatePaymentWithStudentRoleForbidden() throws Exception {
        // Act & Assert - Student role is not allowed
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "student")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"John Doe\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatePaymentWithParentRoleForbidden() throws Exception {
        // Act & Assert - Parent role is not allowed
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "parent")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"Jane Smith\",\"className\":\"Grade 6\",\"amount\":2000,\"currency\":\"MAD\",\"method\":\"Card\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatePaymentWithTeacherRoleForbidden() throws Exception {
        // Act & Assert - Teacher role is not allowed
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "teacher")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"Ahmed Hassan\",\"className\":\"Grade 4\",\"amount\":1800,\"currency\":\"MAD\",\"method\":\"Check\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatePaymentWithNoRoleForbidden() throws Exception {
        // Act & Assert - No role header means no permission
        mockMvc.perform(post("/api/payments")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"John Doe\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatePaymentWithEmptyRoleForbidden() throws Exception {
        // Act & Assert - Empty role header means no permission
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"John Doe\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreatePaymentWithInvalidRoleForbidden() throws Exception {
        // Act & Assert - Invalid role means no permission
        mockMvc.perform(post("/api/payments")
                .header("X-User-Roles", "invalid_role")
                .header("Content-Type", "application/json")
                .content("{\"studentName\":\"John Doe\",\"className\":\"Grade 5\",\"amount\":1500,\"currency\":\"MAD\",\"method\":\"Cash\",\"paymentDate\":\"2025-07-01\"}"))
                .andExpect(status().isForbidden());
    }
}

