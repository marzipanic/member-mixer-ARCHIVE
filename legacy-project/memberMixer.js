
// ------------------------------------------------------------------------------------------------------
// DATA FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function initializeEventData() {
  return localStorage.getItem('memberMixer_events') ? 
  JSON.parse(localStorage.getItem('memberMixer_events')) : 
  { events: [] };
}

function clearEventData() {
  localStorage.setItem('memberMixer_events') = { events: [] };
}


function initializeGroupData() {
  return localStorage.getItem('memberMixer_groups') ? 
  JSON.parse(localStorage.getItem('memberMixer_groups')) : 
  { groups: [] };
}

function clearGroupData() {
  localStorage.setItem('memberMixer_groups') = { groups: [] };
}


function getAvailableGroupId() {
	let availableId = 1;
	const groupNum = groupData.groups.length;
  for (let i = 0; i < groupNum; i++) {
  	let groupId = groupData.groups[i].id;
    availableId = availableId <= groupId ? groupId + 1 : availableId;
	}
  return availableId;
}

function getAvailableEventId() {
	let availableId = 1;
  for (let i = 0; i < eventData.events.length; i++) {
  	let eventId = eventData.events[i].id;
    availableId = availableId <= eventId ? eventId + 1 : availableId;
	}
  return availableId;
}

function getAvailableHostGroups(eventId) {
  let availableGroupCount = 0;
  for (let i = 0; i < groupData.groups.length; i++) {
    let group = groupData.group[i];
    if (group.eventsCanHost.includes(eventId)) {
      availableGroupCount += groupData.group[i].participants
    }
	}
  return availableGroupCount;
}

function getAvailableAttendeeGroups(eventId) {
  let availableGroupCount = 0;
  for (let i = 0; i < groupData.groups.length; i++) {
    let group = groupData.group[i];
    if (group.eventsCanAttend.includes(eventId)) {
      availableGroupCount += groupData.group[i].participants
    }
	}
  return availableGroupCount;
}

// ------------------------------------------------------------------------------------------------------
// MAX PARTICIPANTS
// ------------------------------------------------------------------------------------------------------
function initializeMaxParticipants() {
  let storedValue = localStorage.getItem('memberMixer_maxParticipants');
  if (storedValue && Number.isInteger(parseInt(storedValue))) {
    document.getElementById("maxParticipants").value = storedValue;
    return parseInt(storedValue);
  }
  return 0;
}

function updateMaxParticipants(e) {
  //e.preventDefault();
  let input = document.getElementById("maxParticipants");
  if (Number.isInteger(parseInt(input.value))) {
    maxParticipants = parseInt(input.value);
    localStorage.setItem('memberMixer_maxParticipants', maxParticipants);
  }
  console.log("Max Participants: ", maxParticipants);
}

// ------------------------------------------------------------------------------------------------------
// EVENT FORM FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function submitEventForm() {
  // Grab the form elements
  let availableId = getAvailableEventId();
  let eventNameVal = document.getElementById("eventName").value;
  let eventName = eventNameVal ? eventNameVal : "Event " + availableId;
  let eventDatetimeVal = document.getElementById("eventDatetime").value;
	let eventDatetime = new Date(eventDatetimeVal).toISOString();

  // Store the data and refresh the view
  eventData.events.push({ id: availableId, name: eventName, datetime: eventDatetime });
  console.log(eventData);

  refreshEventForm();
  refreshEventTable();
  refreshGroupForm();
  refreshGroupTable();
}

function refreshEventFormEntryLimit(){
  let alert = document.getElementById("eventAlert");
  let eventForm = document.getElementById("eventForm");
  if (eventData.events.length >= 20) { // Max 20 events allowed
    alert.style.display = "block";
    eventForm.style.display = "none";
  } else {
    alert.style.display = "none";
    eventForm.style.display = "initial";
  }
}

function refreshEventForm() {
  document.getElementById("eventName").value = null;
  document.getElementById("eventDatetime").value = new Date().toDatetimeLocal();
  refreshEventFormEntryLimit();
}

