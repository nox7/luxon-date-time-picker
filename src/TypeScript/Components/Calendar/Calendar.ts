import * as luxon from "luxon";
import { DateTimePickerComponent } from "../../DateTimePickerComponent";
import { BaseComponent } from "./../BaseComponent";
import { DayButton } from "./DayButton";
import { BeforeConfirmedEvent } from "../../Events/BeforeConfirmedEvent";
import { MonthButton } from "./MonthButton";
import { YearButton } from "./YearButton";
import { DateTimePickerWidget } from "../../DateTimePickerWidget";

export class Calendar extends BaseComponent{
    private DateTimePicker: DateTimePickerComponent;
    /**
     * This is the current date time this calendar widget is working with and what the user has selected.
     * The DateTimePicker date time is only set when the user confirms the CurrentDateTime from this Calendar
     * component.
     */
    private CurrentDateTime: luxon.DateTime;
    private DayButtonComponents: DayButton[] = [];
    private MonthButtonComponents: MonthButton[] = [];
    private YearButtonComponents: YearButton[] = [];
    private CalendarControlsButtons: HTMLDivElement;
    private CancelButton: HTMLButtonElement;
    private BackButton: HTMLButtonElement;
    private ConfirmButton: HTMLButtonElement;
    private NextButton: HTMLButtonElement;
    private CalendarControlsContainer: HTMLDivElement;
    private MonthSelectorContainer: HTMLDivElement;
    private YearSelectorContainer: HTMLDivElement;
    private CurrentYearSelectionRowShift: number = 0;

    public constructor(dateTimePicker: DateTimePickerComponent){
        super();
        this.DateTimePicker = dateTimePicker;
    }

