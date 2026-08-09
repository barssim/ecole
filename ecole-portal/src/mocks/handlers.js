// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8085';

const getTenantId = (request) => (request.headers.get('X-Tenant-Id') || 'gardinia').toLowerCase();

const classesByTenant = {
  gardinia: [
    { id: 1, name: '3e A', students: ['Yassine', 'Majda', 'Karim'], teachers: ['Mme El Idrissi'] },
    { id: 2, name: '3e B', students: ['Sara', 'Nabil', 'Omar'], teachers: [] },
    { id: 3, name: 'Terminale C', students: ['Lina', 'Mohamed', 'Hajar'], teachers: ['M. Bensalah'] },
  ],
  qods: [
    { id: 11, name: '4ème A', students: ['Aya', 'Youssef'], teachers: [] },
    { id: 12, name: '4ème B', students: ['Salma', 'Othman'], teachers: ['Mme Rahmani'] },
  ],
};

const teachersByTenant = {
  gardinia: [
    { id: 8, name: 'Mme El Idrissi', username: 'teacher' },
    { id: 9, name: 'M. Bensalah', username: 'teacher2' },
    { id: 10, name: 'Mme Karimi', username: 'teacher3' },
  ],
  qods: [
    { id: 18, name: 'Mme Rahmani', username: 'teacher-qods-1' },
    { id: 19, name: 'M. Alami', username: 'teacher-qods-2' },
  ],
};

const classSchedulesByTenant = {
  gardinia: {
    1: [
      { id: 101, classId: 1, day: 'Monday', slotOrder: 1, slotText: 'Math - 08:00' },
      { id: 102, classId: 1, day: 'Monday', slotOrder: 2, slotText: 'Physics - 10:00' },
      { id: 103, classId: 1, day: 'Wednesday', slotOrder: 1, slotText: 'English - 09:00' },
    ],
    2: [
      { id: 201, classId: 2, day: 'Tuesday', slotOrder: 1, slotText: 'Biology - 08:30' },
      { id: 202, classId: 2, day: 'Thursday', slotOrder: 1, slotText: 'History - 10:30' },
    ],
    3: [
      { id: 301, classId: 3, day: 'Friday', slotOrder: 1, slotText: 'French - 08:00' },
      { id: 302, classId: 3, day: 'Friday', slotOrder: 2, slotText: 'Economics - 10:30' },
    ],
  },
  qods: {
    11: [
      { id: 1101, classId: 11, day: 'Monday', slotOrder: 1, slotText: 'Math - 08:00' },
      { id: 1102, classId: 11, day: 'Monday', slotOrder: 2, slotText: 'Arabic - 10:00' },
    ],
    12: [
      { id: 1201, classId: 12, day: 'Wednesday', slotOrder: 1, slotText: 'Science - 09:00' },
      { id: 1202, classId: 12, day: 'Thursday', slotOrder: 1, slotText: 'Art - 11:00' },
    ],
  },
};

const dayOrder = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const groupScheduleEntries = (entries) => {
  const grouped = [];
  const sorted = [...entries].sort((left, right) => {
    const leftDay = String(left.day || '').trim().toLowerCase();
    const rightDay = String(right.day || '').trim().toLowerCase();
    const dayCompare = (dayOrder[leftDay] || Number.MAX_SAFE_INTEGER) - (dayOrder[rightDay] || Number.MAX_SAFE_INTEGER);
    if (dayCompare !== 0) return dayCompare;
    return (left.slotOrder || 0) - (right.slotOrder || 0);
  });

  sorted.forEach((entry) => {
    if (!grouped.some((item) => item.day === entry.day)) {
      grouped.push({ day: entry.day, slots: [], entries: [] });
    }
    const dayGroup = grouped.find((item) => item.day === entry.day);
    dayGroup.slots.push(entry.slotText);
    dayGroup.entries.push({ id: entry.id, slotOrder: entry.slotOrder, slotText: entry.slotText });
  });

  return grouped;
};