// ------------------------------------------------------------------------------------------------------
// EVENT TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
// TODO add option to sort event table
// TODO Add option to remove event
function refreshEventTable(){
  // Create the new data
  let tbodyNew = document.createElement('tbody');
  const eventNum = eventData.events.length;
  for (let i = 0; i < eventNum; i++) {
    let event = eventData.events[i];
    insertEventTableRow(tbodyNew, event)
	}
  // Replace old data with new data
  let tbodyOld = document.getElementById("eventTable").tBodies[0];
	tbodyOld.parentNode.replaceChild(tbodyNew, tbodyOld);
}

function insertEventTableRow(tbody, event) {
  let tr = tbody.insertRow(tbody.rows.length); // <tr>

  // Handle ID #
  let tdID = tr.insertCell(tr.cells.length); // <td>
  let id = document.createTextNode(event.id);
  tdID.appendChild(id);

  // Handle Group Name
  let tdName = tr.insertCell(tr.cells.length); // <td>
  let name = document.createTextNode(event.name);
  tdName.appendChild(name);

  // Handle Datetime
  let tdDatetime = tr.insertCell(tr.cells.length); // <td>
  let datetimeDisplay = new Date(event.datetime).toLocaleString('en-US', { timeZone: 'UTC' });
  let datetime = document.createTextNode(datetimeDisplay);
  tdDatetime.appendChild(datetime);

  // Handle Row Options
  insertTableRowOptionToRemove(tr);
}

// ------------------------------------------------------------------------------------------------------
// GROUP FORM FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function submitGroupForm() {
  // Grab the form elements
  let availableId = getAvailableGroupId();

  let groupNameVal = document.getElementById("groupName").value;
  let groupName = groupNameVal ? groupNameVal : "Group " + availableId;
  
  let groupParticipantsVal = document.getElementById("groupParticipants").value;
  let groupParticipants = groupParticipantsVal && Number.isInteger(parseInt(groupParticipantsVal)) ? parseInt(groupParticipantsVal) : 1;

  let groupHosting = getGroupFormEventHosting();
  let groupAttendance = getGroupFormEventAttendance();

  // Store the data and refresh the view
  groupData.groups.push({ 
    id: availableId, 
    name: groupName, 
    participants: groupParticipants, 
    eventsCanHost: groupHosting, 
    eventsCanAttend: groupAttendance
  });
  refreshGroupTable();
}

function getGroupFormEventHosting() {
  return getGroupFormEventStatus("Host");
}

function getGroupFormEventAttendance() {
  return getGroupFormEventStatus("Attend");
}

function getGroupFormEventStatus(verb) {
  let eventList = [];
  if (document.getElementById("groupForm"+verb+"All").checked) {
    for (i = 0; i < eventData.events.length; i++) {
      eventList.push(eventData.events[i].id);
    }
  } else {
    for (i = 0; i < eventData.events.length; i++) {
      if (document.getElementById("can"+verb+"_"+eventData.events[i].id.toString()).checked) {
        eventList.push(eventData.events[i].id);
      }
    }
  }
  return eventList;
}

function refreshGroupFormEventOptions() {
  // Remove the old data
  let eventList = document.getElementById("groupFormEventOptions");
  let eventListItems = eventList.querySelectorAll("li");
  for (let i = 1; i < eventListItems.length; i++) { // Skip the first row
    eventList.removeChild(eventListItems[i]); // Delete all other rows
  }

  // Insert the new data
  const eventNum = eventData.events.length;
  for (let i = 0; i < eventNum; i++) {
    let event = eventData.events[i];
    insertGroupFormEventCheckBoxRow(eventList, event);
  }
}

