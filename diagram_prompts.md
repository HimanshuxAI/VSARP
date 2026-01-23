# DFD Generation Prompts
Use the following prompts to generate diagrams. I have provided **Mermaid.js code** (which you can paste into [Mermaid Live Editor](https://mermaid.live/)) and **Text Prompts** (for AI image generators).

---

## 1. DFD Level 0 (Context Diagram)
**Concept:** A single central process interacting with external entities.

### Option A: Mermaid.js Code (Recommended)
Paste this into a Mermaid editor:
```mermaid
graph TD
    %% Entities
    S[Student]
    F[Faculty]
    A[Admin]
    
    %% Central Process
    System((VSARP System))
    
    %% Flows
    S -- "Submit Activity Details & Proof" --> System
    System -- "Acknowledgement & Status" --> S
    
    F -- "Verify/Reject Decisions" --> System
    System -- "Pending Verification Requests" --> F
    
    A -- "User Management & Config" --> System
    System -- "System Reports & Analytics" --> A
    
    %% Styling
    style System fill:#3b82f6,stroke:#333,stroke-width:2px,color:white
```

### Option B: Text Prompt for AI Image Generators
> "A professional Data Flow Diagram Level 0 context diagram. Center circle labeled 'VSARP System'. Three external entities in rectangular boxes surrounding it: 'Student', 'Faculty', and 'Admin'. Arrows show data flow: Student sends 'Activity Submission', Faculty sends 'Approval', Admin sends 'Configuration'. Clean, modern line art style, blue and white color scheme, white background."

---

## 2. DFD Level 1 (High-Level Processes)
**Concept:** Breaking the system into major functional modules.

### Option A: Mermaid.js Code
```mermaid
graph LR
    %% Entities
    Student[Student]
    Faculty[Faculty]
    Admin[Admin]

    %% Processes
    P1((1.0 Auth))
    P2((2.0 Activity Mgr))
    P3((3.0 Verification))
    P4((4.0 Reporting))

    %% Data Stores
    D1[("D1: Users DB")]
    D2[("D2: Activities DB")]

    %% Relationships
    Student -->|"Login Creds"| P1
    P1 <--> D1
    User --> P1
    
    Student -->|"Activity Data"| P2
    P2 -->|"Save Record"| D2
    
    D2 -->|"Fetch Pending"| P3
    Faculty -->|"Approve/Reject"| P3
    P3 -->|"Update Status"| D2
    
    Admin -->|"Request Stats"| P4
    D2 -->|"Aggregated Data"| P4
    
    %% Styling
    style P1 fill:#10b981
    style P2 fill:#3b82f6
    style P3 fill:#f59e0b
    style P4 fill:#8b5cf6
```

### Option B: Text Prompt for AI Image Generators
> "A Data Flow Diagram Level 1 showing 4 main circular processes: 'Authentication', 'Activity Submission', 'Verification', and 'Reporting'. External entities 'Student' and 'Faculty' connect to these processes. Rectangular data stores labeled 'User DB' and 'Activity DB' connected with arrows. Technical flowchart style, flat design, distinctive colors for each process."

---

## 3. DFD Level 2 (Detailed Drill-Down of 'Activity Submission')
**Concept:** Deep dive into exactly what happens when a student submits.

### Option A: Mermaid.js Code
```mermaid
graph TD
    %% External
    Student[Student]
    
    %% Sub-Processes
    P2_1((2.1 Validate Input))
    P2_2((2.2 Upload Proof))
    P2_3((2.3 Compute Hash))
    P2_4((2.4 Insert Record))
    
    %% Data Stores & API
    D2[("Activities Table")]
    Storage[("Cloud Storage")]
    
    %% Flow
    Student -- "Form Data" --> P2_1
    P2_1 -- "Clean Data" --> P2_3
    P2_3 -- "Integrity Hash" --> P2_2
    
    P2_2 -- "File" --> Storage
    Storage -- "Public URL" --> P2_2
    
    P2_2 -- "URL + Metadata" --> P2_4
    P2_4 -- "Save Row" --> D2
    
    %% Styling
    style P2_1 fill:#cbd5e1
    style P2_2 fill:#cbd5e1
    style P2_3 fill:#cbd5e1
    style P2_4 fill:#cbd5e1
```

### Option B: Text Prompt for AI Image Generators
> "Detailed DFD Level 2 flowchart focusing on 'Activity Submission'. Four sequential circles: 'Validate Input', 'Compute Hash', 'Upload to Storage', 'Insert Record'. Arrows show linear flow from Student to Database. Includes a cylinder icon for 'Database' and a cloud icon for 'Storage'. Minimalist tech diagram style."

---

## 4. UML Diagrams (Slide 16)
**Concept:** Three distinct diagrams to show System Actors, Logic Flow, and Data Structure.

### A. Use Case Diagram
**Text Prompt for Gemini Pro:**
> "Generate Mermaid.js code for a Use Case Diagram for a 'Student Activity Verification System'. Actors: Student, Faculty, Admin. Use Cases: 'Submit Activity', 'View History' (Student); 'Approve Activity', 'Reject Activity' (Faculty); 'Manage Users', 'View Reports' (Admin). Include relationships."

**Mermaid Code:**
```mermaid
useCaseDiagram
    actor "Student" as S
    actor "Faculty" as F
    actor "Admin" as A

    package "VSARP System" {
        usecase "Submit Activity" as UC1
        usecase "View History" as UC2
        usecase "Approve/Reject" as UC3
        usecase "View Pending" as UC4
        usecase "Manage Users" as UC5
        usecase "View Analytics" as UC6
    }

    S --> UC1
    S --> UC2
    F --> UC3
    F --> UC4
    A --> UC5
    A --> UC6
```

### B. Sequence Diagram (Submission Flow)
**Text Prompt for Gemini Pro:**
> "Generate Mermaid.js code for a Sequence Diagram showing 'Activity Submission'. Participants: Student, Frontend, API, Database, Storage. Flow: Student submits form -> Frontend uploads proof to Storage -> Storage returns URL -> Frontend sends data+URL to API -> API saves to Database -> Database confirms -> Frontend shows Success."

**Mermaid Code:**
```mermaid
sequenceDiagram
    actor Student
    participant Frontend
    participant API
    participant Storage
    participant Database

    Student->>Frontend: Submit Activity Form
    Frontend->>Storage: Upload Proof File
    Storage-->>Frontend: Return Public URL
    
    Frontend->>API: POST /activities (Data + URL)
    API->>Database: INSERT Activity Record
    Database-->>API: Success
    API-->>Frontend: 200 OK
    Frontend-->>Student: Show "Success" Message
```

### C. Class Diagram
**Text Prompt for Gemini Pro:**
> "Generate Mermaid.js code for a Class Diagram for a Student Activity System. Classes: User (id, email, role), Profile (dept, student_id), Activity (title, status, proof_url, date), Category (name). Relationships: User 1--1 Profile, Profile 1--* Activity, Category 1--* Activity."

**Mermaid Code:**
```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String role
        +login()
    }
    class Profile {
        +String department
        +String student_id
        +getStats()
    }
    class Activity {
        +String title
        +String status
        +String proof_url
        +Date date
        +submit()
        +verify()
    }
    class Category {
        +String name
        +getActivities()
    }

    User "1" *-- "1" Profile
    Profile "1" *-- "*" Activity
    Category "1" *-- "*" Activity
```
