export class BeforeDateTimeConfirmedEvent{
    public Canceled: boolean = false;
    public DateTime: luxon.DateTime;
}