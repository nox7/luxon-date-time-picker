export class ModalBackdrop{
    private Dom: HTMLElement;
    private OnClickCallbacks: ((e: MouseEvent) => void)[] = [];

    public constructor(){
        this.Build()
            .RenderInto(document.body);
    }

    /**
     * Runs the callback when the backdrop is clicked
     */
    public OnClicked(callback: (e: MouseEvent) => void): this{
        this.OnClickCallbacks.push(callback);
        return this;
    }

    /**
     * There can only ever be one #date-picker-component-modal-backdrop, so even if this is called again from another
     * instance it will just use the existing instance in the document.
     * @returns 
     */
    private Build(): this{
        const existingBackdrop: HTMLDivElement = document.querySelector("#date-picker-component-modal-backdrop");
        if (existingBackdrop !== null){
            this.Dom = existingBackdrop;
        }else{
            const template = document.createElement("div");
            template.id = "date-picker-component-modal-backdrop";
    
            this.Dom = template;
        }

        this.Dom.addEventListener("click", e => {
            this.FireOnClickCallbacks(e);
        });

        return this;
    }

    private RenderInto(container: Element): this{
        container.append(this.Dom);
        return this;
    }

    private FireOnClickCallbacks(e: MouseEvent): void{
        for (const callback of this.OnClickCallbacks){
            callback(e);
        }
    }

    /**
     * Shows the modal backdrop
     */
    public Show(){
        document.body.classList.add("date-picker-component-backdrop-shown");
        this.Dom.classList.add("shown");
    }

    /**
     * Hides the modal backdrop
     */
    public Hide(){
        document.body.classList.remove("date-picker-component-backdrop-shown");
        this.Dom.classList.remove("shown");
    }
}