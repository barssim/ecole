package ma.solide.finance_manager.service;

import ma.solide.finance_manager.dto.PaymentDTO;
import ma.solide.finance_manager.entity.Payment;
import ma.solide.finance_manager.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment mockPayment;
    private PaymentDTO mockPaymentDTO;

    @BeforeEach
    void setUp() {
        mockPayment = new Payment("John Doe", "5th Grade", 1500.0, "MAD", "Cash", LocalDate.now());
        mockPayment.setId(1);
        
        mockPaymentDTO = new PaymentDTO(1, "John Doe", "5th Grade", 1500.0, "MAD", "Cash", LocalDate.now());
    }

    @Test
    void testGetPaymentsByStudent() {
        // Arrange
        List<Payment> payments = Arrays.asList(mockPayment);
        when(paymentRepository.findByStudentName("John Doe")).thenReturn(payments);

        // Act
        List<PaymentDTO> result = paymentService.getPaymentsByStudent("John Doe");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getStudentName());
        verify(paymentRepository, times(1)).findByStudentName("John Doe");
    }

    @Test
    void testRecordPaymentSuccess() {
        // Arrange
        when(paymentRepository.save(any(Payment.class)))
                .thenAnswer(invocation -> {
                    Payment p = invocation.getArgument(0);
                    p.setId(1);
                    return p;
                });

        // Act
        PaymentDTO result = paymentService.recordPayment(mockPaymentDTO);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getStudentName());
        assertEquals(1500.0, result.getAmount());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testRecordPaymentWithInvalidAmount() {
        // Arrange
        mockPaymentDTO.setAmount(0.0);

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> paymentService.recordPayment(mockPaymentDTO));
    }

    @Test
    void testGetPaymentById() {
        // Arrange
        when(paymentRepository.findById(1)).thenReturn(Optional.of(mockPayment));

        // Act
        PaymentDTO result = paymentService.getPaymentById(1);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getStudentName());
        verify(paymentRepository, times(1)).findById(1);
    }

    @Test
    void testGetPaymentByIdNotFound() {
        // Arrange
        when(paymentRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> paymentService.getPaymentById(999));
    }

    @Test
    void testDeletePayment() {
        // Arrange
        when(paymentRepository.findById(1)).thenReturn(Optional.of(mockPayment));

        // Act
        paymentService.deletePayment(1);

        // Assert
        verify(paymentRepository, times(1)).delete(mockPayment);
    }
}

