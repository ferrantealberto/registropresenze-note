import { collection, query, where, getDocs, orderBy, Query, DocumentData } from 'firebase/firestore';
import { db } from './firebase';

interface QueryParams {
  period: 'week' | 'month' | 'all';
  startDate?: Date;
  endDate?: Date;
  school?: string;
  class?: string;
  sortDirection: 'asc' | 'desc';
}

// Helper function to create base query with date filter
function createDateQuery(activitiesRef: any, startDate?: Date, endDate?: Date) {
  if (startDate && endDate) {
    return query(activitiesRef, 
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date')
    );
  }
  return query(activitiesRef, orderBy('date'));
}

// Helper function to create school query
function createSchoolQuery(activitiesRef: any, school: string) {
  return query(activitiesRef, 
    where('school', '==', school),
    orderBy('date')
  );
}

// Helper function to create class query
function createClassQuery(activitiesRef: any, schoolClass: string) {
  return query(activitiesRef, 
    where('class', '==', schoolClass),
    orderBy('date')
  );
}

// Helper function to create school and class query
function createSchoolClassQuery(activitiesRef: any, school: string, schoolClass: string) {
  return query(activitiesRef,
    where('school', '==', school),
    where('class', '==', schoolClass),
    orderBy('date')
  );
}

export async function getActivities(params: QueryParams) {
  try {
    const activitiesRef = collection(db, 'activities');
    let q: Query<DocumentData>;

    // Create query based on filters
    if (params.school && params.class) {
      q = createSchoolClassQuery(activitiesRef, params.school, params.class);
    } else if (params.school) {
      q = createSchoolQuery(activitiesRef, params.school);
    } else if (params.class) {
      q = createClassQuery(activitiesRef, params.class);
    } else {
      q = createDateQuery(activitiesRef);
    }

    const querySnapshot = await getDocs(q);
    let activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply date filtering in memory if needed
    if (params.period !== 'all' && params.startDate && params.endDate) {
      activities = activities.filter(activity => {
        const activityDate = activity.date.toDate();
        return activityDate >= params.startDate! && activityDate <= params.endDate!;
      });
    }

    // Apply sorting
    activities.sort((a, b) => {
      const dateA = a.date.toDate().getTime();
      const dateB = b.date.toDate().getTime();
      return params.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return activities;
  } catch (error) {
    console.error('Error in getActivities:', error);
    return [];
  }
}