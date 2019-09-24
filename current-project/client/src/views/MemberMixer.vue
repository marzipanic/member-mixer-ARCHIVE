<template>
  <div class="member-mixer">
    <h1 class="display-3">Member Mixer</h1>
    <p>
      This tool will help you, the Event Planner, create a schedule for gatherings to be hosted and attended by a pool of people. These gatherings prioritize meeting new people, while providing control for participants' availability.
    </p>
    <p>
      Important concepts when using this tool include:
      <ul class="list-unstyled">
        <li><strong>Group:</strong> a collection of participants; couples, families, etc. may attend events together (group size 2+); others may attend events individually (group size 1)</li>
        <li><strong>Event:</strong> a date/time during which several gatherings may be held</li>
        <li><strong>Gathering:</strong> a meeting that is hosted by a single group and attended by some (but not all) other groups</li>
        <li><strong>Host:</strong> a group that is responsible for accommodating/organizing a gathering</li>
      </ul>
    <p>
      To get started, fill out your Group information, event information, and General Settings below then click the "Generate Gatherings" button at the bottom of the page.
    </p>
  </div>
</template>

<script>
// @ is an alias to /src
import ManageSettings from '@/components/MemberMixer/ManageSettingss.vue'
import ManageEvents from '@/components/MemberMixer/ManageEvents.vue'
import ManageGroups from '@/components/MemberMixer/ManageGroups.vue'

export default {
  name: 'manage-settings',
  components: {
    ManageSettings
  }
}
export default {
  name: 'manage-events',
  components: {
    ManageEvents
  }
}
export default {
  name: 'manage-groups',
  components: {
    ManageGroups
  }
}
</script>
