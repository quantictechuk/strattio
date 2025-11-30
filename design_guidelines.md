# Strattio Design System Guidelines

## GRADIENT RESTRICTION RULE

**NEVER** use dark/saturated gradient combos (e.g., purple/pink, blue-500 to purple-600) on any UI element.
**NEVER** let gradients cover more than 20% of the viewport.
**NEVER** apply gradients to text-heavy content or reading areas.
**NEVER** use gradients on small UI elements (<100px width).
**NEVER** stack multiple gradient layers in the same viewport.

### ENFORCEMENT RULE
**IF** gradient area exceeds 20% of viewport **OR** impacts readability  
**THEN** fallback to solid colors or simple, two-color gradients.

### ALLOWED GRADIENT USAGE
- Hero/landing sections (background only, ensure text readability)
- Section backgrounds (not content blocks)
- Large CTA buttons / major interactive elements (light/simple gradients only)
- Decorative overlays and accent visuals

---

## Design Philosophy

Strattio embodies **professional trustworthiness** with a **data-driven, transparent** approach. The design system prioritizes:

1. **Enterprise-grade professionalism** - Suitable for loan officers, visa officers, and investors
2. **Guided simplicity** - Complex business planning made approachable
3. **Transparent credibility** - Show data sources, citations, and methodology
4. **Progressive disclosure** - Never overwhelm; reveal complexity gradually
5. **Celebration of progress** - Acknowledge milestones and completion

---

## Color System

### Primary Palette

```json
{
  "primary": {
    "50": "#EBF5FF",
    "100": "#D6EBFF",
    "200": "#B3D9FF",
    "300": "#80C1FF",
    "400": "#4DA3FF",
    "500": "#1A85FF",
    "600": "#0066E6",
    "700": "#004DB3",
    "800": "#003380",
    "900": "#001A4D"
  },
  "secondary": {
    "50": "#E8F5F1",
    "100": "#C7E8DD",
    "200": "#9FD9C7",
    "300": "#77CAB1",
    "400": "#4FBB9B",
    "500": "#27AC85",
    "600": "#1F8A6A",
    "700": "#17674F",
    "800": "#0F4535",
    "900": "#07221A"
  },
  "neutral": {
    "50": "#F8FAFB",
    "100": "#F1F4F7",
    "200": "#E4E9EF",
    "300": "#CBD4E0",
    "400": "#9BA9BC",
    "500": "#6B7A91",
    "600": "#4A5568",
    "700": "#2D3748",
    "800": "#1A202C",
    "900": "#0F1419"
  }
}
```

### Semantic Colors

```json
{
  "success": {
    "light": "#D1FAE5",
    "DEFAULT": "#10B981",
    "dark": "#065F46"
  },
  "warning": {
    "light": "#FEF3C7",
    "DEFAULT": "#F59E0B",
    "dark": "#92400E"
  },
  "error": {
    "light": "#FEE2E2",
    "DEFAULT": "#EF4444",
    "dark": "#991B1B"
  },
  "info": {
    "light": "#DBEAFE",
    "DEFAULT": "#3B82F6",
    "dark": "#1E40AF"
  }
}
```

### Background & Surface Colors

```json
{
  "background": {
    "primary": "#FFFFFF",
    "secondary": "#F8FAFB",
    "tertiary": "#F1F4F7"
  },
  "surface": {
    "card": "#FFFFFF",
    "elevated": "#FFFFFF",
    "overlay": "rgba(15, 20, 25, 0.6)"
  }
}
```

### Color Usage Guidelines

