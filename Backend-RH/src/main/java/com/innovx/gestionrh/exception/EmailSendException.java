package com.innovx.gestionrh.exception;

public class EmailSendException extends RuntimeException {

    private final String recipient;

    public EmailSendException(String recipient, String reason, Throwable cause) {
        super(String.format("Failed to send email to '%s': %s", recipient, reason), cause);
        this.recipient = recipient;
    }

    public EmailSendException(String message) {
        super(message);
        this.recipient = null;
    }

    public String getRecipient() { return recipient; }
}
