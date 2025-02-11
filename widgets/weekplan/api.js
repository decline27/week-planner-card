const { Driver } = require('homey');
const { DateTime } = require('luxon');

class WeekPlannerDriver extends Driver {

  async onInit() {
    this.log('WeekPlannerDriver initialized');
    
    this._updateInterval = this.homey.settings.get('updateInterval') || 60;
    this.registerUpdateTimer();
  }

  registerUpdateTimer() {
    if (this.updateTimer) clearInterval(this.updateTimer);
    this.updateTimer = setInterval(() => this.updateSchedule(), this._updateInterval * 1000);
  }

  async updateSchedule() {
    try {
      const calendars = await this.homey.calendars.getCalendars();
      const weather = await this.homey.weather.getWeather();
      const schedule = await this.generateSchedule(calendars, weather);
      
      this.emit('schedule', schedule);
      this.log('Schedule updated');
    } catch (err) {
      this.error('Update failed:', err);
    }
  }

  async generateSchedule(calendars, weather) {
    const days = [];
    const startDate = DateTime.now().startOf('day');
    const numberOfDays = this.homey.settings.get('days') || 7;
    
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = startDate.plus({ days: i });
      const events = await this.getDateEvents(currentDate, calendars);
      
      days.push({
        date: currentDate.toLocaleString(DateTime.DATE_HUGE),
        events: events,
        weather: this.getWeatherData(currentDate, weather)
      });
    }
    
    return days;
  }

  // Stub for getting events for a given date.
  async getDateEvents(date, calendars) {
    // Filter for the Google calendar you want connected (use property as defined by Homey)
    const googleCalendar = calendars.find(cal => cal.provider === 'google');
    if (!googleCalendar) {
      this.error('No Google Calendar found');
      return [];
    }
    // ...existing code to retrieve events from googleCalendar...
    // For example, use googleCalendar.id to query events from your Google calendar
    // TODO: Implement logic to query events from googleCalendar using date and googleCalendar.id
    return [];
  }

  getWeatherData(date, weather) {
    return {
      condition: weather.getCondition(),
      temperature: weather.getTemperature(),
      icon: weather.getIcon()
    };
  }

}

module.exports = WeekPlannerDriver;

// Only run the following widget code in a browser environment
if (typeof window !== 'undefined' && window.document) {
  (function() {
    document.addEventListener('DOMContentLoaded', function () {
      // Register the widget with Homey's dashboard API
      Homey.widgets.register({
        onData: function(data) {
          renderWidget(data);
        }
      });
    });

    const renderWidget = function(data) {
      // Update widget title
      document.querySelector('.header').textContent = data.title || 'Week Planner';
      
      // Clear days container and repopulate with updated data
      const container = document.querySelector('.days-container');
      container.innerHTML = ''; // Clear previous content
      if (Array.isArray(data.days)) {
        data.days.forEach(day => {
          const dayCard = document.createElement('div');
          dayCard.className = 'day-card ' + (day.dayClass || '');
          dayCard.innerHTML = `
            <div class="date-header">${day.date}</div>
            <div class="weather-info">
              <img src="${day.weather.icon}" alt="${day.weather.condition}">
              <div class="temp">${day.weather.temperature}°</div>
            </div>
            <div class="events">
              ${(day.events || []).map(event => `
                <div class="event" style="border-color: ${event.color}">
                  <div class="event-time">${event.startTime} - ${event.endTime}</div>
                  <div class="event-title">${event.title}</div>
                </div>
              `).join('')}
            </div>`;
          container.appendChild(dayCard);
        });
      }
    };
  })();
}
