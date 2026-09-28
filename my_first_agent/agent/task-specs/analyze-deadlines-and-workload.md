# Analyze deadlines and workload Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Analyze deadlines and workload
- **Task type:** Reason
- **Automation level:** L2: Intelligent automation
- **Task owner:** Study-planning system

## 1. Task Description

This task evaluates validated assignment records together with the student's available study time. It calculates time remaining, compares estimated work with available capacity, identifies overlapping deadlines, and summarizes workload pressure. The analysis uses the supplied dates, durations, and constraints only. It does not change assignment details or decide how to override a student's calendar or deadline.

## 2. Inputs

### Input 1

- **Input name:** Validated assignment records
- **Contents and format:** Records passed by T2 with course name, assignment title, due date or scheduled time, estimated amount of work or duration, and available study time.
- **Source:** T2 Request missing details

- **If a required input is missing or invalid:** Return the records to T2 for validation and hand the case to T10 if the validation status is inconsistent. Do not calculate using an assumed field.

## 3. Outputs

### Output 1

- **Output name:** Workload and deadline analysis
- **Contents and format:** A structured analysis listing each assignment's time remaining, estimated workload, available capacity, deadline urgency, overlapping constraints, and unresolved uncertainty.
- **Next task or recipient:** T4 Rank assignment priorities
- **Complete when:** Every validated assignment is represented and the analysis identifies whether the supplied workload can fit the supplied available time.

## 4. Planned Tools

### Tool 1

- **Tool name:** analyze_deadlines_and_workload
- **Input:** Validated assignment records
- **Output:** Workload and deadline analysis
- **Implementation Route:** Deterministic date and duration calculations combined with a language-model reasoning call for explanation
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Calculates time relationships and interprets workload pressure using only the validated records; returns evidence and uncertainty for T4.
- **Task timeout:** 60 seconds per run
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient service or inference failure using the same input records. Do not retry invalid data.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the analysis as unresolved and hand the case to T10 Manage adaptive study plan or the student. Do not rank or schedule from an incomplete analysis.

