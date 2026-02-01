# Specification: Implement Mock Data Integration for Patient Flow Chart

## Overview
The goal of this track is to transition the PatientFlowChart component from using static, hardcoded values to dynamic data sourced from a structured mock database. This will provide a foundation for future real-time data integration and simulation features.

## Requirements
- Define a clear schema for patient flow data in db/mockdata.ts.
- Create a data fetching hook or utility that simulates an asynchronous API call.
- Refactor pp/Components/Charts/PatientFlowChart.tsx to consume this data.
- Ensure the chart updates correctly when data changes.
- Maintain existing styling and layout.

## Acceptance Criteria
- db/mockdata.ts contains a diverse set of patient flow records.
- PatientFlowChart displays data fetched from the mock database.
- The chart remains responsive and visually consistent with the current design.
- Unit tests verify data transformation and component rendering.
