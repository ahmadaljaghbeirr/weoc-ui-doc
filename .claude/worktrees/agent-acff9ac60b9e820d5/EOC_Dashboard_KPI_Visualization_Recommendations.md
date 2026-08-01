# EOC Dashboard KPI Visualization Recommendations

## General Note

Add an **information icon (`ⓘ`)** beside every KPI title. On hover or click, show:

- KPI definition and business purpose
- Calculation formula
- Included and excluded records
- Data source
- Last updated date and time
- Reporting period and comparison period
- Target or SLA, when applicable

Use consistent status colors throughout the dashboard: **green** for healthy/available/on target, **amber** for warning/at risk, **red** for critical/unavailable/overdue, **blue** for informational/in progress, and **gray** for unknown or no data. Do not rely on color alone; include labels, icons, or patterns.

---

# Left Side

## Facility Profile

| KPI / Field | Recommended visualization |
| --- | --- |
| Facility Name | **Profile header / text field** with a facility icon; use it as the card title rather than a chart. |
| Project Commercial Operational Date | **Date with milestone icon**; optionally add a small tenure label such as “Operational for 6 years.” |
| Maintenance Company | **Text field with company logo or building icon**; make the name clickable to open company details if drill-down is available. |
| Capacity (Power, Water, or Power and Water) | **Capacity summary card** with separate labeled values for MW and MIGD/m³/day. If both utilities exist, use two compact horizontal bullet bars showing actual/available capacity against designed capacity. |

## Overall Readiness

| KPI | Recommended visualization |
| --- | --- |
| Resources and Capabilities Readiness (based on availability) | **Radial gauge or progress ring** showing the readiness percentage, status band, and available versus required resources beneath it. |
| Facility Readiness (based on Facility Status and Utilities Status) | **Radial gauge or progress ring** with the percentage in the center and two small status chips for Facility Status and Utilities Status. |
| Overall Readiness (based on Resources and Capabilities Readiness and Facility Readiness) | **Large weighted readiness gauge** or **donut score** as the primary left-side KPI. Show the two contributing readiness scores below it and expose their weighting in the info tooltip. |

> Recommended calculation presentation: display readiness as a percentage and a status label such as **Ready**, **Partially Ready**, **At Risk**, or **Not Ready**. Use threshold bands approved by the business owner.

## Drills and Exercises Summary

| KPI | Recommended visualization |
| --- | --- |
| In Progress Exercises | **KPI number card** with a blue status icon and a small progress bar for each active exercise in the drill-down. |
| This Month Exercises | **KPI number card with sparkline** showing exercises by week; clicking it should open the monthly exercise calendar or list. |
| Open Improvement Opportunities | **KPI number card** colored by risk, supported by a **stacked horizontal bar** in the drill-down showing Critical, High, Medium, and Low opportunities. |

---

# Middle

## Incidents Summary

| KPI | Recommended visualization |
| --- | --- |
| Total Events | **KPI number card** with a sparkline and percentage change against the previous equivalent period. |
| Active Events | **KPI number card** with red or amber emphasis and an active-status icon; show change versus the previous period. |
| Closed Events | **KPI number card** with green emphasis and closure-rate context beneath the value. |
| Average Resolution Time | **Duration KPI card** with a target/SLA comparison using a small bullet bar; show trend versus the previous period. |
| Average Response Time | **Duration KPI card** with a target/SLA comparison using a small bullet bar; show trend versus the previous period. |
| Events by Classification | **Sorted horizontal bar chart** for easy comparison across classifications; use consistent classification colors and show counts and percentages. |
| Event Closure Performance | **100% stacked bar** showing Closed Within SLA, Closed Outside SLA, and Still Open. If performance over time is important, use a weekly line chart beneath it. |
| Event Timeline | **Time-series line or stacked area chart** showing events created, activated, and closed by day/week. Allow zooming and filtering by classification and severity. |

## Resources and Capabilities

| KPI | Recommended visualization |
| --- | --- |
| Total Resources (per resource type) | **Grouped horizontal bar chart** by resource type, with the total shown at the end of each bar. |
| Available Resources (per resource type) | **Green segment in a stacked horizontal bar** by resource type; display count and percentage. |
| Unavailable Resources (per resource type) | **Red segment in the same stacked horizontal bar** by resource type; allow drill-down to unavailable resource records and reasons. |

> Best combined visual: use one **100% stacked horizontal bar chart by resource type** with Available, Assigned/Deployed, Reserved, and Unavailable segments. Show total quantity in the row label or at the bar end.

