import { DateTimePickerComponent } from "../../DateTimePickerComponent";
import { DateTimePickerWidget } from "../../DateTimePickerWidget";
import { BaseComponent } from "../BaseComponent";

export class TimePicker extends BaseComponent{
    private DateTimePicker: DateTimePickerComponent;
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
                        <div class="hour-buttons"></div>
                        <div class="minute-buttons"></div>
                        <div class="meridiem-buttons"></div>
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

        this.BackButton.addEventListener("click", () => {
            this.OnBackButtonClicked();
        });

        return this;
    }

    private OnBackButtonClicked(): this{
        this.Hide();
        this.DateTimePicker.Show(DateTimePickerWidget.DATE_PICKER);
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
}