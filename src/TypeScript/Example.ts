import { DateTimePickerComponent } from "./DateTimePickerComponent.js";

const component = new DateTimePickerComponent(document.querySelector("#date-time-picker"))
    .WithDatePicker([1,2,3,4,5,6,7])
    // .WithDatePicker([7,1,2,3,4,5,6])
    .WithTimePicker()
    .Build()
    .Render();