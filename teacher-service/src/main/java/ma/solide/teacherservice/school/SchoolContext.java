package ma.solide.teacherservice.school;

public final class SchoolContext {

    private static final ThreadLocal<String> SCHOOL = new ThreadLocal<>();

    private SchoolContext() {
    }

    public static void setSchoolId(String schoolId) {
        SCHOOL.set(schoolId);
    }

    public static String getRequiredSchoolId() {
        String schoolId = SCHOOL.get();
        if (schoolId == null || schoolId.isBlank()) {
            throw new IllegalStateException("Missing school context");
        }
        return schoolId;
    }

    public static void clear() {
        SCHOOL.remove();
    }
}

