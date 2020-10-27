export class Utils {
  static getDateDiff(startDate: Date, endDate: Date): string {
    const totalDiffSeconds =
      (new Date(endDate).valueOf() - new Date(startDate).valueOf()) / 1000;

    const diffHours = Math.floor(totalDiffSeconds / 3600);
    let remainingSeconds = totalDiffSeconds - diffHours * 3600;

    const diffMinutes = Math.floor(remainingSeconds / 60);
    remainingSeconds = remainingSeconds - (diffMinutes * 60);

    return this.getDiffText(remainingSeconds, diffMinutes, diffHours);
  }

  private static getDiffText(
    seconds: number,
    minutes: number,
    hours: number): string {
    const secondsText = Number(seconds).toFixed(2);
    if (minutes === 0 && hours === 0) {
      return secondsText + ' seconds';
    } else if (hours === 0) {
      return minutes + ' minutes and ' + secondsText + ' seconds';
    } else {
      return hours + ' hours and ' + minutes + ' minutes and ' + secondsText + ' seconds';
    }
  }
}
