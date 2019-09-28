
// ------------------------------------------------------------------------------------------------------
// DATA FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function initializeEventData() {
  return localStorage.getItem('memberMixer_events') ? 
  JSON.parse(localStorage.getItem('memberMixer_events')) : 
  { 'events': [] };
}

function clearEventData() {
  localStorage.setItem('memberMixer_events') = { 'events': [] };
}


function initializeGroupData() {
  return localStorage.getItem('memberMixer_groups') ? 
  JSON.parse(localStorage.getItem('memberMixer_groups')) : 
  { 'groups': [] };
}

function clearGroupData() {
  localStorage.setItem('memberMixer_groups') = { 'groups': [] };
}

function getAvailableGroupId() {
	return getAvailableIdForNextObjectKey(groupData.groups);
}

function getAvailableEventId() {
  return getAvailableIdForNextObjectKey(eventData.events);
}

function getAvailableIdForNextObjectKey(object) {
  let availableId = 1;
  Object.keys(object).forEach(keyId => {
    availableId = availableId <= parseInt(keyId) ? parseInt(keyId) + 1 : availableId;
  });
  return availableId;
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
  eventData.events[availableId] = {
    name: eventName, 
    datetime: eventDatetime 
  };
  console.log(eventData);

  resetEventForm();
  refreshEventTable();
  resetGroupForm();
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

function resetEventForm() {
	document.getElementById("eventName").value = null;
  document.getElementById("eventDatetime").value = new Date().toDatetimeLocal();
  refreshEventFormEntryLimit();
}

// ------------------------------------------------------------------------------------------------------
// EVENT TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
// TODO add option to sort event table
function refreshEventTable(){
  // Create the new data
  let tbodyNew = document.createElement('tbody');
  const eventNum = eventData.events.length;
  Object.keys(eventData.events).forEach(eventId => {
    insertEventTableRow(tbodyNew, parseInt(eventId), eventData.events[eventId])
  });
  // Replace old data with new data
  let tbodyOld = document.getElementById("eventTable").tBodies[0];
	tbodyOld.parentNode.replaceChild(tbodyNew, tbodyOld);
}

function insertEventTableRow(tbody, eventId, event) {
  let tr = tbody.insertRow(tbody.rows.length); // <tr>

  // Handle ID #
  let tdID = tr.insertCell(tr.cells.length); // <td>
  let id = document.createTextNode(eventId);
  tdID.appendChild(id);

  // Handle Event Name
  let tdName = tr.insertCell(tr.cells.length); // <td>
  let name = document.createTextNode(event.name);
  tdName.appendChild(name);

  // Handle Datetime
  let tdDatetime = tr.insertCell(tr.cells.length); // <td>
  let datetimeDisplay = new Date(event.datetime).toLocaleString('en-US', { timeZone: 'UTC' });
  let datetime = document.createTextNode(datetimeDisplay);
  tdDatetime.appendChild(datetime);

  // Handle Row Options
  let btn = createAndGetRemoveButton(tr);
  btn.addEventListener("click", function(){
    removeEvent(eventId, tr);
  }, false);
}

function removeEvent(eventId, tr) {
  delete eventData.events[eventId];
  tr.parentNode.removeChild(tr);
  let groupFormItem = document.getElementById("groupForm_event_"+eventId);
  groupFormItem.parentElement.removeChild(groupFormItem);
}

function clearEventTable() {
  let table = document.getElementById("eventTable");
  let cells = table.getElementsByTagName("td");
  for (let cell of cells) {
    table.firstChild.removeChild(cell);
  }
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

  // Store the data
  groupData.groups[availableId] = {
    name: groupName, 
    participants: groupParticipants, 
    eventsCanHost: groupHosting, 
    eventsCanAttend: groupAttendance
  };

  // Refresh the view
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
    Object.keys(eventData.events).forEach(eventId => {
      eventList.push(parseInt(eventId));
    });
  } else {
    Object.keys(eventData.events).forEach(eventId => {
      if (document.getElementById("can"+verb+"_"+eventId).checked) {
        eventList.push(parseInt(eventId));
      }
    });
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
  Object.keys(eventData.events).forEach(eventId => {
    insertGroupFormEventCheckBoxRow(eventList, parseInt(eventId), eventData.events[eventId]);
  });
}

function insertGroupFormEventCheckBoxRow(eventList, eventId, event) {
  // Handle new list Item
  let liNew = document.createElement("li");
  liNew.classList.add("list-group-item");
  liNew.id = "groupForm_event_"+eventId;
  let formDivNew = document.createElement("div");
  formDivNew.classList.add("form-row");
  liNew.appendChild(formDivNew);

  // Handle Event #
  let eventNumDivNew = document.createElement("div");
  eventNumDivNew.classList.add("col-1");
  eventNumDivNew.innerHTML = eventId;
  formDivNew.appendChild(eventNumDivNew);

  // Handle Event Name
  let eventNameDivNew = document.createElement("div");
  eventNameDivNew.classList.add("col-7");
  eventNameDivNew.innerHTML = event.name;
  console.log("Event Name: ",event.name);
  formDivNew.appendChild(eventNameDivNew);

  // Handle Event "Can Host" Checkbox
  let eventHostDivNew = document.createElement("div");
  eventHostDivNew.classList.add("col-2");
  // input
  let hostInput = document.createElement("input");
  hostInput.classList.add("form-check-input");
  hostInput.type = "checkbox";
  hostInput.id = "canHost_"+eventId;
  // label
  let hostLabel = document.createElement("label");
  hostLabel.classList.add("form-check-label");
  hostLabel.htmlFor = "canHost_"+eventId;
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
  attendInput.id = "canAttend_"+eventId;
  // label
  let attendLabel = document.createElement("label");
  attendLabel.classList.add("form-check-label");
  attendLabel.htmlFor = "canAttend_"+eventId;
  attendLabel.innerHTML = "Can Attend";
  // Combine elements
  eventAttendDivNew.appendChild(attendInput);
  eventAttendDivNew.appendChild(attendLabel);
  formDivNew.appendChild(eventAttendDivNew);

  // Add the new List Item to the List
  eventList.appendChild(liNew);

  // Initialize the Host/Attend checkboxes to checked
  // let hostCheckbox = document.getElementById(hostInput.id)
  // let attendCheckbox = document.getElementById(attendInput.id)
  hostInput.checked = true;
  attendInput.checked = true;

  // Add Event Listeners
  hostInput.addEventListener("click", function(){
    uncheckGroupFormAllCheck("Host");
  }, false);
  attendInput.addEventListener("click", function(){
    uncheckGroupFormAllCheck("Attend");
  }, false);
}

// Toggle "Host All"
function toggleGroupFormHosting() {
  toggleGroupFormEventStatus("Host");
}
// Toggle "Attend All"
function toggleGroupFormAttendance() {
  toggleGroupFormEventStatus("Attend");
}
// Toggle Host/Attend Checkboxes
function toggleGroupFormEventStatus(verb) {
  let allChecked = document.getElementById("groupForm"+verb+"All").checked;
  Object.keys(eventData.events).forEach(eventId => {
    document.getElementById("can"+verb+"_"+eventId).checked = allChecked;
  });
}
function uncheckGroupFormAllCheck(verb) {
  console.log("Set Checkbox False: ", verb)
  document.getElementById("groupForm"+verb+"All").checked = false;
}
function checkGroupFormAllCheck(verb) {
  document.getElementById("groupForm"+verb+"All").checked = true;
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

function resetGroupForm(){
  //refreshGroupFormAttendSelect();
  //refreshGroupFormHostSelect();
  refreshGroupFormEventOptions();
  refreshGroupFormEntryLimit();
  checkGroupFormAllCheck("Host");
  checkGroupFormAllCheck("Attend");
}


// ------------------------------------------------------------------------------------------------------
// GROUP TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
// TODO Add option to remove group

function refreshGroupTable(){
  // Create the new data
  let tbodyNew = document.createElement("tbody");
  Object.keys(groupData.groups).forEach(groupId => {
    insertGroupTableRow(tbodyNew, groupId, groupData.groups[groupId]);
  });

  // Replace old data with new data
  let tbodyOld = document.getElementById("groupTable").tBodies[0];
	tbodyOld.parentNode.replaceChild(tbodyNew, tbodyOld); // Replace with new data
}

function insertGroupTableRow(tbody, groupId, group) {
  let tr = tbody.insertRow(tbody.rows.length); // <tr>

  // Handle ID #
  let tdID = tr.insertCell(tr.cells.length); // <td>
  let id = document.createTextNode(groupId);
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
  let btn = createAndGetRemoveButton(tr);
  btn.addEventListener("click", function(){
    removeGroup(groupId, tr);
  }, false);
}

function removeGroup(groupId, tr) {
  delete groupData.groups[groupId];
  tr.parentNode.removeChild(tr);
}

function clearGroupTable() {
  let table = document.getElementById("groupTable");
  let cells = table.getElementsByTagName("td");
  for (let cell of cells) {
    table.firstChild.removeChild(cell);
  }
}


// ------------------------------------------------------------------------------------------------------
// GENERIC TABLE FUNCTIONS
// ------------------------------------------------------------------------------------------------------
function createAndGetRemoveButton(tr) {
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
  return removeBtn;
}

// ------------------------------------------------------------------------------------------------------
// SCHEDULING ALGORITHM
// ------------------------------------------------------------------------------------------------------
function generateItinerary() {
// TODO finish schedule algorithm
  console.log("Generating Itinerary...");

  let hostWeights = getInitialHostWeights();
  let attendeeWeights = getInitialAttendeeWeights();
  Object.keys(eventData.events).forEach(eventId => {

    // Get Initial Numbers
    let availableHosts = getAvailableHosts(eventId);
    let availableAttendees = getAvailableAttendees(eventId);
    let participantCount = getParticipantCount(availableHosts, availableAttendees);
    let minimumHostCount = Math.ceil(participantCount / maxParticipants);

    // Make Initial Assignments
    let sortedHosts = getSortedHosts(availableHosts, hostWeights);
    let sortedAttendees = getSortedAttendees(availableAttendees, attendeeWeights);

    // Loop Through
  })
  console.log("Generated.");
 }

function getInitialHostWeights() {
  let weights = {}
  Object.keys(groupData.groups).forEach(groupId => {
    if (groupData.groups[groupId].eventsCanHost.length > 0) {
      let eventCount = eventData.events.length;
      let hostableEventCount = groupData.groups[groupId].eventsCanHost.length;
      weights[groupId] = eventCount - hostableEventCount;
    }
  })
  console.log("Initial Host Weights: ", weights);
  return weights;
}

function getInitialAttendeeWeights() {
  let weights = {}
  Object.keys(groupData.groups).forEach(groupId => {
    if (groupData.groups[groupId].eventsCanHost.length > 0) {
      let eventCount = eventData.events.length;
      let attendingEventCount = groupData.groups[groupId].eventsCanAttend.length;
      weights[groupId] = eventCount - attendingEventCount;
    }
  })
  console.log("Initial Attendee Weights: ", weights);
  return weights;
}

function getAvailableHosts(eventId) {
  let availableHosts = [];
  Object.keys(groupData.groups).forEach(group => {
    if (groupData.groups[group].eventsCanHost.includes(eventId)) {
      availableHosts.push(group);
    }
  });
  console.log("Available Hosts: ", availableHosts);
  return availableHosts;
}

function getSortedHosts(hostWeights) {
  // Order hosts by:
    // Can ONLY Host, not attend
    // Greatest Host Weight
    // Group Size
}

function getAvailableAttendees(eventId) {
  let availableAttendees = [];
  Object.keys(groupData.groups).forEach(group => {
    if (groupData.groups[group].eventsCanAttend.includes(eventId)) {
      availableAttendees.push(group);
    }
  });
  return availableAttendees;
}

function getSortedAttendees(attendeeWeights) {
  // Order attendees by:
    // Can ONLY Attend, not attend
    // Greatest Host Weight
    // Group Size
}

function getParticipantCount(availableHosts, availableAttendees) {
  let participantCount = 0
  Object.keys(groupData.groups).forEach(group => {
    if (availableHosts.includes(group) || availableAttendees.includes(group)) {
      participantCount += groupData.groups[group].participants;
    }
  });
  console.log("Participant Count: ", participantCount);
  return participantCount;
}

function refreshSchedule() {
  // TODO build method to refresh Schedule
}


// ------------------------------------------------------------------------------------------------------
// GENERATE SCHEDULE
// ------------------------------------------------------------------------------------------------------




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
  document.getElementById("maxParticipants").addEventListener("input", updateMaxParticipants);
  document.getElementById("generateItineraryBtn").addEventListener("click", generateItinerary);

  // Update tables with default data
  refreshEventTable();
  resetEventForm();
  refreshGroupTable();
  resetGroupForm();
});
