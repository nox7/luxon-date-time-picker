import { BaseComponent } from "./../BaseComponent";

/**
 * Represents an individual day on the calendar
 */
export class DayButton extends BaseComponent{
    private DateTime: luxon.DateTime;

    public constructor(dateTime: luxon.DateTime){
        super();
        this.DateTime = dateTime;
    }

    public override Build(): this{
        const template = document.createElement("button");
        template.setAttribute("type", "button");
        template.innerHTML = `
            <span>${this.DateTime.toFormat("d")}</span>
        `;

        this.Dom = template;
        return this;
    }
}