/**
 * POTLUCK SIGNUP - Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Create two sheets (tabs) named exactly: "Users" and "Signups"
 * 3. In "Users" sheet, add headers in row 1: email | password_hash | name | created_at
 * 4. In "Signups" sheet, add headers in row 1: category | item | slot | user_email | user_name | notes | timestamp
 * 5. Go to Extensions > Apps Script
 * 6. Delete any existing code and paste this entire file
 * 7. Click Deploy > New Deployment
 * 8. Select "Web app" as type
 * 9. Set "Execute as" to "Me"
 * 10. Set "Who has access" to "Anyone"
 * 11. Click Deploy and copy the Web App URL
 * 12. Paste the URL in your Lovable app
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter;
    const action = params.action;
    const callback = params.callback; // optional JSONP callback name
    
    let result;
    
    switch(action) {
      case 'register':
        result = registerUser(params.email, params.password_hash, params.name);
        break;
      case 'login':
        result = loginUser(params.email, params.password_hash);
        break;
      case 'getSignups':
        result = getAllSignups();
        break;
      case 'addSignup':
        result = addSignup(params.category, params.item, params.slot, params.user_email, params.user_name, params.notes);
        break;
      case 'removeSignup':
        result = removeSignup(params.category, params.item, params.slot, params.user_email);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
    
    // NOTE: Google Apps Script Web Apps often cannot be called via browser `fetch()` due to CORS/origin restrictions.
    // To support browser clients reliably, we provide JSONP when `callback` is present.
    const output = callback
      ? `${callback}(${JSON.stringify(result)});`
      : JSON.stringify(result);

    return ContentService
      .createTextOutput(output)
      .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
      
  } catch(error) {
    const params = (e && e.parameter) ? e.parameter : {};
    const callback = params.callback;
    const payload = { success: false, error: error.toString() };
    const output = callback
      ? `${callback}(${JSON.stringify(payload)});`
      : JSON.stringify(payload);

    return ContentService
      .createTextOutput(output)
      .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
  }
}

function registerUser(email, passwordHash, name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  // Check if email already exists (skip header row)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      return { success: false, error: 'Email already registered' };
    }
  }
  
  // Add new user
  sheet.appendRow([email.toLowerCase(), passwordHash, name, new Date().toISOString()]);
  
  return { success: true, user: { email: email.toLowerCase(), name: name } };
}

function loginUser(email, passwordHash) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase() && data[i][1] === passwordHash) {
      return { success: true, user: { email: data[i][0], name: data[i][2] } };
    }
  }
  
  return { success: false, error: 'Invalid email or password' };
}

function getAllSignups() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Signups');
  const data = sheet.getDataRange().getValues();
  
  const signups = [];
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Only add if there's data
      signups.push({
        category: data[i][0],
        item: data[i][1],
        slot: parseInt(data[i][2]),
        userEmail: data[i][3],
        userName: data[i][4],
        notes: data[i][5] || '',
        timestamp: data[i][6]
      });
    }
  }
  
  return { success: true, signups: signups };
}

function addSignup(category, item, slot, userEmail, userName, notes) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Signups');
  const data = sheet.getDataRange().getValues();
  
  // Check if slot is already taken
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === category && data[i][1] === item && parseInt(data[i][2]) === parseInt(slot)) {
      return { success: false, error: 'Slot already taken' };
    }
  }
  
  // Add signup
  sheet.appendRow([category, item, slot, userEmail, userName, notes || '', new Date().toISOString()]);
  
  return { success: true };
}

function removeSignup(category, item, slot, userEmail) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Signups');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === category && 
        data[i][1] === item && 
        parseInt(data[i][2]) === parseInt(slot) && 
        data[i][3].toLowerCase() === userEmail.toLowerCase()) {
      sheet.deleteRow(i + 1); // +1 because sheets are 1-indexed
      return { success: true };
    }
  }
  
  return { success: false, error: 'Signup not found' };
}
