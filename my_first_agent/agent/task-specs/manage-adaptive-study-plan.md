# Manage adaptive study plan Task Specification

```yaml
# BASIC INFORMATION
task_id: "T10"
task_name: "Manage adaptive study plan"
task_owner: "Student"

# Agent Inference Configuration
Provider: "OpenAI"
Model: "gpt-5.5"
Role: "Reasoning and planning within the permitted subtasks in this specification"
Maximum inference requests per task run: "6"
On inference failure or exhausted limits: "Record the unresolved status and hand the case to the student."
```

## 1. Task Goal

- **Objective:** Produce or revise a study plan for the student's newly supplied tasks by checking completeness, reasoning across deadlines, estimated workload, available study time, and calendar constraints, and presenting a grounded plan or a clear handoff request. If the student approves a state-changing update, write only the approved study-plan changes to the calendar.

## 2. Inbound Inputs

### Input 1

- **Input name:** New task records
- **What it contains:** A user-provided list of zero or more new tasks. Each task record must include a task name or identifier, a scheduled time or due date/time, and an estimated duration. The record may also include course, priority, notes, or a user-stated preferred study window. An empty list is valid and means the agent must ask whether there are new tasks before doing further planning.
- **Source:** Student, normally through T1 Collect assignment details

### Input 2

- **Input name:** Calendar context
- **What it contains:** Calendar events and availability returned by `retrieve-calendar` for the date/time range relevant to the supplied tasks. The result may include event identifiers, start and end times, titles, and read-only availability information. It is evidence for conflict checking, not permission to alter existing events.
- **Source:** `retrieve-calendar`, limited to the student's permitted calendar

### Input 3

- **Input name:** User constraints and decisions
- **What it contains:** User-provided available study time, scheduling preferences, conflict-resolution choices, and explicit approval or rejection of a proposed calendar update. The agent must not fill in absent constraints with assumptions.
- **Source:** Student

## 3. Tool Permissions and Boundaries

### Task-Wide Limits

- **Total task timeout:** 10 minutes per task run, including inference, tool calls, retries, waiting, and approval pauses.
- **Maximum tool calls:** 12 total calls across all tools in one run; retries count toward this limit.

### Tool 1

- **Tool name:** `retrieve-calendar`
- **Tool type:** Read-only calendar API request
- **Supports these permitted subtasks:** Verify task intake, inspect calendar constraints, and assess conflicts and available study windows
- **Allowed use:** Read events and availability from the student's permitted calendar for a date/time range justified by complete, user-provided task records. Return only the calendar facts needed to compare deadlines, workload, and availability.
- **Prohibited use:** Do not read unrelated calendars or private data, infer missing dates or durations, create or change events, delete events, or treat a failed or partial response as proof that time is available.
- **Approval required:** None within the allowed read-only use; normal account authentication or access-denied conditions must be handed to the student.
- **Timeout per call:** 30 seconds
- **Maximum retries per call:** 1 additional attempt
- **Retry conditions and failure response:** Retry once only for a transient network or service failure after a short wait. Do not retry authentication, permission, malformed-input, or scope errors. If the result remains unavailable or uncertain, record the limitation and hand off without making a calendar update.

### Tool 2

- **Tool name:** `update-calendar`
- **Tool type:** Calendar API write request
- **Supports these permitted subtasks:** Prepare an approved study-plan update and commit the approved update
- **Allowed use:** Create or update study-plan calendar entries only after all required task fields are present and the student has explicitly approved the proposed changes. Each write must use only the supplied task name, supplied scheduled or due time, supplied estimated duration, retrieved calendar facts, and the student's explicit scheduling decisions.
- **Prohibited use:** Do not invent assignments, dates, times, durations, or availability; delete or modify unrelated events; move existing events without explicit instruction; write a plan while required fields are missing; overwrite a prior update merely because its outcome is unknown; or issue a duplicate write after an uncertain response.
- **Approval required:** Explicit approval from the student is required immediately before each state-changing update. No approval may be inferred from silence, from providing task details, or from asking for a draft.
- **Timeout per call:** 45 seconds
- **Maximum retries per call:** 0 additional attempts
- **Retry conditions and failure response:** Do not automatically retry a write. If the outcome is a timeout, disconnect, or ambiguous response, stop all further writes, mark the update outcome as uncertain, and hand off to the student with the request to verify the calendar before trying again.

### Tool 3

- **Tool name:** `language-model-reasoning`
- **Tool type:** Language-model inference call
- **Supports these permitted subtasks:** Validate completeness, compare workload with deadlines and calendar constraints, identify conflicts, draft alternatives, and summarize evidence
- **Allowed use:** Reason over the user-provided task records, user-provided constraints, and facts returned by `retrieve-calendar`. Produce intermediate findings, questions for missing information, proposed time allocations, conflict explanations, and an auditable result summary. It may recommend an action but may not perform a state-changing action.
- **Prohibited use:** Do not invent task data, external deadlines, durations, calendar availability, or student preferences; do not claim a calendar write succeeded; do not access unprovided external information; and do not bypass approval or the tool limits in this specification.
- **Approval required:** None for analysis and drafting within the allowed inputs. Student approval is still required for any calendar update proposed by the reasoning call.
- **Timeout per call:** 60 seconds
- **Maximum retries per call:** 1 additional attempt
- **Retry conditions and failure response:** Retry once only for a transient inference failure and keep the same inputs. If the retry fails or the inference limit is exhausted, record what could not be determined and hand the case to the student.

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Verify new task intake
- **Subtask description:** Examine whether the student supplied at least one new task. For every supplied task, check for a task name or identifier, a scheduled time or due date/time, and an estimated duration. Produce a complete-field report and a concise question for each missing required field.
- **Subtask boundary:** If no task is supplied, ask whether there are new tasks and pause for the student's response. If a task lacks its date/time or duration, request that information before retrieving calendar data or proposing a state-changing update. Never infer a missing value.
- **Retry limits:** 1 additional inference attempt, within the task-wide limit.

