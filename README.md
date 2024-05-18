# Luxon DateTime Picker in TypeScript
A date and time picker component written in TypeScript that uses Luxon.

## Date Picker
### Changing Week Start in Calendar
To change the week day which the calendar starts with (e.g., start from Sunday instead of Monday), then pass a new weekday index array to WithDatePicker() when building the main component.
```ts
    .WithDatePicker([7,1,2,3,4,5,7])
```

The calendar dates will now start on Sunday. You can use this method to have the calendar start on any day of the week.
