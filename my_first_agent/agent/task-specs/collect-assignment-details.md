# Collect assignment details Task Specification

## Basic Information

- **Task ID:** T1
- **Task name:** Collect assignment details
- **Task type:** Sense
- **Automation level:** L0: Manual
- **Task owner:** Student

## 1. Task Description

The student enters the information needed to plan study work. The student provides the course name, assignment title, due date or scheduled time, estimated amount of work, and available study time. The task uses the student's direct knowledge and judgment; the system does not infer or invent missing values. The workflow needs this task because later validation, prioritization, scheduling, and warnings depend on complete assignment records.

## 2. Inputs

### Input 1

- **Input name:** Student assignment entry
- **Contents and format:** A human response containing one or more assignment records. Each record includes course name, assignment title, due date or scheduled time, estimated amount of work or duration, and available study time. The student may also provide notes or constraints.
- **Source:** Student

- **If a required input is missing or invalid:** The student must provide or correct the missing field. The case goes to T2 Request missing details; a planning run must not continue with an assumed value.

## 3. Outputs

### Output 1

- **Output name:** Assignment records
- **Contents and format:** A structured list of assignment records containing the values entered by the student, with each required field preserved and any student-stated constraint labeled.
- **Next task or recipient:** T2 Request missing details
- **Complete when:** The student has submitted the available assignment information for the requested planning run and the records are ready for required-field checking.

## 4. Planned Tools

### Tool 1

- **Tool name:** record_student_assignment_entry
- **Input:** Student assignment entry
- **Output:** Assignment records
- **Implementation Route:** Manual data entry supported by a form or text-entry interface
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Presents the fields or prompt, records the student's response without changing its meaning, and passes the entered records to T2.
- **Task timeout:** Human response deadline is before the requested planning run or weekly review proceeds.
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the run as awaiting student information and hand it to the student. A missed response is not approval and must not be treated as complete.

