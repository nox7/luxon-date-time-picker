import * as luxon from "luxon";
import { Calendar } from "./Components/Calendar/Calendar";
import { ModalBackdrop } from "./Components/ModalBackdrop";
import { BeforeConfirmedEvent } from "./Events/BeforeConfirmedEvent";
import { BeforeDateNextEvent } from "./Events/BeforeDateNextEvent";
import { DateTimePickerWidget } from "./DateTimePickerWidget";
import { TimePicker } from "./Components/TimePicker/TimePicker";

type BeforeConfirmedCallback = ((e: BeforeConfirmedEvent) => void);
type BeforeDateNextCallback = ((e: BeforeDateNextEvent) => void);
type DateNextCallback = (() => void);
type ConfirmedCallback = (() => void);

export class DateTimePickerComponent{
    private Backdrop: ModalBackdrop;
    private DatePickerEnabled: boolean = false;
    private TimePickerEnabled: boolean = false;
    private Calendar: Calendar;
    private TimePicker: any;
    /**
     * The current DateTime represented by the user's selection in the Calendar and or Time pickers.
     */
    private CurrentDateTime: luxon.DateTime = luxon.DateTime.now();
    /**
     * The order of the weekdays to display in the calendar. Can be overriden when using WithDatePicker()
     */
    private WeekdayIndices: number[] = [1,2,3,4,5,6,7];
    /**
     * The interval of hours to allow the user to select
     */
    private HourInterval: number = 1;
    /**
     * The interval of minutes to allow the user to select. This will always start from the 0th minute of the hour.
     */
    private MinuteInterval: number = 1;
    private OnBeforeConfirmedCallbacks: BeforeConfirmedCallback[] = [];
    private OnBeforeDateNextCallbacks: BeforeDateNextCallback[] = [];
    private OnDateNextCallbacks: DateNextCallback[] = [];
    private OnConfirmedCallbacks: ConfirmedCallback[] = [];

    public constructor(){
        this.Backdrop = new ModalBackdrop();
        this.Backdrop.OnClicked(e => {
            this.OnBackdropClicked(e);
        });
    }

    /**
     * Registers an event to be called before the entire component's luxon.DateTime is confirmed and set by
     * interacting with either the Calendar or Time picker components.
     * @param callback 
     * @returns 
     */
    public OnBeforeConfirmed(callback: BeforeConfirmedCallback): this{
        this.OnBeforeConfirmedCallbacks.push(callback);
        return this;
    }

    public FireBeforeConfirmed(e: BeforeConfirmedEvent): this{
        for (const callback of this.OnBeforeConfirmedCallbacks){
            callback(e);
        }
        return this;
    }

    /**
     * Registers an event to be called after the entire component's luxon.DateTime is confirmed and set by
     * interacting with either the Calendar or Time picker components.
     * @param callback 
     * @returns 
     */
    public OnConfirmed(callback: ConfirmedCallback): this{
        this.OnConfirmedCallbacks.push(callback);
        return this;
    }

    public FireConfirmed(): this{
        for (const callback of this.OnConfirmedCallbacks){
            callback();
        }
        return this;
    }

    /**
     * Registers an event to be called before the Date picker's next button is clicked. This event can only be fired
     * if both the Date and the Time pickers are enabled and thus a Next button exists on the calendar instead
     * of a Confirm button.
     * @param callback 
     * @returns 
     */
    public OnBeforeDateNext(callback: BeforeDateNextCallback): this{
        this.OnBeforeDateNextCallbacks.push(callback);
        return this;
    }

    public FireBeforeDateNext(e: BeforeDateNextEvent): this{
        for (const callback of this.OnBeforeDateNextCallbacks){
            callback(e);
        }
        return this;
    }

    /**
     * Registers an event to be called after the Date picker's next button is clicked. This event can only be fired
     * if both the Date and the Time pickers are enabled and thus a Next button exists on the calendar instead
     * of a Confirm button.
     * @param callback 
     * @returns 
     */
    public OnDateNext(callback: DateNextCallback): this{
        this.OnDateNextCallbacks.push(callback);
        return this;
    }

    public FireDateNext(): this{
        for (const callback of this.OnDateNextCallbacks){
            callback();
        }
        return this;
    }

    /**
     * Hides all components
     */
    public HideAll(): void{
        this.Backdrop.Hide();
        if (this.Calendar !== undefined){
            this.Calendar.Hide();
        }

        if (this.TimePicker !== undefined){
            this.TimePicker.Hide();
        }
    }

    /**
     * Gets the instance of the backdrop used for this modal
     * @returns 
     */
    public GetBackdrop(): ModalBackdrop{
        return this.Backdrop
    }

    /**
     * Gets the current luxon.DateTime that this component is representing. It is modified
     * by the user using this component's controls in either the calendar date picker or the time picker.
     * @returns 
     */
    public GetCurrentDateTime(): luxon.DateTime{
        return this.CurrentDateTime;
    }

    /**
     * Sets the current month, day, and year of the CurrentDateTime of this component.
     * @returns 
     */
    public SetCurrentDate(month: number, day: number, year: number): this{
        this.CurrentDateTime = this.CurrentDateTime.set({
            month: month,
            day: day,
            year: year
        });
        return this;
    }

