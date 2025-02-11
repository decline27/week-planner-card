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
    
    for (let i = 0; i < this.homey.settings.get('days') || 7; i++) {
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

  getWeatherData(date, weather) {
    return {
      condition: weather.getCondition(),
      temperature: weather.getTemperature(),
      icon: weather.getIcon()
    };
  }

}

module.exports = WeekPlannerDriver;

document.addEventListener('DOMContentLoaded', function () {
	// Register the widget with Homey's dashboard API
	Homey.widgets.register({
		onData: function(data) {
			renderWidget(data);
		}
	});
});

function renderWidget(data) {
	// Update widget title
	document.querySelector('.header').textContent = data.title || 'Week Planner';
	
	// Clear days container and repopulate with updated data
	const container = document.querySelector('.days-container');
	container.innerHTML = ''; // ...existing code...
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
}