const findStudentClass = (tenantId, studentName) => {
  const normalized = String(studentName || '').trim().toLowerCase();
  if (!normalized) return null;
  return (classesByTenant[tenantId] || []).find((schoolClass) =>
    (schoolClass.students || []).some((student) => String(student || '').trim().toLowerCase() === normalized)
  ) || null;
};

const getClassScheduleStore = (tenantId) => {
  if (!classSchedulesByTenant[tenantId]) {
    classSchedulesByTenant[tenantId] = {};
  }
  return classSchedulesByTenant[tenantId];
};

const getNextScheduleId = (tenantId) => {
  const schedules = getClassScheduleStore(tenantId);
  return Object.values(schedules)
    .flat()
    .reduce((maxId, entry) => Math.max(maxId, Number(entry.id) || 0), 0) + 1;
};

const examsByTenant = {
  gardinia: [
    { id: 1, subject: 'Mathématiques', className: '3e A', date: '2025-07-22', startTime: '09:00', endTime: '11:00', room: 'Salle 101' },
    { id: 2, subject: 'Physique', className: '3e A', date: '2025-07-23', startTime: '13:00', endTime: '15:00', room: 'Salle 202' },
    { id: 3, subject: "l'arabe", className: '3e B', date: '2025-07-24', startTime: '08:30', endTime: '10:30', room: 'Salle 103' },
  ],
  qods: [
    { id: 11, subject: 'Mathématiques', className: '4ème A', date: '2025-07-25', startTime: '10:00', endTime: '12:00', room: 'Salle 1' },
    { id: 12, subject: 'Français', className: '4ème B', date: '2025-07-26', startTime: '08:30', endTime: '10:00', room: 'Salle 2' },
  ],
};

const attestationsByTenant = {
  gardinia: [
    {
      id: 1,
      userId: 5,
      studentName: 'Assil',
      className: '3e A',
      title: "Attestation de scolarité",
      type: 'enrollment',
      date: '2024-09-01',
      status: 'approved',
      documentUrl: '/documents/attestation-scolarite-5-2024.pdf',
      viewUrl: '/api/attestations/1/view',
      issuedBy: "Directeur de l'école",
      validFrom: '2024-09-01',
      validUntil: '2025-08-31',
      reference: 'ATT-2024-001-5',
    },
    {
      id: 2,
      userId: 5,
      studentName: 'Assil',
      className: '3e A',
      title: 'Attestation de présence',
      type: 'attendance',
      date: '2025-01-15',
      status: 'approved',
      documentUrl: '/documents/attestation-presence-5-2025.pdf',
      viewUrl: '/api/attestations/2/view',
      issuedBy: 'Coordinatrice pédagogique',
      validFrom: '2025-01-01',
      validUntil: '2025-12-31',
      reference: 'ATT-2025-002-5',
    },
    {
      id: 3,
      userId: 5,
      studentName: 'Assil',
      className: '3e A',
      title: "Attestation d'inscription",
      type: 'registration',
      date: '2025-03-22',
      status: 'pending',
      documentUrl: null,
      viewUrl: null,
      issuedBy: 'En attente de validation',
      validFrom: '2025-03-22',
      validUntil: '2026-03-22',
      reference: 'ATT-2025-003-5',
    },
    {
      id: 4,
      userId: 6,
      studentName: 'Barae',
      className: '3e B',
      title: "Attestation de scolarité",
      type: 'enrollment',
      date: '2024-09-01',
      status: 'approved',
      documentUrl: '/documents/attestation-scolarite-6-2024.pdf',
      viewUrl: '/api/attestations/4/view',
      issuedBy: "Directeur de l'école",
      validFrom: '2024-09-01',
      validUntil: '2025-08-31',
      reference: 'ATT-2024-001-6',
    },
  ],
};

const getAttestationStore = (tenantId) => {
  if (!attestationsByTenant[tenantId]) {
    attestationsByTenant[tenantId] = [];
  }
  return attestationsByTenant[tenantId];
};

const getNextAttestationId = (tenantId) =>
  getAttestationStore(tenantId).reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;