- **Primary Blue (#1A85FF)**: Main CTAs, active states, links, progress indicators
- **Secondary Teal (#27AC85)**: Success states, completion badges, secondary actions
- **Neutral Grays**: Text hierarchy, borders, disabled states, backgrounds
- **White (#FFFFFF)**: All cards, content areas, modals, forms
- **Semantic Colors**: Status indicators, alerts, validation messages

**CRITICAL**: Use white backgrounds for all content cards and reading areas. Reserve gradients ONLY for hero sections (max 20% viewport).

---

## Typography

### Font Families

```css
/* Primary Font - IBM Plex Sans (Professional, Technical) */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

/* Secondary Font - Inter (UI Elements) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Monospace - IBM Plex Mono (Code, Data) */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

### Typography Scale

```json
{
  "h1": {
    "fontSize": "text-4xl sm:text-5xl lg:text-6xl",
    "fontWeight": "font-bold",
    "lineHeight": "leading-tight",
    "letterSpacing": "tracking-tight",
    "fontFamily": "font-['IBM_Plex_Sans']"
  },
  "h2": {
    "fontSize": "text-3xl sm:text-4xl lg:text-5xl",
    "fontWeight": "font-bold",
    "lineHeight": "leading-tight",
    "letterSpacing": "tracking-tight",
    "fontFamily": "font-['IBM_Plex_Sans']"
  },
  "h3": {
    "fontSize": "text-2xl sm:text-3xl lg:text-4xl",
    "fontWeight": "font-semibold",
    "lineHeight": "leading-snug",
    "fontFamily": "font-['IBM_Plex_Sans']"
  },
  "h4": {
    "fontSize": "text-xl sm:text-2xl",
    "fontWeight": "font-semibold",
    "lineHeight": "leading-snug",
    "fontFamily": "font-['IBM_Plex_Sans']"
  },
  "h5": {
    "fontSize": "text-lg sm:text-xl",
    "fontWeight": "font-semibold",
    "lineHeight": "leading-normal",
    "fontFamily": "font-['IBM_Plex_Sans']"
  },
  "body-large": {
    "fontSize": "text-lg",
    "fontWeight": "font-normal",
    "lineHeight": "leading-relaxed",
    "fontFamily": "font-['Inter']"
  },
  "body": {
    "fontSize": "text-base",
    "fontWeight": "font-normal",
    "lineHeight": "leading-relaxed",
    "fontFamily": "font-['Inter']"
  },
  "body-small": {
    "fontSize": "text-sm",
    "fontWeight": "font-normal",
    "lineHeight": "leading-normal",
    "fontFamily": "font-['Inter']"
  },
  "caption": {
    "fontSize": "text-xs",
    "fontWeight": "font-medium",
    "lineHeight": "leading-tight",
    "fontFamily": "font-['Inter']"
  },
  "code": {
    "fontSize": "text-sm",
    "fontWeight": "font-normal",
    "fontFamily": "font-['IBM_Plex_Mono']"
  }
}
```

### Text Color Hierarchy

```css
.text-primary { color: #1A202C; } /* Headings, primary content */
.text-secondary { color: #4A5568; } /* Body text, descriptions */
.text-tertiary { color: #6B7A91; } /* Supporting text, labels */
.text-disabled { color: #9BA9BC; } /* Disabled states */
.text-inverse { color: #FFFFFF; } /* Text on dark backgrounds */
```

---

## Spacing System

Use consistent spacing tokens based on 4px base unit:

```json
{
  "spacing": {
    "xs": "0.25rem",    /* 4px */
    "sm": "0.5rem",     /* 8px */
    "md": "1rem",       /* 16px */
    "lg": "1.5rem",     /* 24px */
    "xl": "2rem",       /* 32px */
    "2xl": "3rem",      /* 48px */
    "3xl": "4rem",      /* 64px */
    "4xl": "6rem",      /* 96px */
    "5xl": "8rem"       /* 128px */
  }
}
```

### Spacing Usage

- **Component padding**: `p-4` to `p-6` (16-24px)
- **Card padding**: `p-6` to `p-8` (24-32px)
- **Section spacing**: `py-12` to `py-20` (48-80px)
- **Element gaps**: `gap-4` to `gap-6` (16-24px)
- **Form field spacing**: `space-y-4` (16px vertical)

---

## Layout & Grid System

### Container Widths

```css
.container-sm { max-width: 640px; }   /* Forms, wizards */
.container-md { max-width: 768px; }   /* Content pages */
.container-lg { max-width: 1024px; }  /* Dashboards */
.container-xl { max-width: 1280px; }  /* Wide layouts */
.container-2xl { max-width: 1536px; } /* Full-width dashboards */
```

### Grid Patterns

**Dashboard Layout (3-column)**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <aside className="lg:col-span-3">Sidebar</aside>
  <main className="lg:col-span-9">Content</main>
</div>
```

**Card Grid (Responsive)**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

**Form Layout (Single Column)**
```jsx
<div className="max-w-2xl mx-auto space-y-6">
  {/* Form fields */}
</div>
```

---

## Component Design Patterns

### Buttons

#### Primary Button
```jsx
<button 
  data-testid="primary-action-button"
  className="
    px-6 py-3 
    bg-primary-600 hover:bg-primary-700 
    text-white font-semibold 
    rounded-lg 
    shadow-sm hover:shadow-md
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  "
>
  Generate Plan
</button>
```

#### Secondary Button
```jsx
<button 
  data-testid="secondary-action-button"
  className="
    px-6 py-3 
    bg-white hover:bg-neutral-50 
    text-primary-700 font-semibold 
    border-2 border-primary-600
    rounded-lg 
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  "
>
  Save Draft
</button>
```

#### Ghost Button
```jsx
<button 
  data-testid="ghost-action-button"
  className="
    px-4 py-2 
    text-neutral-700 hover:text-primary-600 hover:bg-primary-50
    font-medium 
    rounded-md 
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500
  "
>
  Cancel
</button>
```

**Button Specifications:**
- **Shape**: Medium radius (8px) for professional tone
- **Sizes**: 
  - Small: `px-4 py-2 text-sm`
  - Medium: `px-6 py-3 text-base`
  - Large: `px-8 py-4 text-lg`
- **Motion**: Smooth hover with scale (0.98) on press
- **States**: Default, Hover, Active, Focus, Disabled, Loading

### Cards

#### Standard Card
```jsx
<div 
  data-testid="content-card"
  className="
    bg-white 
    rounded-xl 
    border border-neutral-200 
    shadow-sm hover:shadow-md
    p-6
    transition-shadow duration-200
  "
>
  {/* Card content */}
</div>
```

#### Elevated Card (Important Content)
```jsx
<div 
  data-testid="elevated-card"
  className="
    bg-white 
    rounded-xl 
    shadow-lg
    p-8
    border border-neutral-100
  "
>
  {/* Card content */}
</div>
```

### Form Elements

#### Input Field
```jsx
<div className="space-y-2">
  <label 
    htmlFor="business-name" 
    className="block text-sm font-medium text-neutral-700"
  >
    Business Name
  </label>
  <input
    id="business-name"
    data-testid="business-name-input"
    type="text"
    className="
      w-full px-4 py-3
      bg-white
      border border-neutral-300 
      rounded-lg
      text-neutral-900
      placeholder:text-neutral-400
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:bg-neutral-100 disabled:cursor-not-allowed
      transition-colors duration-200
    "
    placeholder="Enter your business name"
  />
  <p className="text-xs text-neutral-500">This will appear on your business plan</p>
</div>
```

#### Select Dropdown (Use shadcn Select component)
```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

<Select data-testid="industry-select">
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select industry" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="tech">Technology</SelectItem>
    <SelectItem value="retail">Retail</SelectItem>
    <SelectItem value="food">Food & Beverage</SelectItem>
  </SelectContent>
</Select>
```

#### Textarea
```jsx
<textarea
  data-testid="business-description-textarea"
  rows={4}
  className="
    w-full px-4 py-3
    bg-white
    border border-neutral-300 
    rounded-lg
    text-neutral-900
    placeholder:text-neutral-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    resize-none
    transition-colors duration-200
  "
  placeholder="Describe your business..."
/>
```

### Progress Indicators

#### Step Progress (Wizard)
```jsx
<div className="flex items-center justify-between" data-testid="wizard-progress">
  {steps.map((step, index) => (
    <div key={step.id} className="flex items-center">
      <div className={`
        flex items-center justify-center
        w-10 h-10 rounded-full
        font-semibold text-sm
        transition-all duration-300
        ${index <= currentStep 
          ? 'bg-primary-600 text-white' 
          : 'bg-neutral-200 text-neutral-500'
        }
      `}>
        {index < currentStep ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          index + 1
        )}
      </div>
      {index < steps.length - 1 && (
        <div className={`
          w-16 h-1 mx-2
          transition-colors duration-300
          ${index < currentStep ? 'bg-primary-600' : 'bg-neutral-200'}
        `} />
      )}
    </div>
  ))}
</div>
```

#### Linear Progress Bar
```jsx
import { Progress } from "./components/ui/progress";

<div className="space-y-2" data-testid="generation-progress">
  <div className="flex justify-between text-sm">
    <span className="text-neutral-700 font-medium">Generating plan...</span>
    <span className="text-neutral-500">{progress}%</span>
  </div>
  <Progress value={progress} className="h-2" />
</div>
```

### Badges & Status Indicators

#### Status Badge
```jsx
const statusStyles = {
  draft: "bg-neutral-100 text-neutral-700 border-neutral-300",
  generating: "bg-blue-100 text-blue-700 border-blue-300",
  complete: "bg-green-100 text-green-700 border-green-300",
  error: "bg-red-100 text-red-700 border-red-300"
};

<span 
  data-testid={`status-badge-${status}`}
  className={`
    inline-flex items-center gap-1.5
    px-3 py-1
    text-xs font-semibold
    rounded-full
    border
    ${statusStyles[status]}
  `}
>
  <span className="w-2 h-2 rounded-full bg-current" />
  {status}
</span>
```

#### Citation Badge
```jsx
<button
  data-testid="citation-badge"
  className="
    inline-flex items-center gap-1
    px-2 py-1
    text-xs font-medium
    text-primary-700 bg-primary-50
    border border-primary-200
    rounded-md
    hover:bg-primary-100
    transition-colors duration-200
  "
>
  <InfoIcon className="w-3 h-3" />
  Source
</button>
```

### Alerts & Notifications

#### Info Alert
```jsx
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

<Alert data-testid="info-alert" className="border-info-DEFAULT bg-info-light">
  <InfoIcon className="h-4 w-4 text-info-DEFAULT" />
  <AlertTitle className="text-info-dark">Data Source</AlertTitle>
  <AlertDescription className="text-info-dark">
    Market data sourced from UK Office for National Statistics (ONS) - Updated Jan 2024
  </AlertDescription>
</Alert>
```

#### Success Alert
```jsx
<Alert data-testid="success-alert" className="border-success-DEFAULT bg-success-light">
  <CheckCircleIcon className="h-4 w-4 text-success-DEFAULT" />
  <AlertTitle className="text-success-dark">Plan Generated Successfully</AlertTitle>
  <AlertDescription className="text-success-dark">
    Your business plan is ready for review and export.
  </AlertDescription>
</Alert>
```

#### Error Alert
```jsx
<Alert data-testid="error-alert" className="border-error-DEFAULT bg-error-light">
  <AlertCircleIcon className="h-4 w-4 text-error-DEFAULT" />
  <AlertTitle className="text-error-dark">Generation Failed</AlertTitle>
  <AlertDescription className="text-error-dark">
    Unable to generate financial projections. Please check your inputs and try again.
  </AlertDescription>
</Alert>
```

### Tooltips (Use shadcn Tooltip)

```jsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger data-testid="help-tooltip-trigger">
      <HelpCircleIcon className="w-4 h-4 text-neutral-400" />
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-sm">This field is required for loan applications</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Feature-Specific Design Patterns

### 1. Smart Intake Wizard (Conversational Interface)

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary">
  <div className="max-w-3xl mx-auto px-4 py-8">
    {/* Progress Header */}
    <div className="mb-8" data-testid="wizard-header">
      <Progress value={(currentStep / totalSteps) * 100} className="h-2 mb-4" />
      <p className="text-sm text-neutral-600">Step {currentStep} of {totalSteps}</p>
    </div>

    {/* Chat Messages Container */}
    <div 
      data-testid="chat-messages-container"
      className="space-y-6 mb-24"
    >
      {/* AI Message */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-primary-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-neutral-200">
            <p className="text-neutral-800">
              Let's start with the basics. What's the name of your business?
            </p>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Just now</p>
        </div>
      </div>

      {/* User Message */}
      <div className="flex gap-4 justify-end">
        <div className="flex-1 max-w-md">
          <div className="bg-primary-600 rounded-2xl rounded-tr-none p-4 shadow-sm">
            <p className="text-white">
              TechStart Solutions
            </p>
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-right">2 min ago</p>
        </div>
      </div>
    </div>

    {/* Input Area (Fixed Bottom) */}
    <div 
      data-testid="wizard-input-area"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4"
    >
      <div className="max-w-3xl mx-auto flex gap-3">
        <input
          data-testid="wizard-input-field"
          type="text"
          placeholder="Type your answer..."
          className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          data-testid="wizard-submit-button"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>
```

**Design Principles:**
- Chat bubbles with distinct colors (AI: white, User: primary blue)
- Smooth scroll animations when new messages appear
- Auto-focus on input field
- Show typing indicator when AI is "thinking"
- Validate inputs inline before allowing progression
- Use micro-animations for message appearance (fade + slide up)

### 2. Plan Dashboard (List View)

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary">
  {/* Header */}
  <header className="bg-white border-b border-neutral-200">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">My Business Plans</h1>
        <button 
          data-testid="create-plan-button"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          + New Plan
        </button>
      </div>
    </div>
  </header>

  {/* Plans Grid */}
  <main className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Plan Card */}
      <div 
        data-testid="plan-card"
        className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
              TechStart Solutions
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="plan-actions-menu">
                <MoreVerticalIcon className="w-5 h-5 text-neutral-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="view-plan-action">View</DropdownMenuItem>
                <DropdownMenuItem data-testid="edit-plan-action">Edit</DropdownMenuItem>
                <DropdownMenuItem data-testid="clone-plan-action">Clone</DropdownMenuItem>
                <DropdownMenuItem data-testid="delete-plan-action" className="text-error-DEFAULT">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
              <span className="w-2 h-2 rounded-full bg-current" />
              Complete
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <CalendarIcon className="w-4 h-4" />
            <span>Created Jan 15, 2024</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <FileTextIcon className="w-4 h-4" />
            <span>12 sections • 45 pages</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <TargetIcon className="w-4 h-4" />
            <span>Loan Application</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button 
            data-testid="view-plan-button"
            className="w-full px-4 py-2 text-primary-700 font-medium hover:bg-primary-50 rounded-lg transition-colors"
          >
            View Plan
          </button>
        </div>
      </div>
    </div>
  </main>
</div>
```

**Design Principles:**
- Card-based layout for easy scanning
- Clear status indicators (draft, generating, complete, error)
- Quick actions via dropdown menu
- Hover effects to indicate interactivity
- Empty state with illustration and CTA when no plans exist

### 3. Plan Editor (Section-by-Section)

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
    {/* Sidebar Navigation */}
    <aside 
      data-testid="plan-editor-sidebar"
      className="lg:col-span-3 bg-white border-r border-neutral-200 h-screen sticky top-0 overflow-y-auto"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Sections</h2>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              data-testid={`section-nav-${section.id}`}
              className={`
                w-full text-left px-4 py-3 rounded-lg transition-colors
                ${activeSection === section.id 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{section.title}</span>
                {section.status === 'complete' && (
                  <CheckCircleIcon className="w-4 h-4 text-success-DEFAULT" />
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </aside>

    {/* Main Editor Area */}
    <main className="lg:col-span-9 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-neutral-900">Executive Summary</h1>
            <div className="flex gap-2">
              <button 
                data-testid="regenerate-section-button"
                className="px-4 py-2 text-primary-700 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                <RefreshIcon className="w-4 h-4 inline mr-2" />
                Regenerate
              </button>
              <button 
                data-testid="save-section-button"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
          <p className="text-neutral-600">
            A concise overview of your business, highlighting key points for investors and lenders.
          </p>
        </div>

        {/* Editor Content */}
        <div 
          data-testid="section-editor-content"
          className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8"
        >
          <textarea
            data-testid="section-editor-textarea"
            className="w-full min-h-[400px] text-neutral-900 leading-relaxed focus:outline-none resize-none"
            defaultValue={sectionContent}
          />
        </div>

        {/* Citations & Sources */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Data Sources</h3>
          <div className="space-y-2">
            <div 
              data-testid="citation-item"
              className="flex items-start gap-3 p-3 bg-info-light border border-info-DEFAULT rounded-lg"
            >
              <InfoIcon className="w-4 h-4 text-info-DEFAULT mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-info-dark font-medium">UK Market Data</p>
                <p className="text-xs text-info-dark mt-1">
                  Office for National Statistics (ONS) - Updated Jan 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

**Design Principles:**
- Sticky sidebar navigation for easy section switching
- Large, distraction-free editor area
- Clear regeneration controls with confirmation
- Inline citations and data source transparency
- Auto-save indicator
- Version history access

### 4. Financial Dashboard

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary p-8">
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Financial Projections</h1>
      <p className="text-neutral-600">3-year forecast based on your business model</p>
    </div>

    {/* KPI Cards */}
    <div 
      data-testid="financial-kpi-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {/* KPI Card */}
      <div 
        data-testid="kpi-card-revenue"
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-neutral-600">Total Revenue (Y1)</p>
          <TrendingUpIcon className="w-5 h-5 text-success-DEFAULT" />
        </div>
        <p className="text-3xl font-bold text-neutral-900 mb-2">£450,000</p>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-success-DEFAULT font-medium">+12.5%</span>
          <span className="text-neutral-500">vs projection</span>
        </div>
      </div>

      {/* Repeat for other KPIs */}
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue Chart */}
      <div 
        data-testid="revenue-chart-card"
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Forecast</h3>
        {/* Use Recharts for visualization */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EF" />
            <XAxis dataKey="month" stroke="#6B7A91" />
            <YAxis stroke="#6B7A91" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#1A85FF" 
              strokeWidth={2}
              dot={{ fill: '#1A85FF', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      <div 
        data-testid="expense-chart-card"
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Expense Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Financial Table */}
    <div 
      data-testid="financial-table-card"
      className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Detailed Projections</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Year 1
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Year 2
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Year 3
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            <tr data-testid="financial-row-revenue">
              <td className="px-6 py-4 text-sm font-medium text-neutral-900">Revenue</td>
              <td className="px-6 py-4 text-sm text-neutral-900 text-right">£450,000</td>
              <td className="px-6 py-4 text-sm text-neutral-900 text-right">£675,000</td>
              <td className="px-6 py-4 text-sm text-neutral-900 text-right">£945,000</td>
            </tr>
            {/* More rows */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

**Design Principles:**
- KPI cards with clear hierarchy and trend indicators
- Use Recharts for all data visualizations
- Consistent color coding (primary blue for revenue, secondary teal for profit, neutral for expenses)
- Responsive tables with horizontal scroll on mobile
- Export functionality for charts and tables
- Editable assumptions with inline validation

**Chart Color Palette:**
```json
{
  "chartColors": {
    "primary": "#1A85FF",
    "secondary": "#27AC85",
    "tertiary": "#F59E0B",
    "quaternary": "#8B5CF6",
    "neutral": "#6B7A91"
  }
}
```

### 5. Compliance Report

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary p-8">
  <div className="max-w-4xl mx-auto">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Compliance Check</h1>
      <p className="text-neutral-600">Verify your plan meets UK visa and loan requirements</p>
    </div>

    {/* Overall Status */}
    <div 
      data-testid="compliance-overall-status"
      className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Overall Compliance</h2>
          <p className="text-neutral-600">18 of 20 requirements met</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-success-DEFAULT mb-1">90%</div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-success-light text-success-dark border border-success-DEFAULT">
            <CheckCircleIcon className="w-3 h-3" />
            Ready
          </span>
        </div>
      </div>
    </div>

    {/* Compliance Categories */}
    <div className="space-y-6">
      {/* Category Card */}
      <div 
        data-testid="compliance-category-visa"
        className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">UK Visa Requirements</h3>
            <span className="text-sm font-medium text-success-DEFAULT">8/8 Complete</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Requirement Item - Pass */}
          <div 
            data-testid="compliance-item-market-research"
            className="flex items-start gap-4 p-4 bg-success-light border border-success-DEFAULT rounded-lg"
          >
            <CheckCircleIcon className="w-5 h-5 text-success-DEFAULT flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-success-dark mb-1">
                Market Research Included
              </h4>
              <p className="text-xs text-success-dark">
                UK market analysis with ONS data citations present in Section 3
              </p>
            </div>
          </div>

          {/* Requirement Item - Warning */}
          <div 
            data-testid="compliance-item-financial-detail"
            className="flex items-start gap-4 p-4 bg-warning-light border border-warning-DEFAULT rounded-lg"
          >
            <AlertTriangleIcon className="w-5 h-5 text-warning-DEFAULT flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-warning-dark mb-1">
                Financial Detail Could Be Improved
              </h4>
              <p className="text-xs text-warning-dark mb-2">
                Consider adding more detail to cash flow assumptions for stronger application
              </p>
              <button 
                data-testid="improve-section-button"
                className="text-xs font-medium text-warning-dark underline hover:no-underline"
              >
                Improve Section →
              </button>
            </div>
          </div>

          {/* Requirement Item - Fail */}
          <div 
            data-testid="compliance-item-missing-requirement"
            className="flex items-start gap-4 p-4 bg-error-light border border-error-DEFAULT rounded-lg"
          >
            <XCircleIcon className="w-5 h-5 text-error-DEFAULT flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-error-dark mb-1">
                Job Creation Plan Missing
              </h4>
              <p className="text-xs text-error-dark mb-2">
                UK visa applications require a clear job creation timeline
              </p>
              <button 
                data-testid="add-requirement-button"
                className="text-xs font-medium text-error-dark underline hover:no-underline"
              >
                Add This Section →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Repeat for other categories: Loan Requirements, General Best Practices */}
    </div>
  </div>
</div>
```

**Design Principles:**
- Clear visual hierarchy with color-coded status (green=pass, yellow=warning, red=fail)
- Actionable items with direct links to improve sections
- Progress indicators for each category
- Expandable/collapsible categories for better scanning
- Export compliance report as PDF

### 6. Export Modal

**Layout Structure:**
```jsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent 
    data-testid="export-modal"
    className="max-w-2xl"
  >
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">Export Business Plan</DialogTitle>
      <DialogDescription>
        Choose your export format and customization options
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-6 py-4">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            data-testid="export-format-pdf"
            className={`
              p-4 border-2 rounded-lg transition-all
              ${selectedFormat === 'pdf' 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-neutral-200 hover:border-neutral-300'
              }
            `}
            onClick={() => setSelectedFormat('pdf')}
          >
            <FileTextIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-semibold text-neutral-900">PDF</p>
            <p className="text-xs text-neutral-600 mt-1">Professional format</p>
          </button>

          <button
            data-testid="export-format-docx"
            className={`
              p-4 border-2 rounded-lg transition-all relative
              ${selectedFormat === 'docx' 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-neutral-200 hover:border-neutral-300 opacity-50'
              }
            `}
            onClick={() => setSelectedFormat('docx')}
            disabled
          >
            <FileIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <p className="font-semibold text-neutral-900">DOCX</p>
            <p className="text-xs text-neutral-600 mt-1">Editable format</p>
            <span className="absolute top-2 right-2 px-2 py-1 bg-warning-DEFAULT text-white text-xs font-semibold rounded">
              Pro
            </span>
          </button>
        </div>
      </div>

      {/* Customization Options */}
      <div>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Include Sections
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              data-testid="export-option-financials"
              defaultChecked
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-900">Financial Projections</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
            <input
              type="checkbox"
              data-testid="export-option-citations"
              defaultChecked
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-900">Data Citations & Sources</span>
          </label>
        </div>
      </div>

      {/* Tier Upgrade Prompt (if needed) */}
      <div 
        data-testid="export-upgrade-prompt"
        className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 mb-1">
              Unlock Premium Exports
            </h4>
            <p className="text-xs text-neutral-700 mb-3">
              Upgrade to Pro for DOCX exports, custom branding, and unlimited downloads
            </p>
            <button 
              data-testid="upgrade-to-pro-button"
              className="text-xs font-semibold text-primary-700 underline hover:no-underline"
            >
              View Pro Features →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-3 pt-4 border-t border-neutral-200">
      <button
        data-testid="export-cancel-button"
        onClick={() => setIsOpen(false)}
        className="flex-1 px-6 py-3 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
      >
        Cancel
      </button>
      <button
        data-testid="export-download-button"
        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
      >
        Download PDF
      </button>
    </div>
  </DialogContent>
</Dialog>
```

**Design Principles:**
- Clear format selection with visual cards
- Tier-based feature gating with upgrade prompts
- Customization options via checkboxes
- Loading state during generation
- Success confirmation with download link

### 7. Settings/Profile Page

**Layout Structure:**
```jsx
<div className="min-h-screen bg-background-secondary">
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-neutral-900 mb-8">Settings</h1>

    {/* Tabs */}
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList data-testid="settings-tabs">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Profile Information</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name
                </label>
                <input
                  data-testid="profile-first-name-input"
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name
                </label>
                <input
                  data-testid="profile-last-name-input"
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <button
              data-testid="save-profile-button"
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Save Changes
            </button>
          </form>
        </div>
      </TabsContent>

      {/* Subscription Tab */}
      <TabsContent value="subscription">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Current Plan</h2>
              <p className="text-neutral-600 mt-1">Manage your subscription</p>
            </div>
            <span className="px-4 py-2 bg-primary-100 text-primary-700 font-semibold rounded-lg">
              Pro Plan
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-700">Billing Cycle</span>
              <span className="font-medium text-neutral-900">Monthly</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-700">Next Billing Date</span>
              <span className="font-medium text-neutral-900">Feb 15, 2024</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-neutral-700">Amount</span>
              <span className="font-medium text-neutral-900">£29.99/month</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              data-testid="manage-subscription-button"
              className="px-6 py-3 text-primary-700 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              Manage Subscription
            </button>
            <button
              data-testid="cancel-subscription-button"
              className="px-6 py-3 text-error-DEFAULT border border-error-DEFAULT rounded-lg hover:bg-error-light transition-colors font-medium"
            >
              Cancel Plan
            </button>
          </div>
        </div>
      </TabsContent>

      {/* Usage Tab */}
      <TabsContent value="usage">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Usage Statistics</h2>
          
          <div className="space-y-6">
            {/* Usage Metric */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Plans Created</span>
                <span className="text-sm font-semibold text-neutral-900">8 / 20</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">AI Regenerations</span>
                <span className="text-sm font-semibold text-neutral-900">45 / 100</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">PDF Exports</span>
                <span className="text-sm font-semibold text-neutral-900">12 / Unlimited</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</div>
```

---

## Motion & Micro-interactions

### Transition Principles

**NEVER** use universal transitions like `transition: all`. Always specify properties:

```css
/* ✅ CORRECT */
.button {
  transition: background-color 200ms ease, transform 150ms ease, box-shadow 200ms ease;
}

/* ❌ WRONG */
.button {
  transition: all 200ms ease;
}
```

### Animation Tokens

```json
{
  "duration": {
    "fast": "150ms",
    "normal": "200ms",
    "slow": "300ms",
    "slower": "500ms"
  },
  "easing": {
    "default": "cubic-bezier(0.4, 0, 0.2, 1)",
    "in": "cubic-bezier(0.4, 0, 1, 1)",
    "out": "cubic-bezier(0, 0, 0.2, 1)",
    "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  }
}
```

### Common Micro-interactions

**Button Press:**
```css
.button:active {
  transform: scale(0.98);
}
```

**Card Hover:**
```css
.card {
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

**Input Focus:**
```css
.input {
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.input:focus {
  border-color: #1A85FF;
  box-shadow: 0 0 0 3px rgba(26, 133, 255, 0.1);
}
```

**Loading Spinner:**
```jsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
```

**Fade In Animation:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 300ms ease-out;
}
```

---

## Data Visualization Guidelines

### Chart Library: Recharts

Install: `npm install recharts`

### Chart Color Palette

```javascript
const CHART_COLORS = {
  primary: '#1A85FF',
  secondary: '#27AC85',
  tertiary: '#F59E0B',
  quaternary: '#8B5CF6',
  neutral: '#6B7A91',
  success: '#10B981',
  error: '#EF4444'
};
```

### Line Chart Example

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EF" />
    <XAxis 
      dataKey="month" 
      stroke="#6B7A91"
      style={{ fontSize: '12px', fontFamily: 'Inter' }}
    />
    <YAxis 
      stroke="#6B7A91"
      style={{ fontSize: '12px', fontFamily: 'Inter' }}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4E9EF',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    />
    <Line 
      type="monotone" 
      dataKey="revenue" 
      stroke={CHART_COLORS.primary}
      strokeWidth={2}
      dot={{ fill: CHART_COLORS.primary, r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Bar Chart Example

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EF" />
    <XAxis dataKey="category" stroke="#6B7A91" />
    <YAxis stroke="#6B7A91" />
    <Tooltip />
    <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Empty State for Charts

```jsx
{data.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <ChartBarIcon className="w-16 h-16 text-neutral-300 mb-4" />
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Data Available</h3>
    <p className="text-sm text-neutral-600">
      Complete the financial section to see projections
    </p>
  </div>
) : (
  <ResponsiveContainer width="100%" height={300}>
    {/* Chart */}
  </ResponsiveContainer>
)}
```

---

## Accessibility Guidelines

### Focus States

All interactive elements MUST have visible focus states:

```css
.interactive-element:focus {
  outline: 2px solid #1A85FF;
  outline-offset: 2px;
}

/* Or using ring utilities */
.interactive-element {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}
```

### Color Contrast

- **Text on white background**: Minimum contrast ratio 4.5:1 (WCAG AA)
- **Large text (18px+)**: Minimum contrast ratio 3:1
- **Interactive elements**: Minimum contrast ratio 3:1

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order (top to bottom, left to right)
- Skip links for main content
- Escape key closes modals/dialogs

### Screen Reader Support

```jsx
{/* Descriptive labels */}
<button aria-label="Close dialog">
  <XIcon className="w-5 h-5" />
</button>

{/* Status announcements */}
<div role="status" aria-live="polite">
  Plan generated successfully
</div>

{/* Loading states */}
<button disabled aria-busy="true">
  <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
  Generating...
</button>
```

---

## Image Assets

### Hero Section Images

```json
{
  "hero_images": [
    {
      "url": "https://images.pexels.com/photos/34987129/pexels-photo-34987129.jpeg",
      "description": "Professional business team collaboration",
      "usage": "Landing page hero section, about page"
    },
    {
      "url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      "description": "Business handshake partnership",
      "usage": "Success stories, testimonials section"
    }
  ]
}
```

### Workspace Images

```json
{
  "workspace_images": [
    {
      "url": "https://images.pexels.com/photos/34975524/pexels-photo-34975524.jpeg",
      "description": "Modern office workspace with laptop",
      "usage": "Dashboard background, feature sections"
    }
  ]
}
```

### Image Treatment

- Use subtle overlays (rgba(0, 0, 0, 0.3)) for text readability on hero images
- Apply border-radius: 12px to all content images
- Use object-fit: cover for consistent aspect ratios
- Lazy load images below the fold

---

## Component Paths (shadcn/ui)

Use these pre-built components from `/app/frontend/src/components/ui/`:

### Layout & Navigation
- `accordion.jsx` - Collapsible sections (FAQ, plan sections)
- `breadcrumb.jsx` - Navigation breadcrumbs
- `navigation-menu.jsx` - Main navigation
- `tabs.jsx` - Tabbed interfaces (settings, plan views)
- `separator.jsx` - Visual dividers

### Forms & Inputs
- `button.jsx` - All button variants
- `input.jsx` - Text inputs
- `textarea.jsx` - Multi-line text inputs
- `select.jsx` - Dropdown selections
- `checkbox.jsx` - Checkboxes
- `radio-group.jsx` - Radio button groups
- `switch.jsx` - Toggle switches
- `slider.jsx` - Range sliders
- `calendar.jsx` - Date picker (for financial projections)
- `form.jsx` - Form wrapper with validation

### Feedback & Overlays
- `alert.jsx` - Alert messages
- `alert-dialog.jsx` - Confirmation dialogs
- `dialog.jsx` - Modal dialogs (export, settings)
- `drawer.jsx` - Side drawers (mobile navigation)
- `toast.jsx` / `sonner.jsx` - Toast notifications
- `progress.jsx` - Progress bars
- `skeleton.jsx` - Loading skeletons

### Data Display
- `card.jsx` - Content cards
- `table.jsx` - Data tables
- `badge.jsx` - Status badges
- `avatar.jsx` - User avatars
- `tooltip.jsx` - Tooltips
- `hover-card.jsx` - Hover cards with additional info
- `popover.jsx` - Popovers

### Navigation & Menus
- `dropdown-menu.jsx` - Dropdown menus
- `context-menu.jsx` - Right-click menus
- `menubar.jsx` - Menu bars
- `command.jsx` - Command palette (Cmd+K)

### Advanced
- `carousel.jsx` - Image/content carousels
- `collapsible.jsx` - Collapsible content
- `resizable.jsx` - Resizable panels
- `scroll-area.jsx` - Custom scrollbars

---

## Additional Libraries & Installation

### Recharts (Data Visualization)
```bash
npm install recharts
```

**Usage:**
```jsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

### Lucide React (Icons)
Already installed. Use for all icons:
```jsx
import { CheckCircle, AlertTriangle, Info, X, Menu, ChevronDown } from 'lucide-react';
```

### Framer Motion (Advanced Animations - Optional)
```bash
npm install framer-motion
```

**Usage for page transitions:**
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

---

## Instructions to Main Agent

### Implementation Priority

1. **Start with Design Tokens**: Update `/app/frontend/src/index.css` with color system, typography, and spacing tokens
2. **Build Core Components**: Implement button variants, cards, and form elements first
3. **Create Layout Structure**: Set up navigation, sidebar, and main content areas
4. **Implement Features in Order**:
   - Smart Intake Wizard (conversational UI)
   - Plan Dashboard (list view)
   - Plan Editor (section-by-section)
   - Financial Dashboard (charts & tables)
   - Compliance Report (checklist)
   - Export Modal (format selection)
   - Settings/Profile (tabs)

### Key Implementation Notes

1. **All interactive elements MUST include `data-testid` attributes** for testing
2. **Use shadcn components** from `/app/frontend/src/components/ui/` as primary building blocks
3. **Never use universal transitions** - always specify properties
4. **White backgrounds for all content areas** - no dark gradients
5. **Gradients only for hero sections** (max 20% viewport)
6. **Use Recharts for all data visualizations**
7. **IBM Plex Sans for headings, Inter for body text**
8. **Primary color: #1A85FF (blue), Secondary: #27AC85 (teal)**
9. **Implement responsive design** - mobile-first approach
10. **Show data sources and citations** for transparency

### File Structure

```
/app/frontend/src/
├── components/
│   ├── ui/                    # shadcn components (pre-built)
│   ├── wizard/                # Intake wizard components
│   ├── dashboard/             # Dashboard components
│   ├── editor/                # Plan editor components
│   ├── financial/             # Financial dashboard components
│   ├── compliance/            # Compliance report components
│   └── common/                # Shared components (Header, Footer, etc.)
├── pages/
│   ├── Home.jsx
│   ├── Wizard.jsx
│   ├── Dashboard.jsx
│   ├── PlanEditor.jsx
│   ├── Financial.jsx
│   ├── Compliance.jsx
│   └── Settings.jsx
├── styles/
│   └── index.css              # Global styles with design tokens
└── App.jsx
```

### CSS Custom Properties to Add

```css
:root {
  /* Colors */
  --color-primary-50: #EBF5FF;
  --color-primary-600: #1A85FF;
  --color-primary-700: #0066E6;
  --color-secondary-500: #27AC85;
  --color-neutral-900: #1A202C;
  
  /* Typography */
  --font-heading: 'IBM Plex Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

---

## Common Mistakes to Avoid

### ❌ DON'T:
- Use dark purple, dark blue, dark pink gradients
- Mix multiple gradient directions in same section
- Use gradients on small UI elements or text-heavy areas
- Apply universal `transition: all`
- Center-align the entire app container
- Use emoji icons (🤖💡📊) - use Lucide React icons instead
- Skip `data-testid` attributes on interactive elements
- Ignore responsive design
- Hide data sources or citations

### ✅ DO:
- Use white backgrounds for all content cards
- Keep gradients for hero sections only (max 20% viewport)
- Specify transition properties explicitly
- Use Lucide React icons for all iconography
- Add `data-testid` to all interactive elements
- Implement mobile-first responsive design
- Show data sources with citation badges
- Use shadcn components as primary building blocks
- Maintain consistent spacing using tokens
- Test keyboard navigation and screen reader support

---

## Testing Checklist

Before marking implementation complete, verify:

- [ ] All interactive elements have `data-testid` attributes
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus states are visible on all interactive elements
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1280px)
- [ ] Loading states are implemented for async operations
- [ ] Error states are handled gracefully with clear messages
- [ ] Success states celebrate user achievements
- [ ] Data sources and citations are visible where applicable
- [ ] Charts render correctly with empty states
- [ ] Forms validate inputs with helpful error messages
- [ ] Modals close on Escape key press
- [ ] Tooltips provide helpful context
- [ ] Progress indicators show during long operations

---

## Design System Maintenance

This design system should be treated as a living document. As new features are added:

1. **Document new patterns** in this file
2. **Update color tokens** if new semantic colors are needed
3. **Add new component examples** with code snippets
4. **Maintain consistency** with existing patterns
5. **Test accessibility** for all new components

---

## General UI/UX Design Guidelines

### Transition Rules
- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms

### Text Alignment
- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text

### Icons
- NEVER use AI assistant Emoji characters like `🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇` etc for icons
- Always use **Lucide React** library (already installed) for all icons

### Gradient Restrictions
- NEVER use dark/saturated gradient combos (e.g., purple/pink, blue-500 to purple-600, purple-500 to pink-500, green-500 to blue-500, red to pink) on any UI element
- NEVER use dark gradients for logo, testimonial, footer etc
- NEVER let gradients cover more than 20% of the viewport
- NEVER apply gradients to text-heavy content or reading areas
- NEVER use gradients on small UI elements (<100px width)
- NEVER stack multiple gradient layers in the same viewport

### Gradient Enforcement
- **IF** gradient area exceeds 20% of viewport **OR** affects readability, **THEN** use solid colors

### Where to Use Gradients
- Section backgrounds (not content backgrounds)
- Hero section header content (dark to light to dark color)
- Decorative overlays and accent elements only
- Hero section with 2-3 mild colors
- Gradients can be horizontal, vertical, or diagonal

### Color Guidelines for AI Applications
- For AI chat, voice applications, **do not use purple color**
- Use colors like light green, ocean blue, peach orange instead

### Micro-animations
- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations
- Static designs feel lifeless

### Spacing
- Use 2-3x more spacing than feels comfortable
- Cramped designs look cheap

### Visual Polish
- Add subtle grain textures, noise overlays, custom cursors, selection states, and loading animations
- These details separate good from extraordinary designs

### Design Tokens
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion)
- Immediately set global design tokens (primary, secondary/accent, background, foreground, ring, state colors)
- Don't rely on library defaults
- Don't make backgrounds dark by default - understand the problem first and define colors accordingly
- If problem implies playful/energetic, choose colorful scheme
- If problem implies monochrome/minimal, choose black-white/neutral scheme

### Component Reuse
- Prioritize using pre-existing components from `src/components/ui` when applicable
- Create new components that match the style and conventions of existing components
- Examine existing components to understand project patterns before creating new ones

### Component Library
- **IMPORTANT**: Do not use HTML-based components like dropdown, calendar, toast
- You **MUST** always use `/app/frontend/src/components/ui/` as primary components (modern and stylish)

### Best Practices
- Use Shadcn/UI as the primary component library for consistency and accessibility
- Import path: `./components/ui/[component-name]`

### Export Conventions
- Components MUST use named exports: `export const ComponentName = ...`
- Pages MUST use default exports: `export default function PageName() {...}`

### Toasts
- Use `sonner` for toasts
- Sonner component located in `/app/frontend/src/components/ui/sonner.jsx`

### Visual Depth
- Use 2-4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals

### Overall Goal
- The result should feel human-made, visually appealing, converting, and easy for AI agents to implement
- Maintain good contrast, balanced font sizes, proper gradients, sufficient whitespace, and thoughtful motion and hierarchy
- Avoid overuse of elements and deliver a polished, effective design system

---

**End of Design Guidelines**

This comprehensive design system provides all the necessary specifications for building Strattio's professional, trustworthy, and user-friendly business plan generation platform. Follow these guidelines closely to ensure consistency, accessibility, and a delightful user experience.
