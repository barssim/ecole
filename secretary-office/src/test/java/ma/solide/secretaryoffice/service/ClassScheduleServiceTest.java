package ma.solide.secretaryoffice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.ClassScheduleDayResponse;
import ma.solide.secretaryoffice.dto.ClassScheduleRequestDTO;
import ma.solide.secretaryoffice.model.ClassScheduleEntry;
import ma.solide.secretaryoffice.model.SchoolClass;
import ma.solide.secretaryoffice.repository.ClassScheduleEntryRepository;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;
import ma.solide.secretaryoffice.tenant.TenantContext;

@ExtendWith(MockitoExtension.class)
class ClassScheduleServiceTest {

    private static final String TENANT = "gardinia";

    @Mock
    private ClassScheduleEntryRepository classScheduleEntryRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @InjectMocks
    private ClassScheduleService classScheduleService;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void listScheduleShouldGroupAndSortEntriesByDayAndSlot() {
        when(schoolClassRepository.existsByIdAndTenantId(1, TENANT)).thenReturn(true);
        when(classScheduleEntryRepository.findAllByTenantIdAndClassIdOrderByDayAscSlotOrderAsc(TENANT, 1)).thenReturn(List.of(
                ClassScheduleEntry.builder().id(3L).tenantId(TENANT).classId(1).day("Wednesday").slotOrder(2).slotText("English - 10:00").build(),
                ClassScheduleEntry.builder().id(1L).tenantId(TENANT).classId(1).day("Monday").slotOrder(1).slotText("Math - 08:00").build(),
                ClassScheduleEntry.builder().id(2L).tenantId(TENANT).classId(1).day("Monday").slotOrder(2).slotText("Physics - 10:00").build()
        ));

        List<ClassScheduleDayResponse> result = classScheduleService.listSchedule(1);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDay()).isEqualTo("Monday");
        assertThat(result.get(0).getSlots()).containsExactly("Math - 08:00", "Physics - 10:00");
        assertThat(result.get(0).getEntries()).extracting("id").containsExactly(1L, 2L);
    }

    @Test
    void createDayPlanShouldPersistTrimmedSlots() {
        when(schoolClassRepository.existsByIdAndTenantId(1, TENANT)).thenReturn(true);
        when(classScheduleEntryRepository.save(any(ClassScheduleEntry.class))).thenAnswer(invocation -> {
            ClassScheduleEntry entry = invocation.getArgument(0);
            entry.setId(entry.getSlotOrder().longValue());
            return entry;
        });

        ClassScheduleRequestDTO request = new ClassScheduleRequestDTO();
        request.setDay(" Monday ");
        request.setSlots(List.of(" Math - 08:00 ", "", " Physics - 10:00 "));

        ClassScheduleDayResponse response = classScheduleService.createDayPlan(1, request);

        ArgumentCaptor<ClassScheduleEntry> captor = ArgumentCaptor.forClass(ClassScheduleEntry.class);
        verify(classScheduleEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getDay()).isEqualTo("Monday");
        assertThat(response.getDay()).isEqualTo("Monday");
        assertThat(response.getSlots()).containsExactly("Math - 08:00", "Physics - 10:00");
    }

    @Test
    void createDayPlanShouldRejectUnknownClass() {
        when(schoolClassRepository.existsByIdAndTenantId(99, TENANT)).thenReturn(false);

        ClassScheduleRequestDTO request = new ClassScheduleRequestDTO();
        request.setDay("Monday");
        request.setSlots(List.of("Math - 08:00"));

        assertThatThrownBy(() -> classScheduleService.createDayPlan(99, request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteEntryShouldRemoveMatchingScheduleEntry() {
        SchoolClass schoolClass = SchoolClass.builder().id(1).tenantId(TENANT).name("3e A").build();
        when(classScheduleEntryRepository.findByIdAndTenantId(7L, TENANT)).thenReturn(java.util.Optional.of(
                ClassScheduleEntry.builder()
                        .id(7L)
                        .tenantId(TENANT)
                        .classId(1)
                        .day("Monday")
                        .slotOrder(1)
                        .slotText("Math - 08:00")
                        .build()
        ));
        when(schoolClassRepository.existsByIdAndTenantId(1, TENANT)).thenReturn(true);

        classScheduleService.deleteEntry(1, 7L);

        verify(classScheduleEntryRepository).delete(any(ClassScheduleEntry.class));
    }

    @Test
    void deleteEntryShouldRejectDifferentClassId() {
        when(classScheduleEntryRepository.findByIdAndTenantId(7L, TENANT)).thenReturn(java.util.Optional.of(
                ClassScheduleEntry.builder()
                        .id(7L)
                        .tenantId(TENANT)
                        .classId(2)
                        .day("Monday")
                        .slotOrder(1)
                        .slotText("Math - 08:00")
                        .build()
        ));
        when(schoolClassRepository.existsByIdAndTenantId(2, TENANT)).thenReturn(true);

        assertThatThrownBy(() -> classScheduleService.deleteEntry(1, 7L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(classScheduleEntryRepository, never()).delete(any());
    }
}