### Permitted Subtask 2

- **Subtask name:** Inspect calendar constraints
- **Subtask description:** Use `retrieve-calendar` to identify existing events, open study windows, and relevant timing constraints for complete task records. Produce calendar evidence without changing it.
- **Subtask boundary:** Query only the student's permitted calendar and the justified date/time range. Treat unavailable, incomplete, or stale results as uncertainty. Do not interpret an unknown period as free time.
- **Retry limits:** 1 additional `retrieve-calendar` attempt for a transient failure; no retry for access or scope errors.

### Permitted Subtask 3

- **Subtask name:** Assess deadlines workload and conflicts
- **Subtask description:** Compare the supplied estimated durations and deadlines with retrieved calendar constraints and user-provided available study time. Identify overload, timing conflicts, infeasible windows, and the remaining choices the student must make.
- **Subtask boundary:** Use only supplied or retrieved facts. The agent may calculate totals and propose alternatives, but it may not change deadlines, shorten durations without permission, or decide how to override an existing event.
- **Retry limits:** 1 additional `language-model-reasoning` attempt for a transient failure.

### Permitted Subtask 4

- **Subtask name:** Draft or revise study plan
- **Subtask description:** Form a plan or revision that assigns the supplied work to available windows while respecting deadlines and user constraints. Explain the evidence behind each proposed allocation and identify any unresolved conflict.
- **Subtask boundary:** A draft is advisory until the student approves it. The draft must contain only supplied tasks and durations; it must not include placeholder assignments presented as real tasks or calendar entries.
- **Retry limits:** 1 additional inference attempt, within the task-wide limit.

### Permitted Subtask 5

- **Subtask name:** Commit approved study plan
- **Subtask description:** After explicit student approval, call `update-calendar` once with the approved study-plan changes and return the API outcome as evidence.
- **Subtask boundary:** Confirm completeness and approval immediately before the write. Do not modify unrelated events. If the write outcome is uncertain, stop and hand off; do not attempt a duplicate write.
- **Retry limits:** 0 additional write attempts.

- **Decision guidance:** Use intermediate findings to choose the next permitted subtask rather than following a fixed sequence. Start with intake verification when task data is new or changed; ask for missing fields before any planning. Once required fields are complete, retrieve calendar evidence when a conflict or availability question cannot be answered from the current evidence. Reassess after each new fact, and skip or repeat permitted subtasks when that resolves the most important remaining uncertainty. Present a draft before any write, request explicit approval when a calendar change is appropriate, and stop for handoff when no permitted subtask can make useful progress or when a boundary is reached.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The agent has either (a) produced a complete, evidence-based study-plan recommendation using only user-provided task data and calendar facts, or (b) received explicit approval, completed the permitted calendar write, and has a confirmed update outcome. The final result must list the tasks considered, timing assumptions that were actually provided, constraints checked, and any remaining issue.
- **Hand off early when:** The student supplies no tasks after being asked; any required task name, date/time, or duration is missing; the student must choose how to resolve a conflict or infeasible workload; calendar access is unavailable or incomplete; the request is outside the permitted calendar scope; inference fails or limits are exhausted; the total timeout or tool-call limit is reached; approval is withheld or unclear; or a calendar write has an uncertain outcome.
- **Hand off to:** Student, for missing information, conflict decisions, approval, or calendar verification.

Stop at the first applicable budget limit or handoff condition. While awaiting student review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** `Completed` when a grounded recommendation is produced or an approved update is confirmed; otherwise `Escalated to human`.
- **Result or recommendation:** The proposed or confirmed study plan, including only user-supplied tasks, dates/times, durations, and explicitly approved adjustments. If the task is escalated before a supported result, write `Undetermined`.
- **Evidence summary:** The supplied task fields, user constraints, relevant retrieved calendar facts, conflict or workload analysis, and the approval or update outcome when applicable.
- **Subtasks performed:** List the permitted subtasks completed, including any repeated inference or calendar-read attempt and whether a calendar write was made.
- **Unresolved issues:** List missing fields, unresolved conflicts, access limitations, uncertain write outcomes, or approval questions. Use `None` only when the result is complete and verified.
- **Handoff note:** State why the run stopped, what remains unresolved, and the exact information or decision the student must provide. Use `Not applicable` for a completed task.
- **Next task or recipient:** Student for review, missing information, conflict resolution, approval, or verification; otherwise the approved study plan proceeds to the next workflow step for display or record keeping.

