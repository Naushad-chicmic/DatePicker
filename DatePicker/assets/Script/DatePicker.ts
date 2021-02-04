// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import array = cc.js.array;
import CalenderItem from "./CalenderItem";

const {ccclass, property} = cc._decorator;
let DatePickerNameTag   = {
    NAVIGATION_BAR_TAG  :   "navigationBar"
}


interface IDateProps {
    day     :   number,
    month   :   number,
    year    :   number
};

enum CalenderMode {
    Date, Month, Year
}
class DateProps implements IDateProps {
    day     :   number;
    month   :   number;
    year    :   number;
    constructor(day : number, month : number, year : number) {
        this.day     =   day;
        this.month   =   month;
        this.year    =   year;
    }
};

@ccclass
export default class DatePicker extends cc.Component {
    readonly oneDay     :   number      =   60 * 60 * 24 * 1000;
    readonly  date      :   Date        =   new Date();
    readonly daysMap                    =   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    readonly monthMap                   =   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    private  _calMode : CalenderMode =  CalenderMode.Date;

    currentSelectedDate :   Date        =   null;
    tempDate            :   Date        =   null;

    @property(cc.Prefab)
    calenderBar         :   cc.Prefab   =   null;

    @property(cc.Prefab)
    calenderItem        :   cc.Prefab   =   null;

    @property(cc.Node)
    calenderBase        :   cc.Node     =   null;


    @property(cc.Prefab)
    calenderNavigationBar    :   cc.Prefab   =   null;
    

    onLoad () {
        this.currentSelectedDate = new Date();
        // this.setupMonthView(new Date());
        this.setupSelectedMonthCalender(new Date());
        //Sunday Monday Title
    }


    /********************** YEAR VIEW ****************************/
    setupYearView(dateString) {
        this._calMode = CalenderMode.Year;
        this.tempDate    =   new Date(dateString);
        this.calenderBase.removeAllChildren(true);
        this.setupCalenderNavigationBar();
    
    }

    /********************** MONTH VIEW ****************************/
    setupMonthView(dateString) {
        this._calMode = CalenderMode.Month;
        this.tempDate    =   new Date(dateString);
        this.calenderBase.removeAllChildren(true);
        this.setupEmptyBar();
        this.setupCalenderNavigationBar();
        this.setupMonthData();
    }

    setupMonthData()
    {
        var day     =   this.getDateSplit().day;
        var month   =   this.getDateSplit().month;
        var year    =   this.getDateSplit().year;

        var calenderBar =   cc.instantiate(this.calenderBar)
        this.calenderBase.addChild(calenderBar);

        for (var monthCounter = 0; monthCounter < this.monthMap.length; monthCounter++) {
            var calenderItem    =   cc.instantiate(this.calenderItem);
            calenderBar.addChild(calenderItem);

            var calenderItemProperties  =   {
                text            :   this.monthMap[monthCounter],
                selectionStatus :   month == monthCounter ? true : false,
                itemOpacity     :   255,
                date            :   new Date()
            }
            calenderItem.getComponent("CalenderItem").initialiseItemWithValue(calenderItemProperties);
            calenderItem.on(cc.Node.EventType.TOUCH_START, this.updateCalenderWithSelectedDate, this);

            if ((monthCounter+1) % 4 == 0 && monthCounter != 0) {
                calenderBar =   cc.instantiate(this.calenderBar)
                this.calenderBase.addChild(calenderBar);
            }
        }
    }

    /*********************** Calender View ************************/
    setupSelectedMonthCalender(dateString) {
        this._calMode = CalenderMode.Date;
        this.tempDate    =   new Date(dateString);
        this.calenderBase.removeAllChildren(true);
        this.setupEmptyBar();
        this.setupCalenderNavigationBar();
        this.setupEmptyBar();
        this.setupDaysTitleBar();
        this.setupDaysData();
        this.setupEmptyBar();
    }

