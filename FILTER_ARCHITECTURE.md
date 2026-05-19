# Filter Implementation Architecture

## Component Hierarchy & Data Flow

```mermaid
graph TD
    A[App.jsx] -->|analytics data| B[Dashboard.jsx]
    B -->|filter state & handlers| C[FilterBar.jsx]
    B -->|filtered data| D[Stats Cards]
    B -->|filtered data| E[View Selector]
    B -->|filtered data| F[Charts Grid]
    B -->|filtered data| G[Vacation Lists]
    
    C -->|Search Input| C1[Employee Name Filter]
    C -->|Dropdown| C2[Manager Filter]
    C -->|Dropdown| C3[Status Filter]
    C -->|Date Pickers| C4[Date Range Filter]
    C -->|Button| C5[Clear All Filters]
    
    F --> F1[Status Pie Chart]
    F --> F2[Monthly Line Chart]
    F --> F3[Employee Bar Chart]
    F --> F4[Manager Bar Chart]
    
    G --> G1[Current Vacations]
    G --> G2[Forecast Window]
    G --> G3[Manager View]
    
    style B fill:#667eea,color:#fff
    style C fill:#764ba2,color:#fff
    style D fill:#10b981,color:#fff
    style F fill:#4facfe,color:#fff
    style G fill:#f093fb,color:#fff
```

## Filter State Structure

```javascript
const [filters, setFilters] = useState({
  searchText: '',           // Employee name search
  managers: [],             // Array of selected managers
  statuses: [],             // Array of selected statuses
  dateRange: {
    start: null,            // Start date (Date object or null)
    end: null               // End date (Date object or null)
  }
});
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant FilterBar
    participant Dashboard
    participant Charts
    participant Lists
    
    User->>FilterBar: Changes filter
    FilterBar->>Dashboard: onFilterChange(newFilters)
    Dashboard->>Dashboard: Update filter state
    Dashboard->>Dashboard: Apply filters to raw data
    Dashboard->>Dashboard: Recalculate statistics
    Dashboard->>Charts: Pass filtered data
    Dashboard->>Lists: Pass filtered items
    Charts->>User: Display updated charts
    Lists->>User: Display filtered results
```

## Filter Logic Flow

```mermaid
flowchart TD
    Start[Raw Analytics Data] --> Filter1{Search Text?}
    Filter1 -->|Yes| Apply1[Filter by Employee Name]
    Filter1 -->|No| Filter2
    Apply1 --> Filter2{Managers Selected?}
    Filter2 -->|Yes| Apply2[Filter by Manager]
    Filter2 -->|No| Filter3
    Apply2 --> Filter3{Statuses Selected?}
    Filter3 -->|Yes| Apply3[Filter by Status]
    Filter3 -->|No| Filter4
    Apply3 --> Filter4{Date Range Set?}
    Filter4 -->|Yes| Apply4[Filter by Date Range]
    Filter4 -->|No| Recalc
    Apply4 --> Recalc[Recalculate Statistics]
    Recalc --> Update[Update All Views]
    Update --> End[Display Filtered Results]
    
    style Start fill:#667eea,color:#fff
    style End fill:#10b981,color:#fff
    style Recalc fill:#f59e0b,color:#fff
```

## Component Interaction

### FilterBar Component
**Responsibilities:**
- Render all filter controls
- Manage local input states
- Emit filter changes to parent
- Display active filter count
- Provide clear filters action

**Key Methods:**
```javascript
handleSearchChange(text)
handleManagerChange(selectedManagers)
handleStatusChange(selectedStatuses)
handleDateRangeChange(start, end)
handleClearFilters()
```

### Dashboard Component
**Responsibilities:**
- Maintain filter state
- Apply filters to raw data
- Recalculate statistics from filtered data
- Pass filtered data to child components
- Coordinate view updates

**Key Methods:**
```javascript
applyFilters(items, filters)
recalculateStats(filteredItems)
handleFilterChange(newFilters)
getUniqueManagers(items)
getUniqueStatuses(items)
```

## Performance Optimization

```mermaid
graph LR
    A[User Input] -->|Debounce 300ms| B[Filter Change]
    B --> C{Data Changed?}
    C -->|Yes| D[useMemo: Apply Filters]
    C -->|No| E[Skip Recalculation]
    D --> F[useMemo: Recalc Stats]
    F --> G[Re-render Components]
    E --> H[No Re-render]
    
    style D fill:#10b981,color:#fff
    style F fill:#10b981,color:#fff
    style E fill:#6b7280,color:#fff
```

## Filter Application Algorithm

```javascript
function applyFilters(items, filters) {
  return items.filter(item => {
    // 1. Search text filter (case-insensitive)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const nameMatch = item.employeeName?.toLowerCase().includes(searchLower);
      if (!nameMatch) return false;
    }
    
    // 2. Manager filter (OR logic for multiple managers)
    if (filters.managers.length > 0) {
      if (!filters.managers.includes(item.manager)) return false;
    }
    
    // 3. Status filter (OR logic for multiple statuses)
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(item.status)) return false;
    }
    
    // 4. Date range filter (AND logic)
    if (filters.dateRange.start) {
      const itemStart = new Date(item.startDate);
      if (itemStart < filters.dateRange.start) return false;
    }
    
    if (filters.dateRange.end) {
      const itemEnd = new Date(item.endDate);
      if (itemEnd > filters.dateRange.end) return false;
    }
    
    // All filters passed
    return true;
  });
}
```

## UI Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Header                         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      FilterBar Component                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  Search  │ │ Manager  │ │  Status  │ │   Date Range   │ │
│  │   Box    │ │ Dropdown │ │ Dropdown │ │     Picker     │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│  [Clear All Filters] [Active: 3 filters]                    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Stats Cards (Filtered)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Total   │ │ Current  │ │ Forecast │ │ Managers │      │
│  │ Requests │ │Vacations │ │(3 Months)│ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                       View Selector                          │
│  [Overview] [Forecast] [Managers] [Current]                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Content Area (Filtered)                    │
│  Charts / Lists based on selected view                       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Components
1. Create FilterBar.jsx with basic structure
2. Create FilterBar.css with styling
3. Add filter state to Dashboard.jsx

### Phase 2: Filter Logic
4. Implement applyFilters function
5. Integrate filtering with existing data flow
6. Update statistics calculation

### Phase 3: UI Integration
7. Add FilterBar to Dashboard
8. Connect filter handlers
9. Update all views to use filtered data

### Phase 4: Polish & Testing
10. Add visual feedback (badges, counts)
11. Implement clear filters
12. Test all combinations
13. Optimize performance
