import * as luxon from "luxon";
import { Calendar } from "./Components/Calendar/Calendar";
import { ModalBackdrop } from "./Components/ModalBackdrop";

export class DateTimePickerComponent{
    private Container: HTMLElement;
    private Dom: HTMLElement;
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

    public constructor(container: HTMLElement){
        this.Container = container;
        this.Backdrop = new ModalBackdrop();
        this.Backdrop.OnClicked(e => {
            this.OnBackdropClicked(e);
        });
    }

    /**
     * Hides all components
     */
    public HideAll(): void{
        this.Backdrop.Hide();
        this.Calendar.Hide();
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
     * Returns the indices in the order defined for rendering on the calendar
     */
    public GetWeekdayIndices(): number[]{
        return this.WeekdayIndices;
    }

    /**
     * Sets the component to build with a date picker. Optionally, you can provide an array of weekday indices to define
     * how the week days will be displayed in the calendar. For example, providing [1,2,3,4,5,6,7] will start the weeks in the
     * calendar from Monday. If they need to start from Sunday, then provide [7,1,2,3,4,5,6]
     * @returns 
     */
    public WithDatePicker(weekdayIndices: number[] | undefined = undefined): this{
        if (this.Dom !== undefined){
            throw "Cannot call method when Build() has already been called.";
        }

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
    public WithTimePicker(): this{
        if (this.Dom !== undefined){
            throw "Cannot call method when Build() has already been called.";
        }

        this.TimePickerEnabled = true;

        return this;
    }

    /**
     * Build the component's HTML elements
     * @returns 
     */
    public Build(): this{
        const template = document.createElement("div");
        template.innerHTML = `
            <input type="text" class="date-time-picker-input-component">
        `;

        const input: HTMLInputElement = template.querySelector(".date-time-picker-input-component");

        if (this.DatePickerEnabled){
            this.Calendar = new Calendar(this)
                .Build()
                .RenderInto(document.body);
        }

        input.addEventListener("focus", () => {
            this.OnDateTimePickerInputFocused();
        });

        this.Dom = template;
        return this;
    }

    /**
     * Renders the component into the constructed container. Clears the container's
     * innerHTML before appending this component's Dom.
     * @returns 
     */
    public Render(): this{
        this.Container.innerHTML = ``;
        this.Container.append(this.Dom);
        return this;
    }

    /**
     * Called when the picker input is focused by the user.
     */
    private OnDateTimePickerInputFocused(): void{
        this.Backdrop.Show();
        this.Calendar.Show();
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
}