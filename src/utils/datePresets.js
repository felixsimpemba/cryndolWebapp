import { 
  startOfToday, 
  endOfToday, 
  startOfYesterday, 
  endOfYesterday, 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  format
} from 'date-fns';

export const DATE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom',
  ALL: 'all'
};

export const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  let start, end;

  switch (preset) {
    case DATE_PRESETS.TODAY:
      start = startOfToday();
      end = endOfToday();
      break;
    case DATE_PRESETS.YESTERDAY:
      start = startOfYesterday();
      end = endOfYesterday();
      break;
    case DATE_PRESETS.THIS_WEEK:
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfToday();
      break;
    case DATE_PRESETS.LAST_WEEK:
      const lastWeek = subWeeks(now, 1);
      start = startOfWeek(lastWeek, { weekStartsOn: 1 });
      end = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;
    case DATE_PRESETS.THIS_MONTH:
      start = startOfMonth(now);
      end = endOfToday();
      break;
    case DATE_PRESETS.LAST_MONTH:
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;
    default:
      return { start_date: '', end_date: '' };
  }

  return {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  };
};
