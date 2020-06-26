import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Moment from 'moment';
import _ from 'lodash';
import { Dropdown } from 'react-native-material-dropdown';
import 'moment/locale/fr'; 
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment)

moment.locale("fr")

const styles = StyleSheet.create({
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
  },
  piker: {
    height: 25,
    width: 100,
    flex: 0,
    fontSize: 12,
    zIndex: 2,
    padding: 0,
    ...Platform.select({
      web: {
        // outline: 'none',
        lineHeight: 25,
      },
    }),
  },
  monthPiker: {
    textAlign: 'right',
  }
});

const dates = (startDate, endDate, focusedInput: 'startDate' | 'endDate') => {
  if (focusedInput === 'startDate') {
    if (startDate && endDate) {
      return ({ startDate, endDate, focusedInput: 'endDate' });
    }
    return ({ startDate, endDate, focusedInput: 'endDate' });
  }

  if (focusedInput === 'endDate') {
    if (endDate && startDate && endDate.isBefore(startDate)) {
      return ({ startDate: endDate, endDate, focusedInput: 'endDate' });
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
    focusedMonth,
  } = props;

  const days = [];
  const endOfWeek = startOfWeek.clone().endOf('isoweek');

  Array.from(moment.range(startOfWeek, endOfWeek).by('days')).map((day) => {
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
    const isCurrentMonth = !focusedMonth.isSame(day, 'month')

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
          isCurrentMonth ? { backgroundColor: 'transparent' } : null,
        ]}
        onPress={onPress}
        disabled={isBlocked && !onDisableClicked}
      >
        <Text
          style={[
            styleText,
            textColor ? { color: textColor } : null,
            isCurrentMonth ? { opacity: 0.5 } : null,
          ]}
        >
          {day.date()}
        </Text>
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

  Array.from(weekRange.by('days')).map((day) => {
    dayNames.push(
      <Text key={day.date()} style={[styles.dayName, textColor ? { color: textColor } : null]}>
        {day.format('ddd')}
      </Text>
    );
  });

  Array.from(moment.range(startOfMonth, endOfMonth).by('weeks')).map((week) => {
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

  renderMonthYear = () => {
    const months = _.map(moment.months(), (month, index) => ({
      id: index,
      value: month,
      label: month.charAt(0).toUpperCase() + month.substr(1),
    }))
    
    const years = () => {
      const years = []
      const dateStart = moment().subtract(100, 'y')
      const dateEnd = moment().add(100, 'y')
      let i = 0
      while (dateEnd.diff(dateStart, 'years') >= 0) {
        years.push({
          id: i,
          label: dateStart.format('YYYY'),
          value: dateStart.format('YYYY'),
        })
        i += 1
        dateStart.add(1, 'year')
      }
      return years
    }

    changeMonth = (month) => {
      const { focusedMonth } = this.state
      const day = focusedMonth.format('DD')
      const year = focusedMonth.format('YYYY')
      const i = (_.findIndex(months, ['value', month]) + 1).toString()
      const currentMonth = i.length === 1 ? `0${i}` : i
      this.setState({ focusedMonth: moment(`${day}${currentMonth}${year}`, 'DDMMYYYY') })
    }

    changeYear = (year) => {
      const { focusedMonth } = this.state
      const day = focusedMonth.format('DD')
      const month = focusedMonth.format('MM')
      this.setState({ focusedMonth: moment(`${day}${month}${year}`, 'DDMMYYYY')})
    }
 
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ paddingHorizontal: 5, flexGrow: 1 }}>
          <Dropdown
            value={this.state.focusedMonth.format('MMMM')}
            data={months}
            lineWidth={0}
            fontSize={12}
            onChangeText={changeMonth}
            inputStyle={[
              styles.piker,
              styles.monthPiker,
              {
                color: this.props.textColor,
                ...Platform.select({
                  web: {
                    lineHeight: 25,
                  },
                })
              },
            ]}
            itemTextStyle={{ color: `${this.props.textColor}80` }}
            pickerStyle={{
              backgroundColor: this.props.backgroundColor,
              borderColor: this.props.borderColor,
              borderWidth: 1,
            }}
            itemColor={this.props.textColor}
            dropdownOffset={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        </View>
        <View style={{ paddingHorizontal: 5, flexGrow: 1 }}>
          <Dropdown
            value={this.state.focusedMonth.format('YYYY')}
            data={years()}
            fontSize={12}
            lineWidth={0}
            onChangeText={changeYear}
            inputStyle={[
              styles.piker,
              {
                color: this.props.textColor,
                ...Platform.select({
                  web: {
                    lineHeight: 25,
                  },
                })
              },
            ]}
            itemTextStyle={{ color: `${this.props.textColor}80` }}
            pickerStyle={{
              backgroundColor: this.props.backgroundColor,
              borderColor: this.props.borderColor,
              borderWidth: 1,
            }}
            itemColor={this.props.textColor }
            dropdownOffset={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        </View>
      </View>
    )
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
          <View style={this.props.textColor ? { color: this.props.textColor } : null}>
            {this.renderMonthYear()}
          </View>
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
