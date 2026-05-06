// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8085';

export const handlers = [
  // 💳 Handler for a payment notice
  http.get(`${BASE_URL}/api/paymentNotice`, () => {
    return HttpResponse.json({
      invoiceNumber: 'INV-2025-07-001',
      invoiceDate: '2025-07-06',
      dueDate: '2025-07-15',
      recipient: 'Yasmine El Idrissi',
      class: '5ème année',
      items: [
        { label: 'Tuition - July', amount: 1000 },
        { label: 'Books & Materials', amount: 300 },
        { label: 'Transport', amount: 200 },
      ],
      total: 1500,
      currency: 'MAD',
    });
  }),

  // 📄 Handler for payment history
  http.get(`${BASE_URL}/api/payments`, () => {
    return HttpResponse.json([
      {
        date: '2025-07-01',
        studentName: 'Amira B.',
        amount: '1500',
        currency: 'MAD',
        method: 'Espèces',
      },
      {
        date: '2025-06-15',
        studentName: 'Omar L.',
        amount: '1200',
        currency: 'MAD',
        method: 'Carte bancaire',
      },
    ]);
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
  http.get(`${BASE_URL}/api/exams`, () => {
    return HttpResponse.json([
      {
        subject: 'Mathématiques',
        className: '3e A',
        date: '2025-07-22',
        startTime: '09:00',
        endTime: '11:00',
        room: 'Salle 101',
      },
      {
        subject: 'Physique',
        className: '3e A',
        date: '2025-07-23',
        startTime: '13:00',
        endTime: '15:00',
        room: 'Salle 202',
      },
      {
        subject: "l'arabe",
        className: '3e B',
        date: '2025-07-24',
        startTime: '08:30',
        endTime: '10:30',
        room: 'Salle 103',
      },
    ]);
  }),

   // 🧪 Handler for classes
    http.get(`${BASE_URL}/api/classes`, () => {
      return HttpResponse.json([
      {
        id: 1,
        name: "3e A",
        students: ["Yassine", "Majda", "Karim"]
      },
      {
        id: 2,
        name: "3e B",
        students: ["Sara", "Nabil", "Omar"]
      },
      {
        id: 3,
        name: "Terminale C",
        students: ["Lina", "Mohamed", "Hajar"]
      }
    ]);
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
http.get(`${BASE_URL}/api/studentschedule`, () => {
  const userId = localStorage.getItem("userId");

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
    http.get(`${BASE_URL}/api/attestations`, () => {
      return HttpResponse.json([
      { id: 1, title: "Attestation de scolarité", date: "2024-09-01" },
         { id: 2, title: "Attestation de présence", date: "2025-01-15" },
         { id: 3, title: "Attestation d’inscription", date: "2025-03-22" }
       ]);
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
