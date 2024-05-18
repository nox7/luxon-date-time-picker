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
    private OnClickedCallbacks: (() => void)[] = [];

    public constructor(dateTime: luxon.DateTime, currentDateTime: luxon.DateTime){
        super();
        this.DateTime = dateTime;
        this.CurrentDateTime = currentDateTime;
    }

    /**
     * Gets the luxon.DateTime that this button represents.
     * @returns 
     */
    public GetDateTime(): luxon.DateTime{
        return this.DateTime;
    }

    public OnClicked(callback: () => void): this{
        this.OnClickedCallbacks.push(callback);
        return this;
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

        template.addEventListener("click", () => {
            this.FireOnClickedCallbacks();
        });

        this.Dom = template;
        return this;
    }

    private FireOnClickedCallbacks(): void{
        for (const callback of this.OnClickedCallbacks){
            callback();
        }
    }
}