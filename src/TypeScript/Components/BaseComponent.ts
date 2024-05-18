export class BaseComponent {
    protected Dom: HTMLElement;

    /**
     * Builds the component Dom. Sets the Dom here.
     */
    public Build(): this {
        throw "Not implemented";
    }

    /**
     * Renders the Dom into the provided container
     */
    public RenderInto(container: HTMLElement): this {
        container.append(this.Dom);
        return this;
    }

    /**
     * Removes the Dom from the document. Deletes its HTML element.
     * @returns
     */
    public Remove(): this {
        this.Dom.remove();
        return this;
    }

    /**
     * Returns the HTML element this component represents.
     * @returns
     */
    public GetDom(): HTMLElement {
        return this.Dom;
    }
}