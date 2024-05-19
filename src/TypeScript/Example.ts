import { DateTimePickerComponent } from "./DateTimePickerComponent.js";

const exampleInput: HTMLInputElement = document.querySelector<HTMLInputElement>("#date-time-picker-input");
const component = new DateTimePickerComponent()
    .WithDatePicker([1,2,3,4,5,6,7])
    // .WithDatePicker([7,1,2,3,4,5,6])
    .WithTimePicker(1, 5)
    .Build()
    .OnConfirmed(() => {
        exampleInput.value = component.GetCurrentDateTime().toFormat("MMM dd, yyyy hh:mm a");
        component.HideAll();
    });

exampleInput.addEventListener("focus", () => {
    exampleInput.blur();
    component.Show();
});