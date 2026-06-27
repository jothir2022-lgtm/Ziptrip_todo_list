# Features & Functionalities

---

## Page 1: Todo List (`/`)

### Stats Dashboard
Five live stat cards shown at the top of the page:
- **Total** — total number of tasks
- **Active** — tasks not yet completed
- **Done** — completed tasks
- **Urgent** — high-priority active tasks
- **Overdue** — active tasks past their due date

Stats update immediately on any action.

---

### Add New Task
Click **+ Add New Task** to expand the create form. Fields:

| Field       | Required | Description                                    |
|-------------|----------|------------------------------------------------|
| Title       | Yes      | Short name for the task                        |
| Description | No       | Longer context or detail                       |
| Priority    | No       | High / Medium (default) / Low                  |
| Due Date    | No       | Date picker; enforces future dates             |
| Tags        | No       | Press Enter or comma to add multiple tags      |

Pressing **Enter** in the title field submits the form. Cancel collapses the form without saving.

---

### Todo List

Each task card shows:
- **Completion checkbox** — click to toggle done/undone without opening the task
- **Title** — struck through when completed
- **Description** (truncated to one line)
- **Priority badge** — color-coded: 🔴 High / 🟠 Medium / 🟢 Low
- **Due date** — turns red and shows "overdue" if past due and not completed
- **Tags** — small chips for each tag
- **Subtask progress** — e.g. `☑ 2/3` if subtasks exist
- **Edit button** (on hover) — navigates to detail page
- **Delete button** (on hover) — shows a confirmation modal before deleting

Clicking anywhere on the card (except the checkbox and action buttons) navigates to the detail page.

---

### Filtering & Search

**Status tabs:** All / Active / Completed  
**Priority filter:** dropdown to show only High, Medium, or Low priority tasks  
**Search:** instant text search across task title and description  
**Sort order:** Newest first / Due date / Priority / Title A–Z

All filters combine. For example: Active + High priority + search "design" shows only active, high-priority tasks containing "design."

---

### Clear Completed
A **Clear completed** button appears in the header when at least one task is done. Removes all completed tasks in one click.

---

## Page 2: Todo Detail (`/todo?id=<uuid>`)

Accessed via URL with a `?id=` query parameter. Displays the full details of a single task.

### Task Header
- Large title (struck through if completed)
- Priority badge and status chips (Completed / Overdue)
- **Toggle completion button** — marks complete or active

### Metadata Grid
Displays structured info in cards:
- Created at (date + time)
- Last updated (date + time)
- Due date (highlighted red if overdue)
- Completed at (only shown when task is done)
- Subtask progress count

### Description
Full, untruncated description text with preserved line breaks.

### Tags
All tags displayed as chips.

### Subtasks
Checklist of subtasks inside the task. Each subtask can be:
- **Toggled** — click the checkbox to mark done/undone
- **Deleted** — click × to remove
- **Added** — type in the input and press Enter or click Add

Subtask changes are saved to the backend immediately.

### Notes
A free-form text area for personal notes, links, or context. Click **Save notes** to persist. Separate from the main description to allow editing without modifying the canonical task description.

### Edit Mode
Click **Edit** (top right) to enter inline editing of:
- Title, Description, Priority, Due Date, Tags

Click **Save changes** to persist, or **Cancel** to discard.

### Delete
Click **Delete** in the header to permanently remove the task and return to the list.

---

## General UX Features

- **Toast notifications** — brief success/error banners for every action (auto-dismiss in 3 seconds)
- **Confirmation modal** — shown before any delete action to prevent accidental loss
- **Responsive design** — works on mobile and desktop
- **Dark theme** — consistent dark UI throughout
- **Keyboard friendly** — forms submit on Enter; all interactive elements are keyboard-reachable
- **Not Found state** — `/todo?id=invalid` shows a friendly error with a back button
- **Empty state** — filtered list with no results shows a clear empty state message
