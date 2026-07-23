package ma.solide.finance_manager.service;

import ma.solide.finance_manager.dto.PaymentNoticeDTO;
import ma.solide.finance_manager.entity.PaymentNotice;
import ma.solide.finance_manager.repository.PaymentNoticeRepository;
import ma.solide.finance_manager.tenant.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
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
class PaymentNoticeServiceTest {

    @Mock
    private PaymentNoticeRepository paymentNoticeRepository;

    @InjectMocks
    private PaymentNoticeService paymentNoticeService;

    private PaymentNotice mockNotice;
    private PaymentNoticeDTO mockNoticeDTO;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("school-a");
        mockNotice = new PaymentNotice("INV-202507-001", LocalDate.now(), 
            LocalDate.now().plusDays(15), "John Doe", "5th Grade", 1500.0, "MAD");
        mockNotice.setTenantId("school-a");
        mockNotice.setId(1);
        
        mockNoticeDTO = new PaymentNoticeDTO(1, "INV-202507-001", LocalDate.now(),
            LocalDate.now().plusDays(15), "John Doe", "5th Grade", 1500.0, "MAD", "pending");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void testGetAllNotices() {
        // Arrange
        List<PaymentNotice> notices = Arrays.asList(mockNotice);
        when(paymentNoticeRepository.findByTenantId("school-a")).thenReturn(notices);

        // Act
        List<PaymentNoticeDTO> result = paymentNoticeService.getAllNotices();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(paymentNoticeRepository, times(1)).findByTenantId("school-a");
    }

    @Test
    void testGetNoticeById() {
        // Arrange
        when(paymentNoticeRepository.findByIdAndTenantId(1, "school-a")).thenReturn(Optional.of(mockNotice));

        // Act
        PaymentNoticeDTO result = paymentNoticeService.getNoticeById(1);

        // Assert
        assertNotNull(result);
        assertEquals("INV-202507-001", result.getInvoiceNumber());
        verify(paymentNoticeRepository, times(1)).findByIdAndTenantId(1, "school-a");
    }

    @Test
    void testGetNoticeByIdNotFound() {
        // Arrange
        when(paymentNoticeRepository.findByIdAndTenantId(999, "school-a")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> paymentNoticeService.getNoticeById(999));
    }

    @Test
    void testGetNoticesByStudent() {
        // Arrange
        List<PaymentNotice> notices = Arrays.asList(mockNotice);
        when(paymentNoticeRepository.findByTenantIdAndStudentName("school-a", "John Doe")).thenReturn(notices);

        // Act
        List<PaymentNoticeDTO> result = paymentNoticeService.getNoticesByStudent("John Doe");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getStudentName());
        verify(paymentNoticeRepository, times(1)).findByTenantIdAndStudentName("school-a", "John Doe");
    }

    @Test
    void testCreateNoticeSuccess() {
        // Arrange
        when(paymentNoticeRepository.findByTenantId("school-a")).thenReturn(Arrays.asList());
        when(paymentNoticeRepository.save(any(PaymentNotice.class)))
                .thenAnswer(invocation -> {
                    PaymentNotice n = invocation.getArgument(0);
                    n.setId(1);
                    return n;
                });

        // Act
        PaymentNoticeDTO result = paymentNoticeService.createNotice(mockNoticeDTO);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getStudentName());
        assertEquals("pending", result.getStatus());
        verify(paymentNoticeRepository, times(1)).save(any(PaymentNotice.class));
    }

    @Test
    void testCreateNoticeWithInvalidAmount() {
        // Arrange
        mockNoticeDTO.setTotalAmount(0.0);

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> paymentNoticeService.createNotice(mockNoticeDTO));
    }

    @Test
    void testUpdateNoticeStatusToPaid() {
        // Arrange
        when(paymentNoticeRepository.findByIdAndTenantId(1, "school-a")).thenReturn(Optional.of(mockNotice));
        // Return the same entity passed to save() so mutations (paidDate) are reflected
        when(paymentNoticeRepository.save(any(PaymentNotice.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PaymentNoticeDTO result = paymentNoticeService.updateNoticeStatus(1, "paid");

        // Assert
        assertNotNull(result);
        assertEquals("paid", result.getStatus());
        assertNotNull(result.getPaidDate());
        verify(paymentNoticeRepository, times(1)).save(any(PaymentNotice.class));
    }

    @Test
    void testUpdateNoticeStatusWithInvalidStatus() {
        // Arrange
        when(paymentNoticeRepository.findByIdAndTenantId(1, "school-a")).thenReturn(Optional.of(mockNotice));

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> paymentNoticeService.updateNoticeStatus(1, "invalid"));
    }

    @Test
    void testGetNoticesByStatus() {
        // Arrange
        List<PaymentNotice> notices = Arrays.asList(mockNotice);
        when(paymentNoticeRepository.findByTenantIdAndStatus("school-a", "pending")).thenReturn(notices);

        // Act
        List<PaymentNoticeDTO> result = paymentNoticeService.getNoticesByStatus("pending");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(paymentNoticeRepository, times(1)).findByTenantIdAndStatus("school-a", "pending");
    }
}

