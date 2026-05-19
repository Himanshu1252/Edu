# Fix UI responsiveness, flexbox alignments, and CSS overflow issues

## Description
This PR resolves several structural UI alignment and formatting issues across the application while strictly preserving the original Dark Glassmorphism aesthetic. 

The previous layout had CSS bugs that caused overlapping elements, unreadable tables on mobile viewports, and extreme 3D transforms that broke the document flow. These have been addressed gracefully with targeted CSS fixes.

## Changes Made
- **Responsive Grids:** Updated the `grid-template-columns` property for `.login-sections` to use `minmax(min(100%, 300px), 1fr)`. This ensures the panels wrap elegantly on smaller screens instead of forcing a rigid 350px minimum that breaks the viewport.
- **Table Overflow Handling:** Changed `.table-container` from `overflow-x: visible` to `overflow-x: auto`. Large tables in the Admin and Student dashboards can now be scrolled horizontally on mobile devices without spilling out of their glass panels.
- **Fixed 3D Transform Misalignments:** Dialed back aggressive `transform: translateZ()` properties on `.form-group`, `.btn-primary`, `.stat-box`, and `.glass-panel` children. These extreme 3D effects were previously causing form inputs and buttons to overlap or misalign with their parents. They now still "pop out" elegantly but remain within the correct document flow.

## Note on Raw Template Syntax
*The issue report mentioned raw Jinja tags (e.g., `{{ student.name }}`) being visible. This occurs when users open the `.html` files directly via the browser (`file:///...`). The templates themselves are structurally sound and render perfectly when the Flask development server (`app.py`) is running.*

## Testing
- Verified alignment on mobile, tablet, and desktop breakpoints.
- Verified that tables can scroll horizontally on small screens without breaking the layout.
- Tested form inputs and buttons to ensure they remain accessible and correctly positioned under 3D hover effects.