export const handlers = [
  // 💳 Handler for a payment notice
  http.get(`${BASE_URL}/api/paymentNotice`, () => {
    return HttpResponse.json({
      id: 1,
      invoiceNumber: 'INV-2025-07-001',
      invoiceDate: '2025-07-06',
      dueDate: '2025-07-15',
      studentName: 'Yasmine El Idrissi',
      className: '5ème année',
      totalAmount: 1500,
      currency: 'MAD',
      status: 'pending',
      paidDate: null,
    });
  }),

  // 📄 Handler for payment history
  http.get(`${BASE_URL}/api/payments`, () => {
    return HttpResponse.json([
      {
        id: 1,
        paymentDate: '2025-07-01',
        studentName: 'Yasmine El Idrissi',
        className: '5ème année',
        amount: 1500,
        currency: 'MAD',
        method: 'Espèces',
        reference: 'PAY-2025-07-001',
        notes: null,
      },
      {
        id: 2,
        paymentDate: '2025-06-15',
        studentName: 'Yasmine El Idrissi',
        className: '5ème année',
        amount: 1200,
        currency: 'MAD',
        method: 'Carte bancaire',
        reference: 'PAY-2025-06-001',
        notes: null,
      },
    ]);
  }),

  // 💳 Handler for creating a payment
  http.post(`${BASE_URL}/api/payments`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Math.floor(Math.random() * 10000),
      ...body,
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
    }, { status: 201 });
  }),

  // 📋 Handler for creating a payment notice
  http.post(`${BASE_URL}/api/paymentNotices`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Math.floor(Math.random() * 10000),
      invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`,
      ...body,
      status: 'pending',
    }, { status: 201 });
  }),

  // 👩‍🏫 Handler for professor presence
  http.get(`${BASE_URL}/api/presence/professors`, () => {
    return HttpResponse.json([
      {
        name: 'Mme El Idrissi',
        scheduledTime: '08:00',
        checkInTime: '08:01',
        status: 'Present',
      },
      {
        name: 'M. Bensalah',
        scheduledTime: '09:00',
        checkInTime: null,
        status: 'Absent',
      },
    ]);
  }),

  // 🧪 Handler for upcoming exams
  http.get(`${BASE_URL}/api/exams`, ({ request }) => {
    const tenantId = getTenantId(request);
    return HttpResponse.json(examsByTenant[tenantId] || examsByTenant.gardinia);
  }),

   // 🧪 Handler for classes
    http.get(`${BASE_URL}/api/classes`, ({ request }) => {
      const tenantId = getTenantId(request);
      return HttpResponse.json(classesByTenant[tenantId] || classesByTenant.gardinia);
    }),

    http.get(`${BASE_URL}/api/users/teachers`, ({ request }) => {
      const tenantId = getTenantId(request);
      return HttpResponse.json(teachersByTenant[tenantId] || teachersByTenant.gardinia);
    }),

    http.post(`${BASE_URL}/api/classes/:id/teachers`, async ({ request, params }) => {
      const tenantId = getTenantId(request);
      const body = await request.json();
      const classId = Number(params.id);
      const teacherName = String(body?.name || '').trim();
      const classList = classesByTenant[tenantId] || classesByTenant.gardinia;
      const schoolClass = classList.find((cls) => cls.id === classId);

      if (!schoolClass || !teacherName) {
        return HttpResponse.json({ message: 'Classe ou enseignant introuvable' }, { status: 404 });
      }

      if ((schoolClass.teachers || []).some((teacher) => teacher.toLowerCase() === teacherName.toLowerCase())) {
        return HttpResponse.json({ message: `L'enseignant '${teacherName}' est déjà dans cette classe` }, { status: 409 });
      }

      schoolClass.teachers = [...(schoolClass.teachers || []), teacherName];
      return HttpResponse.json(schoolClass);
    }),

    http.delete(`${BASE_URL}/api/classes/:id/teachers/:teacherName`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const classId = Number(params.id);
      const teacherName = decodeURIComponent(String(params.teacherName || ''));
      const classList = classesByTenant[tenantId] || classesByTenant.gardinia;
      const schoolClass = classList.find((cls) => cls.id === classId);

      if (!schoolClass) {
        return HttpResponse.json({ message: 'Classe introuvable' }, { status: 404 });
      }

      const before = (schoolClass.teachers || []).length;
      schoolClass.teachers = (schoolClass.teachers || []).filter((teacher) => teacher.toLowerCase() !== teacherName.toLowerCase());

      if (schoolClass.teachers.length === before) {
        return HttpResponse.json({ message: `Enseignant '${teacherName}' introuvable dans cette classe` }, { status: 404 });
      }

      return HttpResponse.json(schoolClass);
    }),

    http.get(`${BASE_URL}/api/classes/:id/schedule`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const classId = Number(params.id);
      const classList = classesByTenant[tenantId] || classesByTenant.gardinia;
      const schoolClass = classList.find((cls) => cls.id === classId);

      if (!schoolClass) {
        return HttpResponse.json({ message: 'Classe introuvable' }, { status: 404 });
      }

      const classSchedule = (getClassScheduleStore(tenantId)[classId] || []);
      return HttpResponse.json(groupScheduleEntries(classSchedule));
    }),

    http.post(`${BASE_URL}/api/classes/:id/schedule`, async ({ request, params }) => {
      const tenantId = getTenantId(request);
      const classId = Number(params.id);
      const body = await request.json();
      const classList = classesByTenant[tenantId] || classesByTenant.gardinia;
      const schoolClass = classList.find((cls) => cls.id === classId);
      const day = String(body?.day || '').trim();
      const slots = Array.isArray(body?.slots) ? body.slots.map((slot) => String(slot || '').trim()).filter(Boolean) : [];

      if (!schoolClass) {
        return HttpResponse.json({ message: 'Classe introuvable' }, { status: 404 });
      }
      if (!day) {
        return HttpResponse.json({ message: 'day is required' }, { status: 400 });
      }
      if (slots.length === 0) {
        return HttpResponse.json({ message: 'at least one slot is required' }, { status: 400 });
      }

      const schedules = getClassScheduleStore(tenantId);
      const existing = schedules[classId] || [];
      const nextId = getNextScheduleId(tenantId);
      const nextOrder = existing
        .filter((entry) => String(entry.day || '').trim().toLowerCase() === day.toLowerCase())
        .reduce((maxOrder, entry) => Math.max(maxOrder, Number(entry.slotOrder) || 0), 0) + 1;
      const createdEntries = slots.map((slotText, index) => ({
        id: nextId + index,
        classId,
        day,
        slotOrder: nextOrder + index,
        slotText,
      }));

      schedules[classId] = [...existing, ...createdEntries];
      return HttpResponse.json(groupScheduleEntries(createdEntries)[0]);
    }),

    http.delete(`${BASE_URL}/api/classes/:id/schedule/:entryId`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const classId = Number(params.id);
      const entryId = Number(params.entryId);
      const schedules = getClassScheduleStore(tenantId);
      const classEntries = schedules[classId] || [];
      const nextEntries = classEntries.filter((entry) => entry.id !== entryId);

      if (nextEntries.length === classEntries.length) {
        return HttpResponse.json({ message: 'Schedule entry not found' }, { status: 404 });
      }

      schedules[classId] = nextEntries;
      return new HttpResponse(null, { status: 204 });
    }),

    // 🧪 Handler for teacher courses
    http.get(`${BASE_URL}/api/teachercourses`, () => {
    const userId = localStorage.getItem("userId");
    const teachercourses = {
    "8": [
      {
        "name": "l'Algèbre",
        "language": "Les nombres rationels",
        "schedule": "Lundi - 08:00"
      },
      {
        "name": "La Geométrie",
        "language": "le calcul des surfaces",
        "schedule": "Mercredi - 10:30"
      }
    ],
    "9": [
          {
            "name": "Grammaire",
            "language": "l'adjectiv qualificatif ",
            "schedule": "Lundi - 08:00"
          },
          {
            "name": "la conjugaison",
            "language": "le passé simple",
            "schedule": "Mercredi - 10:30"
          }
        ]
     };

     const course = teachercourses[userId] || [];

     return HttpResponse.json(course);
   }),


