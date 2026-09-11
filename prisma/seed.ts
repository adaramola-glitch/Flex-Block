import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function isoDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

/** Next occurrence of `offset` weekdays from today, skipping weekends. */
function nextWeekday(count: number): string {
  const d = new Date();
  let added = 0;
  while (added < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

async function main() {
  const admin = await db.user.upsert({
    where: { email: "adaramola@davincischools.org" },
    update: {},
    create: {
      email: "adaramola@davincischools.org",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const teacherRivera = await db.user.upsert({
    where: { email: "teacher@davincischools.org" },
    update: {},
    create: {
      email: "teacher@davincischools.org",
      name: "Sam Rivera",
      role: "TEACHER",
    },
  });

  const teacherLee = await db.user.upsert({
    where: { email: "teacher2@davincischools.org" },
    update: {},
    create: {
      email: "teacher2@davincischools.org",
      name: "Jordan Lee",
      role: "TEACHER",
    },
  });

  const students = [];
  const studentNames = [
    "Ava Thompson",
    "Noah Martinez",
    "Mia Chen",
    "Liam Patel",
    "Zoe Johnson",
    "Ethan Garcia",
  ];
  for (let i = 0; i < studentNames.length; i++) {
    const student = await db.user.upsert({
      where: { email: `student${i + 1}@davincischools.org` },
      update: {},
      create: {
        email: `student${i + 1}@davincischools.org`,
        name: studentNames[i],
        role: "STUDENT",
      },
    });
    students.push(student);
  }

  const today = isoDate(0);
  const day1 = nextWeekday(1);
  const day2 = nextWeekday(2);

  // A session today with a booking + attendance already marked, so reports
  // have something to show immediately.
  const todaySession = await db.flexSession.create({
    data: {
      title: "Study Hall",
      description: "Quiet space to work independently.",
      date: today,
      startTime: "10:30",
      endTime: "11:00",
      room: "Library",
      capacity: 30,
      hostId: teacherLee.id,
    },
  });

  const todayBooking = await db.booking.create({
    data: {
      sessionId: todaySession.id,
      studentId: students[0].id,
      date: today,
    },
  });

  await db.attendance.create({
    data: {
      bookingId: todayBooking.id,
      present: true,
      markedById: teacherLee.id,
    },
  });

  await db.flexSession.create({
    data: {
      title: "Algebra II Help Session",
      description: "Bring your questions from this week's homework.",
      date: day1,
      startTime: "10:30",
      endTime: "11:00",
      room: "Room 204",
      capacity: 15,
      hostId: teacherRivera.id,
    },
  });

  await db.flexSession.create({
    data: {
      title: "Yearbook Club",
      description: "Layout work for the spring edition.",
      date: day1,
      startTime: "10:30",
      endTime: "11:00",
      room: "Library",
      capacity: 25,
      hostId: teacherLee.id,
    },
  });

  await db.flexSession.create({
    data: {
      title: "Missing Work Catch-Up",
      description: "Required session for students with missing assignments.",
      date: day1,
      startTime: "10:30",
      endTime: "11:00",
      room: "Room 110",
      capacity: 10,
      mandatory: true,
      hostId: teacherRivera.id,
    },
  });

  await db.flexSession.create({
    data: {
      title: "Chemistry Lab Make-up",
      description: "Make up the titration lab from Tuesday.",
      date: day2,
      startTime: "10:30",
      endTime: "11:00",
      room: "Room 118",
      capacity: 12,
      hostId: teacherRivera.id,
    },
  });

  await db.flexSession.create({
    data: {
      title: "Chess Club",
      description: "All levels welcome.",
      date: day2,
      startTime: "10:30",
      endTime: "11:00",
      room: "Room 220",
      capacity: 20,
      hostId: teacherLee.id,
    },
  });

  console.log("Seed complete:");
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Teachers: ${teacherRivera.email}, ${teacherLee.email}`);
  console.log(`  Students: ${students.map((s) => s.email).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