### Vehicle KPIs

| KPI | Recommended visualization |
| --- | --- |
| Assigned or Deployed Units | **KPI number card** with a vehicle/deployment icon and share of operational units beneath it. |
| Unavailable or Out-of-Service Units | **KPI number card** with red emphasis; add a small breakdown by maintenance, damage, and other causes in the drill-down. |
| Critical Vehicles Unavailable | **Critical alert card** with red border, warning icon, count, and an expandable list of vehicle types/facilities affected. |
| Immediate Transport Capacity | **Large number card** displaying personnel capacity, e.g., **245 personnel**, with a transport icon and available vehicle count beneath it. |
| Operational Readiness Rate (Operational Units ÷ Total Units × 100) | **Radial gauge or progress ring** with threshold bands and the operational/total unit counts below the percentage. |
| Fleet Utilization Rate (Assigned Units ÷ Operational Units × 100) | **Bullet chart or horizontal progress bar** against an approved utilization target; use warning coloring if excessively high or low. |
| Available Seating/Transport Capacity | **KPI number card** with a small stacked bar split by vehicle type or facility. |
| Vehicle Availability by Driving Mode | **100% stacked horizontal bar chart** by driving mode, split into Available, Assigned, and Unavailable. |
| Vehicle Availability by Type | **Grouped or stacked horizontal bar chart** by vehicle type; sort by unavailable percentage or operational importance. |

### Chemicals KPIs

| KPI | Recommended visualization |
| --- | --- |
| Total Chemical Types | **KPI number card** with a chemical/flask icon; optionally show hazardous versus non-hazardous types beneath it. |
| Total Quantity in Stock | **KPI number card** with unit selector or normalized unit; do not combine incompatible measurement units into one total without conversion. |
| Available Quantity | **Green KPI number card** or green segment of a stock-status stacked bar. |
| Reserved or Assigned Quantity | **Blue KPI number card** or blue segment of a stock-status stacked bar. |
| Unavailable Quantity | **Red KPI number card** or red segment of a stock-status stacked bar. |
| Stock Availability Rate | **Radial gauge or progress ring** showing available quantity as a percentage of usable stock, with target threshold bands. |
| Critical Chemicals Below Minimum Stock | **Critical alert card** with count and a ranked horizontal bar chart showing current stock versus minimum level. |
| Chemicals Approaching Expiry | **Amber KPI card** with expiry-window label; drill down to a table sorted by days remaining. |
| Expired Chemicals | **Red KPI card** with a prominent count and drill-down list by chemical, quantity, facility, and expiry date. |
| Days of Supply Remaining | **Bullet chart** showing days remaining against minimum and target coverage; for multiple chemicals, use sorted horizontal bullet bars. |
| Storage Locations Reporting Shortages | **KPI count plus map** with red/amber markers; use a horizontal ranking if a map is not available. |
| Hazardous-Material Readiness by Organization or Facility | **Heatmap matrix** with organizations/facilities as rows, readiness components as columns, and traffic-light readiness cells. |

> Best combined stock visual: use a **stacked horizontal bar** for Available, Reserved/Assigned, and Unavailable quantities, supported by exception cards for below-minimum, approaching-expiry, and expired chemicals.

## Damage & Impact Assessment

### Human Impact

| KPI | Recommended visualization |
| --- | --- |
| Total Deaths | **Critical KPI number card** with dark red emphasis; display the change since the previous assessment. |
| Total Injured | **KPI number card** with amber/red emphasis and a severity split beneath it. |
| Serious Injuries | **Critical KPI number card** with red emphasis and share of total injuries. |
| Minor Injuries | **KPI number card** with amber emphasis and share of total injuries. |
| Missing Persons | **Critical KPI number card** with warning icon and unresolved duration/oldest case beneath it. |
| Total Casualties | **Large KPI number card** representing deaths plus injuries; include the formula in the info tooltip to avoid ambiguity. |
| Injury Severity Rate (Serious Injuries ÷ Total Injuries × 100) | **Radial gauge or bullet chart** with thresholds and previous-assessment comparison. |
| Casualty Change Since Last Assessment | **Variance card** with up/down arrow, absolute change, percentage change, and a small sparkline across assessment versions. |
| Casualties by Company, Facility, Region, or Incident | **Drillable horizontal bar chart** with a dimension selector; use a map when geographic distribution is more important. |
| Tier 2–4 Escalation Cases | **Stacked horizontal bar** split by Tier 2, Tier 3, and Tier 4, with Tier 4 emphasized. |
| Unresolved Missing-Person Cases | **Critical KPI card** plus an aging bar chart grouped into time buckets such as <6h, 6–12h, 12–24h, and >24h. |

