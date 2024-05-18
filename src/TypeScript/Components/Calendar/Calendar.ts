import * as luxon from "luxon";
import { DateTimePickerComponent } from "../../DateTimePickerComponent";
import { BaseComponent } from "./../BaseComponent";
import { DayButton } from "./DayButton";

export class Calendar extends BaseComponent{
    private DateTimePicker: DateTimePickerComponent;
    private DayButtonComponents: DayButton[] = [];

    public constructor(dateTimePicker: DateTimePickerComponent){
        super();
        this.DateTimePicker = dateTimePicker;
    }

    public override Build(): this{
        const currentDateTime: luxon.DateTime = this.DateTimePicker.GetCurrentDateTime();
        const template = document.createElement("div");
        template.classList.add("date-time-picker-modal");
        template.classList.add("date-time-picker-calendar-component");
        template.innerHTML = `
            <div class="dialog">
                <div class="calendar-controls-container">
                    <div class="month-year-controls-container">
                        <button type="button" class="prev-month-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                            </svg>
                        </button>
                        <button type="button" class="month-button">${currentDateTime.toFormat("MMMM")}</button>
                        <button type="button" class="year-button">${currentDateTime.toFormat("yyyy")}</button>
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
                <div class="month-selection-container" style="display: none;"></div>
                <div class="year-selection-container" style="display: none;"></div>
            </div>
        `;

        this.Dom = template;

        template.addEventListener("click", e => {
            this.OnComponentClicked(e);
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
        
        return this;
    }

    public Show(): this{
        this.Dom.classList.add("show");
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

    private ClearCurrentDayButtons(): void{
        this.DayButtonComponents.forEach(component => component.Remove());
        this.DayButtonComponents = [];
    }

    /**
     * Renders the month's date buttons for the current month defined in the 
     * DateTimePicker property's current date time.
     */
    private RenderButtonsForCurrentMonth(): void{
        const currentDateTime = this.DateTimePicker.GetCurrentDateTime();
        this.ClearCurrentDayButtons();

        const dateTimesToRender: luxon.DateTime[] = this.GetListOfDateTimesToRenderOnCalendar();
        const dayButtonsContainer: HTMLElement = this.Dom.querySelector(".weekday-buttons");
        for (const dateTime of dateTimesToRender){
            const buttonComponent = new DayButton(dateTime, currentDateTime)
                .Build()
                .RenderInto(dayButtonsContainer);

            this.DayButtonComponents.push(buttonComponent);
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
        const currentDateTime = this.DateTimePicker.GetCurrentDateTime();

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
}