Prompt 1: The App Shell (Global Layout & Sidebar)
File: AppLayout.jsx & Sidebar.jsx
Prompt for Copilot:
Create a responsive SaaS App Shell for an enterprise system called "VSA Beverages IWS". Use React and Tailwind CSS.
Structure:
A left fixed Sidebar (width 256px, dark theme: bg-[#0f172a] text-slate-300).
A top Header (height 64px, white background, bottom border, containing a search input, bell notification icon, and a user avatar).
A main content area (bg-slate-50) that fills the remaining space and handles scrolling.
Sidebar Navigation Items (Grouped):
Overview: Dashboard, Employees, Products, Suppliers, Clients
Operations: Orders, Production, Inventory
Finance: Billing, Payroll, Invoices, Contracts, Expenses
Intelligence: Analytics, AI Insights, Settings
Styling rules: Active sidebar links should have a background of bg-blue-600/10 and text color text-blue-400 with a left border highlight. Inactive links should hover to white text. Include Lucide-react icons for each section.
Prompt 2: Login & Multi-Step Onboarding (Images 4 & 5)
File: AuthFlow.jsx
Prompt for Copilot:
Build a split-screen Login and Onboarding UI for a B2B SaaS platform using React and Tailwind CSS.
Layout:
Left side (50% width, hidden on mobile): Deep blue background (bg-[#1e3a8a]) with a slight gradient to bottom-right. Include a large heading "Intelligent Warehouse Solutions (IWS)", a subheading about streamlining beverage production, and a subtle transparent background pattern resembling a factory.
Right side (50% width): White background, centered content area.
Component 1 (Login View):
A clean form with "Welcome Back". Include a "Sign in with Google" button (outlined), an "Email Address" input, "Password" input, "Keep me signed in" checkbox, and a solid blue (bg-[#1e3a8a]) "Sign In to Dashboard" button.
Component 2 (Onboarding View - Company Info):
At the top, a horizontal step progress indicator with 4 steps: 1. Company, 2. Settings, 3. Inventory, 4. Review. The active step should be a solid dark blue circle.
Below the steps, a form for "Company Information" containing: "Company Name" (input), "GST Number" (input), "Industry Type" (select dropdown), and "Registered Address" (textarea). Include a "Continue to Step 2" button at the bottom right.
Prompt 3: Operational Overview Dashboard (Image 2)
File: Dashboard.jsx
Prompt for Copilot:
Build a "Dashboard Overview" page for a manufacturing supply chain using React and Tailwind CSS.
Top Section: 4 KPI Cards
Use a CSS Grid (4 columns). Each card needs a white background, soft shadow (shadow-sm), and a subtle top border line in a distinct color (Blue, Orange, Green, Purple).
Card 1: "Active Orders" (124 units, green +12% trend).
Card 2: "Production Status" (88% capacity, yellow steady trend, include a mini progress bar).
Card 3: "Shipments in Transit" (14 active, green 'On Track' badge).
Card 4: "Inventory Reserved" (42% utilization, red 'Low Stock' badge).
Middle Section: Split Layout (60/40)
Left (60%): "AI Insight Panel". This must stand out. Background bg-[#1e293b] text-white with a subtle geometric background pattern. Content: "Demand Spike Predicted", explaining a 24% increase in organic grain demand. Include two buttons: "Adjust Strategy" (white, black text) and "View Details" (outlined).
Right (40%): "Cost Optimization" list. A white card containing a vertical list of 3 AI suggestions (Logistics Consolidation, Energy Peak Shaving, Waste Reduction). Each item should show the title, a brief description, and a green highlight text showing the saved amount (e.g., "Save $1.2k").
Bottom Section: "Recent Order Lifecycle"
A wide white card showing a horizontal status tracker for Order #VSA-99023. Show 5 nodes: Placed (completed), Allocated (completed), In Production (active, dark blue), Shipped (gray), Delivered (gray). Connect them with a progress line. Include timestamps under the completed/active nodes.
Prompt 4: Orders Management with Multi-tabs (Image 1)
File: OrdersHub.jsx
Prompt for Copilot:
Build an "Orders Management" data table component using React and Tailwind CSS.
Header Area:
Title "Orders Management". Include a "Export Report" button (outlined) and a primary "Create New Order" button (blue).
Tab Navigation:
Create horizontal tabs: "New", "Processing", "Dispatched", "Delivered". Next to each text label, include a small rounded pill showing the count (e.g., New [12], Processing [8]). The active tab should have a blue text color and a blue border-bottom.
Filters Row:
Below tabs, a white container (bg-white border border-gray-200 rounded-t-lg). Include two select dropdowns: "All Clients" and "Date: Last 7 days". On the far right, gray text showing "Showing 1-12 of 80 total orders".
Data Table:
Columns: ORDER ID, CLIENT NAME (Name + Location subtext), STATUS, DISTRIBUTION TIMELINE, AMOUNT, ACTIONS (3 dots icon).
Status Column: Use colored pills. New (Light blue bg, blue text), Processing (Light orange bg, orange text), Dispatched (Light purple bg, purple text), Delivered (Light green bg, green text).
Timeline Column: Generate an SVG sparkline path (just placeholder wavy lines) colored to match the status pill of that row.
Pagination: A simple footer below the table with "Previous" and "Next" buttons.
Provide mock JSON data for 4 rows to populate the table so I can see the visual result immediately.
Prompt 5: Product & Packaging Builder Wizard (Image 3)
File: ProductBuilder.jsx
Prompt for Copilot:
Build a "Product & Packaging" configuration wizard using React and Tailwind CSS. This is Step 1 of a 4-step process.
Layout Setup:
Main grid layout: 70% left column (the builder), 30% right column (estimates & AI).
Left Column (Builder Area):
Header: "STEP 1 OF 4: Product & Packaging" with a horizontal progress bar underneath showing 25% complete.
Section 1: "Select Product Type". Display 2 large selectable cards side-by-side. Card 1: "Tender Coconut Water", Card 2: "Concentrate". Each card has an icon, title, and description text. State rule: The selected card should have a solid dark blue border (border-[#1e3a8a]) and a small checkmark icon in the top right corner. Unselected cards should have a light gray border.
Section 2: "Choose Packaging". Display 3 cards: PET Bottle, Glass Bottle (include a tiny "PREMIUM" badge), Tetra Pack. Same selection styling as above.
Right Column (Sticky Sidebar):
Live Estimate Card: White card. Show rows for "Base Price" (
0.45
/
u
n
i
t
)
a
n
d
"
G
l
a
s
s
P
a
c
k
a
g
i
n
g
"
(
+
0.45/unit)and"GlassPackaging"(+
0.18/unit). Show a bold "Total Estimated" ($0.63 per unit EXW) at the bottom.
AI INSIGHTS Card: Dark theme card (bg-[#0f172a] text-white rounded-xl shadow-lg). Top header says "AI INSIGHTS" with a pulsing green dot. Inside, list two insights with icons:
Market Suggestion: "Glass packaging is trending +24% for premium beverage exports in the EU."
Sustainability: "Glass offers 100% recyclability..."
Include a bright blue "Apply Optimized Setup" button at the bottom of the card.
Bottom Bar:
A sticky footer with a "Save Draft" button on the left and a "Next Step" button (dark blue) on the right.