    /**
     * Sets the current month, day, and year of the CurrentDateTime of this component.
     * @returns 
     */
    public SetCurrentTime(hour: number, minute: number, second: number): this{
        this.CurrentDateTime = this.CurrentDateTime.set({
            hour: hour,
            minute: minute,
            second: second,
        });
        return this;
    }

    /**
     * Returns the indices in the order defined for rendering on the calendar
     */
    public GetWeekdayIndices(): number[]{
        return this.WeekdayIndices;
    }

    /**
     * Returns the interval at which hours can be stepped through on the UI
     * @returns 
     */
    public GetHourInterval(): number{
        return this.HourInterval;
    }

    /**
     * Returns the interval at which minutes can be stepped through on the UI
     * @returns 
     */
    public GetMinuteInterval(): number{
        return this.MinuteInterval;
    }

    /**
     * Sets the component to build with a date picker. Optionally, you can provide an array of weekday indices to define
     * how the week days will be displayed in the calendar. For example, providing [1,2,3,4,5,6,7] will start the weeks in the
     * calendar from Monday. If they need to start from Sunday, then provide [7,1,2,3,4,5,6]
     * @returns 
     */
    public WithDatePicker(weekdayIndices: number[] | undefined = undefined): this{
        if (weekdayIndices !== undefined){
            if (weekdayIndices.length !== 7){
                throw "Cannot provide weekdayIndices that doesn't have an array length of 7";
            }

            // TODO, check that only numbers 1-7 are provided and are all unique
            this.WeekdayIndices = weekdayIndices;
        }

        this.DatePickerEnabled = true;

        return this;
    }

    /**
     * Sets the component to build with the time picker.
     * @returns 
     */
    public WithTimePicker(hourInterval: number | undefined = undefined, minuteInterval: number | undefined = undefined): this{
        this.TimePickerEnabled = true;

        if (hourInterval !== undefined){
            this.HourInterval = hourInterval;
        }

        if (minuteInterval !== undefined){
            this.MinuteInterval = minuteInterval;
        }

        return this;
    }

    public GetDatePickerEnabled(): boolean{
        return this.DatePickerEnabled;
    }

    public GetTimePickerEnabled(): boolean{
        return this.TimePickerEnabled;
    }

    /**
     * Build the component's HTML elements
     * @returns 
     */
    public Build(): this{
        if (this.DatePickerEnabled){
            this.Calendar = new Calendar(this)
                .SetCurrentDateTime(this.CurrentDateTime)
                .Build()
                .RenderInto(document.body);
        }

        if (this.TimePickerEnabled){
            this.TimePicker = new TimePicker(this)
                .SetCurrentDateTime(this.CurrentDateTime)
                .Build()
                .RenderInto(document.body);
        }
        return this;
    }

    /**
     * When the component's backdrop is clicked on.
     * @param e 
     * @returns 
     */
    private OnBackdropClicked(e: MouseEvent): this{
        this.HideAll();
        return this;
    }

    /**
     * Called by the internal widgets. This is called when the user confirms their final choice in
     * the widgets. From whichever is enabled (or both) it will fetch the date from the calendar widget
     * and the time from the time picker widget.
     */
    public ConfirmSelection(): void{
        if (this.GetDatePickerEnabled()){
            const dateTimeFromCalendar = this.Calendar.GetCurrentDateTime();
            this.SetCurrentDate(dateTimeFromCalendar.month, dateTimeFromCalendar.day, dateTimeFromCalendar.year);
        }

        if (this.GetTimePickerEnabled()){
            const dateTimeFromTimePicker = this.TimePicker.GetCurrentDateTime();
            this.SetCurrentTime(dateTimeFromTimePicker.hour, dateTimeFromTimePicker.minute, dateTimeFromTimePicker.second);
        }

        this.FireConfirmed();
    }

    /**
     * If no argument is provided, shows the logical first picker. If both the date and time pickers are enabled,
     * this will be the date picker. If only the time picker is enabled, it will be the time picker. If only the date picker
     * is enabled, then the date picker.
     * 
     * If an argument is provided, then it attempts to show the provided picker widget requested - if it is enabled.
     * @returns 
     */
    public Show(widgetEnum: DateTimePickerWidget | undefined = undefined): this{
        if (widgetEnum === DateTimePickerWidget.DATE_PICKER && !this.GetDatePickerEnabled()){
            throw "Cannot show the date picker widget - it is not enabled.";
        }

        if (widgetEnum === DateTimePickerWidget.TIME_PICKER && !this.GetTimePickerEnabled()){
            throw "Cannot show the time picker widget - it is not enabled.";
        }

        // Show the modal backdrop regardless of which widget will be shown
        this.Backdrop.Show();

        if (widgetEnum === undefined){
            if (this.GetDatePickerEnabled()){
                this.Calendar.Show();
            }else if (this.GetTimePickerEnabled()){
                this.TimePicker.Show();
            }else{
                throw "No widgets are enabled. Cannot show either. You must enable one or both before building this DateTimePickerComponent class.";
            }
        }else{
            if (widgetEnum === DateTimePickerWidget.DATE_PICKER){
                this.Calendar.Show();
            }else if (widgetEnum === DateTimePickerWidget.TIME_PICKER){
                this.TimePicker.Show();
            }else{
                throw "Unknown widget enum provided.";
            }
        }

        return this;
    }
}