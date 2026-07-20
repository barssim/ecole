package ma.solide.secretaryoffice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.SchoolClassRequestDTO;
import ma.solide.secretaryoffice.dto.SchoolClassResponse;
import ma.solide.secretaryoffice.model.SchoolClass;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;

@ExtendWith(MockitoExtension.class)
class SchoolClassServiceTest {

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @InjectMocks
    private SchoolClassService schoolClassService;

    @Test
    void updateClassNameShouldPersistNewName() {
        SchoolClass existing = SchoolClass.builder().id(1).name("3e A").students(new java.util.ArrayList<>()).build();
        when(schoolClassRepository.findById(1)).thenReturn(java.util.Optional.of(existing));
        when(schoolClassRepository.existsByNameIgnoreCase("4e A")).thenReturn(false);
        when(schoolClassRepository.save(any(SchoolClass.class))).thenAnswer(inv -> inv.getArgument(0));

        SchoolClassRequestDTO dto = new SchoolClassRequestDTO();
        dto.setName(" 4e A ");

        SchoolClassResponse response = schoolClassService.updateClassName(1, dto);

        assertThat(response.getName()).isEqualTo("4e A");
        verify(schoolClassRepository).save(existing);
    }

    @Test
    void updateClassNameShouldAllowSameNameCaseInsensitive() {
        SchoolClass existing = SchoolClass.builder().id(1).name("3e A").students(new java.util.ArrayList<>()).build();
        when(schoolClassRepository.findById(1)).thenReturn(java.util.Optional.of(existing));
        when(schoolClassRepository.save(any(SchoolClass.class))).thenAnswer(inv -> inv.getArgument(0));

        SchoolClassRequestDTO dto = new SchoolClassRequestDTO();
        dto.setName("3E A"); // same name, different case → no conflict

        SchoolClassResponse response = schoolClassService.updateClassName(1, dto);
        assertThat(response.getName()).isEqualTo("3E A");
    }

    @Test
    void updateClassNameShouldRejectDuplicate() {
        SchoolClass existing = SchoolClass.builder().id(1).name("3e A").students(new java.util.ArrayList<>()).build();
        when(schoolClassRepository.findById(1)).thenReturn(java.util.Optional.of(existing));
        when(schoolClassRepository.existsByNameIgnoreCase("4e B")).thenReturn(true);

        SchoolClassRequestDTO dto = new SchoolClassRequestDTO();
        dto.setName("4e B");

        assertThatThrownBy(() -> schoolClassService.updateClassName(1, dto))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void deleteClassShouldCallRepositoryDeleteById() {
        when(schoolClassRepository.existsById(1)).thenReturn(true);
        doNothing().when(schoolClassRepository).deleteById(1);

        schoolClassService.deleteClass(1);

        verify(schoolClassRepository).deleteById(1);
    }

    @Test
    void deleteClassShouldThrowNotFoundForUnknownId() {
        when(schoolClassRepository.existsById(99)).thenReturn(false);

        assertThatThrownBy(() -> schoolClassService.deleteClass(99))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(schoolClassRepository, never()).deleteById(99);
    }

    @Test
    void createClassShouldPersistTrimmedDistinctStudents() {
        SchoolClassRequestDTO dto = new SchoolClassRequestDTO();
        dto.setName(" 4e A ");
        dto.setStudents(List.of(" Sara ", "", "Sara", " Youssef "));

        when(schoolClassRepository.existsByNameIgnoreCase("4e A")).thenReturn(false);
        when(schoolClassRepository.save(any(SchoolClass.class))).thenAnswer(invocation -> {
            SchoolClass schoolClass = invocation.getArgument(0);
            schoolClass.setId(12);
            return schoolClass;
        });

        SchoolClassResponse response = schoolClassService.createClass(dto);

        ArgumentCaptor<SchoolClass> captor = ArgumentCaptor.forClass(SchoolClass.class);
        verify(schoolClassRepository).save(captor.capture());
        SchoolClass saved = captor.getValue();

        assertThat(saved.getName()).isEqualTo("4e A");
        assertThat(saved.getStudents()).containsExactly("Sara", "Youssef");
        assertThat(response.getId()).isEqualTo(12);
        assertThat(response.getName()).isEqualTo("4e A");
        assertThat(response.getStudents()).containsExactly("Sara", "Youssef");
    }

    @Test
    void createClassShouldRejectDuplicateName() {
        SchoolClassRequestDTO dto = new SchoolClassRequestDTO();
        dto.setName("3e A");

        when(schoolClassRepository.existsByNameIgnoreCase("3e A")).thenReturn(true);

        assertThatThrownBy(() -> schoolClassService.createClass(dto))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }
}