function insertGroupFormEventCheckBoxRow(eventList, event) {
  // Handle new list Item
  let liNew = document.createElement("li");
  liNew.classList.add("list-group-item");
  let formDivNew = document.createElement("div");
  formDivNew.classList.add("form-row");
  liNew.appendChild(formDivNew);

  // Handle Event #
  let eventNumDivNew = document.createElement("div");
  eventNumDivNew.classList.add("col-1");
  eventNumDivNew.innerHTML = event.id;
  formDivNew.appendChild(eventNumDivNew);

  // Handle Event Name
  let eventNameDivNew = document.createElement("div");
  eventNameDivNew.classList.add("col-7");
  eventNameDivNew.innerHTML = event.name;
  formDivNew.appendChild(eventNameDivNew);

  // Handle Event "Can Host" Checkbox
  let eventHostDivNew = document.createElement("div");
  eventHostDivNew.classList.add("col-2");
  
  // input
  let hostInput = document.createElement("input");
  hostInput.classList.add("form-check-input");
  hostInput.type = "checkbox";
  hostInput.id = "canHost_"+event.id;
  // label
  let hostLabel = document.createElement("label");
  hostLabel.classList.add("form-check-label");
  hostLabel.htmlFor = "canHost_"+event.id;
  hostLabel.innerHTML = "Can Host";
  // Combine elements
  eventHostDivNew.appendChild(hostInput);
  eventHostDivNew.appendChild(hostLabel);
  formDivNew.appendChild(eventHostDivNew);

  // Handle Event "Can Attend" Checkbox
  let eventAttendDivNew = document.createElement("div");
  eventAttendDivNew.classList.add("col-2");
  // input
  let attendInput = document.createElement("input");
  attendInput.classList.add("form-check-input");
  attendInput.type = "checkbox";
  attendInput.id = "canAttend_"+event.id;
  // label
  let attendLabel = document.createElement("label");
  attendLabel.classList.add("form-check-label");
  attendLabel.htmlFor = "canAttend_"+event.id;
  attendLabel.innerHTML = "Can Attend";
  // Combine elements
  eventAttendDivNew.appendChild(attendInput);
  eventAttendDivNew.appendChild(attendLabel);
  formDivNew.appendChild(eventAttendDivNew);

  // Add the new List Item to the List
  eventList.appendChild(liNew);
}

function toggleGroupFormHosting() {
  toggleGroupFormEventStatus("Host");
}

function toggleGroupFormAttendance() {
  toggleGroupFormEventStatus("Attend");
}

function toggleGroupFormEventStatus(verb) {
  let allChecked = document.getElementById("groupForm"+verb+"All").checked;
  for (i = 0; i < eventData.events.length; i++) {
    document.getElementById("can"+verb+"_" + eventData.events[i].id).checked = !allChecked;
  }
}


function refreshGroupFormEntryLimit(){
  let alert = document.getElementById("groupAlert");
  let groupForm = document.getElementById("groupForm");
  if (groupData.groups.length >= 50) { // Max 50 groups allowed
    alert.style.display = "block";
    groupForm.style.display = "none";
  } else {
    alert.style.display = "none";
    groupForm.style.display = "initial";
  }
}

function refreshGroupForm(){
  //refreshGroupFormAttendSelect();
  //refreshGroupFormHostSelect();
  refreshGroupFormEventOptions();
  refreshGroupFormEntryLimit();
}

function resetGroupForm() {
	document.getElementById("groupForm").reset();
}


// ------------------------------------------------------------------------------------------------------
// GROUP TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
// TODO Add option to remove group

function refreshGroupTable(){
  // Create the new data
  let tbodyNew = document.createElement("tbody");
  const groupNum = groupData.groups.length;
  for (let i = 0; i < groupNum; i++) {
    let group = groupData.groups[i];
    insertGroupTableRow(tbodyNew, group);
	}
  // Replace old data with new data
  let tbodyOld = document.getElementById("groupTable").tBodies[0];
	tbodyOld.parentNode.replaceChild(tbodyNew, tbodyOld); // Replace with new data
}

