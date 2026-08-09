package ma.solide.studentservice.controller;

import java.util.List;

import ma.solide.studentservice.model.StudentScheduleEntry;
import ma.solide.studentservice.repository.StudentScheduleEntryRepository;
import ma.solide.studentservice.tenant.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentScheduleEntryRepository studentScheduleEntryRepository;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("gardinia");
        try {
            studentScheduleEntryRepository.deleteAll();
            studentScheduleEntryRepository.saveAll(List.of(
                    StudentScheduleEntry.builder()
                            .tenantId("gardinia")
                            .studentId("5")
                            .day("Monday")
                            .slotOrder(1)
                            .slotText("Math - 08:00")
                            .build(),
                    StudentScheduleEntry.builder()
                            .tenantId("gardinia")
                            .studentId("5")
                            .day("Monday")
                            .slotOrder(2)
                            .slotText("Physics - 10:00")
                            .build()
            ));
        } finally {
            TenantContext.clear();
        }
    }

    @Test
    void listScheduleReturnsGroupedDaySlotsForTenant() throws Exception {
        TenantContext.setTenantId("gardinia");
        try {
            mockMvc.perform(get("/api/studentschedule")
                            .header("X-Tenant-Id", "gardinia")
                            .param("user", "5")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$[0].day").value("Monday"))
                    .andExpect(jsonPath("$[0].slots[0]").value("Math - 08:00"))
                    .andExpect(jsonPath("$[0].slots[1]").value("Physics - 10:00"));
        } finally {
            TenantContext.clear();
        }
    }
}