### Material Damage

| KPI | Recommended visualization |
| --- | --- |
| Assets Affected | **KPI number card** with percentage of total known assets affected. |
| Estimated Damage Value in AED | **Large currency KPI card** with abbreviated formatting and change since the previous assessment. |
| Critical Assets Affected | **Critical KPI card** with red emphasis and a ranked drill-down by criticality. |
| Assets Partially Damaged | **Amber KPI card** or amber segment in an asset-condition stacked bar. |
| Assets Completely Damaged | **Dark red KPI card** or red segment in an asset-condition stacked bar. |
| Assets Out of Service | **Red KPI card** with share of affected assets and estimated restoration time beneath it. |
| Damage by Asset Type | **Sorted horizontal stacked bar chart** by asset type, split by Partial, Complete, and Out of Service. |
| Damage by Company or Facility | **Drillable horizontal bar chart or treemap** sized by affected-asset count and colored by estimated damage value/severity. |
| Average Damage Value per Asset (Estimated Damage Value ÷ Assets Affected) | **Currency KPI card** with previous-assessment variance and benchmark/target context if available. |
| Estimated Recovery or Replacement Cost | **Large currency KPI card** with a stacked bar separating Recovery and Replacement cost. |
| Assets Awaiting Assessment | **Amber backlog KPI card** with an aging histogram or time-bucket bar chart. |

### Evacuation and Accommodation

| KPI | Recommended visualization |
| --- | --- |
| Persons Evacuated | **KPI number card** with a sparkline showing cumulative evacuations over time. |
| Persons Requiring Shelter | **KPI number card** with share of evacuated persons beneath it. |
| Persons Currently Accommodated | **Green/blue KPI card** with occupancy context beneath it. |
| Persons Not Yet Accommodated | **Critical gap card** with red emphasis and count by location or vulnerability group. |
| Shelter Demand Rate (Requiring Shelter ÷ Evacuated × 100) | **Radial gauge or horizontal progress bar** showing the percentage and numerator/denominator. |
| Shelter Occupancy Rate | **Bullet chart or gauge** with safe, warning, and over-capacity thresholds. |
| Available Shelter Capacity | **KPI number card** with total capacity and current occupancy beneath it. |
| Remaining Shelter Capacity | **Horizontal capacity bar** showing occupied versus remaining places; emphasize facilities nearing capacity. |
| Evacuation Completion Rate | **Progress ring or progress bar** with evacuated versus target population counts. |
| Evacuation Locations or Zones | **Map with proportional markers or shaded zones**; show evacuated population and completion status in each tooltip. |
| Vulnerable Persons Requiring Assistance | **Critical KPI card** with icons or a stacked bar by assistance category, such as medical, mobility, children, and elderly. |
| Average Evacuation Time | **Duration KPI card** with SLA/target bullet bar and trend versus previous drills/incidents. |

### Environmental and Network Impact

| KPI | Recommended visualization |
| --- | --- |
| Total Affected Area in m² | **KPI number card plus map polygon overlay**; format as m² or km² based on scale. |
| Transmission Loss in MW | **Large KPI number card** with a time-series sparkline and percentage of normal transmission beneath it. |
| Impacted Customers | **Large KPI number card** with change since the last assessment and geographic distribution in the drill-down. |
| Number of Impacted Locations | **KPI number card plus map markers** colored by severity/restoration status. |
| Consumption Reduction | **KPI number card** using the agreed unit, supported by a before-versus-current comparison bar. |
| Consumption Impact Percentage ((Transmission Loss ÷ Normal Daily Consumption) × 100) | **Radial gauge or bullet chart** with warning thresholds and numerator/denominator in the tooltip. |
| Estimated Restoration Time | **Countdown/duration card** displaying the forecast date/time and confidence/status label; update as assessments change. |
| Customers Restored | **Green KPI card** with cumulative restoration sparkline. |
| Customers Awaiting Restoration | **Red/amber KPI card** with an aging or location breakdown. |
| Restoration Progress (Restored Customers ÷ Impacted Customers × 100) | **Large progress bar or progress ring** showing restored and remaining customer counts. |
| Critical Facilities Affected | **Critical KPI card** plus ranked list with facility type, impact, and restoration priority. |
| Environmental Contamination Status | **Categorical status badge** such as None, Suspected, Confirmed, Contained, or Remediated; support it with a map layer where available. |
| Affected Area Contained or Remediated | **100% stacked progress bar** split into Uncontained, Contained, and Remediated area, with total area displayed. |

