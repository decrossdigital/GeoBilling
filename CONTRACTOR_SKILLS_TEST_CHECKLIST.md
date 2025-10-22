# Contractor Skills System - Testing Checklist

## ✅ Testing the Complete Workflow

### Prerequisites
- ✅ Development server running (`npm run dev`)
- ✅ Logged into the application
- ✅ At least one contractor in the system
- ✅ At least one quote in draft status

---

## 🧪 Test Sequence

### **1. Settings Page - Skills Management**

**Navigate to:** `/settings`

**Test:**
- [ ] See "Contractor Skills" section
- [ ] See default skills displayed as purple chips
- [ ] Add new skill: Type "Test Skill" → Click Add
- [ ] Verify skill appears in the list
- [ ] Remove a skill by clicking X
- [ ] Click "Save Settings"
- [ ] Refresh page - verify skills persist

**Expected:** Skills are saved to localStorage and persist across page loads

---

### **2. Contractor Detail Page - Skills Checkboxes**

**Navigate to:** `/contractors/[any-contractor-id]`

**Test:**
- [ ] See skills displayed as purple chips (view mode)
- [ ] Click "Edit" button
- [ ] See skills as checkbox grid (edit mode)
- [ ] Check/uncheck various skills
- [ ] Click "Save"
- [ ] Verify skills update in view mode

**Expected:** Contractor skills update correctly with checkbox selection

---

### **3. Contractors Page - Add Contractor with Skills**

**Navigate to:** `/contractors`

**Test:**
- [ ] Click "+ Add Contractor" button
- [ ] Fill in name, email
- [ ] See skills checkbox grid
- [ ] Select 2-3 skills (e.g., Guitar, Mixing, Vocals)
- [ ] Set pricing type to "Hourly"
- [ ] Enter rate (e.g., 75)
- [ ] Click "Add Contractor"
- [ ] Verify contractor appears in list

**Expected:** New contractor created with selected skills

---

### **4. Quote Page - Assign Contractor**

**Navigate to:** `/quotes/[any-draft-quote-id]`

**Test Skills Filtering:**
- [ ] Click "Add Contractor" in Contractors section
- [ ] See "Assign Contractor" modal
- [ ] See "Skills Needed" checkboxes
- [ ] Check "Guitar" skill
- [ ] Verify contractor list filters to show only contractors with Guitar
- [ ] Check "Vocals" additionally
- [ ] Verify list filters to contractors with BOTH Guitar AND Vocals

**Test Contractor Selection:**
- [ ] Select a contractor from filtered list (radio button)
- [ ] Verify contractor card highlights in purple
- [ ] See contractor's skills and rates displayed

**Test Rate Type:**
- [ ] Select "Hourly Rate"
- [ ] See "Hours" input field appear
- [ ] Enter 3 hours
- [ ] See cost calculate automatically (e.g., 3 × $75 = $225)
- [ ] Switch to "Flat Rate"
- [ ] See hours field disappear
- [ ] See flat rate cost displayed

**Test Assignment:**
- [ ] Verify "Assignment Summary" shows selected skills and calculated cost
- [ ] Click "Assign Contractor"
- [ ] Verify modal closes
- [ ] See contractor appear in Contractors section

**Expected:** 
```
Contractors Section displays:
┌─────────────────────────────────────┐
│ John Doe                            │
│ [Guitar] [Vocals]                   │
│ 3 hrs @ $75/hr                      │
│                            $225.00  │
│                          [Remove]   │
└─────────────────────────────────────┘

Total Contractor Costs: $225.00
```

---

### **5. Multiple Contractor Assignments**

**Test:**
- [ ] Click "Add Contractor" again
- [ ] Select different skills (e.g., "Mixing")
- [ ] Select different contractor
- [ ] Set rate and hours
- [ ] Assign
- [ ] Verify both contractors appear
- [ ] Verify total updates

**Test Same Contractor, Different Skills:**
- [ ] Click "Add Contractor" again
- [ ] Select "Bass" skill
- [ ] Select the SAME contractor as before (who has Bass skill)
- [ ] Set different hours (e.g., 2 hours)
- [ ] Assign
- [ ] Verify contractor appears TWICE with different skills/hours

**Expected:** Same contractor can be assigned multiple times for different roles

---

### **6. Remove Contractor**

**Test:**
- [ ] Click "Remove" button on a contractor assignment
- [ ] Confirm deletion
- [ ] Verify contractor removed from list
- [ ] Verify total contractor costs update

**Expected:** Contractor removed successfully

---

### **7. Edge Cases**

**Empty States:**
- [ ] Quote with no contractors shows "No contractors assigned"
- [ ] Skills filter with no matches shows "No contractors match selected skills"

**Validation:**
- [ ] Try to assign without selecting skills - should show error
- [ ] Try to assign without selecting contractor - should show error

**Draft Status:**
- [ ] "Add Contractor" button only shows for draft quotes
- [ ] "Remove" button only shows for draft quotes
- [ ] Sent quotes show contractors but no edit buttons

---

## 🐛 Known Issues to Watch For

1. **Decimal Conversion**: Ensure costs display as numbers, not Decimal objects
2. **Skills Loading**: Verify skills load from localStorage on all pages
3. **Cost Calculation**: Ensure hourly rate × hours calculates correctly
4. **Filtering Logic**: Multiple skills should use AND logic (not OR)
5. **Empty Skills**: Contractors with no skills should still appear when no filter is active

---

## 📝 Manual Testing Log

**Date:** ___________  
**Tester:** ___________

| Test | Status | Notes |
|------|--------|-------|
| Settings - Add/Remove Skills | ⬜ | |
| Contractor Detail - Edit Skills | ⬜ | |
| Contractors Page - Add with Skills | ⬜ | |
| Quote - Filter by Skills | ⬜ | |
| Quote - Assign Hourly Contractor | ⬜ | |
| Quote - Assign Flat Rate Contractor | ⬜ | |
| Quote - Multiple Assignments | ⬜ | |
| Quote - Same Contractor Twice | ⬜ | |
| Quote - Remove Contractor | ⬜ | |
| Edge Cases | ⬜ | |

---

## ✅ Success Criteria

- [ ] All tests pass
- [ ] No console errors
- [ ] Data persists across page refreshes
- [ ] UI is responsive and intuitive
- [ ] Skills filter works correctly
- [ ] Cost calculations are accurate
- [ ] Total contractor costs displayed correctly

---

## 🚀 Next Steps After Testing

1. Deploy to production (Render.com)
2. Run database migration on production
3. Test with real data
4. Consider adding:
   - Edit contractor assignment (change hours/skills)
   - Include/exclude toggle per contractor
   - Contractor cost impact on quote total

