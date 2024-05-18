import { BaseComponent } from "../BaseComponent";

/**
 * Represents an individual year button on the calendar's year selector.
 */
export class YearButton extends BaseComponent{
    private DateTime: luxon.DateTime;
    /**
     * The current DateTime represented by this year button. We are only concerned with the year itself.
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
            <span>${this.DateTime.toFormat("yyyy")}</span>
        `;

        if (this.DateTime.year === this.CurrentDateTime.year){
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