## Alerts

### Alert Status

| KPI | Recommended visualization |
| --- | --- |
| New Alerts | **KPI number card** with a sparkline and change versus the previous period. |
| Acknowledged Alerts | **KPI number card** with acknowledgement rate beneath it. |
| Open/In-Progress Alerts | **KPI number card** with blue/amber emphasis and aging context. |
| Escalated Alerts | **Critical KPI card** with count and percentage of all alerts. |
| Closed Alerts | **Green KPI number card** with closure rate and period comparison. |
| Reopened Alerts | **Amber/red KPI card** with reopen rate and trend. |
| Unacknowledged Critical Alerts | **Prominent critical alert card** with blinking/pulsing icon used sparingly, oldest age, and direct drill-down. |
| Alerts Awaiting Action | **Amber KPI card** with action-waiting age buckets beneath it. |
| Alerts Overdue by SLA | **Red KPI card** with overdue percentage and a severity breakdown. |

> Best combined visual: include a **status funnel** or **stacked bar** showing New → Acknowledged → In Progress → Closed, while displaying Escalated, Reopened, and Overdue as exception cards rather than funnel stages.

### Severity and Priority

| KPI | Recommended visualization |
| --- | --- |
| Critical, High, Medium, and Low Alerts | **Stacked horizontal bar or donut chart** showing severity distribution. Prefer a bar when exact comparison matters. |
| Immediate, Urgent, and Normal-Priority Alerts | **Stacked horizontal bar** showing priority distribution with counts and percentages. |
| Critical Alerts by Status | **Stacked horizontal bar chart** with alert status as segments; keep critical red as the context and distinguish statuses using labels/patterns. |
| Immediate-Priority Alerts Not Acknowledged | **Critical KPI card** with oldest alert age and direct drill-down. |
| Alerts Escalated to Incidents | **KPI number card** with escalation rate and a small trend sparkline. |
| Severity Trend Compared with the Previous Period | **Multi-series line chart** by severity over time or a set of compact delta cards for Critical, High, Medium, and Low. |

### Response-Performance KPIs

> To measure these accurately, capture **Acknowledged On**, **Action Started On**, and **Closed On** timestamps.

| KPI | Recommended visualization |
| --- | --- |
| Average Time to Acknowledge | **Duration KPI card with SLA bullet bar**, previous-period delta, and percentile detail in the tooltip. |
| Average Time to Begin Action | **Duration KPI card with SLA bullet bar** and previous-period delta. |
| Average Time to Close | **Duration KPI card with SLA bullet bar** and trend sparkline. |
| SLA Compliance Rate | **Radial gauge or bullet chart** with the approved SLA target clearly marked. |
| Alerts Acknowledged Within SLA | **KPI number and percentage card** supported by a 100% stacked bar for Within SLA versus Breached. |
| Alerts Closed Within SLA | **KPI number and percentage card** supported by a 100% stacked bar for Within SLA versus Breached. |
| Oldest Active Alert | **Age card** showing duration, severity, facility, and alert title; use red emphasis when beyond SLA. |
| Average Age of Active Alerts | **Duration KPI card** plus an age-bucket histogram for the drill-down. |
| Critical Alerts Without Updates | **Critical KPI card** with count and longest time without update. |
| Time Since the Last Alert Update | **Freshness/status card** showing relative time and a traffic-light freshness state. If this is per alert, place it in the alert table rather than as one aggregate KPI. |
| Acknowledgement Time = Acknowledged On − Created On | **Per-alert duration column with SLA status chip**; at summary level use a box plot or percentile band to show the distribution, not only the average. |
| Resolution Time = Closed On − Created On | **Per-alert duration column with SLA status chip**; at summary level use a box plot or percentile band to show the distribution. |
| SLA Compliance = Alerts Completed Within SLA ÷ Completed Alerts × 100 | **Gauge/bullet chart** with target line, numerator/denominator, and period trend. |

### Source and Integration KPIs

