import { BaseComponent } from "./../BaseComponent";

/**
 * Represents an individual day on the calendar
 */
export class DayButton extends BaseComponent{
    private DateTime: luxon.DateTime;
    /**
     * The current DateTime represented by the user selection in the DateTimePicker component.
     */
    private CurrentDateTime: luxon.DateTime;

    public constructor(dateTime: luxon.DateTime, currentDateTime: luxon.DateTime){
        super();
        this.DateTime = dateTime;
        this.CurrentDateTime = currentDateTime;
    }

    public override Build(): this{
        const template = document.createElement("button");
        template.setAttribute("type", "button");
        template.innerHTML = `
            <span>${this.DateTime.toFormat("d")}</span>
        `;

        if (this.DateTime.month !== this.CurrentDateTime.month){
            template.classList.add("outside-of-month");
        }

        if (this.DateTime.month === this.CurrentDateTime.month && this.DateTime.day === this.CurrentDateTime.day){
            template.classList.add("selected");
        }

        this.Dom = template;
        return this;
    }
}