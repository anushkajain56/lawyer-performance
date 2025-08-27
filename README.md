# ⚖️ Lawyer Allocation & Performance Dashboard  

A **full-stack case management and performance tracking system** designed to help organizations efficiently allocate lawyers and monitor workload distribution. The system ensures cases are assigned fairly, tracked in real-time, and evaluated with meaningful metrics.  

This project demonstrates how modern applications can be built by combining **FastAPI (Python)**, **React + TypeScript**, and **Supabase** with clean architectural principles.  

---

## 🔑 Key Features  
- **Smart Allocation System** – Assign lawyers to cases based on availability, specialization, and workload.  
- **Performance Dashboard** – Visualize active cases, performance statistics, and trends in real time.  
- **Authentication & Authorization** – Role-based access control powered by Supabase.  
- **RESTful API Backend** – Built with FastAPI for scalability and speed.  
- **Interactive Frontend** – Built with React + TypeScript for a responsive and intuitive user experience.  

---

## 🧩 System Concepts Implemented  

| Concept              | Details                                                                 |
|----------------------|-------------------------------------------------------------------------|
| Lawyer Allocation    | Tracks workload, ensures fair distribution of cases                     |
| Case Management      | CRUD operations for cases with lawyer assignments                       |
| Performance Tracking | Aggregated metrics: cases resolved, active workload, efficiency scoring |
| Role-Based Access    | Admin vs Lawyer views, powered by Supabase Auth                         |
| API Architecture     | REST endpoints for cases, lawyers, and metrics                          |
| Real-Time Updates    | Frontend synced with backend changes via Supabase                       |

---

## 🏗️ Project Architecture  

### Backend (FastAPI)  
- `main.py` – FastAPI entry point, routes defined here  
- `models.py` – Pydantic models for data validation  
- `database.py` – Supabase client and queries  
- `routers/` – Endpoints for lawyers, cases, and metrics  

### Frontend (React + TypeScript)  
- `App.tsx` – Root React app  
- `components/` – UI components (dashboards, tables, forms)  
- `services/` – API calls to backend  
- `pages/` – Views for Admin and Lawyer roles  

### Database (Supabase)  
- Lawyers table with workload and specialization fields  
- Cases table with status and assigned lawyer  
- Metrics aggregation for performance tracking  

---

## 🖥️ Sample Usage  

- Admin logs in → sees overall case statistics and lawyer performance metrics.  
- New case added → allocation system assigns it to the most suitable available lawyer.  
- Lawyer logs in → sees assigned cases and updates case status.  
- Performance dashboard updates in real time with workload distribution.  

---

## 🚀 How to Run  

### Backend  
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
### Frontend 
```bash
cd frontend
npm install
npm run dev
```
## 📸 Screenshots
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/d10c0c8d-6d0d-4517-ad84-f007813e2bda" />
<img width="605" height="363" alt="image" src="https://github.com/user-attachments/assets/e52cb063-a0f9-469e-9ccd-bbe949d8814d" />
<img width="600" height="300" alt="image" src="https://github.com/user-attachments/assets/661a6c24-c2b7-4362-920d-ddcda394a1d5" />

## 🎯 Concepts Reinforced
- Full-stack development (React + FastAPI)
- Role-based authentication (Supabase)
- RESTful API design and integration
- Data visualization in dashboards
- Clean project structuring for scalability

## 📝 Motivation
This project was developed to explore how technology can optimize resource allocation in the legal industry. By combining a structured backend, a dynamic frontend, and real-time metrics, the system demonstrates how software can improve efficiency and transparency in case management. 








