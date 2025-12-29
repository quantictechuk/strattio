# Features UI Locations Guide

This document shows where to find all the new features in the Strattio frontend.

## 📍 Plan Editor Page (`/plan-editor/{planId}`)

When you open a business plan, you'll see these tabs at the top:

### Available Tabs:
1. **Plan Sections** - View and edit plan sections (existing)
2. **Financials** - Financial projections and **Scenario Planning** (new: Scenario Planning is at the bottom of Financials tab)
3. **Compliance** - Compliance reports (existing)
4. **Analytics** ⭐ NEW - Plan analytics dashboard with completion/quality scores
5. **Investment Readiness** ⭐ NEW - Investment readiness score (0-100) with recommendations
6. **Pitch Deck** ⭐ NEW - Generate and download PowerPoint pitch decks
7. **AI Insights** ⭐ NEW - AI-powered market analysis, risk assessment, growth strategies
8. **AI Chat** ⭐ NEW - Real-time AI advisor chat assistant
9. **Share & Collaborate** ⭐ NEW - Share plans, invite collaborators, comments, version history

### How to Access:
1. Go to Dashboard
2. Click on any plan card to open it
3. You'll see all the tabs at the top of the plan editor
4. Click on any tab to access that feature

---

## 📍 Dashboard Page (`/dashboard`)

### Features Available:

#### 1. **Achievements Section** ⭐ NEW
- **Location:** Scroll down on the dashboard, below your plans list
- **What it shows:**
  - Your earned badges (8 different achievement types)
  - Progress bar showing completion
  - "Check for New" button to detect new achievements
- **Achievements include:**
  - 🎯 First Steps (created first plan)
  - 💰 Financial Master (completed financials)
  - ⭐ Plan Perfectionist (100% completion)
  - ⚡ Speed Runner (completed plan in <24h)
  - 👥 Team Player (invited collaborator)
  - 📄 Export Expert (5+ exports)
  - 🏆 Quality Champion (quality score 80+)
  - 💼 Investment Ready (readiness score 80+)

#### 2. **Plan Comparison Tool** ⭐ NEW
- **Location:** On the dashboard, above your plans list
- **How to use:**
  1. Check the checkbox on 2-4 plan cards (you'll see checkboxes on the left side of each plan card)
  2. A "Compare (X)" button will appear in the action bar
  3. Click "Compare" to see side-by-side comparison
  4. Modal will show metrics comparison, differences, and best performers

#### 3. **Support Tickets** (existing)
- **Location:** Below Achievements section

---

## 🎯 Quick Feature Access Guide

### For Plan Analysis:
- **Analytics Tab** → See completion score, quality score, time tracking
- **Investment Readiness Tab** → Get investment readiness score and recommendations
- **AI Insights Tab** → Get market analysis, risk assessment, funding recommendations

### For Plan Creation:
- **AI Chat Tab** → Ask questions and get real-time help
- **Share & Collaborate Tab** → Invite team members, add comments

### For Presentations:
- **Pitch Deck Tab** → Generate PowerPoint pitch deck

### For Financial Planning:
- **Financials Tab** → View projections
- **Scenario Planning** (in Financials tab) → See best/worst/realistic scenarios

### For Gamification:
- **Dashboard → Achievements** → See your badges and progress

### For Comparison:
- **Dashboard** → Select 2-4 plans with checkboxes → Click "Compare"

---

## 🔍 Troubleshooting

### If you don't see the tabs:
1. **Refresh the page** - The new code needs to be loaded
2. **Clear browser cache** - Old JavaScript might be cached
3. **Check if you're on the plan editor page** - Features are only visible when viewing a plan
4. **Make sure the plan is loaded** - Wait for the plan data to load first

### If tabs are there but content doesn't load:
1. **Check browser console** for errors (F12 → Console tab)
2. **Verify backend is running** - Check if API calls are working
3. **Check network tab** - See if API requests are failing

---

## 📱 Mobile View

All features are mobile-responsive:
- Tabs scroll horizontally on mobile
- Components adapt to smaller screens
- Touch-friendly buttons and interactions

---

## ✅ Feature Checklist

- [x] Analytics Dashboard - ✅ In Plan Editor (Analytics tab)
- [x] AI Plan Advisor Chat - ✅ In Plan Editor (AI Chat tab)
- [x] Plan Sharing & Collaboration - ✅ In Plan Editor (Share & Collaborate tab)
- [x] Investment Readiness Score - ✅ In Plan Editor (Investment Readiness tab)
- [x] Pitch Deck Generator - ✅ In Plan Editor (Pitch Deck tab)
- [x] Scenario Planning - ✅ In Plan Editor (Financials tab, at bottom)
- [x] Achievement System - ✅ In Dashboard (scroll down)
- [x] Plan Comparison Tool - ✅ In Dashboard (select plans, click Compare)
- [x] AI-Powered Insights - ✅ In Plan Editor (AI Insights tab)

---

**Last Updated:** January 2025  
**Status:** All features integrated and visible in UI
