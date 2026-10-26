const MeetingStatus = Object.freeze({
  TO_SCHEDULE: 'TO_SCHEDULE',
  SCHEDULED: 'SCHEDULED',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
});

class MeetingService {
  constructor() {
    this.meetings = [];
    this.nextId = 1;
    this.processedEventIds = new Set();
  }

  findAll() {
    return [...this.meetings];
  }

  findById(id) {
    return this.meetings.find((meeting) => meeting.id === id) ?? null;
  }

  handleApplicationSubmitted(event) {
    if (this.processedEventIds.has(event.eventId)) {
      console.log(`Event ${event.eventId} already processed: ignored (idempotent consumer)`);
      return null;
    }

    const meeting = {
      id: this.nextId++,
      title: `Interview with ${event.candidateFirstname} ${event.candidateLastname} - ${event.jobName}`,
      date: null,
      status: MeetingStatus.TO_SCHEDULE,
      candidateId: event.candidateId,
      jobId: event.jobId,
      applicationId: event.applicationId,
      eventId: event.eventId,
      createdAt: new Date().toISOString(),
    };
    this.meetings.push(meeting);
    this.processedEventIds.add(event.eventId);
    console.log(`Interview to schedule created: meeting ${meeting.id} for application ${meeting.applicationId}`);
    return meeting;
  }
}

module.exports = { MeetingStatus, MeetingService, meetingService: new MeetingService() };