    public override Build(): this{
        const currentDateTime: luxon.DateTime = this.CurrentDateTime;
        const template = document.createElement("div");
        template.classList.add("date-time-picker-modal");
        template.classList.add("date-time-picker-calendar-component");
        template.innerHTML = `
            <div class="dialog">
                <div class="calendar-container">
                    <div class="calendar-controls-container">
                        <div class="month-year-controls-container">
                            <button type="button" class="prev-month-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                </svg>
                            </button>
                            <button type="button" class="select-month-button">${currentDateTime.toFormat("MMMM")}</button>
                            <button type="button" class="select-year-button">${currentDateTime.toFormat("yyyy")}</button>
                            <button type="button" class="next-month-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </button>
                        </div>
                        <div class="weekday-grid-container">
                            <div class="weekdays-titles"></div>
                            <div class="weekday-buttons"></div>
                        </div>
                    </div>
                    <div class="month-selection-container" style="display: none;">
                        <div class="month-buttons"></div>
                    </div>
                    <div class="year-selection-container" style="display: none;">
                        <div class="year-buttons"></div>
                    </div>
                    <div class="calendar-controls-buttons">
                        <button type="button" class="close-button">
                            <span>Cancel</span>
                        </button>
                        <button type="button" class="confirm-button">
                            <span>Confirm</span>
                        </button>
                        <button type="button" class="back-button" style="display: none;">
                            <span>Cancel</span>
                        </button>
                        <button type="button" class="next-button" style="display: none;">
                            <span>Next</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.Dom = template;
        this.CalendarControlsButtons = template.querySelector(".calendar-controls-buttons");
        this.CancelButton = template.querySelector(".close-button");
        this.ConfirmButton = template.querySelector(".confirm-button");
        this.BackButton = template.querySelector(".back-button");
        this.NextButton = template.querySelector(".next-button");
        this.CalendarControlsContainer = template.querySelector(".calendar-controls-container");
        this.MonthSelectorContainer = template.querySelector(".month-selection-container");
        this.YearSelectorContainer = template.querySelector(".year-selection-container");

        template.addEventListener("click", e => {
            this.OnComponentClicked(e);
        });

        template.querySelector(".prev-month-button").addEventListener("click", e => {
            this.OnMonthChangeButtonClicked(-1);
        });

        template.querySelector(".next-month-button").addEventListener("click", e => {
            this.OnMonthChangeButtonClicked(1);
        });

        template.querySelector(".select-month-button").addEventListener("click", e => {
            this.OnSelectMonthButtonClicked();
        });

        template.querySelector(".select-year-button").addEventListener("click", e => {
            this.OnSelectYearButtonClicked();
        });

        template.querySelector(".year-selection-container").addEventListener("wheel", (e: WheelEvent) => {
            this.OnSelectYearScroll(e.deltaY);
        });

        // Render weekday titles from user-defined weekday indices order
        const weekdayIndices = this.DateTimePicker.GetWeekdayIndices();
        for (const weekdayNumber of weekdayIndices){
            const luxonDateWithWeekdaySet = luxon.DateTime.now().set({weekday: <luxon.WeekdayNumbers>weekdayNumber});
            const element = document.createElement("div");
            element.textContent = luxonDateWithWeekdaySet.toFormat("EEE");
            template.querySelector(".weekdays-titles").append(element);
        }

        this.RenderButtonsForCurrentMonth();

        this.CancelButton.addEventListener("click", () => {
            this.OnCancelButtonClicked();
        });

        this.ConfirmButton.addEventListener("click", () => {
            this.OnConfirmButtonClicked();
        });

        this.NextButton.addEventListener("click", () => {
            this.OnNextButtonClicked();
        });
        
        return this;
    }

    private OnSelectMonthButtonClicked(): void{
        this.RenderMonthSelectionButtons();
        this.ShowMonthPicker();
    }

    private OnSelectYearButtonClicked(): void{
        // Reset the shows to shift by
        this.CurrentYearSelectionRowShift = 0;
        this.RenderYearSelectionButtons();
        this.ShowYearPicker();
    }

    /**
     * When the user scrolls/drags while selecting a year
     * @param deltaY 
     */
    private OnSelectYearScroll(deltaY: number): void{
        if (deltaY < 0){
            --this.CurrentYearSelectionRowShift;
            this.ClearYearSelectionButtons();
            this.RenderYearSelectionButtons();
        }else if (deltaY > 0){
            ++this.CurrentYearSelectionRowShift;
            this.ClearYearSelectionButtons();
            this.RenderYearSelectionButtons();
        }
    }

    private OnCancelButtonClicked(): void{
        this.DateTimePicker.HideAll();
    }

    private OnConfirmButtonClicked(): void{
        const beforeConfirmEvent: BeforeConfirmedEvent = new BeforeConfirmedEvent();
        beforeConfirmEvent.DateTime = this.CurrentDateTime;

        this.DateTimePicker.FireBeforeConfirmed(beforeConfirmEvent);

        if (!beforeConfirmEvent.Canceled){
            this.DateTimePicker.ConfirmSelection();
        }
    }

    private OnNextButtonClicked(): void{
        this.Hide();
        this.DateTimePicker.Show(DateTimePickerWidget.TIME_PICKER);
    }

    /**
     * Shows the month picker section of the calendar. Hides other content sections.
     */
    private ShowMonthPicker(): void{
        this.CalendarControlsButtons.style.display = "none";
        this.CalendarControlsContainer.style.display = "none";
        this.YearSelectorContainer.style.display = "none";
        this.MonthSelectorContainer.style.display = null;
    }

    /**
     * Shows the year picker section of the calendar. Hides other content sections.
     */
    private ShowYearPicker(): void{
        this.CalendarControlsButtons.style.display = "none";
        this.CalendarControlsContainer.style.display = "none";
        this.YearSelectorContainer.style.display = null;
        this.MonthSelectorContainer.style.display = "none";
    }

    /**
     * Shows the normal date picker view of a calendar.
     */
    private ShowDatePicker(): void{
        this.CalendarControlsButtons.style.display = null;
        this.CalendarControlsContainer.style.display = null;
        this.YearSelectorContainer.style.display = "none";
        this.MonthSelectorContainer.style.display = "none";
    }

    /**
     * Shows the calendar modal component. Also logically shows/hides the correct buttons to either confirm the
     * date or progress the calendar to render the time selector if it has been enabled.
     * @returns 
     */
    public Show(): this{
        this.CancelButton.style.display = null;
        this.BackButton.style.display = "none";

        if (this.DateTimePicker.GetTimePickerEnabled()){
            this.NextButton.style.display = null;
            this.ConfirmButton.style.display = "none";
        }else{
            this.NextButton.style.display = "none";
            this.ConfirmButton.style.display = null;
        }

        this.Dom.classList.add("show");
        return this;
    }

    /**
     * Sets the current luxon.DateTime the calendar is using as a reference. Should not be called
     * by methods inside this component - used for outside callers.
     * @param dateTime 
     * @returns 
     */
    public SetCurrentDateTime(dateTime: luxon.DateTime): this{
        this.CurrentDateTime = dateTime;
        return this;
    }

    public GetCurrentDateTime(): luxon.DateTime{
        return this.CurrentDateTime;
    }

    /**
     * Reloads the calendar's day buttons and labels.
     * @returns 
     */
    public Reload(): this{
        this.ClearCurrentDayButtons();
        this.RenderButtonsForCurrentMonth();
        this.UpdateMonthButtonText();
        this.UpdateYearButtonText();
        return this;
    }

    public Hide(): this{
        this.Dom.classList.remove("show");
        return this;
    }

    /**
     * When any part of the modal is clicked
     * @param e
     */
    private OnComponentClicked(e: MouseEvent): void{
        const elementTarget: HTMLElement = e.target as HTMLElement;
        if (elementTarget !== null){
            if (elementTarget.classList.contains("date-time-picker-modal")){
                this.DateTimePicker.HideAll();
            }
        }
    }

    /**
     * Removes all the day buttons in the calendar widget, and clears the DayButtonComponents array of this instance.
     */
    private ClearCurrentDayButtons(): void{
        this.DayButtonComponents.forEach(component => component.Remove());
        this.DayButtonComponents = [];
    }

    /**
     * Removes all the month buttons in the month selection section, and clears the array of this instance.
     */
    private ClearMonthSelectionButtons(): void{
        this.MonthButtonComponents.forEach(component => component.Remove());
        this.MonthButtonComponents = [];
    }

    /**
     * Removes all the year buttons in the year selection section, and clears the array of this instance.
     */
    private ClearYearSelectionButtons(): void{
        this.YearButtonComponents.forEach(component => component.Remove());
        this.YearButtonComponents = [];
    }

    /**
     * Renders the month's date buttons for the current month defined in the 
     * DateTimePicker property's current date time.
     */
    private RenderButtonsForCurrentMonth(): void{
        const currentDateTime = this.CurrentDateTime;
        this.ClearCurrentDayButtons();

        const dateTimesToRender: luxon.DateTime[] = this.GetListOfDateTimesToRenderOnCalendar();
        const dayButtonsContainer: HTMLElement = this.Dom.querySelector(".weekday-buttons");
        for (const dateTime of dateTimesToRender){
            const buttonComponent = new DayButton(dateTime, currentDateTime)
                .Build()
                .RenderInto(dayButtonsContainer)
                .OnClicked(() => {
                    this.OnDayButtonClicked(buttonComponent);
                });

            this.DayButtonComponents.push(buttonComponent);
        }
    }

    /**
     * Renders the buttons for the month selection section.
     */
    private RenderMonthSelectionButtons(): void{
        const currentDateTime = this.CurrentDateTime;
        this.ClearMonthSelectionButtons();
        for (let i = 1; i <= 12; i++){
            const buttonComponent = new MonthButton(luxon.DateTime.now().set({day: 1, month: i}), currentDateTime)
                .Build()
                .RenderInto(this.MonthSelectorContainer.querySelector(".month-buttons"))
                .OnClicked(() => {
                    this.OnMonthButtonClicked(buttonComponent);
                });

            this.MonthButtonComponents.push(buttonComponent);
        }
    }

    /**
     * Renders the buttons for the year selection section. Renders years in 12 year intervals where the current year
     * is always rendered as the 5th index (starting the second row out of 3 rows)
     */
    private RenderYearSelectionButtons(): void{
        const currentDateTime = this.CurrentDateTime;
        const yearsPerRow = 4;
        const rowsToShiftBy = this.CurrentYearSelectionRowShift ?? 0;
        const firstYearToRender = currentDateTime.year - yearsPerRow;
        const lastYearToRender = currentDateTime.year + (yearsPerRow - 1) + yearsPerRow;
        this.ClearYearSelectionButtons();
        for (let i = firstYearToRender + (yearsPerRow * rowsToShiftBy); i <= lastYearToRender + (yearsPerRow * rowsToShiftBy); i++){
            const buttonComponent = new YearButton(luxon.DateTime.now().set({day: 1, month: 1, year: i}), currentDateTime)
                .Build()
                .RenderInto(this.YearSelectorContainer.querySelector(".year-buttons"))
                .OnClicked(() => {
                    this.OnYearButtonClicked(buttonComponent);
                });

            this.YearButtonComponents.push(buttonComponent);
        }
    }

    /**
     * Fetches an array of luxon.DateTime objects in chronological order to render for the current month's
     * calendar view.
     * 
     * We first begin by determine if we need to gather dates from the previous month. This happens
     * when the 1st of the current month begins on a weekday other than the user-defined start weekday.
     * 
     * Then, we fill the array with all dates of the current month.
     * 
     * Then, we determine if we need any dates from the next month. This occurs only when the last date
     * of the current month is not the last weekday in the user-defined weekdays.
     */
    private GetListOfDateTimesToRenderOnCalendar(): luxon.DateTime[]{
        const dateTimesToRender: luxon.DateTime[] = [];
        const currentDateTime = this.CurrentDateTime;

        // What week day does the current month start on?
        const firstDayOfCurrentMonth = currentDateTime.set({day: 1});
        const lastDayOfCurrentMonth = currentDateTime.set({day: currentDateTime.daysInMonth});
        const firstWeekdayOfCurrentMonth = firstDayOfCurrentMonth.weekday;
        const lastWeekdayOfCurrentMonth = lastDayOfCurrentMonth.weekday;
        const userDefinedWeekIndices = this.DateTimePicker.GetWeekdayIndices();

        // Check if the weekday that this month starts on is the same as the user-defined start of the week
        // to show in the calendar
        if (userDefinedWeekIndices[0] !== firstWeekdayOfCurrentMonth){
            // This means that the current month's weekday starts at a point which is not the start of the user-defined's
            // first day of the week. We must gather days from the previous month until we satisfy how many we are missing.

            // Which index, in the user-defined weekdays, does this current month's weekday fall into?
            const indexInUserDefinedWeek = userDefinedWeekIndices.indexOf(firstWeekdayOfCurrentMonth);

            // Iterate until we hit the array-index that the current week day falls on
            for (let i = 0; i < indexInUserDefinedWeek; i++){
                dateTimesToRender.push(firstDayOfCurrentMonth.minus({day: indexInUserDefinedWeek - i}));
            }
        }

        // Add all days from the current month
        for (let i = 1; i <= firstDayOfCurrentMonth.daysInMonth; i++){
            dateTimesToRender.push(firstDayOfCurrentMonth.set({day: i}));
        }

        // Check if the last day of the month's weekday is not equal to the last day of the user-defined week
        if (userDefinedWeekIndices[userDefinedWeekIndices.length - 1] !== lastWeekdayOfCurrentMonth){
            // This means that the current month's weekday end at a point which is not the end of the user-defined's
            // last day of the week. We must gather days from the next month until we satisfy how many we are missing.

            // Which index, in the user-defined weekdays, does this current month's weekday fall into?
            const indexInUserDefinedWeek = userDefinedWeekIndices.indexOf(lastWeekdayOfCurrentMonth);

            // Iterate until we hit the end of the user define week indices array length
            for (let i = indexInUserDefinedWeek; i < userDefinedWeekIndices.length - 1; i++){
                dateTimesToRender.push(lastDayOfCurrentMonth.plus({day: i - indexInUserDefinedWeek + 1}));
            }
        }

        return dateTimesToRender;
    }

    /**
     * Called when a year selection button is clicked. Sets the current date's year and then re-renders the calendar buttons
     * based on the new date selected.
     * @param component 
     */
    private OnYearButtonClicked(component: YearButton): this{
        const dateTime = component.GetDateTime();
        this.CurrentDateTime = this.CurrentDateTime.set({
            year: dateTime.year
        });

        this.ClearCurrentDayButtons();
        this.RenderButtonsForCurrentMonth();
        this.UpdateMonthButtonText();
        this.UpdateYearButtonText();
        this.ShowDatePicker();
        return this;
    }

    /**
     * Called when a month selection button is clicked. Sets the current date's month and then re-renders the calendar buttons
     * based on the new date selected.
     * @param component 
     */
    private OnMonthButtonClicked(component: MonthButton): this{
        const dateTime = component.GetDateTime();
        this.CurrentDateTime = this.CurrentDateTime.set({
            month: dateTime.month
        });

        this.ClearCurrentDayButtons();
        this.RenderButtonsForCurrentMonth();
        this.UpdateMonthButtonText();
        this.UpdateYearButtonText();
        this.ShowDatePicker();
        return this;
    }

    /**
     * Called when a day button in the calendar is clicked. Sets the current Date (month, day, year)
     * and then re-renders the calendar buttons based on the new date selected.
     * @param component 
     * @returns 
     */
    private OnDayButtonClicked(component: DayButton): this{
        const dateTime = component.GetDateTime();
        this.CurrentDateTime = this.CurrentDateTime.set({
            month: dateTime.month,
            day: dateTime.day,
            year: dateTime.year
        });

        this.ClearCurrentDayButtons();
        this.RenderButtonsForCurrentMonth();
        this.UpdateMonthButtonText();
        this.UpdateYearButtonText();
        return this;
    }

    /**
     * Called when one of the month change buttons is clicked. The interval provided is either 1 or -1 and shifts
     * the current month by that interval. The day buttons are then cleared and re-rendered.
     * @param interval
     */
    private OnMonthChangeButtonClicked(interval: number): this{
        const newDateTime = this.CurrentDateTime.plus({month: interval});
        this.CurrentDateTime = this.CurrentDateTime.set({
            month: newDateTime.month,
            day: newDateTime.day,
            year: newDateTime.year
        });

        this.ClearCurrentDayButtons();
        this.RenderButtonsForCurrentMonth();
        this.UpdateMonthButtonText();
        this.UpdateYearButtonText();
        this.ShowDatePicker();
        return this;
    }

    /**
     * Updates the calendar's month button's current month text.
     */
    private UpdateMonthButtonText(): this{
        const monthButton = this.Dom.querySelector(".select-month-button");
        monthButton.textContent = this.CurrentDateTime.toFormat("MMMM");
        return this;
    }

    /**
     * Updates the calendar's year button's current year text.
     */
    private UpdateYearButtonText(): this{
        const yearButton = this.Dom.querySelector(".select-year-button");
        yearButton.textContent = this.CurrentDateTime.toFormat("yyyy");
        return this;
    }
}