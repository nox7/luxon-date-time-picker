import { DateTimePickerComponent } from "../../DateTimePickerComponent";
import { DateTimePickerWidget } from "../../DateTimePickerWidget";
import { BaseComponent } from "../BaseComponent";
import { HourButton } from "./HourButton";
import { MinuteButton } from "./MinuteButton";

export class TimePicker extends BaseComponent{
    private DateTimePicker: DateTimePickerComponent;
    private HourButtonComponents: HourButton[] = [];
    private MinuteButtonComponents: MinuteButton[] = [];
    /**
     * The current date time this component references. We are only concerned with the hours and minutes.
     * This component will never change the month, day, or year as it is a time component.
     */
    private CurrentDateTime: luxon.DateTime;
    private TimePickerControlsButtons: HTMLDivElement;
    private CancelButton: HTMLButtonElement;
    private BackButton: HTMLButtonElement;
    private ConfirmButton: HTMLButtonElement;
    private NextButton: HTMLButtonElement;
    private AMButton: HTMLButtonElement;
    private PMButton: HTMLButtonElement;

    public constructor(dateTimePickerComponent: DateTimePickerComponent){
        super();
        this.DateTimePicker = dateTimePickerComponent;
    }

    public SetCurrentDateTime(dateTime: luxon.DateTime): this{
        this.CurrentDateTime = dateTime;
        return this;
    }

    public GetCurrentDateTime(dateTime: luxon.DateTime): luxon.DateTime{
        return this.CurrentDateTime;
    }

