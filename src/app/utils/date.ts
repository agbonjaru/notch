import { Injectable } from "@angular/core";

// @Injectable({
//     providedIn: "root"
// })
export default class DateUtils {
  formatDate(date: string) {
    const d = date.split(" ");
    return `${d[1]} ${d[2]}, ${d[d.length - 1]}`;
  }
  getTimeStp(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  getEndTimeStp(date) {
    const d = new Date(date);
    d.setHours(23, 59);
    return d.getTime();
  }
  getResetDatesTime(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toJSON();
  }
  getCurrentTs() {
    return new Date().getTime();
  }
  getPrvMntTs() {
    return new Date().setMonth(new Date().getMonth() - 6).valueOf();
  }
  getInitDate(): { startDate: any; endDate: any } {
    return { startDate: this.getPrvMntTs(), endDate: this.getCurrentTs() };
  }
  getNxtMntTs() {
    return new Date().setMonth(new Date().getMonth() + 1).valueOf();
  }
  getNxtDayTs(date) {
    return new Date(date).setDate(new Date(date).getDate() + 1).valueOf();
  }
  getNxtDay() {
    return new Date(new Date().setDate(new Date().getDate() + 1))
  }
  getDateFilter(dateFilter: { endDate: any; startDate: any }) {
    let newFilter = {
      endDate:
        dateFilter && dateFilter.endDate
          ? this.getEndTimeStp(dateFilter.endDate)
          : this.getCurrentTs(),
      startDate:
        dateFilter && dateFilter.startDate
          ? this.getTimeStp(dateFilter.startDate)
          : this.getPrvMntTs(),
    };
    if (newFilter.endDate === newFilter.startDate) {
      newFilter.endDate = this.getNxtDayTs(newFilter.endDate);
    }
    return newFilter;
  }

  padFigure(num) {
    return num.toString().length == 1 ? `0${num}` : num;
  }

  checkIfDateIsInTimeStampFormat(input_date: string): boolean {
    const input_date_as_number: any = Number(input_date);
    return !isNaN(input_date_as_number);
  }

  convertDateToTimestamp(date: string) {
    if (this.checkIfDateIsInTimeStampFormat(date)) {
      return date;
    }

    return typeof date == "string" && date.length > 0
      ? Date.parse(date).toString()
      : "";
  }

  convertTimestampToDate(seconds) {
    const date = new Date(Number(seconds));
    let month = this.padFigure(date.getMonth() + 1),
      day = this.padFigure(date.getDate()),
      year = date.getFullYear();

    return seconds == 0 ? "" : `${year}-${month}-${day}`;
  }

  getMaximumDateForHTMLDateInput(timestamp?) {
    const milli_seconds = timestamp || Date.now();
    return this.convertTimestampToDate(milli_seconds);
  }

  getCurrentDateTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  getCurrentDayInSeconds() {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = this.padFigure(date.getMonth() + 1);
    const day = this.padFigure(date.getDate());

    return Date.parse(`${year}-${month}-${day}`);
  }

  convertDateStringToTimestamp(date_string) {
    const d = new Date(date_string);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const formatted_date = `${year}-${month}-${day}`;
    return Date.parse(formatted_date)
  }

}