    setupEmptyBar() {
        var emptyBar =   cc.instantiate(this.calenderBar)
        this.calenderBase.addChild(emptyBar);
    }

    setupCalenderNavigationBar() {
        var navigationBar   =   cc.instantiate(this.calenderNavigationBar);
        navigationBar.getChildByName('CurrentDate').on('click', this.navTabCb, this);
        navigationBar.name  =   DatePickerNameTag.NAVIGATION_BAR_TAG;
        this.calenderBase.addChild(navigationBar);
        this.updateCalenderNavigationBarDate();
    }

    updateCalenderNavigationBarDate() {
        var day     =   this.getDateSplit().day;
        var month   =   this.getDateSplit().month;
        var year    =   this.getDateSplit().year;

        var navigationBar                       =   this.calenderBase.getChildByName(DatePickerNameTag.NAVIGATION_BAR_TAG);
        var currentDateViewNode                 =   navigationBar.getChildByName("CurrentDate");
        var dateTitle                           =   currentDateViewNode.getChildByName("dateTitle");
        dateTitle.getComponent(cc.Label).string =   this.monthMap[month] + " " +year;

        var leftNavigationButton                =   navigationBar.getChildByName("LeftNavigation");
        var rightNavigationButton               =   navigationBar.getChildByName("RightNavigation");

        leftNavigationButton.on(cc.Node.EventType.TOUCH_START, this.decrementDate, this);
        rightNavigationButton.on(cc.Node.EventType.TOUCH_START, this.incrementDate, this)
    }

    setupDaysData() {
        var day     =   this.getDateSplit().day;
        var month   =   this.getDateSplit().month;
        var year    =   this.getDateSplit().year;

        var monthArray  =   this.getMonthDetails(year, month);
        for (var counter = 0; counter <6; counter++) {
            var calenderBar =   cc.instantiate(this.calenderBar)
            this.calenderBase.addChild(calenderBar);

            for (var childrenCounter = 0; childrenCounter < 7; childrenCounter++) {
                var tempDay     =   monthArray[counter * 7 + childrenCounter].date;
                var tempMonth   =   monthArray[counter * 7 + childrenCounter].month;

                var calenderItem    =   cc.instantiate(this.calenderItem);
                calenderBar.addChild(calenderItem);

                var status          =   false;
                var calculatedDate  =   this.getDate(monthArray[counter *7 + childrenCounter]);
                if(new Date().toDateString() == calculatedDate.toDateString() || calculatedDate.toDateString() == this.currentSelectedDate.toDateString()) {
                    status      =   true;
                }

                var itemOpacity =   tempMonth == 0 ? 255 : 100;
                var calenderItemProperties  =   {
                    text            :   ""+monthArray[counter *7 + childrenCounter].date.toString(),
                    selectionStatus :   status,
                    itemOpacity     :   itemOpacity,
                    date            :   this.getDate(monthArray[counter *7 + childrenCounter])
                }
                calenderItem.getComponent("CalenderItem").initialiseItemWithValue(calenderItemProperties);
                calenderItem.on(cc.Node.EventType.TOUCH_START, this.updateCalenderWithSelectedDate, this);
            }
        }
    }

    getDate({date, month}:{date:number, month:number}) : Date {
        let tempDate = new Date(this.tempDate);
        tempDate.setMonth(tempDate.getMonth() + month, date);
        return tempDate;
    }

    setupDaysTitleBar() {
        var calTitleBar     =   cc.instantiate(this.calenderBar);
        this.calenderBase.addChild(calTitleBar);
        for (var counter = 0; counter < this.daysMap.length; counter++) {
            var titleText   =   cc.instantiate(this.calenderItem);
            calTitleBar.addChild(titleText);
            var calenderItemProperties  =   {
                text            :   this.daysMap[counter],
                selectionStatus :   false,
                itemOpacity     :   100,
                date            :   new Date()
            }
            titleText.getComponent("CalenderItem").initialiseItemWithValue(calenderItemProperties);
        }
    }

