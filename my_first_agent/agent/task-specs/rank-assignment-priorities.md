# Rank assignment priorities Task Specification

## Basic Information

- **Task ID:** T4
- **Task name:** Rank assignment priorities
- **Task type:** Decide
- **Automation level:** L2: Intelligent automation
- **Task owner:** Study-planning system

## 1. Task Description

This task orders assignments by urgency and importance using the workload and deadline analysis. It considers time remaining, estimated work, available study capacity, and any student-provided constraints. It produces a recommendation with reasons, while preserving the student's ability to revise or reject the order. It must not invent priorities or change due dates.

## 2. Inputs

### Input 1

- **Input name:** Workload and deadline analysis
- **Contents and format:** A structured analysis from T3 containing assignment-level urgency, estimated workload, available capacity, deadline relationships, and uncertainty.
- **Source:** T3 Analyze deadlines and workload

- **If a required input is missing or invalid:** Return the case to T3 for a corrected analysis and notify T10 Manage adaptive study plan if the issue cannot be resolved.

## 3. Outputs

### Output 1

- **Output name:** Prioritized assignment list
- **Contents and format:** An ordered list of the supplied assignments with priority positions, supporting evidence, constraints, and any tie or uncertainty that requires student judgment.
- **Next task or recipient:** T5 Create study schedule
- **Complete when:** Every assignment in the analysis has a position or explicitly documented tie, and the ordering rationale is available to the scheduling task.

## 4. Planned Tools

### Tool 1

- **Tool name:** rank_assignment_priorities
- **Input:** Workload and deadline analysis
- **Output:** Prioritized assignment list
- **Implementation Route:** Language-model reasoning call constrained by the analysis fields and deterministic ranking rules
- **Integration approach:** Direct integration with the study-planning workflow
- **Role in this task:** Compares assignments, explains the recommended order, and flags cases where the student must choose between competing priorities.
- **Task timeout:** 60 seconds per run
- **Maximum retries:** 1
- **Retry only when:** Retry once after a short wait for a transient inference failure using the same analysis. Do not retry when required evidence is missing; hand off instead.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the ranking as unresolved and hand the case to T10 Manage adaptive study plan or the student. Do not create a schedule from an unverified ranking.

