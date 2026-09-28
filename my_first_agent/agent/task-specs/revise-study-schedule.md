# Revise study schedule Task Specification

## Basic Information

- **Task ID:** T8
- **Task name:** Revise study schedule
- **Task type:** Reason
- **Automation level:** L2: Intelligent automation
- **Task owner:** Study-planning system

## 1. Task Description

This task revises the proposed schedule after the student requests changes. It interprets the student's feedback, applies only the stated changes and existing task data, and produces a revised schedule for another deadline check and review. It may offer alternatives when the request conflicts with deadlines or available time, but it must not invent assignments, dates, durations, or preferences.

## 2. Inputs

### Input 1

- **Input name:** Student change request
- **Contents and format:** A human response identifying the requested schedule change, such as a preferred study window, priority change, or correction to a task detail.
- **Source:** Student after T7 Display proposed plan

### Input 2

- **Input name:** Current proposed study plan
- **Contents and format:** The schedule and warnings currently displayed by T7, including assignment links, proposed times, durations, deadlines, and unresolved issues.
- **Source:** T7 Display proposed plan

- **If a required input is missing or invalid:** Ask the student to clarify the change or return the case to T2 for corrected task details. Hand unresolved ambiguity to T10 Manage adaptive study plan; do not silently choose an interpretation.

## 3. Outputs

### Output 1

- **Output name:** Revised study schedule
- **Contents and format:** A revised schedule showing changed blocks, preserved task data, updated warnings or conflicts, and a short explanation of how the student's request was applied.
- **Next task or recipient:** T6 Show deadline warning
- **Complete when:** The requested change is either applied with its consequences shown or documented as infeasible with alternatives and unresolved student decisions.

## 4. Planned Tools

### Tool 1

- **Tool name:** revise_study_schedule
- **Input:** Student change request and Current proposed study plan
- **Output:** Revised study schedule
- **Implementation Route:** Language-model reasoning call constrained by the existing plan and the student's explicit request
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Interprets the request, revises the schedule, preserves unchanged fields, and identifies conflicts without saving calendar changes.
- **Task timeout:** 90 seconds per run
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient inference failure using the same request and plan. Do not retry ambiguous student instructions without clarification.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the revision as unresolved and hand the case to T10 Manage adaptive study plan or the student. Do not send an unverified revision to T9.