    start () {

    }
    navTabCb (ref){
        console.log(this._calMode);
        switch(this._calMode){
            case CalenderMode.Date:
                this.setupMonthView(this.tempDate);
                break;
            case CalenderMode.Month:
                this.setupYearView(this.tempDate);
                break;
        }

    }
    decrementDate(){
        switch(this._calMode){
            case CalenderMode.Date:
                this.decrementMonthDate();
                this.setupSelectedMonthCalender(this.tempDate.toDateString());
                break;
            case CalenderMode.Month:
                this.decrementMonthDate(12);
                this.setupMonthView(this.tempDate.toDateString());
                break;
        }
    }
    incrementDate(){
        switch(this._calMode){
            case CalenderMode.Date:
                this.incrementMonthDate();
                this.setupSelectedMonthCalender(this.tempDate.toDateString());
                break;
            case CalenderMode.Month:
                this.incrementMonthDate(12);
                this.setupMonthView(this.tempDate.toDateString());
                break;
        }
    }

    /**
     * getNumberOfDays will return the number of days in month
     * The value 40 is taken as an example, you can take any value which is bigger than 31 and smaller than 60.
     * Again the reason why we took 31 is that it is the number of days any of the longest months will ever have.
     * note that your value should not be bigger than 59.
     * If it is bigger than 59 then there is a chance that we might skip next month and
     * we will be getting a date of the month after the next month.
     * @param year
     * @param month
     */
    getNumberOfDays(year, month) {
        return 40 - new Date(year, month, 40).getDate();
    }

    getMonthDetails(year, month) {
        let firstDay = (new Date(year, month)).getDay();
        let numberOfDays = this.getNumberOfDays(year, month);
        let monthArray = [];
        let rows = 6;
        let currentDay = null;
        let index = 0;
        let cols = 7;

        for(let row=0; row<rows; row++) {
            for(let col=0; col<cols; col++) {
                currentDay = this.getDayDetails(
                    index,
                    numberOfDays,
                    firstDay,
                    year,
                    month
                );
                monthArray.push(currentDay);
                index++;
            }
        }
        return monthArray;
    }

    getDayDetails(index, numberOfDays, firstDay, year, currentMonth) {
        let date = index- firstDay;
        let day = index % 7;
        let prevMonth = currentMonth - 1;
        let prevYear = year;
        if(prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }
        let prevMonthNumberOfDays = this.getNumberOfDays(prevYear, prevMonth);
        let _date = (date < 0 ? prevMonthNumberOfDays+date : date % numberOfDays) + 1;

        let month = date < 0 ? -1 : date >= numberOfDays ? 1 : 0;
        let timestamp = new Date(year, currentMonth, _date).getTime();

        return {
            date: _date,
            day,
            month,
            timestamp,
            dayString: this.daysMap[day]
        }
    }

    incrementMonthDate( month : number = 1) {
        this.tempDate.setMonth(this.tempDate.getMonth() + month, 1);
       // this.setupSelectedMonthCalender(this.tempDate.toDateString());
    }

    decrementMonthDate(month : number = 1) {
        this.tempDate.setMonth(this.tempDate.getMonth() - month, 1);
      //  this.setupSelectedMonthCalender(this.tempDate.toDateString());
    }

    getCurrentSelectedDay() {
        return this.currentSelectedDate;
    }

    updateCalenderWithSelectedDate(ref) {
        var calenderItem    : CalenderItem  =   ref.target;
        this.currentSelectedDate            =   new Date(calenderItem.getComponent("CalenderItem").currentDate);
        this.setupSelectedMonthCalender(this.currentSelectedDate.toDateString());
    }
    // update (dt) {}

    getDateSplit() : DateProps {
        let currDate    =   this.tempDate;
        return new DateProps(currDate.getDate(), currDate.getMonth(), currDate.getFullYear());
    }
}
