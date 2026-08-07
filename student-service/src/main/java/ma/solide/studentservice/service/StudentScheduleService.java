package ma.solide.studentservice.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import ma.solide.studentservice.dto.StudentScheduleDayResponse;
import ma.solide.studentservice.dto.StudentScheduleRequest;
import ma.solide.studentservice.model.StudentScheduleEntry;
import ma.solide.studentservice.repository.StudentScheduleEntryRepository;
import ma.solide.studentservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentScheduleService {

    private static final Map<String, Integer> DAY_ORDER = Map.of(
            "monday", 1,
            "tuesday", 2,
            "wednesday", 3,
            "thursday", 4,
            "friday", 5,
            "saturday", 6,
            "sunday", 7
    );

    private final StudentScheduleEntryRepository studentScheduleEntryRepository;

    public StudentScheduleService(StudentScheduleEntryRepository studentScheduleEntryRepository) {
        this.studentScheduleEntryRepository = studentScheduleEntryRepository;
    }

    public List<StudentScheduleDayResponse> listSchedule(String studentId) {
        String tenantId = TenantContext.getRequiredTenantId();
        List<StudentScheduleEntry> entries;
        if (StringUtils.hasText(studentId)) {
            entries = studentScheduleEntryRepository.findAllByTenantIdAndStudentIdOrderByDayAscSlotOrderAsc(
                    tenantId,
                    studentId.trim()
            );
        } else {
            entries = studentScheduleEntryRepository.findAllByTenantIdOrderByStudentIdAscDayAscSlotOrderAsc(tenantId);
        }

        entries.sort((left, right) -> {
            int dayCompare = Integer.compare(dayIndex(left.getDay()), dayIndex(right.getDay()));
            if (dayCompare != 0) {
                return dayCompare;
            }
            return Integer.compare(left.getSlotOrder(), right.getSlotOrder());
        });

        Map<String, List<String>> groupedByDay = new LinkedHashMap<>();
        for (StudentScheduleEntry entry : entries) {
            groupedByDay.computeIfAbsent(entry.getDay(), ignored -> new ArrayList<>()).add(entry.getSlotText());
        }

        List<StudentScheduleDayResponse> response = new ArrayList<>();
        for (Map.Entry<String, List<String>> dayEntry : groupedByDay.entrySet()) {
            response.add(StudentScheduleDayResponse.builder().day(dayEntry.getKey()).slots(dayEntry.getValue()).build());
        }
        return response;
    }

    public StudentScheduleDayResponse createDayPlan(StudentScheduleRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
        }
        if (!StringUtils.hasText(request.getDay())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "day is required");
        }
        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at least one slot is required");
        }

        List<String> createdSlots = new ArrayList<>();
        int order = 1;
        for (String slot : request.getSlots()) {
            if (!StringUtils.hasText(slot)) {
                continue;
            }
            String slotText = slot.trim();
            studentScheduleEntryRepository.save(StudentScheduleEntry.builder()
                    .tenantId(tenantId)
                    .studentId(request.getStudentId().trim())
                    .day(request.getDay().trim())
                    .slotOrder(order++)
                    .slotText(slotText)
                    .build());
            createdSlots.add(slotText);
        }

        if (createdSlots.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at least one non-empty slot is required");
        }

        return StudentScheduleDayResponse.builder().day(request.getDay().trim()).slots(createdSlots).build();
    }

    public void deleteEntry(Long entryId) {
        String tenantId = TenantContext.getRequiredTenantId();
        StudentScheduleEntry entry = studentScheduleEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found"));

        if (!tenantId.equals(entry.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found");
        }

        studentScheduleEntryRepository.delete(entry);
    }

    private int dayIndex(String dayName) {
        if (!StringUtils.hasText(dayName)) {
            return Integer.MAX_VALUE;
        }
        return DAY_ORDER.getOrDefault(dayName.trim().toLowerCase(Locale.ROOT), Integer.MAX_VALUE);
    }
}