// 🧪 Handler for schedule
http.get(`${BASE_URL}/api/studentschedule`, ({ request }) => {
  const userId = localStorage.getItem("userId");
  const studentName = localStorage.getItem("LoggedIn") || localStorage.getItem("userName") || localStorage.getItem("username") || '';
  const tenantId = getTenantId(request);

  const matchedClass = findStudentClass(tenantId, studentName);
  if (matchedClass) {
    const schedule = getClassScheduleStore(tenantId)[matchedClass.id] || [];
    return HttpResponse.json(groupScheduleEntries(schedule));
  }

  const userSchedules = {
    "5": [
      { day: "Monday", slots: ["Math - 08:00", "Physics - 10:00", "English - 13:00"] },
      { day: "Tuesday", slots: ["Biology - 09:00", "History - 11:00", "Sport - 15:00"] }
    ],
    "6": [
      { day: "Wednesday", slots: ["Chemistry - 08:30", "Arabic - 10:30", "Arts - 14:00"] },
      { day: "Thursday", slots: ["Geography - 09:00", "Ethics - 11:30", "Coding - 16:00"] }
    ],
    "7": [
      { day: "Friday", slots: ["French - 08:00", "Economics - 10:30", "Club Hour - 13:30"] }
    ]
  };

  const schedule = userSchedules[userId] || [];

  return HttpResponse.json(schedule);
}),

 // 🧪 Handler for attestations
   http.get(`${BASE_URL}/api/attestations`, ({ request }) => {
     const tenantId = getTenantId(request);
     const requestedUserId = request.url.searchParams.get('userId');
     const search = (request.url.searchParams.get('search') || '').toLowerCase();
     let attestations = [...getAttestationStore(tenantId)];

     if (requestedUserId) {
       attestations = attestations.filter((item) => String(item.userId) === requestedUserId);
     }

     if (search) {
       attestations = attestations.filter((item) => String(item.title || '').toLowerCase().includes(search));
     }

     return HttpResponse.json(attestations);
   }),

    // 🎓 Handler for production attestations (detailed, user-specific)
    http.get(`${BASE_URL}/api/attestationsproduction`, ({ request }) => {
      const tenantId = getTenantId(request);
      return HttpResponse.json(getAttestationStore(tenantId));
    }),

    // 📋 Handler for student attestation request (POST)
    http.post(`${BASE_URL}/api/attestations/request`, async ({ request }) => {
      const body = await request.json();
      const { userId, studentName, className, type } = body;

      if (!userId || !type) {
        return new HttpResponse("userId et type sont requis", { status: 400 });
      }

      const TYPE_TITLES = {
        enrollment:   "Attestation de scolarité",
        attendance:   "Attestation de présence",
        conduct:      "Attestation de bonne conduite",
        academic:     "Attestation de résultats académiques",
        registration: "Attestation d'inscription",
      };

      if (!TYPE_TITLES[type]) {
        return new HttpResponse("Type invalide", { status: 400 });
      }

      const tenantId = getTenantId(request);
      const today = new Date().toISOString().split('T')[0];
      const mockId = getNextAttestationId(tenantId);
      const reference = `REQ-${today.replace(/-/g,'')}${userId}-${type.substring(0,3).toUpperCase()}`;

      const created = {
        id: mockId,
        userId: userId,
        studentName: studentName || `Étudiant ${userId}`,
        className: className || '-',
        title: TYPE_TITLES[type],
        type: type,
        date: today,
        status: 'pending',
        documentUrl: null,
        viewUrl: null,
        issuedBy: 'En attente de validation',
        validFrom: today,
        validUntil: null,
        reference: reference,
      };

      getAttestationStore(tenantId).unshift(created);

      return HttpResponse.json(created, { status: 201 });
    }),

    http.patch(`${BASE_URL}/api/attestations/:id/approve`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const attestation = getAttestationStore(tenantId).find((item) => item.id === Number(params.id));
      if (!attestation) {
        return new HttpResponse(null, { status: 404 });
      }
      attestation.status = 'approved';
      attestation.issuedBy = 'Traitée par secrétariat';
      return HttpResponse.json(attestation);
    }),

    http.patch(`${BASE_URL}/api/attestations/:id/cancel`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const attestation = getAttestationStore(tenantId).find((item) => item.id === Number(params.id));
      if (!attestation) {
        return new HttpResponse(null, { status: 404 });
      }
      attestation.status = 'rejected';
      attestation.issuedBy = 'Traitée par secrétariat';
      return HttpResponse.json(attestation);
    }),

    http.delete(`${BASE_URL}/api/attestations/:id`, ({ request, params }) => {
      const tenantId = getTenantId(request);
      const store = getAttestationStore(tenantId);
      const index = store.findIndex((item) => item.id === Number(params.id));
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }
      store.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),

    // 🔐 Handler for login authentication with roles
    http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
      const { username, password } = await request.json();

      if (username === 'admin' && password === 'adminpass') {
        return HttpResponse.json({
          token: 'mock-admin-token',
          user: {
            id: 2,
            username: 'admin',
            roles: ['admin']
          }
        });
      }
      if (username === 'manager' && password === 'managerpass') {
              return HttpResponse.json({
                token: 'mock-admin-token',
                user: {
                  id: 1,
                  username: 'manager',
                  roles: ['manager']
                }
              });
            }
            if (username === 'finance' && password === 'financepass') {
                          return HttpResponse.json({
                            token: 'mock-admin-token',
                            user: {
                              id: 1,
                              username: 'finance',
                              roles: ['finance']
                            }
                          });
                        }
        if (username === 'parent' && password === 'parentpass') {
                    return HttpResponse.json({
                      token: 'mock-admin-token',
                      user: {
                        id: 3,
                        username: 'parent',
                        roles: ['parent']
                      }
                    });
                  }
        if (username === 'teacher' && password === 'teacherpass') {
                            return HttpResponse.json({
                              token: 'mock-admin-token',
                              user: {
                                id: 4,
                                username: 'teacher',
                                roles: ['teacher']
                              }
                            });
                          }

      if (username === 'Assil' && password === 'assil') {
        return HttpResponse.json({
          token: 'mock-user-token',
          user: {
            id: 5,
            username: 'Assil',
            roles: ['student']
          }
        });
      }
       if (username === 'Barae' && password === 'barae') {
              return HttpResponse.json({
                token: 'mock-user-token',
                user: {
                  id: 6,
                  username: 'Barae',
                  roles: ['student']
                }
              });
            }
       if (username === 'Tasnim' && password === 'tasnim') {
                     return HttpResponse.json({
                       token: 'mock-user-token',
                       user: {
                         id: 7,
                         username: 'Tasnim',
                         roles: ['student']
                       }
                     });
                   }
                          if (username === 'Aziz' && password === 'aziz') {
                                                    return HttpResponse.json({
                                                      token: 'mock-user-token',
                                                      user: {
                                                        id: 9,
                                                        username: 'Aziz',
                                                        roles: ['teacher']
                                                      }
                                                    });
                                                  }
      return new HttpResponse(null, { status: 401 });
    }),

    // 🔐 Handler for user registration with role assignment
    http.post(`${BASE_URL}/api/auth/register`, async ({ request }) => {
      const { surname, firstname, email, adresse, password, roles } = await request.json();

      // Validate required fields
      if (!surname || !firstname || !email || !password || !roles || roles.length === 0) {
        return new HttpResponse("Missing required fields", { status: 400 });
      }

      // Generate a mock user ID
      const userId = Math.floor(Math.random() * 10000);

      // Return success response with token and user info including role
      return HttpResponse.json({
        token: `mock-registration-token-${userId}`,
        user: {
          id: userId,
          username: email.split('@')[0], // Use email prefix as username
          email: email,
          surname: surname,
          firstname: firstname,
          adresse: adresse,
          roles: roles // Return the assigned roles
        }
      }, { status: 201 });
    }),

http.post("/api/upload", async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new HttpResponse("Missing file", { status: 400 });
    }

    return HttpResponse.json({
      filename: file.name,
      url: `/uploads/${file.name}`,
    });
  }),

];
