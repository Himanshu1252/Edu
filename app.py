import os
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'dev-secret-key-super-secure'
DATABASE = 'database.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_number TEXT NOT NULL,
            branch TEXT NOT NULL,
            admin_id INTEGER NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES admins (id),
            UNIQUE (roll_number, admin_id)
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_number TEXT NOT NULL,
            subject TEXT NOT NULL,
            marks INTEGER NOT NULL,
            admin_id INTEGER NOT NULL,
            FOREIGN KEY (roll_number, admin_id) REFERENCES students (roll_number, admin_id),
            FOREIGN KEY (admin_id) REFERENCES admins (id),
            UNIQUE (roll_number, subject, admin_id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            flash("Please log in to access the dashboard.", "error")
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin_register', methods=['POST'])
def admin_register():
    username = request.form['username'].strip().lower()
    password = request.form['password']
    
    if len(username) < 3 or len(password) < 4:
        flash('Username and Password must be longer.', 'error')
        return redirect(url_for('index'))
        
    password_hash = generate_password_hash(password)
    
    conn = get_db()
    try:
        conn.execute('INSERT INTO admins (username, password_hash) VALUES (?, ?)', (username, password_hash))
        conn.commit()
        flash('Admin account created successfully! You can now log in.', 'success')
    except sqlite3.IntegrityError:
        flash('Username already exists. Please choose a different one.', 'error')
    finally:
        conn.close()
        
    return redirect(url_for('index'))

@app.route('/admin_login', methods=['POST'])
def admin_login():
    username = request.form['username'].strip().lower()
    password = request.form['password']
    
    conn = get_db()
    admin = conn.execute('SELECT * FROM admins WHERE username = ?', (username,)).fetchone()
    conn.close()
    
    if admin and check_password_hash(admin['password_hash'], password):
        session['admin_id'] = admin['id']
        session['admin_username'] = admin['username']
        flash('Logged in successfully.', 'success')
        return redirect(url_for('admin'))
        
    flash('Invalid username or password', 'error')
    return redirect(url_for('index'))

@app.route('/student_login', methods=['POST'])
def student_login():
    roll_number = request.form['roll_number'].strip()
    
    conn = get_db()
    # Find most recently created student for this roll number 
    student = conn.execute('SELECT * FROM students WHERE roll_number = ? ORDER BY id DESC', (roll_number,)).fetchone()
    conn.close()
    
    if student:
        session['student_roll'] = roll_number
        session['student_admin_id'] = student['admin_id'] 
        session['student_name'] = student['name']
        return redirect(url_for('student'))
        
    flash('Student not found. Please check roll number.', 'error')
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

# Helper function just for generating the letter grade based on percentage
def determine_grade(percentage):
    if percentage >= 90: return 'A+'
    elif percentage >= 80: return 'A'
    elif percentage >= 70: return 'B'
    elif percentage >= 60: return 'C'
    elif percentage >= 50: return 'D'
    return 'F'

@app.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    admin_id = session['admin_id']
    conn = get_db()
    
    if request.method == 'POST':
        action = request.form.get('action')
        
        # Action 1: Add new student ONLY
        if action == 'add_student':
            name = request.form['name'].strip()
            roll_number = request.form['roll_number'].strip()
            branch = request.form['branch'].strip()
            try:
                conn.execute(
                    'INSERT INTO students (name, roll_number, branch, admin_id) VALUES (?, ?, ?, ?)', 
                    (name, roll_number, branch, admin_id)
                )
                conn.commit()
                flash('Student added successfully!', 'success')
            except sqlite3.IntegrityError:
                flash('This Roll Number already exists in your records!', 'error')
                
        # Action 2: Add marks ONLY (Does not touch student table!)
        # Action 2: Add marks ONLY (With dynamic branch verification!)
        elif action == 'add_marks':
            roll_number = request.form['roll_number'].strip()
            subject = request.form['subject'].strip()
            try:
                marks = int(request.form['marks'])
            except ValueError:
                marks = -1
            
            # Validation Step A: Validate boundaries
            if marks < 0 or marks > 100:
                flash('Marks must be legitimately between 0 and 100', 'error')
            else:
                # Validation Step B: Verify student exists AND fetch their true profile branch
                student_profile = conn.execute(
                    'SELECT branch FROM students WHERE roll_number = ? AND admin_id = ?', 
                    (roll_number, admin_id)
                ).fetchone()
                
                if not student_profile:
                    flash('A student with this roll number does not exist in your records.', 'error')
                else:
                    # NEW Rule Map matching your updated JavaScript subjects precisely
                    allowed_rules = {
                        "Computer": ["JAVA", "AOA", "DBMS", "IOT", "Operating Sys."],
                        "Science": ["Physics", "Chemistry", "Maths"],
                        "Humanities": ["English", "History", "Geography", "Business Development"]
                    }
                    
                    # Read the student's true registered branch from the database column
                    student_true_branch = student_profile['branch']
                    allowed_subjects = allowed_rules.get(student_true_branch, [])
                    
                    # Security Check: If teacher selects a subject not belonging to the student's true branch
                    if subject not in allowed_subjects:
                        flash(f"Mismatched Data! Student {roll_number} belongs to '{student_true_branch}' and cannot be graded in '{subject}'.", "error")
                    else:
                        # Validation Step C: Explicit Duplicate Subject Check
                        subject_exists = conn.execute(
                            'SELECT 1 FROM marks WHERE roll_number = ? AND subject = ? AND admin_id = ?',
                            (roll_number, subject, admin_id)
                        ).fetchone()
                        
                        if subject_exists:
                            flash('Subject already added for this student', 'error')
                        else:
                            conn.execute(
                                'INSERT INTO marks (roll_number, subject, marks, admin_id) VALUES (?, ?, ?, ?)', 
                                (roll_number, subject, marks, admin_id)
                            )
                            conn.commit()
                            flash(f'Marks added successfully to {subject}!', 'success')

        elif action == 'delete_student':
            roll_number = request.form['roll_number']
            conn.execute('DELETE FROM marks WHERE roll_number = ? AND admin_id = ?', (roll_number, admin_id))
            conn.execute('DELETE FROM students WHERE roll_number = ? AND admin_id = ?', (roll_number, admin_id))
            conn.commit()
            flash('Student and records deleted successfully!', 'success')
            
    # Step 1: Get per-student totals for percentage/grade calculation
    totals_query = '''
        SELECT 
            s.roll_number,
            COALESCE(SUM(m.marks), 0) as total,
            COUNT(m.marks) as total_subjects
        FROM students s
        LEFT JOIN marks m ON s.roll_number = m.roll_number AND s.admin_id = m.admin_id
        WHERE s.admin_id = ?
        GROUP BY s.roll_number
    '''
    totals_rows = conn.execute(totals_query, (admin_id,)).fetchall()
    student_totals = {}
    for t in totals_rows:
        total = t['total']
        count = t['total_subjects']
        percentage = (total / (count * 100)) * 100 if count > 0 else 0
        grade = determine_grade(percentage)
        student_totals[t['roll_number']] = {
            'total': total,
            'percentage': round(percentage, 2),
            'grade': grade,
            'total_subjects': count
        }

    # Step 2: Get one row per subject per student (detailed view)
    detail_query = '''
        SELECT 
            s.name, 
            s.roll_number, 
            s.branch, 
            m.subject,
            m.marks
        FROM students s
        LEFT JOIN marks m ON s.roll_number = m.roll_number AND s.admin_id = m.admin_id
        WHERE s.admin_id = ?
        ORDER BY s.roll_number, m.subject
    '''
    rows = conn.execute(detail_query, (admin_id,)).fetchall()

    students_data = []
    for r in rows:
        roll = r['roll_number']
        stats = student_totals.get(roll, {'total': 0, 'percentage': 0, 'grade': 'F', 'total_subjects': 0})
        max_marks = stats['total_subjects'] * 100
        students_data.append({
            'name': r['name'],
            'roll_number': roll,
            'branch': r['branch'],
            'subject': r['subject'] if r['subject'] else '—',
            'marks': f"{r['marks']}/100" if r['marks'] is not None else '—',
            'total': f"{stats['total']}/{max_marks}" if max_marks > 0 else '0',
            'percentage': stats['percentage'],
            'grade': stats['grade']
        })
        
    conn.close()
    return render_template('admin.html', students=students_data, username=session.get('admin_username'))

@app.route('/student')
def student():
    roll_number = session.get('student_roll')
    admin_id = session.get('student_admin_id')
    
    if not roll_number or not admin_id:
        return redirect(url_for('index'))
        
    conn = get_db()
    student_info = conn.execute(
        'SELECT * FROM students WHERE roll_number = ? AND admin_id = ?', 
        (roll_number, admin_id)
    ).fetchone()
    
    marks = conn.execute(
        'SELECT * FROM marks WHERE roll_number = ? AND admin_id = ?', 
        (roll_number, admin_id)
    ).fetchall()
    
    stats = conn.execute(
        'SELECT COALESCE(SUM(marks), 0) as total, COUNT(marks) as total_subjects FROM marks WHERE roll_number = ? AND admin_id = ?', 
        (roll_number, admin_id)
    ).fetchone()
    
    conn.close()
    
    if not student_info:
        flash("Record disappeared.", "error")
        return redirect(url_for('index'))
    
    total = stats['total']
    count = stats['total_subjects']
    max_marks = count * 100
    percentage = (total / max_marks) * 100 if count > 0 else 0
    grade = determine_grade(percentage)
    
    # Format total for frontend consistency
    formatted_total = f"{total}/{max_marks}" if max_marks > 0 else "0"
    
    return render_template(
        'student.html', 
        student=student_info, 
        marks=marks, 
        total=formatted_total, 
        percentage=round(percentage, 2), 
        grade=grade
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
