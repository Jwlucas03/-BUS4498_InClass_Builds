# Create study schedule Task Specification

## Basic Information

- **Task ID:** T5
- **Task name:** Create study schedule
- **Task type:** Act
- **Automation level:** L2: Intelligent automation
- **Task owner:** Study-planning system

## 1. Task Description

This task converts the prioritized assignment list into a draft study schedule. It divides larger work into reasonable study blocks, places those blocks within the student's supplied available study time, and preserves assignment deadlines and estimated durations. The result is a proposal for review, not an autonomous commitment to the calendar. The system may propose alternatives when the available time is insufficient but may not invent time windows or change assignment requirements.

## 2. Inputs

### Input 1

- **Input name:** Prioritized assignment list
- **Contents and format:** An ordered list from T4 with assignment names, priority rationale, due dates or scheduled times, estimated workload, and unresolved conflicts.
- **Source:** T4 Rank assignment priorities

### Input 2

- **Input name:** Available study time
- **Contents and format:** Student-provided study windows or total available study time, including any stated constraints or unavailable periods.
- **Source:** T1 Collect assignment details

- **If a required input is missing or invalid:** Return the case to T2 or T3 for correction and hand the case to T10 Manage adaptive study plan. Do not fill in an unavailable time window.

## 3. Outputs

### Output 1

- **Output name:** Draft study schedule
- **Contents and format:** A schedule containing each planned study block, linked assignment, proposed start and end time or duration, priority, deadline relationship, and any unscheduled workload or conflict.
- **Next task or recipient:** T6 Show deadline warning
- **Complete when:** The draft accounts for every supplied assignment and available study constraint and clearly identifies any work that cannot fit.

## 4. Planned Tools

### Tool 1

- **Tool name:** create_study_schedule
- **Input:** Prioritized assignment list and Available study time
- **Output:** Draft study schedule
- **Implementation Route:** Language-model planning call with deterministic time-allocation checks
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Proposes study blocks from supplied tasks and time windows, checks that durations are not silently reduced, and returns a draft with conflicts.
- **Task timeout:** 90 seconds per run
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient inference or calculation failure using identical inputs. Do not retry if the inputs are incomplete.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the draft as unresolved and hand the case to T10 Manage adaptive study plan or the student. Do not display an incomplete schedule as final.

