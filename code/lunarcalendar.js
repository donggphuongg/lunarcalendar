class SolarDate {
    constructor(_day, _month, _year) {
        this.Hour = 0; this.Minute = 0; this.Second = 0;
        var sd = parseInt(_day); var sm = parseInt(_month); var sy = parseInt(_year);
        if(!isNaN(sd) && !isNaN(sm) && !isNaN(sy)) {
            this.Year = (sy < 0) ? 0 : ((sy > 3000) ? 3000 : sy);
            this.Month = (sm < 1) ? 1 : ((sm > 12) ? 12 : sm);
            if(sd < 1) this.Day = 1;
            else if(sd > endMonth(this.Month, this.Year)) this.Day = endMonth(this.Month, this.Year);
            else this.Day = sd;
        }
    }
    dayOfWeek() {
        return this.getJulianDate() % 7;
    }
    dayOfYear() {
        var fDate = new SolarDate(1, 1, this.Year);
        var jFst = fDate.getJulianDate();
        return this.getJulianDate() - jFst;
    }
    sunLongitude(timeZone) {
        var tRes = sunLongitude(this.getJulian(timeZone), timeZone) + ((19 / 24) * (360 / 365.25));
        if(tRes > 360) tRes -= 360;
        return tRes;
    }
    solarTerm(timeZone) {
        var cTerm = Math.floor(this.sunLongitude(timeZone) / 15);
        var nTerm = (cTerm + 1 > 23)?0:(cTerm + 1);
        if(nTerm!=0) {
            var nSunLog = nTerm * 15;
            var nJul = this.getJulian(timeZone) + 2;
            var nDate = fromJulian(nJul);
            var nDateSunLog = nDate.sunLongitude(timeZone);
            if(nDateSunLog > nSunLog) return nTerm;
            else return cTerm;
        }
        else {
            var nJul = this.getJulian(timeZone) + 2;
            var nDateSunLog = fromJulian(nJul).sunLongitude(timeZone);
            if(nDateSunLog >=0 && nDateSunLog <=15) return 0;
            else return cTerm;
        }
        return 0;
    }
    weekOfMonth() {
        var fMonth = new SolarDate(1, this.Month, this.Year);
        var mWeek = Math.floor(fMonth.getJulianDate() / 7);
        var tWeek = Math.floor(this.getJulianDate() / 7);
        return tWeek - mWeek;
    }
    weekOfYear() {
        var fYear = new SolarDate(1, 1, this.Year);
        var yWeek = Math.floor(fYear.getJulianDate() / 7);
        var tWeek = Math.floor(this.getJulianDate() / 7);
        return tWeek - yWeek;
    }
    getJulian(timeZone) {
        return julianNumber(timeZone, this.Hour, this.Minute, this.Day, this.Month, this.Year);
    }
    getJulianDate() {
        return toJulian(this.Day, this.Month, this.Year);
    }
    getLunarDate(timeZone) {
        return new LunarDate(this,timeZone);
    }
    setFromDate(_date) {
        if(_date instanceof Date) {
            this.Year = _date.getFullYear();
            this.Month = _date.getMonth() + 1;
            this.Day = _date.getDate();
            this.Hour = _date.getHours();
            this.Minute = _date.getMinutes();
            this.Second = _date.getSeconds();
        }
    }
    toString() {
        return this.Day + '/' + this.Month + '/' + this.Year;
    }
}
class LunarDate {
    constructor(_solardate, _timeZone) {
        this.Day = 25; this.Month = 11; this.Year = 1999; this.Leap = false;
        if(isNaN(_timeZone)) this.TimeZone = 7;
        else {
            this.TimeZone = (_timeZone<-12)?-12:((_timeZone>14)?14:_timeZone);
            if(_solardate instanceof SolarDate) {
                var arrDate = solarToLunar(_solardate.Day, _solardate.Month, _solardate.Year, this.TimeZone);
                this.Day = arrDate[0];
                this.Month = arrDate[1];
                this.Year = arrDate[2];
                this.Leap = (arrDate[3]==0)?false:true;
            }
        }
    }
    toString(leapStr) {
        var lStr = (this.Leap == 0)?'':('('+ leapStr + ')');
        return this.Day + '/' + this.Month + lStr + '/' + this.Year;
    }
}
const endMonth = (_month, _year) => {
    if(_month == 2) {
        if(_year % 4 == 0) return 29;
        else return 28;
    }
    else {
        if(_month==1 || _month==3 || _month==5 || _month==7 || _month==8 || _month==10 || _month==12) return 31;
        else if(_month==4 || _month==6 || _month==9 || _month==11) return 30;
        else return NaN;
    }
}
const julianNumber = (timeZone, _hour, _minute, _day, _month, _year) => {
    var jdInt = toJulian(_day, _month, _year);
    var jdDiv = (_hour - 12 - timeZone) / 24.0 + _minute / 1440.0;
    return (jdInt + jdDiv);
}
const toJulian = (_day, _month, _year) => {
    var a, y, m, jd;
    a = Math.floor((14 - _month) / 12.0);
    y = _year + 4800 - a;
    m = _month + 12 * a - 3;
    jd = _day + Math.floor((153 * m + 2) / 5.0) + 365 * y + Math.floor(y / 4.0) - 
            Math.floor(y / 100.0) + Math.floor(y / 400.0) - 32045;
    if (jd < 2299161){
        jd = _day + Math.floor((153 * m + 2) / 5.0) + 365 * y + Math.floor(y / 4.0) - 32083;
    }
    return jd;
}
const fromJulian = _julian => {
    var a, b, c, d, e, m, day, month, year;
    if (_julian > 2299160){
        a = _julian + 32044;
        b = Math.floor((4 * a + 3) / 146097);
        c = a - Math.floor((b * 146097) / 4);
    }
    else{
        b = 0;
        c = _julian + 32082;
    }
    d = Math.floor((4 * c + 3) / 1461);
    e = c - Math.floor((1461 * d) / 4);
    m = Math.floor((5 * e + 2) / 153);
    day = e - Math.floor((153 * m + 2) / 5) + 1;
    month = m + 3 - 12 * Math.floor(m / 10);
    year = b * 100 + d - 4800 + Math.floor(m / 10);
    return new SolarDate(day,month,year);
}
const newMoon = (k, timeZone) => {
    var T, T2, T3, dr, Jd1, M, Mpr, F, C1, deltat, JdNew;
    var PI = Math.PI;
    T = k/1236.85; // Time in Julian centuries from 1900 January 0.5
    T2 = T * T;
    T3 = T2 * T;
    dr = PI/180.0;
    Jd1 = 2415020.75933 + 29.53058868*k + 0.0001178*T2 - 0.000000155*T3;
    Jd1 = Jd1 + 0.00033*Math.sin((166.56 + 132.87*T - 0.009173*T2)*dr); // Mean new moon
    M = 359.2242 + 29.10535608*k - 0.0000333*T2 - 0.00000347*T3; // Sun's mean anomaly
    Mpr = 306.0253 + 385.81691806*k + 0.0107306*T2 + 0.00001236*T3; // Moon's mean anomaly
    F = 21.2964 + 390.67050646*k - 0.0016528*T2 - 0.00000239*T3; // Moon's argument of latitude
    C1=(0.1734 - 0.000393*T)*Math.sin(M*dr) + 0.0021*Math.sin(2*dr*M);
    C1 = C1 - 0.4068*Math.sin(Mpr*dr) + 0.0161*Math.sin(dr*2*Mpr);
    C1 = C1 - 0.0004*Math.sin(dr*3*Mpr);
    C1 = C1 + 0.0104*Math.sin(dr*2*F) - 0.0051*Math.sin(dr*(M+Mpr));
    C1 = C1 - 0.0074*Math.sin(dr*(M-Mpr)) + 0.0004*Math.sin(dr*(2*F+M));
    C1 = C1 - 0.0004*Math.sin(dr*(2*F-M)) - 0.0006*Math.sin(dr*(2*F+Mpr));
    C1 = C1 + 0.0010*Math.sin(dr*(2*F-Mpr)) + 0.0005*Math.sin(dr*(2*Mpr+M));
    if (T < -11){
        deltat= 0.001 + 0.000839*T + 0.0002261*T2 - 0.00000845*T3 - 0.000000081*T*T3;
    } 
    else{
        deltat= -0.000278 + 0.000265*T + 0.000262*T2;
    }
    JdNew = Jd1 + C1 - deltat;
    return Math.floor(JdNew + 0.5 + timeZone/24.0);
}
const sunLongitude = (_julian, timeZone) => {
    var T, T2, dr, M, L0, DL, L;
    var PI = Math.PI;
    T = (_julian - 2451545.5 - timeZone / 24) / 36525.0; // Time in Julian centuries from 2000-01-01 12:00:00 GMT
    T2 = T*T;
    dr = PI/180; // degree to radian
    M = 357.52910 + 35999.05030*T - 0.0001559*T2 - 0.00000048*T*T2; // mean anomaly, degree
    L0 = 280.46645 + 36000.76983*T + 0.0003032*T2; // mean longitude, degree
    DL = (1.914600 - 0.004817*T - 0.000014*T2)*Math.sin(dr*M);
    DL = DL + (0.019993 - 0.000101*T)*Math.sin(dr*2*M) + 0.000290*Math.sin(dr*3*M);
    L = L0 + DL; // true longitude, degree
    L = L*dr;
    L = L - PI*2*(Math.floor(L/(PI*2))); // Normalize to (0, 2*PI)
    return (L * 180.0 / PI);
}
const solarTerm = (_julian, timeZone) => {
    return Math.floor(sunLongitude(_julian, timeZone) / 30);
}
const preWinterSolstice = (_year, timeZone) => {
    var k, off, nm, sunLong;
    off = toJulian(31, 12, _year) - 2415021;
    k = Math.floor(off / 29.530588853);
    nm = newMoon(k, timeZone);
    sunLong = solarTerm(nm, timeZone); // sun longitude at local midnight
    if (sunLong >= 9) {
        nm = newMoon(k-1, timeZone);
    }
    return nm;
}
const leapMonthOffset = (a11, timeZone) => {
    var k, last, arc, i;
    k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    last = 0;
    i = 1; // We start with the month following lunar month 11
    arc = solarTerm(newMoon(k+i, timeZone), timeZone);
    do {
        last = arc;
        i++;
        arc = solarTerm(newMoon(k+i, timeZone), timeZone);
    } while (arc != last && i < 14);
    return i-1;
}
const solarToLunar = (_day, _month, _year, timeZone) => {
    var k, dayNumber, monthStart, a11, b11, lunarDay, lunarMonth, lunarYear, lunarLeap;
    dayNumber = toJulian(_day, _month, _year);
    k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    monthStart = newMoon(k+1, timeZone);
    if (monthStart > dayNumber) {
        monthStart = newMoon(k, timeZone);
    }
    a11 = preWinterSolstice(_year, timeZone);
    b11 = a11;
    if (a11 >= monthStart) {
        lunarYear = _year;
        a11 = preWinterSolstice(_year-1, timeZone);
    } else {
        lunarYear = _year+1;
        b11 = preWinterSolstice(_year+1, timeZone);
    }
    lunarDay = dayNumber-monthStart+1;
    diff = Math.floor((monthStart - a11)/29.0);
    lunarLeap = 0;
    lunarMonth = diff+11;
    if (b11 - a11 > 365) {
        leapMonthDiff = leapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff == leapMonthDiff) {
                lunarLeap = 1;
            }
        }
    }
    if (lunarMonth > 12) {
        lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }
    return new Array(lunarDay,lunarMonth,lunarYear,lunarLeap);
}
