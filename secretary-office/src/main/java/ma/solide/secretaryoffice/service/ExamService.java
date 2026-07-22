package ma.solide.secretaryoffice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.ExamRequestDTO;
import ma.solide.secretaryoffice.dto.ExamResponseDTO;
import ma.solide.secretaryoffice.model.Exam;
import ma.solide.secretaryoffice.repository.ExamRepository;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<ExamResponseDTO> getAllExams() {
        return examRepository.findAllByOrderByDateAscStartTimeAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ExamResponseDTO getExam(Integer id) {
        return toResponse(findEntity(id));
    }

    public ExamResponseDTO createExam(ExamRequestDTO dto) {
        validate(dto);

        Exam exam = Exam.builder()
                .subject(dto.getSubject().trim())
                .className(dto.getClassName().trim())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .room(dto.getRoom().trim())
                .notes(StringUtils.hasText(dto.getNotes()) ? dto.getNotes().trim() : null)
                .build();

        return toResponse(examRepository.save(exam));
    }

    public ExamResponseDTO updateExam(Integer id, ExamRequestDTO dto) {
        validate(dto);

        Exam exam = findEntity(id);
        exam.setSubject(dto.getSubject().trim());
        exam.setClassName(dto.getClassName().trim());
        exam.setDate(dto.getDate());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setRoom(dto.getRoom().trim());
        exam.setNotes(StringUtils.hasText(dto.getNotes()) ? dto.getNotes().trim() : null);

        return toResponse(examRepository.save(exam));
    }

    public void deleteExam(Integer id) {
        findEntity(id);
        examRepository.deleteById(id);
    }

    private Exam findEntity(Integer id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found with id " + id));
    }

    private void validate(ExamRequestDTO dto) {
        if (!StringUtils.hasText(dto.getSubject())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }
        if (!StringUtils.hasText(dto.getClassName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "className is required");
        }
        if (dto.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        if (dto.getStartTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime is required");
        }
        if (dto.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime is required");
        }
        if (!StringUtils.hasText(dto.getRoom())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "room is required");
        }
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
    }

    private ExamResponseDTO toResponse(Exam exam) {
        return ExamResponseDTO.builder()
                .id(exam.getId())
                .subject(exam.getSubject())
                .className(exam.getClassName())
                .date(exam.getDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .room(exam.getRoom())
                .notes(exam.getNotes())
                .build();
    }
}

