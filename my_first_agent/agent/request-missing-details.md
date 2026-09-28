# Request missing details Task Specification

## Basic Information

- **Task ID:** T2
- **Task name:** Request missing details
- **Task type:** Verify
- **Automation level:** L1: Rule-based automation
- **Task owner:** Study-planning system

## 1. Task Description

This task checks assignment records against the required-field rules and identifies missing, blank, malformed, or contradictory values. If a required value is missing, it creates a clear request for the student to supply or correct that value. If all required values are present and valid, it passes the validated records to the next planning task. The task uses deterministic field and consistency rules and never fills in a missing date, time, or duration.

## 2. Inputs

### Input 1

- **Input name:** Assignment records
- **Contents and format:** A structured list from T1 containing course name, assignment title, due date or scheduled time, estimated amount of work or duration, and available study time.
- **Source:** T1 Collect assignment details

- **If a required input is missing or invalid:** Create a Missing-details request that names each missing or invalid field and send it to the student. Route the corrected response back through T1 and this task; do not continue to T3.

## 3. Outputs

### Output 1

- **Output name:** Validation result
- **Contents and format:** A status of complete or incomplete, the checked field names, and either validated assignment records or a list of specific validation errors.
- **Next task or recipient:** T3 Analyze deadlines and workload when complete; the student when incomplete.
- **Complete when:** Every required field has passed the rules and the result identifies the records that may be used for planning.

### Output 2

- **Output name:** Missing-details request
- **Contents and format:** A student-facing request listing the exact assignment, field, and correction needed, without proposing an invented value.
- **Next task or recipient:** Student, with the corrected response returning to T1 Collect assignment details.
- **Complete when:** The request is displayed or delivered once and its delivery status is recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** check_required_fields
- **Input:** Assignment records
- **Output:** Validation result
- **Implementation Route:** Deterministic validation function or workflow rule engine
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Checks required fields, data types, date/time form, nonnegative duration, and basic consistency without modifying the student's values.
- **Task timeout:** 15 seconds per validation run
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient execution failure. Do not retry malformed input; route that result to the student.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record validation as unresolved and hand the case to T10 Manage adaptive study plan or the student. Do not pass the records as valid.

### Tool 2

- **Tool name:** request_missing_details
- **Input:** Missing-details request
- **Output:** Missing-details request
- **Implementation Route:** Workflow message or user-interface prompt
- **Integration approach:** Direct integration with the student interaction channel
- **Role in this task:** Presents the missing-field request to the student and records that the request was issued.
- **Task timeout:** 30 seconds to create or display the request
- **Maximum retries:** 0
- **Retry only when:** Not applicable; do not repeat a request automatically because duplicate prompts can confuse the student.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the request was not delivered and hand the case to the student or T10. Do not continue to T3.

