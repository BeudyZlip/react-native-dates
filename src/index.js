import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fr'; 
import 'moment-range';

moment.locale("fr")

// type DatesType = {
//   range: boolean,
//   date: ?moment,
//   startDate: ?moment,
//   endDate: ?moment,
//   focusedInput: 'startDate' | 'endDate',
//   onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
//   isDateBlocked: (date: moment) => boolean,
//   onDisableClicked: (date: moment) => void
// }

// type MonthType = {
//   range: boolean,
//   date: ?moment,
//   startDate: ?moment,
//   endDate: ?moment,
//   focusedInput: 'startDate' | 'endDate',
//   currentDate: moment,
//   focusedMonth: moment,
//   onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
//   isDateBlocked: (date: moment) => boolean,
//   onDisableClicked: (date: moment) => void
// }

// type WeekType = {
//   range: boolean,
//   date: ?moment,
//   startDate: ?moment,
//   endDate: ?moment,
//   focusedInput: 'startDate' | 'endDate',
//   startOfWeek: moment,
//   onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
//   isDateBlocked: (date: moment) => boolean,
//   onDisableClicked: (date: moment) => void
// }

const styles = StyleSheet.create({
  calendar: {
    // backgroundColor: 'rgb(255, 255, 255)'
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  week: {
    flexDirection: 'row'
  },
  dayName: {
    flexGrow: 1,
    flexBasis: 1,
    textAlign: 'center',
  },
  day: {
    flexGrow: 1,
    flexBasis: 1,
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 245)',
    margin: 1,
    padding: 10
  },
  dayBlocked: {
    backgroundColor: 'rgb(255, 255, 255)'
  },
  daySelected: {
    backgroundColor: 'rgb(52,120,246)'
  },
  dayText: {
    color: 'rgb(0, 0, 0)',
  },
  dayDisabledText: {
    color: 'gray',
    opacity: 0.5,
  },
  dText: {
    color: 'rgb(252, 252, 252)'
  }
});

const dates = (startDate, endDate, focusedInput: 'startDate' | 'endDate') => {
  if (focusedInput === 'startDate') {
    if (startDate && endDate) {
      return ({ startDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'endDate' });
  }

  if (focusedInput === 'endDate') {
    if (endDate && startDate && endDate.isBefore(startDate)) {
      return ({ startDate: endDate, endDate: null, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'startDate' });
  }

  return ({ startDate, endDate, focusedInput });
};

export const Week = (props) => {
  const {
    range,
    date,
    startDate,
    endDate,
    focusedInput,
    startOfWeek,
    onDatesChange,
    isDateBlocked,
    onDisableClicked,
    textColor,
    dayBackgroundColor,
    daySelectedColor,
    format,
  } = props;

  const days = [];
  const endOfWeek = startOfWeek.clone().endOf('isoweek');

  moment.range(startOfWeek, endOfWeek).by('days', (day) => {
    const onPress = () => {
      if (isDateBlocked(day)) {
        onDisableClicked(day);
      } else if (range) {
        let isPeriodBlocked = false;
        const start = focusedInput === 'startDate' ? day : moment(startDate, format);
        const end = focusedInput === 'endDate' ? day : moment(endDate, format);
        if (start && end) {
          moment.range(start, end).by('days', (dayPeriod) => {
            if (isDateBlocked(dayPeriod)) isPeriodBlocked = true;
          });
        }
        onDatesChange(isPeriodBlocked ?
          dates(end, null, 'startDate') :
          dates(start, end, focusedInput));
      } else {
        onDatesChange({ date: day });
      }
    };

    const isDateSelected = () => {
      if (range) {
        if (startDate && endDate) {
          return day.isBetween(moment(startDate, format), moment(endDate, format), null, '[]')
        }
      }
      return date && day.isSame(moment(date, format));
    };

    const isBlocked = isDateBlocked(day);
    const isSelected = isDateSelected();

    const style = [
      styles.day,
      isBlocked && styles.dayBlocked,
      isSelected && styles.daySelected
    ];

    const styleText = [
      styles.dayText,
      isBlocked && styles.dayDisabledText,
      isSelected && styles.daySelectedText
    ];

    days.push(
      <TouchableOpacity
        key={day.date()}
        style={[
          style,
          dayBackgroundColor ? { backgroundColor: dayBackgroundColor } : null,
          daySelectedColor && isSelected ? { backgroundColor: daySelectedColor } : null,
        ]}
        onPress={onPress}
        disabled={isBlocked && !onDisableClicked}
      >
        <Text style={[styleText, textColor ? { color: textColor } : null]}>{day.date()}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.week}>{days}</View>
  );
};

export const Month = (props) => {
  const {
    currentDate,
    focusedMonth,
    textColor
  } = props;

  const dayNames = [];
  const weeks = [];
  const startOfMonth = focusedMonth.clone().startOf('month').startOf('isoweek');
  const endOfMonth = focusedMonth.clone().endOf('month');
  const weekRange = moment.range(currentDate.clone().startOf('isoweek'), currentDate.clone().endOf('isoweek'));

  weekRange.by('days', (day) => {
    dayNames.push(
      <Text key={day.date()} style={[styles.dayName, textColor ? { color: textColor } : null]}>
        {day.format('ddd')}
      </Text>
    );
  });

  moment.range(startOfMonth, endOfMonth).by('weeks', (week) => {
    weeks.push(
      <Week
        key={week}
        startOfWeek={week}
        {...props}
      />
    );
  });

  return (
    <View style={styles.month}>
      <View style={styles.week}>
        {dayNames}
      </View>
      {weeks}
    </View>
  );
};

export default class Dates extends Component {
  constructor(props) {
    super(props)
    const {
      date,
      startDate,
      format,
    } = this.props
    let currentDate = moment()
    if (date) currentDate = moment(date, format)
    else if ( startDate ) currentDate = moment(startDate, format)

    let focusedMonth = moment().startOf('month')
    if (date) focusedMonth = moment(date, format).startOf('month')
    else if ( startDate ) focusedMonth =  moment(startDate, format).startOf('month')

    this.state = {
      currentDate,
      focusedMonth,
    }
  }

  render() {
    const { label } = this.props
    const previousMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(-1, 'M') });
    };

    const nextMonth = () => {
      this.setState({ focusedMonth: this.state.focusedMonth.add(1, 'M') });
    };

    Previous = () => typeof label.previous !== 'string' ? label.previous : <Text>{label.previous}</Text>
    Next = () => typeof label.next !== 'string' ? label.next : <Text>{label.next}</Text>

    return (
      <View style={styles.calendar}>
        <View style={styles.heading}>
          <TouchableOpacity onPress={previousMonth}>
            <Previous />
          </TouchableOpacity>
          <Text style={this.props.textColor ? { color: this.props.textColor } : null}>
            {this.state.focusedMonth.format('MMMM YYYY').charAt(0).toUpperCase() + this.state.focusedMonth.format('MMMM YYYY').substr(1)}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Next />
          </TouchableOpacity>
        </View>
        <Month
          currentDate={this.state.currentDate}
          focusedMonth={this.state.focusedMonth}
          {...this.props}
        />
      </View>
    );
  }
}
