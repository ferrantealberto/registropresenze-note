import { isWithinInterval } from 'date-fns';

const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60000;
const BASE_DATE = new Date(2000, 0, 1);

interface TimeSlot {
  start: Date;
  end: Date;
}

function createTimeFromString(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export function calculateRealHours(activities: any[]): number {
  if (!activities?.length) return 0;

  try {
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = a.date.toDate();
      const dateB = b.date.toDate();
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    });

    const timeSlots: TimeSlot[] = [];

    sortedActivities.forEach(activity => {
      if (!activity.date || !activity.startTime || !activity.endTime) return;

      try {
        const activityDate = activity.date.toDate();
        const startTime = createTimeFromString(activityDate, activity.startTime);
        const endTime = createTimeFromString(activityDate, activity.endTime);

        // Check for overlaps and merge time slots
        let overlapped = false;
        for (let i = 0; i < timeSlots.length; i++) {
          const slot = timeSlots[i];
          if (
            isWithinInterval(startTime, { start: slot.start, end: slot.end }) ||
            isWithinInterval(endTime, { start: slot.start, end: slot.end }) ||
            (startTime <= slot.start && endTime >= slot.end)
          ) {
            // Merge overlapping slots
            slot.start = new Date(Math.min(startTime.getTime(), slot.start.getTime()));
            slot.end = new Date(Math.max(endTime.getTime(), slot.end.getTime()));
            overlapped = true;
            break;
          }
        }

        if (!overlapped) {
          timeSlots.push({ start: startTime, end: endTime });
        }
      } catch (error) {
        console.error('Error processing activity time:', error);
      }
    });

    // Calculate total real hours with 2 decimal places
    const totalHours = timeSlots.reduce((total, slot) => {
      const hours = (slot.end.getTime() - slot.start.getTime()) / (MS_PER_MINUTE * MINUTES_PER_HOUR);
      return total + hours;
    }, 0);

    return Number(totalHours.toFixed(2));
  } catch (error) {
    console.error('Error calculating real hours:', error);
    return 0;
  }
}

export function calculateLessonHours(startTime: string, endTime: string): number {
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const start = createTimeFromString(BASE_DATE, startTime);
    const end = createTimeFromString(BASE_DATE, endTime);
    
    const diffInMinutes = (end.getTime() - start.getTime()) / MS_PER_MINUTE;
    // Round up to nearest hour
    const hours = Math.ceil(diffInMinutes / MINUTES_PER_HOUR);
    
    return Math.max(0, hours); // Ensure we never return negative hours
  } catch (error) {
    console.error('Error calculating lesson hours:', error);
    return 0;
  }
}