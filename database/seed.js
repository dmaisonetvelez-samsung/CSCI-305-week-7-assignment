const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'university.db');
const db = new sqlite3.Database(dbPath);

const sampleCourses = [
  ['Introduction to Computer Science', 'CS101', 'Basics of programming and algorithms.'],
  ['Web Development', 'CS202', 'Building modern web applications using HTML, CSS, and JS.'],
  ['Database Systems', 'CS303', 'Introduction to SQL and relational database design.'],
  ['Artificial Intelligence', 'CS404', 'Foundations of machine learning and neural networks.']
];

db.serialize(() => {
  const stmt = db.prepare(`INSERT INTO courses (name, code, description) VALUES (?, ?, ?)`);
  
  sampleCourses.forEach(course => {
    stmt.run(course, (err) => {
      if (err) {
        // Skip errors for duplicate codes if re-running seed
        if (!err.message.includes('UNIQUE constraint failed')) {
          console.error("Error seeding course:", err.message);
        }
      }
    });
  });

  stmt.finalize();
  console.log("Sample data seeded into university.db.");
});

db.close();
