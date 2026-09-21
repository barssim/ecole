package ma.solide.secretaryoffice.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import ma.solide.secretaryoffice.dto.ClassScheduleDayResponse;
import ma.solide.secretaryoffice.dto.ClassScheduleEntryResponse;
import ma.solide.secretaryoffice.dto.ClassScheduleRequestDTO;
import ma.solide.secretaryoffice.model.ClassScheduleEntry;
import ma.solide.secretaryoffice.repository.ClassScheduleEntryRepository;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;
import ma.solide.secretaryoffice.school.SchoolContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassScheduleService {

    private static final Map<String, Integer> DAY_ORDER = Map.of(
            "monday", 1,
            "tuesday", 2,
            "wednesday", 3,
            "thursday", 4,
            "friday", 5,
            "saturday", 6,
            "sunday", 7
    );

    private final ClassScheduleEntryRepository classScheduleEntryRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ClassScheduleService(ClassScheduleEntryRepository classScheduleEntryRepository,
                               SchoolClassRepository schoolClassRepository) {
        this.classScheduleEntryRepository = classScheduleEntryRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<ClassScheduleDayResponse> listSchedule(Integer classId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        ensureClassExists(classId, schoolId);
        List<ClassScheduleEntry> entries = classScheduleEntryRepository
                .findAllBySchoolIdAndClassIdOrderByDayAscSlotOrderAsc(schoolId, classId);
        return groupEntries(entries);
    }

    public ClassScheduleDayResponse createDayPlan(Integer classId, ClassScheduleRequestDTO request) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        ensureClassExists(classId, schoolId);

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getDay())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "day is required");
        }
        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at least one slot is required");
        }

        String day = request.getDay().trim();
        List<ClassScheduleEntry> existingEntries = classScheduleEntryRepository
                .findAllBySchoolIdAndClassIdOrderByDayAscSlotOrderAsc(schoolId, classId);
        List<String> createdSlots = new ArrayList<>();
        List<ClassScheduleEntry> savedEntries = new ArrayList<>();
        int order = existingEntries.stream()
                .filter(entry -> day.equalsIgnoreCase(StringUtils.hasText(entry.getDay()) ? entry.getDay().trim() : ""))
                .mapToInt(ClassScheduleEntry::getSlotOrder)
                .max()
                .orElse(0) + 1;
        for (String slot : request.getSlots()) {
            if (!StringUtils.hasText(slot)) {
                continue;
            }
            String slotText = slot.trim();
            ClassScheduleEntry savedEntry = classScheduleEntryRepository.save(ClassScheduleEntry.builder()
                    .schoolId(schoolId)
                    .classId(classId)
                    .day(day)
                    .slotOrder(order++)
                    .slotText(slotText)
                    .build());
            savedEntries.add(savedEntry);
            createdSlots.add(slotText);
        }

        if (createdSlots.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at least one non-empty slot is required");
        }

        return ClassScheduleDayResponse.builder()
                .day(day)
                .slots(createdSlots)
                .entries(savedEntries.stream().map(this::toEntryResponse).toList())
                .build();
    }

    public void deleteEntry(Integer classId, Long entryId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        ClassScheduleEntry entry = classScheduleEntryRepository.findByIdAndSchoolId(entryId, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found"));

        ensureClassExists(entry.getClassId(), schoolId);
        if (classId == null || !classId.equals(entry.getClassId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule entry not found");
        }
        classScheduleEntryRepository.delete(entry);
    }

    private void ensureClassExists(Integer classId, String schoolId) {
        if (classId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
        if (!schoolClassRepository.existsByIdAndSchoolId(classId, schoolId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Classe introuvable pour l'id " + classId);
        }
    }

    private List<ClassScheduleDayResponse> groupEntries(List<ClassScheduleEntry> entries) {
        Map<String, List<ClassScheduleEntry>> groupedByDay = new LinkedHashMap<>();
        List<ClassScheduleEntry> sorted = new ArrayList<>(entries);
        sorted.sort((left, right) -> {
            int dayCompare = Integer.compare(dayIndex(left.getDay()), dayIndex(right.getDay()));
            if (dayCompare != 0) {
                return dayCompare;
            }
            return Integer.compare(left.getSlotOrder(), right.getSlotOrder());
        });

        for (ClassScheduleEntry entry : sorted) {
            groupedByDay.computeIfAbsent(entry.getDay(), ignored -> new ArrayList<>()).add(entry);
        }

        List<ClassScheduleDayResponse> response = new ArrayList<>();
        for (Map.Entry<String, List<ClassScheduleEntry>> dayEntry : groupedByDay.entrySet()) {
            List<ClassScheduleEntry> dayEntries = dayEntry.getValue();
            response.add(ClassScheduleDayResponse.builder()
                    .day(dayEntry.getKey())
                    .slots(dayEntries.stream().map(ClassScheduleEntry::getSlotText).toList())
                    .entries(dayEntries.stream().map(this::toEntryResponse).toList())
                    .build());
        }
        return response;
    }

    private List<ClassScheduleEntryResponse> buildEntries(List<String> slots, List<ClassScheduleEntry> sourceEntries) {
        if (sourceEntries != null) {
            return sourceEntries.stream().map(this::toEntryResponse).toList();
        }
        List<ClassScheduleEntryResponse> entries = new ArrayList<>();
        for (int i = 0; i < slots.size(); i++) {
            entries.add(ClassScheduleEntryResponse.builder()
                    .id(null)
                    .slotOrder(i + 1)
                    .slotText(slots.get(i))
                    .build());
        }
        return entries;
    }

    private ClassScheduleEntryResponse toEntryResponse(ClassScheduleEntry entry) {
        return ClassScheduleEntryResponse.builder()
                .id(entry.getId())
                .slotOrder(entry.getSlotOrder())
                .slotText(entry.getSlotText())
                .build();
    }

    private int dayIndex(String dayName) {
        if (!StringUtils.hasText(dayName)) {
            return Integer.MAX_VALUE;
        }
        return DAY_ORDER.getOrDefault(dayName.trim().toLowerCase(Locale.ROOT), Integer.MAX_VALUE);
    }
}



