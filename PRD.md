# AI Career Navigator (Working Title) - Product Requirements Document (PRD)

## 1. Product Overview

An AI-powered personalized assistant designed to continuously guide students throughout their Higher Education Institution (HEI) journey.

The system helps students:
- Define clear career goals
- Identify skill gaps
- Get personalized learning recommendations
- Prepare for competitive and company-specific exams
- Track progress
- Align with industry expectations for placements

The product acts as a long-term academic + career operating system, not just a recommendation tool.

## 2. Problem Statement

Students in HEIs face:
- Lack of clarity about career goals
- No structured roadmap to reach target roles
- Overwhelming resources online
- Poor awareness of competitive/company exams
- No continuous progress measurement
- Misalignment between academic learning and industry needs

Result:
- Wasted time
- Random course consumption
- Weak placement outcomes

## 3. Product Vision

To become a continuous AI mentor that:
1. Converts vague career interest → structured roadmap
2. Converts roadmap → daily action plan
3. Converts action → measurable progress
4. Converts progress → placement readiness

## 4. Target Users

**Primary Users**
- Undergraduate students (1st–4th year)
- Engineering / Commerce / Science students
- Tier 2 / Tier 3 college students

**Secondary Users**
- Placement cells
- Mentors
- Career counselors

## 5. Core Features

### 5.1 Career Goal Definition Module
**Objective**
Help students define realistic and structured career goals.

**Features**
- Interest assessment questionnaire
- Skill-based profiling
- Personality alignment mapping
- Role suggestion engine

**Inputs**
- Academic background
- Interests
- Current skills
- Preferred industries
- Location preference

**Outputs**
- 3–5 suggested career paths
- Required skills list
- Timeline roadmap (year-wise / semester-wise)

*Example:*
> Career Goal: Data Analyst
> Required Skills: Python, SQL, Excel, Statistics, Data Visualization
> Timeline: 18 months

### 5.2 Skill Gap Analysis Engine
**Objective**
Identify missing skills between current profile and target role.

**Mechanism**
1. Extract required skill matrix for selected career.
2. Compare with student’s current skill set.
3. Categorize into: Strong, Intermediate, Missing

**Output**
Skill Gap Report:
- % readiness score
- Missing competencies
- Priority ranking

*Example:*
| Skill | Required Level | Current Level | Gap |
|-------|----------------|---------------|-----|
| Python | Advanced | Beginner | High |
| SQL | Intermediate | None | High |
| Excel | Intermediate | Intermediate | Low |

### 5.3 Personalized Recommendation System
**Objective**
Provide structured learning resources.

**Recommendation Types**
- Courses (Coursera, Udemy, NPTEL, etc.)
- Books
- Practice platforms (LeetCode, HackerRank)
- YouTube curated playlists
- Project ideas
- Internships

**Personalization Logic**
- Based on skill gap
- Based on time availability
- Based on budget
- Based on difficulty level

**Output**
- Weekly learning plan
- Resource links
- Estimated completion time

### 5.4 Competitive & Company Exam Guidance
**Objective**
Prepare students for:
- Government exams
- Company recruitment exams
- Coding rounds
- Aptitude tests
- GATE/CAT/UPSC/Bank exams

**Features**
- Exam eligibility check
- Exam calendar tracking
- Syllabus breakdown
- Mock test integration
- Company-specific preparation guide

*Example:*
If target = Software Developer:
- TCS NQT preparation roadmap
- Infosys test pattern
- DSA topic list
- Coding practice schedule

### 5.5 Continuous Progress Tracking
**Objective**
Track measurable growth.

**Tracking Metrics**
- Skills completed
- Practice hours logged
- Mock test scores
- Projects completed
- Internship applications

**Features**
- Dashboard
- Progress graph
- Readiness score update
- Weekly performance report

**Output**
- Career Readiness Index (0–100)

### 5.6 Placement Readiness & Industry Alignment
**Objective**
Align student profile with real industry requirements.

**Features**
- Resume evaluation
- ATS score prediction
- LinkedIn profile optimization suggestions
- Portfolio review checklist
- Industry demand trends

**AI Analysis**
- Compare resume vs job description
- Highlight weak areas
- Suggest improvements

## 6. Functional Requirements
- **FR1**: System shall allow student account creation and profile setup.
- **FR2**: System shall generate career recommendations based on profile input.
- **FR3**: System shall perform automated skill gap analysis.
- **FR4**: System shall recommend personalized learning resources.
- **FR5**: System shall track progress and update readiness score.
- **FR6**: System shall provide exam-specific preparation roadmap.
- **FR7**: System shall generate placement readiness report.

## 7. Non-Functional Requirements
- Secure user data storage
- Scalable architecture
- Mobile responsive UI
- Real-time recommendation updates
- High recommendation accuracy

## 8. System Architecture (High-Level)
- **Frontend**: Web / App
- **Backend**: API Layer
- **AI Engine**: 
  - NLP-based profile analysis
  - Recommendation engine
  - Resume analyzer
  - Predictive readiness scoring
- **Database**: User data, Content data
- **External API Integration**: Course providers, exam data

## 10. User Flow
1. Register
2. Complete profile
3. Select career interest
4. Receive roadmap
5. Get weekly plan
6. Track progress
7. Prepare for exams
8. Improve resume
9. Achieve placement readiness

## 11. KPIs (Success Metrics)
- Monthly active users
- Completion rate of roadmap
- Improvement in readiness score
- Placement success rate
- Mock test score improvement

## 12. Future Enhancements
- Mentor matching
- Peer learning groups
- AI interview simulation
- Scholarship alerts
- Internship auto-apply assistant

## 13. Constraints
- Accuracy depends on updated industry data
- Requires constant exam database updates
- AI bias must be minimized
- Internet dependency

## 14. Risk Analysis
- **Risk**: Poor recommendation quality
  - *Mitigation*: Feedback loop learning model
- **Risk**: Low engagement
  - *Mitigation*: Gamification + milestone rewards
- **Risk**: Data privacy issues
  - *Mitigation*: Encryption + role-based access

## Summary
This product acts as:
- Career clarity engine
- Skill gap detector
- Learning recommendation system
- Exam preparation guide
- Progress tracker
- Placement readiness optimizer

It transforms an unstructured college journey into a guided, measurable, industry-aligned pathway.
