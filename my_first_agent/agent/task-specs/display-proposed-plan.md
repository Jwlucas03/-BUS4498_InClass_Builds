# Display proposed plan Task Specification

## Basic Information

- **Task ID:** T7
- **Task name:** Display proposed plan
- **Task type:** Act
- **Automation level:** L1: Rule-based automation
- **Task owner:** Study-planning system

## 1. Task Description

This task presents the draft schedule and deadline-warning result in a form the student can review. It displays assignment priorities, proposed study times, durations, warnings, assumptions, and unresolved conflicts without changing the underlying plan. The workflow needs this task because the student must review the recommendation before requesting revisions or approving the final plan.

## 2. Inputs

### Input 1

- **Input name:** Draft study schedule
- **Contents and format:** A structured proposed schedule from T5 containing assignment-linked blocks, times or durations, priorities, deadlines, and unscheduled work.
- **Source:** T5 Create study schedule

### Input 2

- **Input name:** Deadline warning result
- **Contents and format:** A status and evidence from T6 describing deadline feasibility, warnings, affected assignments, and unresolved issues.
- **Source:** T6 Show deadline warning

- **If a required input is missing or invalid:** Record the display as incomplete and hand the case to T10 Manage adaptive study plan or the student. Do not present an incomplete plan as ready for approval.

## 3. Outputs

### Output 1

- **Output name:** Proposed study plan display
- **Contents and format:** A student-readable view of the schedule, priorities, suggested study times, deadline warnings, assumptions, and controls for accepting or requesting changes.
- **Next task or recipient:** Student for review; changes return to T8 Revise study schedule and acceptance proceeds to T9 Save final study plan.
- **Complete when:** The student can see all schedule blocks and warnings and can provide an explicit review decision.

## 4. Planned Tools

### Tool 1

- **Tool name:** display_proposed_plan
- **Input:** Draft study schedule and Deadline warning result
- **Output:** Proposed study plan display
- **Implementation Route:** User-interface rendering or formatted workflow response
- **Integration approach:** Direct integration with the student interaction channel
- **Role in this task:** Formats and displays the supplied schedule and warnings for review; it does not approve, revise, or save the plan.
- **Task timeout:** 30 seconds per display attempt
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient display failure. Do not repeat a successful display automatically.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the plan was not displayed and hand the case to T10 Manage adaptive study plan or the student. Do not continue to T9 as if the student reviewed it.