    public override Build(): this{
        const template = document.createElement("div");
        template.classList.add("date-time-picker-modal");
        template.classList.add("date-time-picker-time-picker-component");
        template.innerHTML = `
            <div class="dialog">
                <div class="time-picker-container">
                    <div class="time-picker-controls-container">
                        <div class="hour-section">
                            <button type="button" class="time-control-button back-hour-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                </svg>
                            </button>
                            <div class="hour-buttons-container">
                                <div class="prev-hour-buttons"></div>
                                <div class="current-hour-button"></div>
                                <div class="next-hour-buttons"></div>
                                <div class="gradient"></div>
                            </div>
                            <button type="button" class="time-control-button next-hour-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </button>
                        </div>
                        <div class="time-colon">:</div>
                        <div class="minute-section">
                            <button type="button" class="time-control-button back-minute-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                </svg>
                            </button>
                            <div class="minute-buttons-container">
                                <div class="prev-minute-buttons"></div>
                                <div class="current-minute-button"></div>
                                <div class="next-minute-buttons"></div>
                                <div class="gradient"></div>
                            </div>
                            <button type="button" class="time-control-button next-minute-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </button>
                        </div>
                        <div class="meridiem-buttons">
                            <button type="button" class="am-button">AM</button>
                            <button type="button" class="pm-button">PM</button>
                        </div>
                    </div>
                    <div class="time-picker-controls-buttons">
                        <button type="button" class="close-button">
                            <span>Cancel</span>
                        </button>
                        <button type="button" class="back-button" style="display: none;">
                            <span>Back</span>
                        </button>
                        <button type="button" class="confirm-button">
                            <span>Confirm</span>
                        </button>
                        <button type="button" class="next-button" style="display: none;">
                            <span>Next</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.Dom = template;

        this.Dom.addEventListener("click", e => {
            this.OnComponentClicked(e);
        });

        this.TimePickerControlsButtons = template.querySelector(".time-picker-controls-buttons");
        this.CancelButton = template.querySelector(".close-button");
        this.ConfirmButton = template.querySelector(".confirm-button");
        this.BackButton = template.querySelector(".back-button");
        this.NextButton = template.querySelector(".next-button");
        this.AMButton = template.querySelector(".am-button");
        this.PMButton = template.querySelector(".pm-button");

        this.BackButton.addEventListener("click", () => {
            this.OnBackButtonClicked();
        });

        this.RenderHourButtons();
        this.RenderMinuteButtons();

        if (this.IsCurrentTimeAM()){
            this.SelectAMButton();
        }else{
            this.SelectPMButton();
        }

        return this;
    }

    private OnBackButtonClicked(): this{
        this.Hide();
        this.DateTimePicker.Show(DateTimePickerWidget.DATE_PICKER);
        return this;
    }

    /**
     * Determines if the CurrentDateTime represents an anti meridiem time
     */
    private IsCurrentTimeAM(): boolean{
        return this.CurrentDateTime.hour < 13;
    }

    public SelectAMButton(): this{
        if (!this.AMButton.classList.contains("selected")){
            if (this.PMButton.classList.contains("selected")){
                this.PMButton.classList.remove("selected");
            }

            this.AMButton.classList.add("selected");
        }

        return this;
    }

    public SelectPMButton(): this{
        if (!this.PMButton.classList.contains("selected")){
            if (this.AMButton.classList.contains("selected")){
                this.AMButton.classList.remove("selected");
            }

            this.PMButton.classList.add("selected");
        }

        return this;
    }

    /**
     * Shows the time picker modal component. Also logically shows/hides the correct buttons to either confirm the
     * time or regress back to the calendar, if it is enabled.
     * @returns 
     */
    public Show(): this{
        this.NextButton.style.display = "none";
        
        if (this.DateTimePicker.GetDatePickerEnabled()){
            this.CancelButton.style.display = "none";
            this.BackButton.style.display = null;
            this.ConfirmButton.style.display = null;
        }else{
            this.CancelButton.style.display = null;
            this.BackButton.style.display = "none";
            this.ConfirmButton.style.display = null;
        }

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

    private ClearHourButtons(): this{
        this.HourButtonComponents.forEach(component => component.Remove());
        this.HourButtonComponents = [];
        return this;
    }

    private ClearMinuteButtons(): this{
        this.MinuteButtonComponents.forEach(component => component.Remove());
        this.MinuteButtonComponents = [];
        return this;
    }

    private RenderHourButtons(): this{
        this.ClearHourButtons();

        // Render previous hours
        // i represents how many to render
        for (let i = 1; i <= 2; i++){
            const component = new HourButton(this.CurrentDateTime.minus({hour: i}), this.CurrentDateTime)
                .Build()
                .RenderInto(this.Dom.querySelector(".prev-hour-buttons"))
                .OnClicked(() => {
                    this.OnHourButtonClicked(component);
                });

            this.HourButtonComponents.push(component);
        }

        // Render current hour
        const currentComponent = new HourButton(this.CurrentDateTime, this.CurrentDateTime)
            .Build()
            .RenderInto(this.Dom.querySelector(".current-hour-button"))
            .OnClicked(() => {
                this.OnHourButtonClicked(currentComponent);
            });

        this.HourButtonComponents.push(currentComponent);

        // Render next hours
        // i represents how many to render
        for (let i = 1; i <= 2; i++){
            const component = new HourButton(this.CurrentDateTime.plus({hour: i}), this.CurrentDateTime)
                .Build()
                .RenderInto(this.Dom.querySelector(".next-hour-buttons"))
                .OnClicked(() => {
                    this.OnHourButtonClicked(component);
                });

            this.HourButtonComponents.push(component);
        }

        return this;
    }

    private RenderMinuteButtons(): this{
        this.ClearMinuteButtons();

        // Render previous minutes
        // i represents how many to render
        for (let i = 1; i <= 2; i++){
            const component = new MinuteButton(this.CurrentDateTime.minus({minute: i}), this.CurrentDateTime)
                .Build()
                .RenderInto(this.Dom.querySelector(".prev-minute-buttons"))
                .OnClicked(() => {
                    this.OnMinuteButtonClicked(component);
                });

            this.MinuteButtonComponents.push(component);
        }

        // Render current minute
        const currentComponent = new MinuteButton(this.CurrentDateTime, this.CurrentDateTime)
            .Build()
            .RenderInto(this.Dom.querySelector(".current-minute-button"))
            .OnClicked(() => {
                this.OnMinuteButtonClicked(currentComponent);
            });

        this.MinuteButtonComponents.push(currentComponent);

        // Render next minutes
        // i represents how many to render
        for (let i = 1; i <= 2; i++){
            const component = new MinuteButton(this.CurrentDateTime.plus({minute: i}), this.CurrentDateTime)
                .Build()
                .RenderInto(this.Dom.querySelector(".next-minute-buttons"))
                .OnClicked(() => {
                    this.OnMinuteButtonClicked(component);
                });

            this.MinuteButtonComponents.push(component);
        }

        return this;
    }

    private OnHourButtonClicked(component: HourButton): this{
        return this;
    }

    private OnMinuteButtonClicked(component: MinuteButton): this{
        return this;
    }
}