function insertGroupTableRow(tbody, group) {
  let tr = tbody.insertRow(tbody.rows.length); // <tr>

  // Handle ID #
  let tdID = tr.insertCell(tr.cells.length); // <td>
  let id = document.createTextNode(group.id);
  tdID.appendChild(id);

  // Handle Group Name
  let tdName = tr.insertCell(tr.cells.length); // <td>
  let name = document.createTextNode(group.name);
  tdName.appendChild(name);

  // Handle # of Group Members
  let tdPartNum = tr.insertCell(tr.cells.length); // <td>
  let participants = document.createTextNode(group.participants);
  tdPartNum.appendChild(participants);

  // Handle (Events) Can Host
  let tdHost = tr.insertCell(tr.cells.length); // <td>
  let hostingText = group.eventsCanHost ? group.eventsCanHost.toString() : "NONE";
  let hostingNode = document.createTextNode(hostingText);
  tdHost.appendChild(hostingNode);

  // Handle (Events) Can Attend
  let tdAttend = tr.insertCell(tr.cells.length); // <td>
  let attendingText = group.eventsCanAttend ? group.eventsCanAttend.toString() : "NONE";
  let attendingNode = document.createTextNode(attendingText);
  tdAttend.appendChild(attendingNode);

  // Handle Options
  insertTableRowOptionToRemove(tr);
}

function resetEventForm() {
	document.getElementById("groupForm").reset();
}


// ------------------------------------------------------------------------------------------------------
// GENERIC TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function insertTableRowOptionToRemove(tr) {
  // TODO generate remove button id and logic
  let tdOptions = tr.insertCell(tr.cells.length); // <td>
  tdOptions.classList.add("text-right");

  let removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.classList.add("btn","btn-danger");

  let removeIcon = document.createElement("i");
  removeIcon.classList.add("fa","fa-trash");
  removeIcon.setAttribute("aria-hidden", "true");

  removeBtn.appendChild(removeIcon);
  tdOptions.appendChild(removeBtn);
}

// ------------------------------------------------------------------------------------------------------
// SCHEDULING ALGORITHM
// ------------------------------------------------------------------------------------------------------
function generateSchedule() {
  // TODO finish schedule algorithm
  let hostInfo = { groups: [{ }] };
  let relationships = { groups: [{ }] };
  let counts = { participants: 0, availableParticipants: 0 };

  for (let i = 0; i < groupData.length; i++) {
  	counts.participants += groupData.group[i].participants;
    if (groupData.group[i].some(e => e.name === 'Magenic')) {
      counts.availableParticipants += groupData.group[i].participants
    }
	}
  return availableId;
  //let participantCount =
}

function refreshSchedule() {
  // TODO build method to refresh Schedule
}


// ------------------------------------------------------------------------------------------------------
// GENERATE SCHEDULE
// ------------------------------------------------------------------------------------------------------

function submitSettingsForm() {
  generateSchedule();
  refreshSchedule();
}



// ------------------------------------------------------------------------------------------------------
// MAIN PROGRAM
// ------------------------------------------------------------------------------------------------------
// Set Some Defaults
let dateISO = new Date().toISOString(); //"2011-12-19T15:28:46.493Z"

// Check Local Storage for User Defined Settings
let maxParticipants = initializeMaxParticipants();
console.log("Initial Max Participants: ", maxParticipants);

let eventData = initializeEventData();
console.log("Initial Event Data: ", eventData);

let groupData = initializeGroupData();
console.log("Initial Group Data: ", groupData);


document.addEventListener("DOMContentLoaded",function(){ // On DOM Ready
  // Register Form Control Listeners
  document.getElementById("groupFormSubmitBtn").addEventListener("click", submitGroupForm);
  document.getElementById("groupFormResetBtn").addEventListener("click", resetGroupForm);
  document.getElementById("groupFormHostAll").addEventListener("change", toggleGroupFormHosting);
  document.getElementById("groupFormAttendAll").addEventListener("change", toggleGroupFormAttendance);
  document.getElementById("eventFormSubmitBtn").addEventListener("click", submitEventForm);
  document.getElementById("eventFormResetBtn").addEventListener("click", resetEventForm);
  document.getElementById("settingsFormSubmitBtn").addEventListener("click", submitSettingsForm);
  document.getElementById("maxParticipants").addEventListener("input", updateMaxParticipants);

  // Update tables with default data
  refreshEventTable();
  refreshEventForm();
  refreshGroupTable();
  refreshGroupForm();
});
