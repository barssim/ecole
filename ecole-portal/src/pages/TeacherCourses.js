import React, { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", schedule: "", chapiter: [] });
  const [uploadingChapiter, setUploadingChapiter] = useState({ courseIndex: null, chapiterIndex: null });
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_GATEWAY_URL}/api/teachercourses?teacher=${userId}`
        );
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
        else console.warn("Unexpected API response:", data);
      } catch (err) {
        console.error("Error loading courses", err);
      }
    };
    fetchCourses();
  }, [userId]);

  const handleAddCourse = () => {
    if (!newCourse.name.trim() || !newCourse.schedule.trim()) return;
    setCourses(prev => [...prev, newCourse]);
    setNewCourse({ name: "", schedule: "", chapiter: [] });
  };

  const handleEditCourse = (index) => {
    const updatedName = prompt("Enter new course name:", courses[index]?.name);
    const updatedSchedule = prompt("Enter new schedule:", courses[index]?.schedule);
    if (updatedName && updatedSchedule) {
      setCourses(prev =>
        prev.map((course, i) =>
          i === index ? { ...course, name: updatedName, schedule: updatedSchedule } : course
        )
      );
    }
  };

  const handleRemoveCourse = (index) => {
    if (window.confirm("Are you sure you want to remove this course?")) {
      setCourses(prev => prev.filter((_, i) => i !== index));
    }
  };

const handleAddChapiter = (index) => {
  const title = prompt("Enter chapiter name:");
  if (title) {
    setCourses(prev => {
      const updated = [...prev];
      const course = updated[index];

      // Ensure chapiter is always an array
      course.chapiter = Array.isArray(course.chapiter) ? course.chapiter : [];

      course.chapiter.push({ title, materials: [] });
      return updated;
    });
  }
};


  const handleEditChapiter = (courseIndex, chapiterIndex) => {
    const currentChapiter = courses[courseIndex]?.chapiter?.[chapiterIndex];
    if (!currentChapiter) return;
    const newTitle = prompt("Enter new chapiter name:", currentChapiter.title);
    if (newTitle) {
      setCourses(prev => {
        const updated = [...prev];
        updated[courseIndex].chapiter[chapiterIndex].title = newTitle;
        return updated;
      });
    }
  };

  const handleRemoveChapiter = (courseIndex, chapiterIndex) => {
    if (window.confirm("Remove this chapiter?")) {
      setCourses(prev => {
        const updated = [...prev];
        updated[courseIndex].chapiter.splice(chapiterIndex, 1);
        return updated;
      });
    }
  };

  const handleUploadToChapiter = (courseIndex, chapiterIndex) => {
    setUploadingChapiter({ courseIndex, chapiterIndex });
  };

  const handleFileUploadSuccess = (courseIndex, chapiterIndex, fileData) => {
    setCourses(prev => {
      const updated = [...prev];
      updated[courseIndex].chapiter[chapiterIndex].materials.push(fileData);
      return updated;
    });
    setUploadingChapiter({ courseIndex: null, chapiterIndex: null });
  };

  return (
    <div className="teacher-courses">
      <h2>📚 Mes Cours</h2>
      <ul>
        {Array.isArray(courses) &&
          courses.map((course, idx) => (
            <li key={idx}>
              <strong>{course.name}</strong><br />
              🗓️ {course.schedule}
              <div style={{ marginLeft: "16px" }}>
                {Array.isArray(course.chapiter) &&
                  course.chapiter.map((chap, cIdx) => (
                    <div key={cIdx} style={{ marginTop: "8px" }}>
                      📘 <strong>{chap.title}</strong><br />
                      📎 Materials: {chap.materials?.length || 0}
                      <div>
                        <button onClick={() => handleEditChapiter(idx, cIdx)}>✏️ Edit Chapiter</button>
                        <button onClick={() => handleRemoveChapiter(idx, cIdx)}>🗑️ Remove Chapiter</button>
                        <button onClick={() => handleUploadToChapiter(idx, cIdx)}>📤 Upload Material</button>
                        {uploadingChapiter.courseIndex === idx &&
                          uploadingChapiter.chapiterIndex === cIdx && (
                            <FileUpload
                              filename={chap.title}
                              onUploadSuccess={(fileData) =>
                                handleFileUploadSuccess(idx, cIdx, fileData)
                              }
                            />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <button onClick={() => handleEditCourse(idx)}>✏️ Edit Course</button>
              <button onClick={() => handleAddChapiter(idx)}>➕ Add Chapiter</button>
              <button onClick={() => handleRemoveCourse(idx)}>🗑️ Remove Course</button>
            </li>
          ))}
      </ul>

      <hr />
      <h3>➕ Add New Course</h3>
      <input
        type="text"
        placeholder="Course name"
        value={newCourse.name}
        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Schedule"
        value={newCourse.schedule}
        onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
      />
      <button onClick={handleAddCourse}>Add Course</button>
    </div>
  );
};

export default TeacherCourses;
