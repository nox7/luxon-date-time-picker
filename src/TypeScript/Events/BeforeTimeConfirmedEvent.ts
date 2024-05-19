export class BeforeTimeConfirmedEvent{
    public Canceled: boolean = false;
    public DateTime: luxon.DateTime;
}