# Workflow of Tasks


## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow begins when a student adds a new assignment, updates an existing assignment, or requests a new study plan. The system also runs automatically at the beginning of each week to review upcoming deadlines.

### 1.3 Completion Condition at Runtime
One workflow run is complete when the system has created and displayed a study schedule containing prioritized tasks, suggested study times, and any deadline warnings for the student to review.

### 1.4 General Workflow

First, the student enters assignment information, including the course name, assignment title, due date, estimated amount of work, and available study time. The system checks whether all required information is present. If information is missing or unclear, the system asks the student to correct or add the needed details.

Next, the system analyzes the assignment deadlines, estimated workload, and the student's available time. It uses AI to rank assignments by urgency and importance, divide large assignments into smaller tasks, and create a realistic study schedule. The system then displays the proposed schedule to the student for review.

The student can accept the plan or request changes. If the student requests changes, the system revises the schedule based on the student's feedback. If the system identifies that there is not enough available time before a deadline, it shows a warning and recommends prioritizing the most urgent work. The workflow ends when the student receives and approves or saves the final study plan.

### 1.5 Workflow Diagram

flowchart TD
Copy everything inside this box, from the first ```mermaid line through the last ``` line:

```mermaid
flowchart TD
    S([Start: Student requests a study plan])
    T1[Collect assignment details]
    D1{Are details complete?}
    T2[Request missing details]
    T3[Analyze deadlines and workload]
    T4[Rank assignment priorities]
    T5[Create study schedule]
    D2{Is there enough study time?}
    T6[Show deadline warning]
    T7[Display proposed plan]
    D3{Does student approve plan?}
    T8[Revise study schedule]
    T9[Save final study plan]
    E([End: Study plan available])

    S --> T1
    T1 --> D1
    D1 -- No --> T2
    T2 --> T1
    D1 -- Yes --> T3
    T3 --> T4
    T4 --> T5
    T5 --> D2
    D2 -- No --> T6
    T6 --> T7
    D2 -- Yes --> T7
    T7 --> D3
    D3 -- No --> T8
    T8 --> T7
    D3 -- Yes --> T9
    T9 --> E
```