| KPI | Recommended visualization |
| --- | --- |
| Alerts by Source Type | **Sorted horizontal bar chart** by source type with counts and percentages. |
| Alerts by Integration | **Sorted horizontal bar chart** by integration; color failed/degraded integrations differently. |
| Alerts by Company or Facility | **Drillable horizontal bar chart** with an All Companies → Company → Facility hierarchy. |
| Alerts by Affected Location | **Map with clustered markers**; use a ranked horizontal bar if coordinates are unavailable. |
| Most Frequent Alert Category | **Top-category KPI card** supported by a ranked top-five horizontal bar chart. |
| Integrations Currently Generating Alerts | **Live integration-status list** with healthy/degraded status dot, last alert time, and alert count. |
| Failed or Delayed Integrations | **Critical exception card** with count and a compact table showing integration, status, failure/delay duration, and last successful message. |
| Duplicate Alerts Detected | **KPI number card** with duplicate rate and trend; drill down to duplicate clusters. |
| Alerts Generated Manually Versus Automatically | **100% stacked bar or donut chart** split into Manual and Automatic, with counts and percentages. |

## Tasks Overview

| KPI | Recommended visualization |
| --- | --- |
| Open | **KPI number card** with backlog-age indicator. |
| In Progress | **KPI number card** with blue emphasis and percentage of all tasks. |
| Completed | **Green KPI number card** with completion rate and trend. |

> Best combined visual: use a **stacked horizontal bar** for Open, In Progress, and Completed. Add a separate red exception segment/card for Overdue tasks if due dates are available.

---

# Right Side

## HR

| KPI | Recommended visualization |
| --- | --- |
| Total Employees | **KPI number card** with workforce icon and comparison to required headcount if available. |
| Available Employees | **Green KPI number card** with availability percentage beneath it. |
| Assigned Employees | **Blue KPI number card** with utilization percentage beneath it. |
| Unavailable Employees | **Red/amber KPI number card** with reason breakdown in the drill-down. |
| Workforce Availability Rate (Available Employees ÷ Total Employees × 100) | **Radial gauge or progress ring** with target and warning threshold bands. |
| Workforce Utilization Rate (Assigned Employees ÷ Total Employees × 100) | **Bullet chart or horizontal progress bar** against an approved utilization range. |
| Mobilizable Employees | **Large KPI number card** with number available within selected mobilization windows, such as 15, 30, and 60 minutes. |
| Average Mobilization Time | **Duration KPI card with SLA bullet bar** and trend versus previous incidents/drills. |
| Critical-Role Coverage (Available Employees in Critical Roles ÷ Required Employees × 100) | **Gauge or bullet chart** with required versus available counts; use red below the minimum coverage threshold. |
| Roles with Staffing Shortages | **Ranked horizontal variance bar chart** showing required minus available employees by role. |
| Skills Coverage Rate | **Heatmap matrix** with critical skills as rows and departments/facilities as columns; use a summary gauge only for the overall rate. |
| Employees Unavailable by Department, Company, or Location | **Drillable stacked horizontal bar chart** with a dimension selector and segments for absence/unavailability reasons. Use a map for geographic location when useful. |

> Best combined workforce visual: use a **100% stacked bar** showing Available, Assigned, and Unavailable employees, with separate gauges for Availability Rate and Critical-Role Coverage.

---

# Recommended Dashboard Interaction

- Every KPI card should support click-through to the filtered record list that produced the value.
- Include global filters for company, region, facility, incident, date range, and operational status.
- Show the selected hierarchy clearly: **All Companies → Company → Region → Facility**.
- Display **last updated time** and data freshness status for each major section.
- Show **No Data**, **Not Applicable**, and **Zero** as distinct states.
- Allow users to switch applicable charts between **count**, **percentage**, and **rate**.
- Use comparison indicators consistently: current period versus previous equivalent period, target, or SLA.
- Keep the first dashboard level focused on exceptions and readiness; move detailed distributions, tables, maps, and record lists into drill-down views.

# Suggested Visual Priority

1. **Primary executive indicators:** Overall Readiness, Active Events, Critical Alerts, Unacknowledged Critical Alerts, Critical Assets Affected, Impacted Customers, Immediate Transport Capacity, Workforce Availability, and Critical-Role Coverage.
2. **Operational indicators:** resource availability, fleet readiness, chemical shortages/expiry, evacuation progress, restoration progress, alert response performance, and task progress.
3. **Analytical indicators:** trends, classification/source distributions, company/facility comparisons, aging, heatmaps, and geographic impact maps.

